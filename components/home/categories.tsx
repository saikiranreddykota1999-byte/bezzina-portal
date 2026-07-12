import { getHomepageCategories } from '@/services/product.service';
import { CategoriesGrid } from '@/components/home/categories-grid';

export async function Categories() {
  const categories = await getHomepageCategories();
  return <CategoriesGrid categories={categories} />;
}
