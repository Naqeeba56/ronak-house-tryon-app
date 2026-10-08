import { BaseModel } from "@/types/studio";

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
    imageUrl: "/models/default-male-front-v2.webp",
  },
  {
    id: "try-on-female",
    name: "Female model - full body",
    gender: "female",
    imageUrl: "/models/default-female-professional.webp",
  },
];

export const OUTFIT_PRESETS_BY_GENDER = {
  male: [
    { label: "Shirt", description: "a tailored button-up shirt with a collar and front placket", fabricTarget: "the shirt body and sleeves" },
    { label: "Trousers", description: "a pair of tailored full-length trousers", fabricTarget: "the full-length trousers" },
    { label: "Blazer", description: "a structured, tailored blazer", fabricTarget: "the blazer body and sleeves" },
    { label: "3-Piece Suit", description: "a coordinated three-piece suit with jacket, waistcoat, and matching trousers", fabricTarget: "the jacket, waistcoat, and matching trousers" },
    { label: "Nehru Jacket", description: "a sleeveless, high-collar Nehru jacket over a simple kurta", fabricTarget: "the Nehru jacket" },
    { label: "Indo-Western", description: "a contemporary Indo-Western outfit with a long tailored jacket and trousers", fabricTarget: "the jacket and trousers" },
    { label: "Sherwani", description: "a formal knee-length sherwani with a high collar and front buttons", fabricTarget: "the sherwani body and sleeves" },
    { label: "Kurta", description: "a traditional straight-cut, knee-length kurta with a front placket", fabricTarget: "the kurta body and sleeves" },
  ],
  female: [
    { label: "Salwar Suit", description: "a salwar suit with a knee-length kameez, salwar trousers, and dupatta", fabricTarget: "the kameez and salwar trousers" },
    { label: "Saree", description: "a traditional saree draped over a fitted blouse and petticoat", fabricTarget: "the saree drape and blouse" },
    { label: "Lehenga", description: "a lehenga outfit with a flared skirt, fitted choli, and dupatta", fabricTarget: "the lehenga skirt and choli" },
  ],
} as const;

export const GARMENT_PRESETS = [
  ...OUTFIT_PRESETS_BY_GENDER.male.map((preset) => ({ ...preset, gender: "male" as const })),
  ...OUTFIT_PRESETS_BY_GENDER.female.map((preset) => ({ ...preset, gender: "female" as const })),
];