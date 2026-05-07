import { Wand } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import { SuperButton } from '@/components/common/button';
import { Search } from '@/components/common/form';
import { IdeoramaCreator } from '@/components/ideorama/IdeoramaCreator';
import IdeoramasGroup from '@/components/ideorama/IdeoramasGroup';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { getUserIdeoramas } from '@/services/ideorama.service';
import { getMyProfile } from '@/services/profile.service';

const ITEMS_PER_PAGE = 8;

const MyIdeoramas: React.FC = () => {
  const [ideoramas, setIdeoramas] = useState<Ideorama[]>([]);
  const [searchResults, setSearchResults] = useState<Ideorama[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [profile, setProfile] = useState<Profile>({
    id: '',
    userId: '',
    pseudo: 'Unknown',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
    bio: '',
    voiceButtons: true,
    followers: [],
    following: [],
    ideoramaLiked: [],
    ideoramas: [],
  });
  const [createsNew, setCreatesNew] = useState(false);

  useEffect(() => {
    getUserIdeoramas().then(res => setIdeoramas(res.data));
    getMyProfile().then(res => setProfile(res.data.profile));
  }, []);

  const searchOptions = useMemo(
    () => ideoramas.map(i => ({ value: i.name, label: i.name })),
    [ideoramas]
  );

  const displayIdeoramas = useMemo(
    () => (searchResults !== null ? searchResults : ideoramas),
    [ideoramas, searchResults]
  );

  const totalPages = Math.ceil(displayIdeoramas.length / ITEMS_PER_PAGE);

  const paginatedIdeoramas = useMemo(
    () =>
      displayIdeoramas.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      ),
    [displayIdeoramas, currentPage]
  );

  const handleSearch = (term: string) => {
    setCurrentPage(1);
    if (!term || term.trim() === '') {
      setSearchResults(null);
    } else {
      const lower = term.toLowerCase();
      setSearchResults(
        ideoramas.filter(i => i.name?.toLowerCase().includes(lower))
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

  return (
    <div className="w-full h-full">
      <div className="magic-text text-center md:text-5xl text-3xl justify-center flex items-center gap-2 font-bold mb-6">
        Tes idéoramas, {profile.pseudo}
      </div>

      <SuperButton
        tooltip="Créer un nouveau idéorama"
        voiceText="Créer un nouveau idéorama"
        onClick={() => setCreatesNew(true)}
        className="main-btn mb-8"
      >
        <Wand /> Créer un nouveau idéorama
      </SuperButton>

      {createsNew && (
        <IdeoramaCreator isOpen={createsNew} setIsOpen={setCreatesNew} />
      )}

      <Search
        onSelect={handleSearch}
        options={searchOptions}
        limit={5}
        label="idéorama"
        placeholder="Rechercher un idéorama..."
        className="mb-8"
      />

      <IdeoramasGroup
        ideoramas={paginatedIdeoramas}
        setIdeoramas={setIdeoramas}
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

export default MyIdeoramas;
