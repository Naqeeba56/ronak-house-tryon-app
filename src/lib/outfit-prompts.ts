type OutfitDefinition = {
  label: string;
  gender: "male" | "female";
  fabricTarget: string;
  designInstructions?: string;
  fabricInstructions?: string;
};

export const OUTFITS = {
  "male-shirt": {
    label: "shirt",
    gender: "male",
    fabricTarget: "the shirt only",
  },
  "male-pant": {
    label: "formal tailored trousers",
    gender: "male",
    fabricTarget: "both trouser legs and the waistband, without changing the selected fabric's appearance",
    designInstructions:
      "Create formal tailored dress trousers with a proper waistband, fly, belt loops, clean pressed crease, and straight or subtly tapered full-length legs following Image 3. These must look like formal trousers, not jeans, denim, chinos, cargo pants, joggers, or casual pants. Do not add denim fading, contrast topstitching, rivets, patch pockets, or casual styling. Replace the person's existing lower garment; keep the shirt, jacket, belt if present, shoes, and all other items unchanged.",
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
    fabricTarget: "the complete kurta body and sleeves; use the same fabric on matching bottoms only if they are part of the selected kurta set",
    fabricInstructions:
      "Treat Image 2 as the exact textile swatch, not a loose inspiration. Reproduce its visible motif shapes, colours, orientation, spacing, and repeat across the full kurta front, back, and sleeves. Continue the swatch pattern naturally over folds and seams without replacing it with a similar pattern. Do not copy the pale colour, dotted print, embroidery, or embellishment visible in Image 3 unless the same feature is present in Image 2. Add no embroidery, buttons, piping, or decorative trim that is not shown by the kurta design reference or fabric swatch.",
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
    designInstructions:
      "Create a complete traditional saree drape with a fitted blouse, wrapped and pleated lower drape, and pallu arranged over the torso and shoulder as shown in Image 3. Use Image 3 only for draping, blouse cut, and silhouette; ignore its model and all jewellery.",
    fabricInstructions:
      "Map the uploaded swatch faithfully across the saree, visible pallu, pleats, and blouse. Preserve the swatch's exact colours and motifs; only reproduce a border or embellishment if that border or detail is visibly present in Image 2. Do not borrow the reference saree's colour, print, border, or embroidery.",
  },
  "female-salwar-suit": {
    label: "salwar suit",
    gender: "female",
    fabricTarget: "the salwar suit and its existing coordinated components only",
    fabricInstructions:
      "Use Image 2 as the exact textile source across the kameez and every coordinated fabric component being replaced. Keep the swatch's actual colours, print, motif scale and spacing, weave, and texture. Do not copy the reference outfit's print, contrast panels, embroidery, or trim unless those details are visible in Image 2.",
  },
  "female-lehenga": {
    label: "lehenga",
    gender: "female",
    fabricTarget: "the lehenga and its existing choli and dupatta only",
    designInstructions:
      "Create a complete lehenga outfit: a full-length flared skirt, fitted choli, and draped dupatta following Image 3's silhouette and arrangement. Use Image 3 only for garment construction and styling; ignore its model, jewellery, colour, and all textile details.",
    fabricInstructions:
      "Apply the uploaded swatch consistently to the lehenga skirt, choli, and dupatta. Preserve the swatch's exact colours, motif shapes, orientation, scale, spacing, weave, and texture. Do not copy the reference lehenga's gold embroidery, ornate hem, border, or embellishment unless the same detail is visible in Image 2.",
  },
} satisfies Record<string, OutfitDefinition>;

export type OutfitKey = keyof typeof OUTFITS;

export function buildTryOnPrompt(key: OutfitKey) {
  const outfit = OUTFITS[key];
  const specificDesignInstructions = "designInstructions" in outfit
    ? outfit.designInstructions
    : undefined;
  const specificFabricInstructions = "fabricInstructions" in outfit
    ? outfit.fabricInstructions
    : undefined;
  const designInstructions = specificDesignInstructions
    ? `\nSELECTED OUTFIT REQUIREMENTS: ${specificDesignInstructions}`
    : "";
  const fabricInstructions = specificFabricInstructions
    ? `\nOUTFIT-SPECIFIC FABRIC REQUIREMENTS: ${specificFabricInstructions}`
    : "";

  return `You are an expert fashion AI assistant.
Images in order:
1. PERSON: the person to edit; preserve this identity, body, pose, and scene.
2. FABRIC: the authoritative source for the garment's colour and every material property.
3. OUTFIT STYLE REFERENCE: the source for the selected garment's design and construction.

Create a photorealistic virtual try-on. The selected ${outfit.label} must be clearly identifiable in the result. Reconstruct or replace the target clothing as needed to match the selected outfit; do not merely recolour the person's existing clothes.
DESIGN: Use Image 3 only for the ${outfit.label}'s garment design and construction: silhouette, cut, neckline or collar, sleeves, closures, length, fit, and visible components. Ignore Image 3's person, face, pose, body, colour, fabric, print, accessories, background, lighting, and framing.${designInstructions}
FABRIC MATCH — HIGHEST PRIORITY: Apply Image 2 to ${outfit.fabricTarget}. Image 2 is the single source of truth for material appearance; Image 3 is never a source for fabric colour, print, texture, or embellishment. Match Image 2 faithfully: preserve its actual hue, colour, saturation, lightness, print or solid appearance, motif shapes, motif orientation, scale and spacing, weave, grain, texture, and sheen. Do not sample colour or pattern from Image 1 or Image 3. Do not recolour, redesign, simplify, embellish, substitute, or invent any material property. If Image 2 is a solid fabric, keep it solid; if it has a print, reproduce that print at the same recognizable scale and repeat. Carry the same material consistently across every specified garment panel; let only natural folds, lighting, and shadows change its apparent brightness.${fabricInstructions}
COMPLEX TEXTILES: For dense prints, mixed patterns, stripes, checks, embroidery, woven motifs, and detailed borders in Image 2, retain each distinct motif and its boundaries. Keep pattern scale, repeat spacing, direction, alignment, and relative placement consistent across garment panels. Continue patterns naturally over folds and seams without blending adjacent motifs together. Preserve visible border width, orientation, and position; do not duplicate, omit, merge, regularize, or invent details to fill gaps. Where the textile is hidden by a fold, seam, or overlap, continue it plausibly from the visible neighboring pattern rather than creating a new design. Maintain the distinction between printed, woven, and embroidered details when visible; do not turn a print into embroidery or vice versa.
PERSON AND SCENE: Keep Image 1's face, skin tone, hair, body shape, pose, hands, feet, camera angle, background, lighting, and framing unchanged. Fit the designed outfit naturally to this person's body and preserve realistic anatomy and proportions.
FOOTWEAR: Keep any footwear already worn or explicitly shown in Image 1 unchanged, including its design and colour; do not replace, restyle, or recolour it to match the outfit. If footwear is not present or visible and the generated composition requires it, choose simple footwear whose formality suits the selected ${outfit.label} and whose colours coordinate with the applied fabric without competing with it. Keep feet anatomically correct, footwear paired and naturally fitted, and ground contact and shadows consistent with Image 1's lighting and floor. Do not invent footwear when the feet are outside the frame.
OTHER CLOTHING: Keep clothing and items outside the selected outfit unchanged. Do not add unrelated garments or accessories, and do not leave the original target garment visible through or over the new outfit.
OUTPUT: Return one photorealistic image with the same aspect ratio and framing as Image 1. No text, logos, watermark, collage, or extra people.`;
}
