-- FlavorVault - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- RECIPES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  servings INTEGER NOT NULL CHECK (servings >= 1 AND servings <= 50),
  category TEXT NOT NULL,
  ingredients JSONB NOT NULL,
  steps JSONB NOT NULL,
  image_uri TEXT NULL,
  prep_time INTEGER NULL CHECK (prep_time >= 0 AND prep_time <= 1440),
  cook_time INTEGER NULL CHECK (cook_time >= 0 AND cook_time <= 1440),
  tags JSONB NULL,
  source TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL
);

-- Index for user queries
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category);
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes(created_at DESC);

-- Enable RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own recipes
CREATE POLICY "Users can manage own recipes"
ON recipes
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- MEAL PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_date ON meal_plans(date);
CREATE INDEX IF NOT EXISTS idx_meal_plans_recipe_id ON meal_plans(recipe_id);

-- Enable RLS
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can manage own meal plans"
ON meal_plans
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- SHOPPING LIST ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS shopping_list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(name) > 0 AND length(name) <= 100),
  quantity REAL NULL CHECK (quantity IS NULL OR (quantity > 0 AND quantity <= 1000)),
  unit TEXT NULL,
  checked BOOLEAN NOT NULL DEFAULT FALSE,
  recipe_id UUID NULL REFERENCES recipes(id) ON DELETE CASCADE,
  meal_plan_id UUID NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'Other',
  source TEXT NOT NULL DEFAULT 'recipe' CHECK (source IN ('recipe', 'manual')),
  original_name TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_user_id ON shopping_list_items(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_category ON shopping_list_items(category);
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_recipe_id ON shopping_list_items(recipe_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_source ON shopping_list_items(source);

-- Enable RLS
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can manage own shopping list items"
ON shopping_list_items
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- CUSTOM CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS custom_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(name) > 0 AND length(name) <= 30),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL,
  UNIQUE(user_id, name)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_custom_categories_user_id ON custom_categories(user_id);

-- Enable RLS
ALTER TABLE custom_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can manage own custom categories"
ON custom_categories
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- RECIPE TAGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS recipe_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  category_type TEXT NOT NULL CHECK (category_type IN ('default', 'custom')),
  category_name TEXT NOT NULL,
  tag_value TEXT NOT NULL CHECK (length(tag_value) > 0 AND length(tag_value) <= 30),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_recipe_tags_user_id ON recipe_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_tags_recipe_id ON recipe_tags(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_tags_category_name ON recipe_tags(category_name);
CREATE INDEX IF NOT EXISTS idx_recipe_tags_tag_value ON recipe_tags(tag_value);

-- Enable RLS
ALTER TABLE recipe_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can manage own recipe tags"
ON recipe_tags
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for recipes
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for custom_categories
CREATE TRIGGER update_custom_categories_updated_at
  BEFORE UPDATE ON custom_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DELETE USER ACCOUNT FUNCTION
-- ============================================
-- Securely deletes the calling user's account server-side.
-- Uses SECURITY DEFINER to bypass RLS and access auth.users.
-- All user data cascades automatically via ON DELETE CASCADE.
-- Storage objects must be cleaned up manually since Storage doesn't cascade.

CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  calling_user_id UUID;
BEGIN
  calling_user_id := auth.uid();

  IF calling_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  BEGIN
    DELETE FROM storage.objects
    WHERE bucket_id = 'recipe-images'
      AND (storage.foldername(name))[1] = calling_user_id::text;
  EXCEPTION
    WHEN OTHERS THEN
      NULL;
  END;

  DELETE FROM auth.users WHERE id = calling_user_id;
END;
$$;
