import {
  allenKeyRange,
  bootSizes,
  capacityTonRange,
  flatScrewdriverSizes,
  imperialSizes,
  inchSizes,
  lbSizes,
  lengthMm,
  lifeJacketSizes,
  metricThreadRange,
  mmRange,
  mmSizes,
  ozSizes,
  phillipsSizes,
  safetySizes,
  slingLengths,
  socketSetRange,
  torqueDriveSizes,
  torxKeyRange,
  wireRopeDiameters,
} from '@/lib/catalogue/variant-generators';

export type CatalogueProductDef = {
  name: string;
  subcategorySlug: string;
  subcategoryName: string;
  variants: string[];
  material?: string;
  marineGrade?: boolean;
  industrialGrade?: boolean;
  searchKeywords?: string[];
};

export type CatalogueRootDef = {
  name: string;
  slug: string;
  code: string;
  division: 'industrial' | 'marine';
  subcategories: Array<{ slug: string; name: string }>;
  products: CatalogueProductDef[];
};

function p(
  name: string,
  subcategorySlug: string,
  subcategoryName: string,
  variants: string[],
  options: Partial<CatalogueProductDef> = {},
): CatalogueProductDef {
  return {
    name,
    subcategorySlug,
    subcategoryName,
    variants,
    material: options.material,
    marineGrade: options.marineGrade,
    industrialGrade: options.industrialGrade ?? true,
    searchKeywords: options.searchKeywords,
  };
}

