type OutfitDefinition = {
  label: string;
  gender: "male" | "female";
  fabricTarget: string;
};

export const OUTFITS = {
  "male-shirt": {
    label: "shirt",
    gender: "male",
    fabricTarget: "the shirt only",
  },
  "male-pant": {
    label: "trousers",
    gender: "male",
    fabricTarget: "the trousers only",
  },
  "male-indo-western-jacket": {
    label: "Indo-Western jacket",
    gender: "male",
    fabricTarget: "the Indo-Western jacket only",
  },
  "male-two-piece-suit": {
    label: "two-piece suit",
    gender: "male",
    fabricTarget: "the suit jacket and matching trousers only",
  },
  "male-three-piece-suit": {
    label: "three-piece suit",
    gender: "male",
    fabricTarget: "the suit jacket, waistcoat, and matching trousers only",
  },
  "male-blazer": {
    label: "blazer",
    gender: "male",
    fabricTarget: "the blazer only",
  },
  "male-nehru-jacket": {
    label: "Nehru jacket",
    gender: "male",
    fabricTarget: "the Nehru jacket only",
  },
  "male-sherwani": {
    label: "sherwani",
    gender: "male",
    fabricTarget: "the sherwani only",
  },
  "male-kurta": {
    label: "kurta set",
    gender: "male",
    fabricTarget: "the kurta and its existing matching bottoms only",
  },
  "male-pathani": {
    label: "Pathani suit",
    gender: "male",
    fabricTarget: "the Pathani top and its existing matching bottoms only",
  },
  "male-jodhpuri-suit": {
    label: "Jodhpuri suit (bandhgala)",
    gender: "male",
    fabricTarget: "the Jodhpuri coat and matching trousers only",
  },
  "female-saree": {
    label: "saree",
    gender: "female",
    fabricTarget: "the saree and its blouse only",
  },
  "female-salwar-suit": {
    label: "salwar suit",
    gender: "female",
    fabricTarget: "the salwar suit and its existing coordinated components only",
  },
  "female-lehenga": {
    label: "lehenga",
    gender: "female",
    fabricTarget: "the lehenga and its existing choli and dupatta only",
  },
} satisfies Record<string, OutfitDefinition>;

export type OutfitKey = keyof typeof OUTFITS;

export function buildTryOnPrompt(key: OutfitKey) {
  const outfit = OUTFITS[key];

  return `You are an expert fashion AI assistant.
Image 1 is a model wearing clothes.
Image 2 is a fabric pattern swatch.
Task: Replace the texture/fabric of the ${outfit.label} (${outfit.fabricTarget}) in Image 1 with the fabric pattern shown in Image 2.
Rules:
1. Preserve the model's exact pose, facial features, body shape, lighting, and background.
2. Maintain realistic clothing folds, seams, and shading while applying the pattern.
3. Keep the selected garment's existing cut, construction, fit, length, and layering unchanged. Do not add, remove, or redesign clothing or accessories. Do not alter any other garment or item.
4. Match the swatch's true colour, weave, sheen, and print scale. Apply it continuously to the selected garment without incomplete panels or abrupt edges.
Return one photorealistic image with the same framing and aspect ratio as Image 1.`;
}
