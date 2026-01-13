const PLURAL_MAPPINGS: Record<string, string> = {
  eggs: 'egg',
  tomatoes: 'tomato',
  potatoes: 'potato',
  onions: 'onion',
  carrots: 'carrot',
  peppers: 'pepper',
  mushrooms: 'mushroom',
  apples: 'apple',
  oranges: 'orange',
  lemons: 'lemon',
  limes: 'lime',
  bananas: 'banana',
  avocados: 'avocado',
  berries: 'berry',
  cherries: 'cherry',
  strawberries: 'strawberry',
  blueberries: 'blueberry',
  raspberries: 'raspberry',
  blackberries: 'blackberry',
  cloves: 'clove',
  stalks: 'stalk',
  heads: 'head',
  bunches: 'bunch',
  slices: 'slice',
  leaves: 'leaf',
  sprigs: 'sprig',
  strips: 'strip',
  cubes: 'cube',
  chunks: 'chunk',
  pieces: 'piece',
  breasts: 'breast',
  thighs: 'thigh',
  drumsticks: 'drumstick',
  wings: 'wing',
  fillets: 'fillet',
  steaks: 'steak',
  chops: 'chop',
  ribs: 'rib',
  anchovies: 'anchovy',
  sardines: 'sardine',
  shrimp: 'shrimp',
  scallops: 'scallop',
  mussels: 'mussel',
  clams: 'clam',
  oysters: 'oyster',
  tortillas: 'tortilla',
  rolls: 'roll',
  buns: 'bun',
  loaves: 'loaf',
  bagels: 'bagel',
  crackers: 'cracker',
  cookies: 'cookie',
  almonds: 'almond',
  walnuts: 'walnut',
  pecans: 'pecan',
  cashews: 'cashew',
  peanuts: 'peanut',
  pistachios: 'pistachio',
  hazelnuts: 'hazelnut',
  beans: 'bean',
  lentils: 'lentil',
  chickpeas: 'chickpea',
  noodles: 'noodle',
  olives: 'olive',
  capers: 'caper',
  jalapeños: 'jalapeno',
  jalapenos: 'jalapeno',
  chilies: 'chili',
  chilis: 'chili',
  chillies: 'chili',
  cucumbers: 'cucumber',
  zucchinis: 'zucchini',
  squashes: 'squash',
  eggplants: 'eggplant',
  artichokes: 'artichoke',
  asparagus: 'asparagus',
  radishes: 'radish',
  turnips: 'turnip',
  beets: 'beet',
  parsnips: 'parsnip',
};

const DESCRIPTOR_REMOVALS = [
  'fresh',
  'freshly',
  'dried',
  'dry',
  'frozen',
  'canned',
  'organic',
  'raw',
  'cooked',
  'chopped',
  'diced',
  'minced',
  'sliced',
  'grated',
  'shredded',
  'ground',
  'crushed',
  'whole',
  'halved',
  'quartered',
  'cubed',
  'julienned',
  'peeled',
  'deveined',
  'boneless',
  'skinless',
  'bone-in',
  'skin-on',
  'large',
  'medium',
  'small',
  'extra-large',
  'extra large',
  'jumbo',
  'mini',
  'thin',
  'thick',
  'fine',
  'coarse',
  'hot',
  'cold',
  'warm',
  'room temperature',
  'softened',
  'melted',
  'chilled',
  'ripe',
  'unripe',
  'firm',
  'soft',
  'crisp',
  'tender',
  'packed',
  'loosely packed',
  'firmly packed',
  'low-fat',
  'fat-free',
  'reduced-fat',
  'full-fat',
  'low-sodium',
  'unsalted',
  'salted',
  'sweet',
  'unsweetened',
  'sweetened',
  'plain',
  'flavored',
  'seasoned',
  'unseasoned',
  'toasted',
  'roasted',
  'blanched',
  'sauteed',
  'sautéed',
  'fried',
  'boiled',
  'steamed',
  'grilled',
  'smoked',
  'cured',
  'pickled',
  'marinated',
];

const KEEP_DESCRIPTORS = [
  'olive oil',
  'extra virgin olive oil',
  'virgin olive oil',
  'vegetable oil',
  'canola oil',
  'coconut oil',
  'sesame oil',
  'peanut oil',
  'soy sauce',
  'fish sauce',
  'worcestershire sauce',
  'hot sauce',
  'tomato sauce',
  'tomato paste',
  'baking powder',
  'baking soda',
  'brown sugar',
  'powdered sugar',
  'confectioners sugar',
  'granulated sugar',
  'cane sugar',
  'maple syrup',
  'corn syrup',
  'heavy cream',
  'sour cream',
  'cream cheese',
  'cottage cheese',
  'ricotta cheese',
  'parmesan cheese',
  'mozzarella cheese',
  'cheddar cheese',
  'feta cheese',
  'goat cheese',
  'blue cheese',
  'swiss cheese',
  'provolone cheese',
  'jack cheese',
  'american cheese',
  'pepper jack',
  'black pepper',
  'white pepper',
  'red pepper',
  'cayenne pepper',
  'bell pepper',
  'chili powder',
  'garlic powder',
  'onion powder',
  'all-purpose flour',
  'bread flour',
  'whole wheat flour',
  'almond flour',
  'coconut flour',
  'rice flour',
  'chicken broth',
  'beef broth',
  'vegetable broth',
  'chicken stock',
  'beef stock',
  'vegetable stock',
  'apple cider vinegar',
  'balsamic vinegar',
  'red wine vinegar',
  'white wine vinegar',
  'rice vinegar',
  'white wine',
  'red wine',
  'dry white wine',
  'dry red wine',
  'green onion',
  'spring onion',
  'red onion',
  'yellow onion',
  'white onion',
  'sweet onion',
];

function createDescriptorRegex(): RegExp {
  const sortedDescriptors = [...DESCRIPTOR_REMOVALS].sort(
    (a, b) => b.length - a.length
  );
  const escaped = sortedDescriptors.map((d) =>
    d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  return new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');
}

const DESCRIPTOR_REGEX = createDescriptorRegex();

export function normalizeIngredientName(name: string): string {
  let normalized = name.toLowerCase().trim();

  normalized = normalized.replace(/\s+/g, ' ');

  const keepLower = KEEP_DESCRIPTORS.map((d) => d.toLowerCase());
  const isKeepDescriptor = keepLower.some(
    (d) => normalized === d || normalized.includes(d)
  );

  if (!isKeepDescriptor) {
    normalized = normalized.replace(DESCRIPTOR_REGEX, '');
    normalized = normalized.replace(/\s+/g, ' ').trim();
  }

  if (PLURAL_MAPPINGS[normalized]) {
    normalized = PLURAL_MAPPINGS[normalized];
  } else {
    const words = normalized.split(' ');
    const lastWord = words[words.length - 1];
    if (PLURAL_MAPPINGS[lastWord]) {
      words[words.length - 1] = PLURAL_MAPPINGS[lastWord];
      normalized = words.join(' ');
    }
  }

  normalized = normalized
    .replace(/,+/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return normalized;
}

export function createNormalizationKey(name: string): string {
  return normalizeIngredientName(name);
}

export function areIngredientsSimilar(name1: string, name2: string): boolean {
  const norm1 = normalizeIngredientName(name1);
  const norm2 = normalizeIngredientName(name2);
  return norm1 === norm2;
}

export function extractBaseIngredient(name: string): string {
  return normalizeIngredientName(name);
}
