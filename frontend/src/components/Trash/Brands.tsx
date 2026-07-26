import * as React from "react";
import BrandsTable from "../Admin/Brands/BrandsTable";
import BrandFilters from "../Admin/Brands/BrandFilters";
import { useDebounce } from "Hooks/useDebounce";
import { useBrands } from "Hooks/useBrands";
import { useSearchParams } from "react-router-dom";

const BrandsTrash: React.FC = () => {
  const [searchParams] = useSearchParams();

  const debouncedParams = useDebounce(searchParams, 800);
  const { data: brands, isLoading } = useBrands(debouncedParams);

  return (
    <div>
      <BrandFilters />
      <br />
      <BrandsTable brands={brands} isLoading={isLoading} />
    </div>
  );
};
export default BrandsTrash;
