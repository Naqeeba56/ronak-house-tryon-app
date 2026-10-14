export type OutfitCategory =
  | "Shirt"
  | "Pant"
  | "Indo-Western Jacket"
  | "2-Piece Suit"
  | "3-Piece Suit"
  | "Blazer"
  | "Nehru Jacket"
  | "Sherwani"
  | "Kurta"
  | "Pathani"
  | "Jodhpuri suit";

export interface BaseModel {
  id: string;
  name: string;
  gender: 'male' | 'female';
  imageUrl: string;
}

export interface GenerationHistory {
  id: string;
  outputUrl: string;
  createdAt: string;
}