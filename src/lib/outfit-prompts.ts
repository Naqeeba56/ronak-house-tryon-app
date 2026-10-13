type O = {
  label: string;
  gender: "male" | "female";
  preset: string;
  r: string;
  d: string;
  f: string;
  a: string;
  s: string;
  k: string;
};

// r=replace only, d=design, f=fabric goes on, a=add only if missing, s=outfit-specific rules, k=extra items to keep
const KEEP = "footwear, socks, watch, glasses, jewellery, bag, headwear"; // always kept; female also: hairstyle, makeup, bindi

export const OUTFITS = {
  "male-shirt": {
    label: "shirt",
    gender: "male",
    preset: "/outfit-presets/male-shirt.webp",
    r: "only the top shirt (keep any outer layer; fabric goes on the visible inner shirt)",
    d: "full-sleeve button-down: collar+stand, front placket, barrel cuffs, curved hem; pockets/collar per preset",
    f: "whole shirt",
    a: "none",
    s: "crisp symmetric collar and cuffs; keep original tucked/untucked state; sleeves end at wrist",
    k: "trousers/lower garment, outer layer, belt",
  },
  "male-pant": {
    label: "trousers",
    gender: "male",
    preset: "/outfit-presets/male-pant.webp",
    r: "only the lower garment",
    d: "tailored trousers: waistband, belt loops, fly, side pockets, leg shape per preset, clean crease, hem just above shoes",
    f: "whole trousers",
    a: "belt only if none and preset shows one",
    s: "waistband at original height, shirt hem unchanged; same pattern direction on both legs; shoes/socks unchanged",
    k: "upper garment incl. tucked state, outer layer",
  },
  "male-indo-western-jacket": {
    label: "Indo-Western jacket",
    gender: "male",
    preset: "/outfit-presets/male-indo-jacket.webp",
    r: "outer layer only (add jacket over existing top if none)",
    d: "fusion jacket per preset: front opening or asymmetric hem, collar/lapel, length, sleeves; structured shoulders",
    f: "jacket",
    a: "plain neutral inner shirt only if upper body is bare",
    s: "existing inner garment stays visible; no added embroidery/trims; sleeves end at wrist",
    k: "inner garment, lower garment",
  },
  "male-two-piece-suit": {
    label: "two-piece suit",
    gender: "male",
    preset: "/outfit-presets/male-suit-two-piece.webp",
    r: "jacket and trousers",
    d: "single-breasted jacket, notch lapels, 2-3 buttons, pockets, working cuffs + matching creased trousers; lapel width/length/buttons per preset",
    f: "jacket and trousers as one matching set",
    a: "plain white dress shirt if no collared shirt; tie only if preset shows one and person has none",
    s: "pattern aligned across lapels, pockets, sleeves; no waistcoat; shirt collar above lapels, about 1 cm cuff showing; buttons as preset",
    k: "existing collared shirt/tie",
  },
  "male-three-piece-suit": {
    label: "three-piece suit",
    gender: "male",
    preset: "/outfit-presets/male-suit-three-piece.webp",
    r: "jacket, waistcoat, trousers",
    d: "single-breasted jacket with notch lapels + matching V-neck waistcoat (5-6 buttons, pointed hem) + creased trousers",
    f: "all three as one matching set",
    a: "plain white dress shirt if no collared shirt; tie/pocket square only if preset shows them and person has none",
    s: "waistcoat visible between lapels, hem at waistband; jacket open if preset open; consistent pattern across pieces",
    k: "existing collared shirt/tie",
  },
  "male-blazer": {
    label: "blazer",
    gender: "male",
    preset: "/outfit-presets/male-blazer.webp",
    r: "outer jacket only (add blazer over existing top if none)",
    d: "single-breasted smart-casual blazer, notch lapels, 2 buttons, patch/flap pockets, soft shoulder, hip length",
    f: "blazer",
    a: "plain white open-collar shirt only if no top",
    s: "relaxed, softer than a suit jacket; shoulder fits real shoulder; open/closed per preset; sleeves end at wrist with inner cuff showing",
    k: "inner top, trousers/jeans",
  },
  "male-nehru-jacket": {
    label: "Nehru jacket",
    gender: "male",
    preset: "/outfit-presets/male-nehru-jacket.webp",
    r: "outer layer only (add jacket over existing top if none)",
    d: "sleeveless hip-length jacket, closed mandarin collar, 5-6 front buttons, slightly fitted, welt pockets",
    f: "jacket",
    a: "plain white/cream full-sleeve kurta only if no top",
    s: "SLEEVELESS: the person's own sleeves stay visible and unchanged; never extend fabric into sleeves",
    k: "kurta/shirt underneath, lower garment",
  },
  "male-indo-western": {
    label: "Indo-Western outfit",
    gender: "male",
    preset: "/outfit-presets/male-indo-western.webp",
    r: "upper outfit and lower garment as one set",
    d: "fusion set per preset: long kurta-jacket or asymmetric top, collar/neckline, closures, sleeves, slim straight trousers",
    f: "main top; trousers same fabric only if preset shows a matching set, else plain complementary solid",
    a: "none",
    s: "one cohesive set; no ties/scarves/pocket squares unless preset has them; clean modern fit; trousers slim, end at shoe",
    k: "none extra",
  },
  "male-sherwani": {
    label: "sherwani",
    gender: "male",
    preset: "/outfit-presets/male-sherwani.webp",
    r: "upper outfit and lower garment as one set",
    d: "knee-length sherwani, closed mandarin collar, structured shoulder, fitted waist, slight flare, full sleeves, decorative front buttons",
    f: "sherwani",
    a: "ivory/plain churidar or straight trousers; stole only if preset shows one",
    s: "straight button column collar to hem; embroidery/zari only where the fabric has it, else tonal piping",
    k: "none extra",
  },
  "male-kurta": {
    label: "kurta set",
    gender: "male",
    preset: "/outfit-presets/male-kurta.webp",
    r: "upper garment and lower garment as one set",
    d: "knee-length straight kurta, mandarin collar, short placket 3-4 buttons, full sleeves, side slits, relaxed fit",
    f: "kurta",
    a: "straight pyjama/churidar in plain solid complementing the fabric",
    s: "bottoms visible from hem to ankle; natural vertical drape",
    k: "none extra",
  },
  "male-pathani": {
    label: "Pathani suit",
    gender: "male",
    preset: "/outfit-presets/male-pathani.webp",
    r: "upper garment and lower garment as one set",
    d: "long straight loose kurta (knee or below), flat shirt-style collar, placket, full sleeves with cuffs, side pockets, side slits + wide relaxed salwar with gathered waist, straight hem",
    f: "kurta and salwar as matching set",
    a: "none",
    s: "kurta longer and straighter than a normal kurta; salwar wide with soft gathers",
    k: "none extra",
  },
  "male-jodhpuri-suit": {
    label: "Jodhpuri suit (bandhgala)",
    gender: "male",
    preset: "/outfit-presets/male-jodhpuri.webp",
    r: "coat and trousers",
    d: "structured hip-to-upper-thigh coat, closed stand collar, no lapels, 5-6 buttons collar to hem, tailored shoulders, working cuffs, welt pockets + matching straight trousers",
    f: "coat and trousers as one matching set",
    a: "plain shirt only if none at the neck; collar edge only; no tie",
    s: "close fit at chest and shoulders; no open front",
    k: "existing shirt underneath",
  },
  "female-saree": {
    label: "saree",
    gender: "female",
    preset: "/outfit-presets/female-saree.webp",
    r: "whole outfit shoulders to ankles (saree + blouse)",
    d: "Nivi drape: 5-7 even pleats at navel falling to floor, pallu across torso over left shoulder, loose end behind; natural folds; border along hem and pallu edge; drape per preset",
    f: "saree",
    a: "fitted blouse in plain solid from the fabric's palette; neckline/sleeves per preset",
    s: "border continuous without breaks; match preset's midriff and arm coverage, no more skin than preset",
    k: "none extra",
  },
  "female-salwar-suit": {
    label: "salwar suit",
    gender: "female",
    preset: "/outfit-presets/female-indo-western.webp",
    r: "whole outfit shoulders to ankles (kameez, bottoms, dupatta)",
    d: "kameez mid-thigh to knee with side slits, neckline/sleeves/fit per preset; salwar or churidar; dupatta draped per preset",
    f: "kameez; bottoms and dupatta plain solids from fabric palette unless preset shows a matching set",
    a: "none",
    s: "pattern continuous across front panel; churidar bunches at ankles; dupatta drape natural, never covering the face",
    k: "none extra",
  },
  "female-lehenga": {
    label: "lehenga",
    gender: "female",
    preset: "/outfit-presets/female-nehru-jacket.webp",
    r: "whole outfit shoulders to ankles (skirt, choli, dupatta)",
    d: "full flared floor-length skirt gathered at waist, hem skimming floor; fitted choli; dupatta draped per preset",
    f: "lehenga skirt",
    a: "choli and dupatta in plain solids from fabric palette unless preset shows a matching set",
    s: "pattern even around the skirt; volume as preset, not slim",
    k: "none extra",
  },
  "female-kurta": {
    label: "kurta set",
    gender: "female",
    preset: "/outfit-presets/female-kurta.webp",
    r: "whole outfit shoulders to ankles (kurta and bottoms)",
    d: "straight kurta, neckline, sleeves, hem length, and side slits per preset; coordinated straight bottoms",
    f: "kurta",
    a: "plain solid bottoms complementing the fabric if none are visible",
    s: "keep the kurta's original length and fit; bottoms remain visible to the ankles",
    k: "none extra",
  },
} satisfies Record<string, O>;

