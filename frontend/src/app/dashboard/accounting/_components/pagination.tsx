import { ArrowLeft, ArrowRight } from 'lucide-react';
import { FC } from 'react';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface Props {
  currentPage: number;
  totalPages: number;
  handleNextPage: (pageNumber: number) => void;
  handlePreviousPage: (pageNumber: number) => void;
  handleSelectedChange: (pageNumber: number) => void;
}
const AccountsPagination: FC<Props> = ({
  currentPage,
  handleNextPage,
  handlePreviousPage,
  handleSelectedChange,
  totalPages,
}: Props) => {
  const handleNext = () => {
    if (currentPage >= totalPages) {
      return;
    }
    return handleNextPage(currentPage + 1);
  };
  const handlePrevious = () => {
    if (currentPage <= 1) {
      return;
    }
    return handlePreviousPage(currentPage - 1);
  };
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem onClick={handlePrevious}>
          <PaginationPrevious href='#'>
            <ArrowLeft />
          </PaginationPrevious>
        </PaginationItem>
        {Array.from({ length: totalPages }, (_, index) => (
          <PaginationItem
            key={index + 1}
            onClick={() => handleSelectedChange(index + 1)}
          >
            <PaginationLink href='#' isActive={currentPage === index + 1}>
              {index + 1}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem onClick={handleNext}>
          <PaginationNext href='#'>
            <ArrowRight />
          </PaginationNext>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
export default AccountsPagination;
