'use server';

import { revalidatePath } from 'next/cache';
import { requireStaffUser } from '@/lib/auth/server-session';
import { categoryFormSchema } from '@/lib/validators/catalogue';
import type { Category, CategoryDivision } from '@/types/product';

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string };

export type CategoryTree = {
  parents: Category[];
  subcategories: Category[];
};

export async function getAdminCategoryTree(): Promise<ActionResult<CategoryTree>> {
  try {
    const { supabase } = await requireStaffUser();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) return { success: false, error: error.message };

    const categories = data ?? [];
    return {
      success: true,
      data: {
        parents: categories.filter((c) => !c.parent_id),
        subcategories: categories.filter((c) => c.parent_id),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load categories',
    };
  }
}

export async function createCategory(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase } = await requireStaffUser();
    const parsed = categoryFormSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
    }

    const payload = parsed.data;
    if (payload.parent_id && payload.division) {
      return {
        success: false,
        error: 'Subcategories inherit division from their parent — leave division empty.',
      };
    }

    if (!payload.parent_id && !payload.division) {
      return { success: false, error: 'Top-level categories require a division.' };
    }

    let division = payload.division;
    if (payload.parent_id) {
      const { data: parent } = await supabase
        .from('categories')
        .select('division')
        .eq('id', payload.parent_id)
        .single();
      division = (parent?.division as CategoryDivision | null) ?? null;
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: payload.name,
        slug: payload.slug,
        description: payload.description ?? null,
        parent_id: payload.parent_id,
        division,
        sort_order: payload.sort_order,
      })
      .select('id')
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath('/marine');
    revalidatePath('/industrial');
    return { success: true, data: { id: data.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create category',
    };
  }
}

export async function updateCategory(id: string, input: unknown): Promise<ActionResult> {
  try {
    const { supabase } = await requireStaffUser();
    const parsed = categoryFormSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
    }

    const payload = parsed.data;
    let division = payload.division;

    if (payload.parent_id) {
      const { data: parent } = await supabase
        .from('categories')
        .select('division')
        .eq('id', payload.parent_id)
        .single();
      division = (parent?.division as CategoryDivision | null) ?? null;
    }

    const { error } = await supabase
      .from('categories')
      .update({
        name: payload.name,
        slug: payload.slug,
        description: payload.description ?? null,
        parent_id: payload.parent_id,
        division: payload.parent_id ? division : payload.division,
        sort_order: payload.sort_order,
      })
      .eq('id', id);

    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath('/marine');
    revalidatePath('/industrial');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update category',
    };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireStaffUser();

    const { count: childCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', id);

    if ((childCount ?? 0) > 0) {
      return { success: false, error: 'Remove subcategories first.' };
    }

    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id);

    if ((productCount ?? 0) > 0) {
      return {
        success: false,
        error: 'Cannot delete — products are assigned to this category. Reassign them first.',
      };
    }

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete category',
    };
  }
}