export const INDUSTRIAL_TOOLS_CATALOGUE: CatalogueRootDef[] = [
  {
    name: 'Hand Tools',
    slug: 'industrial-hand-tools',
    code: 'HT',
    division: 'industrial',
    subcategories: [
      { slug: 'combination-wrenches', name: 'Combination Wrenches' },
      { slug: 'socket-sets', name: 'Socket Sets' },
      { slug: 'adjustable-wrenches', name: 'Adjustable Wrenches' },
      { slug: 'allen-keys', name: 'Allen Keys' },
      { slug: 'torx-keys', name: 'Torx Keys' },
      { slug: 'flat-screwdrivers', name: 'Flat Screwdrivers' },
      { slug: 'phillips-screwdrivers', name: 'Phillips Screwdrivers' },
      { slug: 'combination-pliers', name: 'Combination Pliers' },
      { slug: 'locking-pliers', name: 'Locking Pliers' },
      { slug: 'pipe-wrenches', name: 'Pipe Wrenches' },
      { slug: 'claw-hammers', name: 'Claw Hammers' },
      { slug: 'ball-peen-hammers', name: 'Ball Peen Hammers' },
      { slug: 'sledge-hammers', name: 'Sledge Hammers' },
      { slug: 'hacksaws', name: 'Hacksaws' },
      { slug: 'torque-wrenches', name: 'Torque Wrenches' },
    ],
    products: [
      p('Combination Wrench', 'combination-wrenches', 'Combination Wrenches', [
        ...mmSizes([6, 8, 10, 12, 13, 14, 17, 19, 22, 24, 27, 30]),
        ...imperialSizes(['1/4"', '5/16"', '3/8"', '1/2"', '9/16"', '5/8"', '11/16"', '3/4"', '13/16"', '7/8"', '15/16"', '1"']),
      ], { material: 'Chrome Vanadium Steel' }),
      p('Socket Set', 'socket-sets', 'Socket Sets', socketSetRange(), { material: 'Chrome Vanadium Steel' }),
      p('Adjustable Wrench', 'adjustable-wrenches', 'Adjustable Wrenches', inchSizes(['6', '8', '10', '12', '15']), { material: 'Carbon Steel' }),
      p('Allen Key Set', 'allen-keys', 'Allen Keys', allenKeyRange(), { material: 'Hardened Steel' }),
      p('Torx Key Set', 'torx-keys', 'Torx Keys', torxKeyRange(), { material: 'Hardened Steel' }),
      p('Flat Screwdriver', 'flat-screwdrivers', 'Flat Screwdrivers', flatScrewdriverSizes(), { material: 'Chrome Vanadium Steel' }),
      p('Phillips Screwdriver', 'phillips-screwdrivers', 'Phillips Screwdrivers', phillipsSizes(), { material: 'Chrome Vanadium Steel' }),
      p('Combination Pliers', 'combination-pliers', 'Combination Pliers', lengthMm([160, 180, 200, 250]), { material: 'Carbon Steel' }),
      p('Locking Pliers', 'locking-pliers', 'Locking Pliers', inchSizes(['5', '7', '10']), { material: 'Carbon Steel' }),
      p('Pipe Wrench', 'pipe-wrenches', 'Pipe Wrenches', inchSizes(['10', '14', '18', '24', '36']), { material: 'Cast Iron / Steel' }),
      p('Claw Hammer', 'claw-hammers', 'Claw Hammers', ozSizes([16, 20, 24]), { material: 'Steel / Fibreglass Handle' }),
      p('Ball Peen Hammer', 'ball-peen-hammers', 'Ball Peen Hammers', ozSizes([8, 16, 24, 32]), { material: 'Steel' }),
      p('Sledge Hammer', 'sledge-hammers', 'Sledge Hammers', lbSizes([2, 4, 8, 10]), { material: 'Steel' }),
      p('Hacksaw', 'hacksaws', 'Hacksaws', inchSizes(['12']), { material: 'Steel Frame' }),
      p('Torque Wrench', 'torque-wrenches', 'Torque Wrenches', torqueDriveSizes(), { material: 'Alloy Steel' }),
    ],
  },
  {
    name: 'Power Tools',
    slug: 'industrial-power-tools',
    code: 'PT',
    division: 'industrial',
    subcategories: [
      { slug: 'angle-grinders', name: 'Angle Grinders' },
      { slug: 'corded-drills', name: 'Corded Drills' },
      { slug: 'cordless-drills', name: 'Cordless Drills' },
      { slug: 'impact-wrenches', name: 'Impact Wrenches' },
      { slug: 'circular-saws', name: 'Circular Saws' },
      { slug: 'reciprocating-saws', name: 'Reciprocating Saws' },
      { slug: 'bench-grinders', name: 'Bench Grinders' },
      { slug: 'drill-presses', name: 'Drill Presses' },
    ],
    products: [
      p('Angle Grinder', 'angle-grinders', 'Angle Grinders', mmSizes([100, 115, 125, 230])),
      p('Corded Drill', 'corded-drills', 'Corded Drills', mmSizes([10, 13])),
      p('Cordless Drill', 'cordless-drills', 'Cordless Drills', mmSizes([10, 13])),
      p('Impact Wrench', 'impact-wrenches', 'Impact Wrenches', inchSizes(['1/2', '3/4'])),
      p('Circular Saw', 'circular-saws', 'Circular Saws', mmSizes([165, 185, 235])),
      p('Reciprocating Saw', 'reciprocating-saws', 'Reciprocating Saws', mmRange(20, 32, 4)),
      p('Bench Grinder', 'bench-grinders', 'Bench Grinders', mmSizes([150, 200, 250])),
      p('Drill Press', 'drill-presses', 'Drill Presses', mmSizes([13, 16])),
    ],
  },
  {
    name: 'Fasteners',
    slug: 'industrial-fasteners',
    code: 'FA',
    division: 'industrial',
    subcategories: [
      { slug: 'hex-bolts', name: 'Hex Bolts' },
      { slug: 'socket-cap-screws', name: 'Socket Cap Screws' },
      { slug: 'hex-nuts', name: 'Hex Nuts' },
      { slug: 'flat-washers', name: 'Flat Washers' },
      { slug: 'self-tapping-screws', name: 'Self Tapping Screws' },
      { slug: 'threaded-rods', name: 'Threaded Rods' },
      { slug: 'u-bolts', name: 'U Bolts' },
      { slug: 'eye-bolts', name: 'Eye Bolts' },
    ],
    products: [
      p('Hex Bolt', 'hex-bolts', 'Hex Bolts', metricThreadRange(4, 30), { material: 'Stainless Steel A2' }),
      p('Socket Cap Screw', 'socket-cap-screws', 'Socket Cap Screws', metricThreadRange(3, 20), { material: 'Alloy Steel' }),
      p('Hex Nut', 'hex-nuts', 'Hex Nuts', metricThreadRange(3, 30), { material: 'Stainless Steel A2' }),
      p('Flat Washer', 'flat-washers', 'Flat Washers', metricThreadRange(3, 30), { material: 'Stainless Steel A2' }),
      p('Self Tapping Screw', 'self-tapping-screws', 'Self Tapping Screws', metricThreadRange(3, 12), { material: 'Zinc Plated Steel' }),
      p('Threaded Rod', 'threaded-rods', 'Threaded Rods', metricThreadRange(6, 20), { material: 'Stainless Steel A4' }),
      p('U Bolt', 'u-bolts', 'U Bolts', metricThreadRange(6, 24), { material: 'Galvanised Steel' }),
      p('Eye Bolt', 'eye-bolts', 'Eye Bolts', metricThreadRange(6, 24), { material: 'Stainless Steel A4' }),
    ],
  },
  {
    name: 'Marine Rigging & Deck Hardware',
    slug: 'industrial-marine-rigging',
    code: 'MR',
    division: 'marine',
    subcategories: [
      { slug: 'wire-rope', name: 'Wire Rope' },
      { slug: 'shackles', name: 'Shackles' },
      { slug: 'turnbuckles', name: 'Turnbuckles' },
      { slug: 'cleats', name: 'Cleats' },
      { slug: 'marine-fenders', name: 'Marine Fenders' },
      { slug: 'anchor-chains', name: 'Anchor Chains' },
      { slug: 'mooring-rope', name: 'Mooring Rope' },
    ],
    products: [
      p('Wire Rope', 'wire-rope', 'Wire Rope', wireRopeDiameters(), { marineGrade: true, material: 'Galvanised Steel' }),
      p('Shackle', 'shackles', 'Shackles', [...mmSizes([6, 8, 10, 12, 16, 20]), ...capacityTonRange()], { marineGrade: true, material: 'Stainless Steel' }),
      p('Turnbuckle', 'turnbuckles', 'Turnbuckles', mmSizes([6, 8, 10, 12, 16, 20]), { marineGrade: true, material: 'Stainless Steel' }),
      p('Deck Cleat', 'cleats', 'Cleats', inchSizes(['4', '6', '8', '10', '12']), { marineGrade: true, material: 'Stainless Steel' }),
      p('Marine Fender', 'marine-fenders', 'Marine Fenders', ['Cylindrical', 'Round', 'Flat', 'Ball'], { marineGrade: true, material: 'PVC / Rubber' }),
      p('Anchor Chain', 'anchor-chains', 'Anchor Chains', mmSizes([6, 7, 8, 10, 12, 13]), { marineGrade: true, material: 'Galvanised Steel' }),
      p('Mooring Rope', 'mooring-rope', 'Mooring Rope', ['12 mm', '14 mm', '16 mm', '18 mm', '20 mm', '24 mm'], { marineGrade: true, material: 'Polyester / Nylon' }),
    ],
  },
  {
    name: 'Lifting & Rigging Equipment',
    slug: 'industrial-lifting-rigging',
    code: 'LE',
    division: 'industrial',
    subcategories: [
      { slug: 'chain-hoists', name: 'Chain Hoists' },
      { slug: 'lever-hoists', name: 'Lever Hoists' },
      { slug: 'webbing-slings', name: 'Webbing Slings' },
      { slug: 'wire-rope-slings', name: 'Wire Rope Slings' },
      { slug: 'd-shackles', name: 'D Shackles' },
      { slug: 'snatch-blocks', name: 'Snatch Blocks' },
    ],
    products: [
      p('Chain Hoist', 'chain-hoists', 'Chain Hoists', capacityTonRange(), { industrialGrade: true, material: 'Alloy Steel' }),
      p('Lever Hoist', 'lever-hoists', 'Lever Hoists', capacityTonRange(), { industrialGrade: true, material: 'Alloy Steel' }),
      p('Webbing Sling', 'webbing-slings', 'Webbing Slings', [...slingLengths(), ...capacityTonRange()], { industrialGrade: true, material: 'Polyester Webbing' }),
      p('Wire Rope Sling', 'wire-rope-slings', 'Wire Rope Slings', [...wireRopeDiameters(), ...slingLengths()], { industrialGrade: true, material: 'Galvanised Steel' }),
      p('D Shackle', 'd-shackles', 'D Shackles', [...mmSizes([6, 8, 10, 12, 16, 20]), ...capacityTonRange()], { industrialGrade: true, material: 'Alloy Steel' }),
      p('Snatch Block', 'snatch-blocks', 'Snatch Blocks', [...capacityTonRange(), ...inchSizes(['3', '4', '6'])]),
    ],
  },
  {
    name: 'Measuring & Safety Equipment',
    slug: 'industrial-measuring-safety',
    code: 'MS',
    division: 'industrial',
    subcategories: [
      { slug: 'tape-measures', name: 'Tape Measures' },
      { slug: 'vernier-calipers', name: 'Vernier Calipers' },
      { slug: 'spirit-levels', name: 'Spirit Levels' },
      { slug: 'safety-helmets', name: 'Safety Helmets' },
      { slug: 'safety-gloves', name: 'Safety Gloves' },
      { slug: 'steel-toe-boots', name: 'Steel Toe Boots' },
      { slug: 'life-jackets', name: 'Life Jackets' },
    ],
    products: [
      p('Tape Measure', 'tape-measures', 'Tape Measures', ['3 m', '5 m', '8 m', '10 m', '15 m', '30 m']),
      p('Vernier Caliper', 'vernier-calipers', 'Vernier Calipers', mmSizes([150, 200, 300])),
      p('Spirit Level', 'spirit-levels', 'Spirit Levels', lengthMm([400, 600, 800, 1000, 1200])),
      p('Safety Helmet', 'safety-helmets', 'Safety Helmets', safetySizes(), { material: 'ABS' }),
      p('Safety Gloves', 'safety-gloves', 'Safety Gloves', safetySizes(), { material: 'Nitrile / Leather' }),
      p('Steel Toe Boot', 'steel-toe-boots', 'Steel Toe Boots', bootSizes(), { material: 'Leather / Composite Toe' }),
      p('Life Jacket', 'life-jackets', 'Life Jackets', lifeJacketSizes(), { marineGrade: true, material: 'Foam / Nylon' }),
    ],
  },
];
