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
    imageUrl: "/models/default-male-tailored.webp",
  },
  {
    id: "try-on-female",
    name: "Female model - full body",
    gender: "female",
    imageUrl: "/models/default-female-professional.webp",
  },
];

export const GARMENT_PRESETS = [
  {
    label: "Shirt",
    description: "a tailored collared shirt",
    fabricTarget: "the shirt body and sleeves",
    region: "upper",
    thumbnails: { male: "/outfit-presets/male-shirt.webp", female: "/outfit-presets/female-shirt.webp" },
  },
  {
    label: "Pant",
    description: "full-length tailored trousers",
    fabricTarget: "both trouser legs from the waistband to the hems",
    region: "lower",
    thumbnails: { male: "/outfit-presets/male-pant.webp", female: "/outfit-presets/female-pant.webp" },
  },
  {
    label: "Indo-Western Jacket",
    description: "a tailored Indo-Western jacket",
    fabricTarget: "the jacket body and sleeves",
    region: "long-upper",
    thumbnails: { male: "/outfit-presets/male-indo-jacket.webp", female: "/outfit-presets/female-indo-jacket.webp" },
  },
  {
    label: "2-Piece Suit",
    description: "a coordinated two-piece suit with a jacket and matching trousers",
    fabricTarget: "the suit jacket and both matching trouser legs",
    region: "full",
    thumbnails: { male: "/outfit-presets/male-suit-two-piece.webp", female: "/outfit-presets/female-suit-two-piece.webp" },
  },
  {
    label: "3-Piece Suit",
    description: "a coordinated three-piece suit with a jacket, waistcoat, and matching trousers",
    fabricTarget: "the jacket, waistcoat, and both matching trouser legs",
    region: "full",
    thumbnails: { male: "/outfit-presets/male-suit-three-piece.webp", female: "/outfit-presets/female-suit-three-piece.webp" },
  },
  {
    label: "Blazer",
    description: "a structured tailored blazer",
    fabricTarget: "the blazer body and sleeves",
    region: "upper",
    thumbnails: { male: "/outfit-presets/male-blazer.webp", female: "/outfit-presets/female-blazer.webp" },
  },
  {
    label: "Nehru Jacket",
    description: "a sleeveless, high-collar Nehru jacket",
    fabricTarget: "the Nehru jacket",
    region: "upper",
    thumbnails: { male: "/outfit-presets/male-nehru-jacket.webp", female: "/outfit-presets/female-nehru-jacket.webp" },
  },
  {
    label: "Indo Western",
    description: "a coordinated Indo-Western outfit",
    fabricTarget: "the selected Indo-Western garment pieces",
    region: "full",
    thumbnails: { male: "/outfit-presets/male-indo-western.webp", female: "/outfit-presets/female-indo-western.webp" },
  },
  {
    label: "Sherwani",
    description: "a formal knee-length sherwani",
    fabricTarget: "the sherwani body and sleeves",
    region: "long-upper",
    thumbnails: { male: "/outfit-presets/male-sherwani.webp", female: "/outfit-presets/female-sherwani.webp" },
  },
  {
    label: "Kurta",
    description: "a traditional straight-cut, knee-length kurta",
    fabricTarget: "the kurta body and sleeves",
    region: "long-upper",
    thumbnails: { male: "/outfit-presets/male-indo-western.webp", female: "/outfit-presets/female-kurta.webp" },
  },
  {
    label: "Patahni",
    description: "a traditional Pathani kurta with matching full-length trousers",
    fabricTarget: "the Pathani kurta and both matching trouser legs",
    region: "full",
    thumbnails: { male: "/outfit-presets/male-pathani.webp", female: "/outfit-presets/female-pathani.webp" },
  },
  {
    label: "Jothpuri suit",
    description: "a tailored Jodhpuri bandhgala jacket with matching trousers",
    fabricTarget: "the Jodhpuri jacket and both matching trouser legs",
    region: "full",
    thumbnails: { male: "/outfit-presets/male-jodhpuri.webp", female: "/outfit-presets/female-jodhpuri.webp" },
  },
] as const;

export type GarmentPreset = (typeof GARMENT_PRESETS)[number];