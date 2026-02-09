export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
  public: {
    Tables: {
      recipes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          servings: number;
          category: string;
          ingredients: Json;
          steps: Json;
          image_uri: string | null;
          prep_time: number | null;
          cook_time: number | null;
          tags: Json | null;
          source: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          servings: number;
          category: string;
          ingredients: Json;
          steps: Json;
          image_uri?: string | null;
          prep_time?: number | null;
          cook_time?: number | null;
          tags?: Json | null;
          source?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          servings?: number;
          category?: string;
          ingredients?: Json;
          steps?: Json;
          image_uri?: string | null;
          prep_time?: number | null;
          cook_time?: number | null;
          tags?: Json | null;
          source?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      meal_plans: {
        Row: {
          id: string;
          user_id: string;
          recipe_id: string;
          date: string;
          meal_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          recipe_id: string;
          date: string;
          meal_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          recipe_id?: string;
          date?: string;
          meal_type?: string;
          created_at?: string;
        };
      };
      shopping_list_items: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          quantity: number | null;
          unit: string | null;
          checked: boolean;
          recipe_id: string | null;
          meal_plan_id: string | null;
          category: string;
          source: string;
          original_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          quantity?: number | null;
          unit?: string | null;
          checked?: boolean;
          recipe_id?: string | null;
          meal_plan_id?: string | null;
          category?: string;
          source?: string;
          original_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          quantity?: number | null;
          unit?: string | null;
          checked?: boolean;
          recipe_id?: string | null;
          meal_plan_id?: string | null;
          category?: string;
          source?: string;
          original_name?: string | null;
          created_at?: string;
        };
      };
      custom_categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      recipe_tags: {
        Row: {
          id: string;
          user_id: string;
          recipe_id: string;
          category_type: string;
          category_name: string;
          tag_value: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          recipe_id: string;
          category_type: string;
          category_name: string;
          tag_value: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          recipe_id?: string;
          category_type?: string;
          category_name?: string;
          tag_value?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
