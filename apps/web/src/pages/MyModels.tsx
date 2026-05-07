import { Wand } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import { Loading } from '@/components/common';
import { SuperButton } from '@/components/common/button';
import { Search } from '@/components/common/form';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { VoxelModelCreator } from '@/components/voxel/VoxelModelCreator';
import VoxelModelsGroup from '@/components/voxel/VoxelModelsGroup';
import { useProfile } from '@/hooks/useProfile';
import { getUserVoxelModels, VoxelModel } from '@/services/voxel.service';

const ITEMS_PER_PAGE = 8;

const MyModels: React.FC = () => {
  const { fetchProfile, loading } = useProfile();

  const [models, setModels] = useState<VoxelModel[]>([]);
  const [searchResults, setSearchResults] = useState<VoxelModel[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [profile, setProfile] = useState<Profile>({
    id: '',
    userId: '',
    pseudo: 'Unknown',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Emma',
    bio: '',
    followers: [],
    following: [],
    ideoramaLiked: [],
    ideoramas: [],
  });
  const [createsNew, setCreatesNew] = useState(false);

  useEffect(() => {
    const loadPage = async () => {
      const [profileData, modelsData] = await Promise.all([
        fetchProfile(),
        getUserVoxelModels(),
      ]);
      setProfile(profileData.profile);
      setModels(modelsData.data);
    };
    loadPage().catch(() => {});
  }, [fetchProfile]);

  const searchOptions = useMemo(
    () => models.map(m => ({ value: m.name, label: m.name })),
    [models]
  );

  const displayModels = useMemo(
    () => (searchResults !== null ? searchResults : models),
    [models, searchResults]
  );

  const totalPages = Math.ceil(displayModels.length / ITEMS_PER_PAGE);

  const paginatedModels = useMemo(
    () =>
      displayModels.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      ),
    [displayModels, currentPage]
  );

  const handleSearch = (term: string) => {
    setCurrentPage(1);
    if (!term || term.trim() === '') {
      setSearchResults(null);
    } else {
      const lower = term.toLowerCase();
      setSearchResults(
        models.filter(m => m.name?.toLowerCase().includes(lower))
      );
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages];
    if (currentPage >= totalPages - 2)
      return [
        1,
        '...',
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    return [
      1,
      '...',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      '...',
      totalPages,
    ];
  };

  if (loading) return <Loading />;

  return (
    <div className="w-full h-full">
      <div className="magic-text text-center md:text-5xl text-3xl justify-center flex items-center gap-2 font-bold mb-6">
        Tes modèles, {profile.pseudo}
      </div>

      <SuperButton
        tooltip="Créer un nouveau modèle"
        voiceText="Créer un nouveau modèle"
        onClick={() => setCreatesNew(true)}
        className="main-btn mb-8"
      >
        <Wand /> Créer un nouveau modèle
      </SuperButton>

      {createsNew && (
        <VoxelModelCreator isOpen={createsNew} setIsOpen={setCreatesNew} />
      )}

      <Search
        onSelect={handleSearch}
        options={searchOptions}
        limit={5}
        label="modèle"
        placeholder="Rechercher un modèle..."
        className="mb-8"
      />

      <VoxelModelsGroup
        models={paginatedModels}
        profile={profile}
        setModels={setModels}
      />

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                aria-disabled={currentPage === 1}
                className={
                  currentPage === 1
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>

            {getPageNumbers().map((page, i) =>
              page === '...' ? (
                <PaginationItem key={`ellipsis-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={currentPage === page}
                    onClick={() => setCurrentPage(page as number)}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                aria-disabled={currentPage === totalPages}
                className={
                  currentPage === totalPages
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default MyModels;
