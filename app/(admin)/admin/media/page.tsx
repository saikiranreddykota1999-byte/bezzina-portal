import { getMediaAssetsAction } from '@/actions/admin-media';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { MediaLibraryManager } from '@/components/admin/media-library-manager';

export const metadata = { title: 'Media Library | Admin' };

export default async function AdminMediaPage() {
  const result = await getMediaAssetsAction();
  if (!result.success) return <p className="text-[var(--admin-danger)]">{result.error}</p>;

  return (
    <div>
      <AdminPageHeader
        title="Media Library"
        description="Upload, search, and manage images, videos, and documents."
      />
      <MediaLibraryManager assets={result.data ?? []} />
    </div>
  );
}