export type OutfitKey = keyof typeof OUTFITS;

export function buildTryOnPrompt(key: OutfitKey) {
  const outfit = OUTFITS[key];
  const keptItems = `${outfit.k}, ${KEEP}${outfit.gender === "female" ? ", hairstyle, makeup, bindi" : ""}`;

  return `Photorealistic virtual try-on edit. Images in order: 1 PERSON (edit this), 2 FABRIC (copy exact colour, weave, sheen, print), 3 STYLE REF (copy ONLY the ${outfit.label} design: cut, collar, closures, length; ignore its colour, pattern, background, model, crop, and any other garments).
Make the person wear a ${outfit.label} made from the fabric.
REPLACE ONLY: ${outfit.r}.
DESIGN: ${outfit.d}
FABRIC GOES ON: ${outfit.f}
ADD ONLY IF MISSING: ${outfit.a}
SPECIFIC RULES: ${outfit.s}
KEEP EXACTLY (colour, print, fit, folds, position): all other clothing and items, including ${keptItems}. Do not restyle, recolour, tuck/untuck, or invent cropped items.
FABRIC: true colour and texture; print at realistic scale, grain-aligned, matched at seams; natural drape, folds, stitching.
PERSON/SCENE: keep face, skin tone, hair, body shape, pose, hands, camera angle, background, lighting, framing unchanged; no beautifying. Garment fits the real body with correct occlusion and shadows.
OUTPUT: one photorealistic image, same aspect ratio as Image 1. No text, logos, watermark, collage, extra people.`;
}
