import { Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { DataTable } from '../common/data-table/dataTable';

import { columns } from './assetsColumns';

import { AssetFilesUpload } from '@/components/assets-upload/AssetFilesUpload';
import { SuperButton } from '@/components/common/button';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { inferCategory } from '@/lib/asset';
import {
  bulkCreateAssets,
  bulkDeleteAssets,
  getAssets,
} from '@/services/asset.service';

const PAGE_SIZE = 20;

export default function AssetHandling() {
  const [data, setData] = useState<Asset[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);

  const fetchPage = useCallback(async (targetPage: number) => {
    setLoading(true);
    try {
      const result = await getAssets({ page: targetPage, limit: PAGE_SIZE });
      setData(result.items);
      setPageCount(result.totalPages);
      setSelectedAssetIds([]);
    } catch {
      toast.error('Erreur lors du chargement des assets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(page);
  }, [fetchPage, page]);

  const refresh = useCallback(() => fetchPage(page), [fetchPage, page]);

  const tableColumns = useMemo(() => columns(refresh), [refresh]);

  const onUpload = async (files: File[]) => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      const result = await bulkCreateAssets({
        assets: files.map(file => ({
          name: file.name.replace(/\.[^.]+$/, ''),
          category: inferCategory(file),
          file,
        })),
      });

      if (result.failed.length > 0) {
        toast.warning(
          `${result.succeeded.length} asset(s) créé(s) · ${result.failed.length} échec(s)`
        );
      } else {
        toast.success(`${result.succeeded.length} asset(s) créé(s)`);
      }

      setOpen(false);
      setPage(1);
      await fetchPage(1);
    } catch (error: any) {
      toast.error(error?.message ?? "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSelected = useCallback(async () => {
    if (selectedAssetIds.length === 0) {
      toast.error('Aucun asset sélectionné');
      return;
    }

    try {
      const result = await bulkDeleteAssets(selectedAssetIds);

      if (result.failed.length > 0) {
        toast.warning(
          `${result.deleted} supprimé(s) · ${result.failed.length} échec(s)`
        );
      } else {
        toast.success(`${result.deleted} asset(s) supprimé(s)`);
      }

      setSelectedAssetIds([]);

      const nextPage =
        data.length >= selectedAssetIds.length && page > 1 ? page - 1 : page;
      setPage(nextPage);
      await fetchPage(nextPage);
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  }, [selectedAssetIds, data.length, page, fetchPage]);

  const handleSelectedRowsChange = useCallback((selectedRows: Asset[]) => {
    const ids = selectedRows.map(asset => asset.id);
    setSelectedAssetIds(ids);
  }, []);

  return (
    <div className="container mx-auto h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="magic-text md:text-5xl text-3xl font-bold">
          Gérez les assets
        </h1>
      </div>

      <div className="container mx-auto">
        {/* Action Bar */}
        <div className="flex justify-between items-center mb-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <SuperButton
                voiceText={"Le paramètre avancé, c'est pour les grands."}
                className="flex items-center gap-2 form-button"
              >
                <Plus className="w-4 h-4" />
                Ajouter des assets
              </SuperButton>
            </DialogTrigger>
            <DialogContent className="bg-sidebar max-w-3xl! w-full z-120">
              <AssetFilesUpload onUpload={onUpload} loading={uploading} />
            </DialogContent>
          </Dialog>

          {selectedAssetIds.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {selectedAssetIds.length} asset(s) sélectionné(s)
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
              >
                Supprimer la sélection
              </Button>
            </div>
          )}
        </div>

        <DataTable
          columns={tableColumns}
          data={data}
          loading={loading}
          pageCount={pageCount}
          pageIndex={page - 1}
          onPageChange={newIndex => setPage(newIndex + 1)}
          onSelectedRowsChange={handleSelectedRowsChange}
        />
      </div>
    </div>
  );
}
