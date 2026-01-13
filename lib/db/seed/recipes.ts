import { DishCategory, MeasurementUnit } from '@/constants/enums';
import { CreateRecipeInput } from '../schema/recipe';

/**
 * Sample recipe data for seeding the database
 * 8 recipes: 2 breakfast, 2 lunch, 3 dinner, 1 dessert
 */
export const sampleRecipes: CreateRecipeInput[] = [
  // Breakfast 1: Classic Pancakes
  {
    title: 'Fluffy Buttermilk Pancakes',
    servings: 4,
    category: DishCategory.BREAKFAST,
    ingredients: [
      {
        name: 'all-purpose flour',
        quantity: 2,
        unit: MeasurementUnit.CUP,
      },
      {
        name: 'sugar',
        quantity: 2,
        unit: MeasurementUnit.TBSP,
      },
      {
        name: 'baking powder',
        quantity: 2,
        unit: MeasurementUnit.TSP,
      },
      {
        name: 'baking soda',
        quantity: 1,
        unit: MeasurementUnit.TSP,
      },
      {
        name: 'salt',
        quantity: 0.5,
        unit: MeasurementUnit.TSP,
      },
      {
        name: 'buttermilk',
        quantity: 2,
        unit: MeasurementUnit.CUP,
      },
      {
        name: 'eggs',
        quantity: 2,
        unit: MeasurementUnit.UNIT,
      },
      {
        name: 'butter',
        quantity: 4,
        unit: MeasurementUnit.TBSP,
      },
      {
        name: 'vanilla extract',
        quantity: 1,
        unit: MeasurementUnit.TSP,
      },
    ],
    steps: [
      'In a large bowl, whisk together flour, sugar, baking powder, baking soda, and salt.',
      'In another bowl, whisk buttermilk, eggs, melted butter, and vanilla extract.',
      'Pour wet ingredients into dry ingredients and stir until just combined (batter should be lumpy).',
      'Heat a griddle or non-stick pan over medium heat and lightly grease.',
      'Pour 1/4 cup batter for each pancake onto the griddle.',
      'Cook until bubbles form on surface and edges look dry, about 2-3 minutes.',
      'Flip and cook until golden brown on the other side, about 1-2 minutes.',
      'Serve warm with maple syrup, butter, and fresh berries.',
    ],
    prepTime: 10,
    cookTime: 20,
    tags: ['Easy', 'rating:4.5', 'quick', 'family-friendly', 'American'],
    imageUri: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=800',
  },

  // Breakfast 2: Oatmeal
  {
    title: 'Hearty Cinnamon Oatmeal',
    servings: 2,
    category: DishCategory.BREAKFAST,
    ingredients: [
      {
        name: 'rolled oats',
        quantity: 1,
        unit: MeasurementUnit.CUP,
      },
      {
        name: 'milk',
        quantity: 2,
        unit: MeasurementUnit.CUP,
      },
      {
        name: 'cinnamon',
        quantity: 1,
        unit: MeasurementUnit.TSP,
      },
      {
        name: 'honey',
        quantity: 2,
        unit: MeasurementUnit.TBSP,
      },
      {
        name: 'banana',
        quantity: 1,
        unit: MeasurementUnit.UNIT,
      },
      {
        name: 'walnuts',
        quantity: 0.25,
        unit: MeasurementUnit.CUP,
      },
      {
        name: 'salt',
        quantity: 0.25,
        unit: MeasurementUnit.TSP,
      },
    ],
    steps: [
      'In a medium saucepan, bring milk and salt to a gentle boil.',
      'Stir in rolled oats and reduce heat to medium-low.',
      'Cook, stirring occasionally, for 5-7 minutes until creamy.',
      'Stir in cinnamon and honey.',
      'Slice banana and chop walnuts.',
      'Divide oatmeal into bowls and top with banana slices and walnuts.',
      'Drizzle with additional honey if desired.',
    ],
    prepTime: 5,
    cookTime: 10,
    tags: ['Easy', 'rating:4.2', 'quick', 'vegetarian', 'healthy'],
    imageUri: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800',
  },

  // Lunch 1: Chicken Caesar Salad
  {
    title: 'Classic Chicken Caesar Salad',
    servings: 4,
    category: DishCategory.LUNCH,
    ingredients: [
      {
        name: 'romaine lettuce',
        quantity: 2,
        unit: MeasurementUnit.HEAD,
      },
      {
        name: 'chicken breast',
        quantity: 1,
        unit: MeasurementUnit.LB,
      },
      {
        name: 'parmesan cheese',
        quantity: 0.5,
        unit: MeasurementUnit.CUP,
      },
      {
        name: 'croutons',
        quantity: 1,
        unit: MeasurementUnit.CUP,
      },
      {
        name: 'Caesar dressing',
        quantity: 0.5,
        unit: MeasurementUnit.CUP,
      },
      {
        name: 'olive oil',
        quantity: 2,
        unit: MeasurementUnit.TBSP,
      },
      {
        name: 'salt',
        quantity: 0.5,
        unit: MeasurementUnit.TSP,
      },
      {
        name: 'black pepper',
        quantity: 0.25,
        unit: MeasurementUnit.TSP,
      },
    ],
    steps: [
      'Season chicken breasts with salt and pepper.',
      'Heat olive oil in a pan over medium-high heat.',
      'Cook chicken for 6-7 minutes per side until cooked through.',
      'Let chicken rest for 5 minutes, then slice into strips.',
      'Wash and chop romaine lettuce into bite-sized pieces.',
      'In a large bowl, toss lettuce with Caesar dressing.',
      'Add croutons and half the parmesan cheese, toss again.',
      'Top with sliced chicken and remaining parmesan.',
      'Serve immediately.',
    ],
    prepTime: 15,
    cookTime: 20,
    tags: ['Easy', 'rating:4.7', 'quick', 'salad', 'American'],
    imageUri: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=800',
  },

  // Lunch 2: Caprese Sandwich
  {
    title: 'Fresh Caprese Sandwich',
    servings: 2,
    category: DishCategory.LUNCH,
    ingredients: [
      {
        name: 'ciabatta bread',
        quantity: 1,
        unit: MeasurementUnit.UNIT,
      },
      {
        name: 'fresh mozzarella',
        quantity: 8,
        unit: MeasurementUnit.OZ,
      },
      {
        name: 'tomatoes',
        quantity: 2,
        unit: MeasurementUnit.UNIT,
      },
      {
        name: 'fresh basil',
        quantity: 1,
        unit: MeasurementUnit.BUNCH,
      },
      {
        name: 'balsamic glaze',
        quantity: 2,
        unit: MeasurementUnit.TBSP,
      },
      {
        name: 'olive oil',
        quantity: 2,
        unit: MeasurementUnit.TBSP,
      },
      {
        name: 'salt',
        quantity: 0.5,
        unit: MeasurementUnit.TSP,
      },
      {
        name: 'black pepper',
        quantity: 0.25,
        unit: MeasurementUnit.TSP,
      },
    ],
    steps: [
      'Slice ciabatta bread in half horizontally.',
      'Drizzle cut sides with olive oil.',
      'Slice mozzarella and tomatoes into 1/4-inch thick slices.',
      'Layer mozzarella and tomato slices on bottom half of bread.',
      'Season with salt and pepper.',
      'Add fresh basil leaves.',
      'Drizzle with balsamic glaze.',
      'Top with other half of bread and slice into portions.',
      'Serve immediately or wrap tightly.',
    ],
    prepTime: 10,
    cookTime: 0,
    tags: ['Easy', 'rating:4.4', 'quick', 'vegetarian', 'Italian', 'no-cook'],
    imageUri: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=800',
  },

  // Dinner 1: Spaghetti Bolognese
  {
    title: 'Classic Spaghetti Bolognese',
    servings: 6,
    category: DishCategory.DINNER,
    ingredients: [
      {
        name: 'spaghetti',
        quantity: 1,
        unit: MeasurementUnit.LB,
      },
      {
        name: 'ground beef',
        quantity: 1,
        unit: MeasurementUnit.LB,
      },
      {
        name: 'onion',
        quantity: 1,
        unit: MeasurementUnit.UNIT,
      },
      {
        name: 'garlic',
        quantity: 4,
        unit: MeasurementUnit.CLOVE,
      },
      {
        name: 'crushed tomatoes',
        quantity: 28,
        unit: MeasurementUnit.OZ,
      },
      {
        name: 'tomato paste',
        quantity: 2,
        unit: MeasurementUnit.TBSP,
      },
      {
        name: 'olive oil',
        quantity: 2,
        unit: MeasurementUnit.TBSP,
      },
      {
        name: 'dried oregano',
        quantity: 1,
        unit: MeasurementUnit.TSP,
      },
      {
        name: 'dried basil',
        quantity: 1,
        unit: MeasurementUnit.TSP,
      },
      {
        name: 'salt',
        quantity: 1,
        unit: MeasurementUnit.TSP,
      },
      {
        name: 'black pepper',
        quantity: 0.5,
        unit: MeasurementUnit.TSP,
      },
      {
        name: 'parmesan cheese',
        quantity: 0.5,
        unit: MeasurementUnit.CUP,
      },
    ],
    steps: [
      'Dice onion and mince garlic.',
      'Heat olive oil in a large pot over medium heat.',
      'Cook onion until softened, about 5 minutes.',
      'Add garlic and cook for 1 minute until fragrant.',
      'Add ground beef and cook until browned, breaking it up with a spoon.',
      'Stir in tomato paste, crushed tomatoes, oregano, basil, salt, and pepper.',
      'Bring to a simmer, then reduce heat and cook for 30 minutes, stirring occasionally.',
      'Meanwhile, cook spaghetti according to package directions.',
      'Drain pasta and toss with sauce.',
      'Serve topped with parmesan cheese.',
    ],
    prepTime: 15,
    cookTime: 45,
    tags: ['Medium', 'rating:4.8', 'family-friendly', 'Italian', 'comfort-food'],
    imageUri: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=800',
  },

  // Dinner 2: Chicken Stir-Fry
  {
    title: 'Quick Vegetable Chicken Stir-Fry',
    servings: 4,
    category: DishCategory.DINNER,
    ingredients: [
      {
        name: 'chicken breast',
        quantity: 1.5,
        unit: MeasurementUnit.LB,
      },
      {
        name: 'broccoli',
        quantity: 2,
        unit: MeasurementUnit.CUP,
      },
      {
        name: 'bell pepper',
        quantity: 2,
        unit: MeasurementUnit.UNIT,
      },
      {
        name: 'carrots',
        quantity: 2,
        unit: MeasurementUnit.UNIT,
      },
      {
        name: 'soy sauce',
        quantity: 0.25,
        unit: MeasurementUnit.CUP,
      },
      {
        name: 'garlic',
        quantity: 3,
        unit: MeasurementUnit.CLOVE,
      },
      {
        name: 'ginger',
        quantity: 1,
        unit: MeasurementUnit.TBSP,
      },
      {
        name: 'vegetable oil',
        quantity: 2,
        unit: MeasurementUnit.TBSP,
      },
      {
        name: 'rice',
        quantity: 2,
        unit: MeasurementUnit.CUP,
      },
      {
        name: 'sesame seeds',
        quantity: 1,
        unit: MeasurementUnit.TBSP,
      },
    ],
    steps: [
      'Cook rice according to package directions.',
      'Cut chicken into bite-sized pieces.',
      'Chop broccoli, bell peppers, and slice carrots.',
      'Mince garlic and ginger.',
      'Heat oil in a large wok or skillet over high heat.',
      'Add chicken and cook until golden, about 5-6 minutes.',
      'Remove chicken and set aside.',
      'Add vegetables to the pan and stir-fry for 4-5 minutes.',
      'Add garlic and ginger, cook for 1 minute.',
      'Return chicken to pan, add soy sauce, and toss everything together.',
      'Serve over rice and garnish with sesame seeds.',
    ],
    prepTime: 20,
    cookTime: 20,
    tags: ['Easy', 'rating:4.6', 'quick', 'Asian', 'healthy', 'one-pot'],
    imageUri: 'https://images.pexels.com/photos/2673353/pexels-photo-2673353.jpeg?auto=compress&cs=tinysrgb&w=800',
  },

  // Dinner 3: Baked Salmon
  {
    title: 'Lemon Herb Baked Salmon',
    servings: 4,
    category: DishCategory.DINNER,
    ingredients: [
      {
        name: 'salmon fillets',
        quantity: 4,
        unit: MeasurementUnit.PIECE,
      },
      {
        name: 'lemon',
        quantity: 2,
        unit: MeasurementUnit.UNIT,
      },
      {
        name: 'fresh dill',
        quantity: 0.25,
        unit: MeasurementUnit.CUP,
      },
      {
        name: 'olive oil',
        quantity: 3,
        unit: MeasurementUnit.TBSP,
      },
      {
        name: 'garlic',
        quantity: 3,
        unit: MeasurementUnit.CLOVE,
      },
      {
        name: 'salt',
        quantity: 1,
        unit: MeasurementUnit.TSP,
      },
      {
        name: 'black pepper',
        quantity: 0.5,
        unit: MeasurementUnit.TSP,
      },
      {
        name: 'asparagus',
        quantity: 1,
        unit: MeasurementUnit.LB,
      },
    ],
    steps: [
      'Preheat oven to 400°F (200°C).',
      'Line a baking sheet with parchment paper.',
      'Place salmon fillets on the baking sheet.',
      'Mince garlic and chop fresh dill.',
      'In a small bowl, mix olive oil, minced garlic, dill, salt, and pepper.',
      'Brush the mixture over salmon fillets.',
      'Slice one lemon and place slices on top of salmon.',
      'Trim asparagus and arrange around salmon on the baking sheet.',
      'Drizzle asparagus with remaining olive oil mixture.',
      'Bake for 12-15 minutes until salmon is cooked through.',
      'Squeeze juice from remaining lemon over salmon before serving.',
    ],
    prepTime: 10,
    cookTime: 15,
    tags: ['Easy', 'rating:4.9', 'quick', 'healthy', 'gluten-free'],
    imageUri: 'https://images.pexels.com/photos/3763847/pexels-photo-3763847.jpeg?auto=compress&cs=tinysrgb&w=800',
  },

  // Dessert: Chocolate Cake
  {
    title: 'Rich Chocolate Cake',
    servings: 12,
    category: DishCategory.DESSERT,
    ingredients: [
      {
        name: 'all-purpose flour',
        quantity: 2,
        unit: MeasurementUnit.CUP,
      },
      {
        name: 'sugar',
        quantity: 2,
        unit: MeasurementUnit.CUP,
      },
      {
        name: 'cocoa powder',
        quantity: 0.75,
        unit: MeasurementUnit.CUP,
      },
      {
        name: 'baking powder',
        quantity: 2,
        unit: MeasurementUnit.TSP,
      },
      {
        name: 'baking soda',
        quantity: 1.5,
        unit: MeasurementUnit.TSP,
      },
      {
        name: 'salt',
        quantity: 1,
        unit: MeasurementUnit.TSP,
      },
      {
        name: 'eggs',
        quantity: 2,
        unit: MeasurementUnit.UNIT,
      },
      {
        name: 'milk',
        quantity: 1,
        unit: MeasurementUnit.CUP,
      },
      {
        name: 'vegetable oil',
        quantity: 0.5,
        unit: MeasurementUnit.CUP,
      },
      {
        name: 'vanilla extract',
        quantity: 2,
        unit: MeasurementUnit.TSP,
      },
      {
        name: 'boiling water',
        quantity: 1,
        unit: MeasurementUnit.CUP,
      },
    ],
    steps: [
      'Preheat oven to 350°F (175°C).',
      'Grease and flour two 9-inch round cake pans.',
      'In a large bowl, combine flour, sugar, cocoa, baking powder, baking soda, and salt.',
      'Add eggs, milk, oil, and vanilla. Beat on medium speed for 2 minutes.',
      'Stir in boiling water (batter will be thin).',
      'Pour batter evenly into prepared pans.',
      'Bake for 30-35 minutes until a toothpick inserted in center comes out clean.',
      'Cool in pans for 10 minutes, then remove to wire racks to cool completely.',
      'Frost with your favorite chocolate frosting.',
      'Slice and serve.',
    ],
    prepTime: 20,
    cookTime: 35,
    tags: ['Medium', 'rating:4.8', 'dessert', 'family-friendly', 'celebration'],
    imageUri: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];
