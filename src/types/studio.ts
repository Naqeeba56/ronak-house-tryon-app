export type OutfitCategory = 'kurta' | 'pathani' | 'shirt' | 'pants' | 'blazer';

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