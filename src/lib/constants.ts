import type { BaseModel } from "@/types/studio";

export const APP_ADMIN_EMAIL = "ansaritalish938@gmail.com";

export const TRYON_PLANS = {
  starter: { name: "Starter", amountPaise: 6000, tryonCount: 10 },
  pro: { name: "Pro", amountPaise: 49900, tryonCount: 90 },
  topup: { name: "Top-up", amountPaise: 29900, tryonCount: 50 },
} as const;

export type TryOnPlanId = keyof typeof TRYON_PLANS;

export const TRY_ON_MODEL_PRESETS: BaseModel[] = [
  {
    id: "try-on-male",
    name: "Male model - full body",
    gender: "male",
    imageUrl: "/models/studio-male-model-v2.webp",
  },
  {
    id: "try-on-female",
    name: "Female model - full body",
    gender: "female",
    imageUrl: "/models/studio-female-model.webp",
  },
];

export const DEFAULT_MODEL_IMAGE_URL = TRY_ON_MODEL_PRESETS[0].imageUrl;

type GarmentPresetDefinition = {
  label: string;
  description: string;
  fabricTarget: string;
  gender?: "male" | "female";
  thumbnails?: Partial<Record<"male" | "female", string>>;
};

export const GARMENT_PRESETS: readonly GarmentPresetDefinition[] = [
  {
    label: "Shirt",
    description: "a tailored collared shirt",
    fabricTarget: "the shirt body and sleeves",
    gender: "male",
    thumbnails: { male: "/outfit-presets/male-shirt.webp" },
  },
  {
    label: "Pant",
    description: "full-length tailored trousers",
    fabricTarget: "both trouser legs from the waistband to the hems",
    gender: "male",
    thumbnails: { male: "/outfit-presets/male-pant.webp" },
  },
  {
    label: "Indo-Western Jacket",
    description: "a tailored Indo-Western jacket",
    fabricTarget: "the jacket body and sleeves",
    gender: "male",
    thumbnails: { male: "/outfit-presets/male-indo-jacket.webp" },
  },
  {
    label: "2-Piece Suit",
    description: "a coordinated two-piece suit with a jacket and matching trousers",
    fabricTarget: "the suit jacket and both matching trouser legs",
    gender: "male",
    thumbnails: { male: "/outfit-presets/male-suit-two-piece.webp" },
  },
  {
    label: "3-Piece Suit",
    description: "a coordinated three-piece suit with a jacket, waistcoat, and matching trousers",
    fabricTarget: "the jacket, waistcoat, and both matching trouser legs",
    gender: "male",
    thumbnails: { male: "/outfit-presets/male-suit-three-piece.webp" },
  },
  {
    label: "Blazer",
    description: "a structured tailored blazer",
    fabricTarget: "the blazer body and sleeves",
    gender: "male",
    thumbnails: { male: "/outfit-presets/male-blazer.webp" },
  },
  {
    label: "Nehru Jacket",
    description: "a sleeveless, high-collar Nehru jacket",
    fabricTarget: "the Nehru jacket",
    gender: "male",
    thumbnails: { male: "/outfit-presets/male-nehru-jacket.webp" },
  },
  {
    label: "Sherwani",
    description: "a formal knee-length sherwani",
    fabricTarget: "the sherwani body and sleeves",
    gender: "male",
    thumbnails: { male: "/outfit-presets/male-sherwani.webp" },
  },
  {
    label: "Kurta",
    description: "a traditional straight-cut, knee-length kurta",
    fabricTarget: "the kurta body and sleeves",
    gender: "male",
    thumbnails: { male: "/outfit-presets/male-kurta.webp" },
  },
  {
    label: "Pathani",
    description: "a traditional Pathani kurta with matching full-length trousers",
    fabricTarget: "the Pathani kurta and both matching trouser legs",
    gender: "male",
    thumbnails: { male: "/outfit-presets/male-pathani.webp" },
  },
  {
    label: "Jodhpuri suit",
    description: "a tailored Jodhpuri bandhgala jacket with matching trousers",
    fabricTarget: "the Jodhpuri jacket and both matching trouser legs",
    gender: "male",
    thumbnails: { male: "/outfit-presets/male-jodhpuri.webp" },
  },
  {
    label: "Saree",
    description: "a traditional saree with a fitted blouse",
    fabricTarget: "the saree and blouse",
    gender: "female",
    thumbnails: { female: "/outfit-presets/female-shirt.webp" },
  },
  {
    label: "Salwar suit",
    description: "a traditional salwar suit with kameez, bottoms, and dupatta",
    fabricTarget: "the kameez, coordinated bottoms, and dupatta",
    gender: "female",
    thumbnails: { female: "/outfit-presets/female-saree.webp" },
  },
  {
    label: "Lehenga",
    description: "a flared lehenga skirt with choli and dupatta",
    fabricTarget: "the lehenga skirt, choli, and dupatta",
    gender: "female",
    thumbnails: { female: "/outfit-presets/female-indo-western.webp" },
  },
] as const;

export type GarmentPreset = (typeof GARMENT_PRESETS)[number];