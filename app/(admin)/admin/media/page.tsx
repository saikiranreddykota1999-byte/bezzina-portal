import { getMediaAssetsAction } from '@/actions/admin-media';
import { MediaLibraryManager } from '@/components/admin/media-library-manager';

export const metadata = { title: 'Media Library | Admin' };

export default async function AdminMediaPage() {
  const result = await getMediaAssetsAction();
  if (!result.success) return <p className="text-red-600">{result.error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Media Library</h1>
      <p className="mt-1 text-sm text-slate-600">Upload, search, and manage images, videos, and documents.</p>
      <div className="mt-8">
        <MediaLibraryManager assets={result.data ?? []} />
      </div>
    </div>
  );
}
