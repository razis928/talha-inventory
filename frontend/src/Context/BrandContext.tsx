import * as React from "react";
import { useBrands } from "Hooks/useBrands";
import { useLocation, useSearchParams } from "react-router-dom";
import { mainNavigationPaths } from "Constants";

interface IBrandContext {
  activeBrand: string;
  setActiveBrand(value: string): void;
}

export const BrandContext = React.createContext<IBrandContext>({
  activeBrand: "",
  setActiveBrand: value => {}
});

export const BrandProvider: React.FC = ({ children }) => {
  // first fetch all the brands
  const { data } = useBrands();
  const { pathname } = useLocation();
  const shouldChangeBrandInUrl = mainNavigationPaths.includes(pathname);
  const [searchParams, setSearchSearchParams] = useSearchParams();
  // This state will store the currently active brand.
  const [activeBrand, setActive] = React.useState("");

  // Here's the order of priority of the source, from where we get the active brand id
  // First, try reading it from URLSearchParams, then check the localStorage and if no
  // brand is found then set the first brand coming from the backend as active brand.
  const brandFromURL = searchParams.get("brand_id");
  const brandFromStorage = localStorage.getItem("brand");
  // 😱⁉️🤯🤬
  const defaultBrand =
    data?.results?.find(brand => brand.id === (brandFromURL || brandFromStorage))?.id ||
    data?.results[0]?.id ||
    "";

  const setActiveBrand = React.useCallback(
    (brandId: string) => {
      setActive(brandId);
      localStorage.setItem("brand", brandId);
      if (shouldChangeBrandInUrl && brandId) {
        const params = new URLSearchParams(searchParams);
        params.set("brand_id", brandId);
        setSearchSearchParams(params);
      }
    },
    [searchParams, setSearchSearchParams, shouldChangeBrandInUrl]
  );

  React.useEffect(() => {
    if (defaultBrand) {
      setActiveBrand(defaultBrand);
    }
  }, [defaultBrand, setActiveBrand]);

  return (
    <BrandContext.Provider value={{ activeBrand, setActiveBrand }}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  return React.useContext(BrandContext);
};
