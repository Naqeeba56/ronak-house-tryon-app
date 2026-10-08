const DATABASE_NAME = "fabricfit-ai";
const STORE_NAME = "studio";
const IMAGE_KEY = "latest-generated-image";

type StoredImage =
  | { kind: "blob"; blob: Blob }
  | { kind: "url"; url: string };

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);

    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function fetchImageBlob(imageUrl: string): Promise<Blob | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return null;

    const blob = await response.blob();
    return blob.type.startsWith("image/") ? blob : null;
  } catch {
    return null;
  }
}

export async function saveLatestGeneratedImage(imageUrl: string): Promise<void> {
  const blob = await fetchImageBlob(imageUrl);
  const storedImage: StoredImage = blob
    ? { kind: "blob", blob }
    : { kind: "url", url: imageUrl };
  const database = await openDatabase();

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put(storedImage, IMAGE_KEY);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

export async function loadLatestGeneratedImage(): Promise<string | null> {
  const database = await openDatabase();

  try {
    const storedImage = await new Promise<StoredImage | undefined>((resolve, reject) => {
      const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(IMAGE_KEY);
      request.onsuccess = () => resolve(request.result as StoredImage | undefined);
      request.onerror = () => reject(request.error);
    });

    if (storedImage?.kind === "blob" && storedImage.blob instanceof Blob) {
      return URL.createObjectURL(storedImage.blob);
    }
    if (storedImage?.kind === "url" && typeof storedImage.url === "string") {
      return storedImage.url;
    }
    return null;
  } finally {
    database.close();
  }
}

export async function clearLatestGeneratedImage(): Promise<void> {
  const database = await openDatabase();

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).delete(IMAGE_KEY);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}