'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { OfficesSection } from '@/components/page/hr/OfficesSection';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import { useDebounce } from '@/hooks/useDebounce';
import { useApi } from '@/hooks/useService/useApi';
import type { OfficeResponse } from '@/types/api/office.types';

/**
 * Container halaman Daftar Kantor (HR Admin) — orchestration layer.
 * Mengelola list kantor (GET /offices), pencarian debounced, dan penghapusan kantor.
 */
export default function HrOfficesContainer() {
  const api = useApi();
  const ns = useAppNameSpace();

  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, 500);

  const list = api.office.query.list({
    keyword: debouncedKeyword || undefined,
    limit: 100,
  });

  const isSearching = list.isFetching || keyword !== debouncedKeyword;
  const remove = api.office.mutate.delete();

  const handleDelete = useCallback(
    async (office: OfficeResponse) => {
      const confirmed = await ns.alert.confirm({
        title: 'Hapus Lokasi Kantor?',
        deskripsi: `Apakah Anda yakin ingin menghapus kantor "${office.name}"? Data absensi dan penempatan pada kantor ini dapat terpengaruh.`,
        confirmButtonText: 'Ya, Hapus Kantor',
        icon: 'warning',
      });

      if (!confirmed) return;

      try {
        await remove.mutateAsync({ officeId: office.id });
        toast.success(`Kantor ${office.name} berhasil dihapus.`);
        list.refetch();
      } catch (err: any) {
        toast.error(err?.message || 'Gagal menghapus kantor');
      }
    },
    [list, ns.alert, remove],
  );

  return (
    <OfficesSection
      state={{
        isPending: list.isPending,
        isFetching: isSearching,
        isError: list.isError,
        errorMessage: list.error?.message,
        offices: list.data ?? [],
        keyword,
        isDeleting: remove.isPending,
      }}
      actions={{
        onKeywordChange: setKeyword,
        onDelete: handleDelete,
      }}
    />
  );
}
