import { v4 as uuidv4 } from 'uuid';
import { dbConnection, DatabaseError } from '../connection';
import {
  ShoppingListItem,
  ShoppingListItemRow,
  ShoppingListItemUtils,
  CreateShoppingListItemInput,
  UpdateShoppingListItemInput,
  ShoppingListItemWithRecipe,
  GroupedShoppingListItems,
  ShoppingListItemSource,
  CATEGORY_ORDER,
} from '../schema/shopping-list';

export class ShoppingListService {
  async createItem(
    input: CreateShoppingListItemInput
  ): Promise<ShoppingListItem> {
    const item = ShoppingListItemUtils.create(input);
    item.id = uuidv4();

    const errors = ShoppingListItemUtils.validate(item);
    if (errors.length > 0) {
      throw new DatabaseError(
        'VALIDATION_ERROR',
        `Shopping list item validation failed: ${errors.join(', ')}`
      );
    }

    const row = ShoppingListItemUtils.toRow(item);

    try {
      const query = `
        INSERT INTO shopping_list_items (
          id, name, quantity, unit, checked, recipeId, mealPlanId,
          category, source, originalName, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await dbConnection.executeQuery(query, [
        row.id,
        row.name,
        row.quantity,
        row.unit,
        row.checked,
        row.recipeId,
        row.mealPlanId,
        row.category,
        row.source,
        row.originalName,
        row.createdAt,
      ]);

      return item;
    } catch (error) {
      throw new DatabaseError(
        'CREATE_FAILED',
        `Failed to create shopping list item: ${error}`,
        error
      );
    }
  }

  async createBulk(
    inputs: CreateShoppingListItemInput[]
  ): Promise<ShoppingListItem[]> {
    return await dbConnection.executeTransaction(async () => {
      const items: ShoppingListItem[] = [];

      for (const input of inputs) {
        const item = await this.createItem(input);
        items.push(item);
      }

      return items;
    });
  }

  async getAll(): Promise<ShoppingListItem[]> {
    try {
      const query = `
        SELECT * FROM shopping_list_items
        ORDER BY category, name ASC
      `;

      const rows =
        await dbConnection.executeSelect<ShoppingListItemRow>(query);

      return rows.map((row) => ShoppingListItemUtils.fromRow(row));
    } catch (error) {
      throw new DatabaseError(
        'GET_ALL_FAILED',
        `Failed to get all shopping list items: ${error}`,
        error
      );
    }
  }

  async getAllByCategory(): Promise<GroupedShoppingListItems> {
    try {
      const items = await this.getAll();
      return ShoppingListItemUtils.groupByCategory(items);
    } catch (error) {
      throw new DatabaseError(
        'GET_BY_CATEGORY_FAILED',
        `Failed to get shopping list items by category: ${error}`,
        error
      );
    }
  }

  async getShoppingListItemById(
    id: string
  ): Promise<ShoppingListItem | null> {
    try {
      const query = `
        SELECT * FROM shopping_list_items
        WHERE id = ?
      `;

      const rows =
        await dbConnection.executeSelect<ShoppingListItemRow>(query, [id]);

      if (rows.length === 0) {
        return null;
      }

      return ShoppingListItemUtils.fromRow(rows[0]);
    } catch (error) {
      throw new DatabaseError(
        'GET_FAILED',
        `Failed to get shopping list item by ID: ${error}`,
        error
      );
    }
  }

  async getAllShoppingItems(options?: {
    checkedOnly?: boolean;
    uncheckedOnly?: boolean;
    recipeOnly?: boolean;
    manualOnly?: boolean;
  }): Promise<ShoppingListItem[]> {
    try {
      let query = `
        SELECT * FROM shopping_list_items
        WHERE 1=1
      `;
      const params: any[] = [];

      if (options?.checkedOnly) {
        query += ` AND checked = 1`;
      }

      if (options?.uncheckedOnly) {
        query += ` AND checked = 0`;
      }

      if (options?.recipeOnly) {
        query += ` AND source = 'recipe'`;
      }

      if (options?.manualOnly) {
        query += ` AND source = 'manual'`;
      }

      query += ` ORDER BY checked ASC, category, name ASC`;

      const rows =
        await dbConnection.executeSelect<ShoppingListItemRow>(
          query,
          params
        );

      return rows.map((row) => ShoppingListItemUtils.fromRow(row));
    } catch (error) {
      throw new DatabaseError(
        'GET_ALL_FAILED',
        `Failed to get all shopping list items: ${error}`,
        error
      );
    }
  }

  async getShoppingItemsWithRecipe(): Promise<ShoppingListItemWithRecipe[]> {
    try {
      const query = `
        SELECT
          sli.*,
          r.title as recipeTitle,
          r.imageUri as recipeImageUri
        FROM shopping_list_items sli
        LEFT JOIN recipes r ON sli.recipeId = r.id
        ORDER BY sli.category, sli.name ASC
      `;

      const rows = await dbConnection.executeSelect<any>(query);

      return rows.map((row) => ({
        ...ShoppingListItemUtils.fromRow(row),
        recipeTitle: row.recipeTitle,
        recipeImageUri: row.recipeImageUri,
      }));
    } catch (error) {
      throw new DatabaseError(
        'GET_WITH_RECIPE_FAILED',
        `Failed to get shopping items with recipe: ${error}`,
        error
      );
    }
  }

  async getShoppingItemsByRecipe(
    recipeId: string
  ): Promise<ShoppingListItem[]> {
    try {
      const query = `
        SELECT * FROM shopping_list_items
        WHERE recipeId = ?
        ORDER BY category, name ASC
      `;

      const rows =
        await dbConnection.executeSelect<ShoppingListItemRow>(query, [
          recipeId,
        ]);

      return rows.map((row) => ShoppingListItemUtils.fromRow(row));
    } catch (error) {
      throw new DatabaseError(
        'GET_BY_RECIPE_FAILED',
        `Failed to get shopping items by recipe: ${error}`,
        error
      );
    }
  }

  async getShoppingItemsByMealPlan(
    mealPlanId: string
  ): Promise<ShoppingListItem[]> {
    try {
      const query = `
        SELECT * FROM shopping_list_items
        WHERE mealPlanId = ?
        ORDER BY category, name ASC
      `;

      const rows =
        await dbConnection.executeSelect<ShoppingListItemRow>(query, [
          mealPlanId,
        ]);

      return rows.map((row) => ShoppingListItemUtils.fromRow(row));
    } catch (error) {
      throw new DatabaseError(
        'GET_BY_MEAL_PLAN_FAILED',
        `Failed to get shopping items by meal plan: ${error}`,
        error
      );
    }
  }

  async updateCheckedState(
    id: string,
    checked: boolean
  ): Promise<ShoppingListItem> {
    try {
      const query = `
        UPDATE shopping_list_items
        SET checked = ?
        WHERE id = ?
      `;

      await dbConnection.executeQuery(query, [checked ? 1 : 0, id]);

      const item = await this.getShoppingListItemById(id);
      if (!item) {
        throw new DatabaseError(
          'NOT_FOUND',
          `Shopping list item with ID ${id} not found`
        );
      }

      return item;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        'UPDATE_CHECKED_FAILED',
        `Failed to update checked state: ${error}`,
        error
      );
    }
  }

  async updateShoppingItem(
    input: UpdateShoppingListItemInput
  ): Promise<ShoppingListItem> {
    try {
      const existing = await this.getShoppingListItemById(input.id);
      if (!existing) {
        throw new DatabaseError(
          'NOT_FOUND',
          `Shopping list item with ID ${input.id} not found`
        );
      }

      const updated = ShoppingListItemUtils.update(existing, input);

      const errors = ShoppingListItemUtils.validate(updated);
      if (errors.length > 0) {
        throw new DatabaseError(
          'VALIDATION_ERROR',
          `Shopping list item validation failed: ${errors.join(', ')}`
        );
      }

      const row = ShoppingListItemUtils.toRow(updated);

      const updates: string[] = [];
      const params: any[] = [];

      if (input.name !== undefined) {
        updates.push('name = ?');
        params.push(row.name);
      }
      if (input.quantity !== undefined) {
        updates.push('quantity = ?');
        params.push(row.quantity);
      }
      if (input.unit !== undefined) {
        updates.push('unit = ?');
        params.push(row.unit);
      }
      if (input.checked !== undefined) {
        updates.push('checked = ?');
        params.push(row.checked);
      }
      if (input.category !== undefined) {
        updates.push('category = ?');
        params.push(row.category);
      }

      if (updates.length === 0) {
        return existing;
      }

      params.push(input.id);

      const query = `
        UPDATE shopping_list_items
        SET ${updates.join(', ')}
        WHERE id = ?
      `;

      await dbConnection.executeQuery(query, params);

      return updated;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        'UPDATE_FAILED',
        `Failed to update shopping list item: ${error}`,
        error
      );
    }
  }

  async deleteItem(id: string): Promise<void> {
    try {
      const query = `
        DELETE FROM shopping_list_items
        WHERE id = ?
      `;

      await dbConnection.executeQuery(query, [id]);
    } catch (error) {
      throw new DatabaseError(
        'DELETE_FAILED',
        `Failed to delete shopping list item: ${error}`,
        error
      );
    }
  }

  async deleteBySource(source: ShoppingListItemSource): Promise<void> {
    try {
      const query = `
        DELETE FROM shopping_list_items
        WHERE source = ?
      `;

      await dbConnection.executeQuery(query, [source]);
    } catch (error) {
      throw new DatabaseError(
        'DELETE_BY_SOURCE_FAILED',
        `Failed to delete shopping items by source: ${error}`,
        error
      );
    }
  }

  async deleteByRecipeId(recipeId: string): Promise<void> {
    try {
      const query = `
        DELETE FROM shopping_list_items
        WHERE recipeId = ?
      `;

      await dbConnection.executeQuery(query, [recipeId]);
    } catch (error) {
      throw new DatabaseError(
        'DELETE_BY_RECIPE_FAILED',
        `Failed to delete shopping items by recipe: ${error}`,
        error
      );
    }
  }

  async clearAll(): Promise<void> {
    try {
      const query = `DELETE FROM shopping_list_items`;
      await dbConnection.executeQuery(query);
    } catch (error) {
      throw new DatabaseError(
        'CLEAR_ALL_FAILED',
        `Failed to clear all shopping list items: ${error}`,
        error
      );
    }
  }

  async deleteAllCheckedItems(): Promise<void> {
    try {
      const query = `
        DELETE FROM shopping_list_items
        WHERE checked = 1
      `;

      await dbConnection.executeQuery(query);
    } catch (error) {
      throw new DatabaseError(
        'DELETE_CHECKED_FAILED',
        `Failed to delete checked items: ${error}`,
        error
      );
    }
  }

  async deleteShoppingItemsByRecipe(recipeId: string): Promise<void> {
    return this.deleteByRecipeId(recipeId);
  }

  async deleteShoppingItemsByMealPlan(mealPlanId: string): Promise<void> {
    try {
      const query = `
        DELETE FROM shopping_list_items
        WHERE mealPlanId = ?
      `;

      await dbConnection.executeQuery(query, [mealPlanId]);
    } catch (error) {
      throw new DatabaseError(
        'DELETE_BY_MEAL_PLAN_FAILED',
        `Failed to delete shopping items by meal plan: ${error}`,
        error
      );
    }
  }

  async createShoppingItemsBatch(
    inputs: CreateShoppingListItemInput[]
  ): Promise<ShoppingListItem[]> {
    return this.createBulk(inputs);
  }

  async deleteShoppingItemsBatch(ids: string[]): Promise<void> {
    return await dbConnection.executeTransaction(async () => {
      for (const id of ids) {
        await this.deleteItem(id);
      }
    });
  }

  async checkAllItems(): Promise<void> {
    try {
      const query = `
        UPDATE shopping_list_items
        SET checked = 1
      `;

      await dbConnection.executeQuery(query);
    } catch (error) {
      throw new DatabaseError(
        'CHECK_ALL_FAILED',
        `Failed to check all items: ${error}`,
        error
      );
    }
  }

  async uncheckAllItems(): Promise<void> {
    try {
      const query = `
        UPDATE shopping_list_items
        SET checked = 0
      `;

      await dbConnection.executeQuery(query);
    } catch (error) {
      throw new DatabaseError(
        'UNCHECK_ALL_FAILED',
        `Failed to uncheck all items: ${error}`,
        error
      );
    }
  }

  async uncheckRecipeItems(): Promise<void> {
    try {
      const query = `
        UPDATE shopping_list_items
        SET checked = 0
        WHERE source = 'recipe'
      `;

      await dbConnection.executeQuery(query);
    } catch (error) {
      throw new DatabaseError(
        'UNCHECK_RECIPE_ITEMS_FAILED',
        `Failed to uncheck recipe items: ${error}`,
        error
      );
    }
  }

  async getShoppingItemCount(options?: {
    checkedOnly?: boolean;
    uncheckedOnly?: boolean;
    source?: ShoppingListItemSource;
  }): Promise<number> {
    try {
      let query = `SELECT COUNT(*) as count FROM shopping_list_items WHERE 1=1`;
      const params: any[] = [];

      if (options?.checkedOnly) {
        query += ` AND checked = 1`;
      }

      if (options?.uncheckedOnly) {
        query += ` AND checked = 0`;
      }

      if (options?.source) {
        query += ` AND source = ?`;
        params.push(options.source);
      }

      const result = await dbConnection.executeSelect<{ count: number }>(
        query,
        params
      );

      return result[0]?.count || 0;
    } catch (error) {
      throw new DatabaseError(
        'COUNT_FAILED',
        `Failed to get shopping item count: ${error}`,
        error
      );
    }
  }

  async executeInTransaction<T>(
    operation: (service: ShoppingListService) => Promise<T>
  ): Promise<T> {
    return await dbConnection.executeTransaction(async () => {
      return await operation(this);
    });
  }

  // Legacy method names for backward compatibility
  async createShoppingListItem(
    input: CreateShoppingListItemInput
  ): Promise<ShoppingListItem> {
    return this.createItem(input);
  }

  async deleteShoppingItem(id: string): Promise<void> {
    return this.deleteItem(id);
  }
}

export const shoppingListService = new ShoppingListService();
