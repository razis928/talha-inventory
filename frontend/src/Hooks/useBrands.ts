import { useOrg } from "Context/OrgContext";
import { useMutation, useQuery, useQueryClient, UseQueryResult } from "react-query";
import { queryStringify } from "Utils/queryString";
import { BrandsResponse } from "../Interfaces/Brands";
import { API_URL, getAccessToken } from "./api";
import { QueryPagination } from "Interfaces/QueryFilters";
import { toast } from "react-toastify";
import { brandParamsGeneralKeys } from "Utils/queryParamKeys";

export const useBrands = (
  searchParams?: URLSearchParams
): UseQueryResult<BrandsResponse, Error> => {
  const pagination: Partial<QueryPagination> = {
    count: searchParams?.get("count") || "100",
    page: searchParams?.get("page") || "1"
  };
  const { activeOrg: organization_id } = useOrg();
  const generalParams: Record<string, string> = {
    organization_id: (searchParams?.get("organization_id") as string) || organization_id,
    // If on the trash page, send the is_trash query param.
    ...(searchParams?.has("is_trash") ? { is_trash: "1" } : {})
  };

  brandParamsGeneralKeys.forEach(key => {
    if (searchParams?.has(key)) {
      generalParams[key] = searchParams?.get(key) as string;
    }
  });

  return useQuery<BrandsResponse, Error>(
    ["brands", searchParams?.toString()],
    async () => {
      const response = await fetch(
        `${API_URL}/brand/${queryStringify({
          ...pagination,
          ...generalParams,
          sorting: "-created"
        })}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${getAccessToken()}`
          }
        }
      );
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("TOKEN_EXPIRED");
        }
        throw new Error(response.statusText);
      }
      return response.json();
    },
    {
      enabled: !!organization_id,
      staleTime: Infinity,
      cacheTime: Infinity
    }
  );
};
export const useBrandsByOrganization = (
  orgId?: string,
  queryFilters?: Partial<QueryPagination>
) => {
  const qParams = queryStringify({ organization_id: orgId || "", ...queryFilters });
  return useQuery<BrandsResponse, Error>(
    ["brands", { orgId }],
    async () => {
      const response = await fetch(`${API_URL}/brand/${qParams}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    },
    {
      enabled: !!orgId,
      staleTime: Infinity,
      cacheTime: Infinity
    }
  );
};
export const useBrandsList = () => {
  return useQuery<BrandsResponse, Error>("brandsLists", async () => {
    const response = await fetch(`${API_URL}/brand/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getAccessToken()}`
      }
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  });
};
export const useTrashBrand = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { brandId?: string }>(
    async variables => {
      "delete-brand";
      const response = await fetch(`${API_URL}/brand/${id ? id : variables.brandId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "content-type": "application/json"
        }
      });
      if (!response.ok || response.status !== 204) {
        throw new Error("Error in deleting brand.");
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("brands");
        toast.success("Brand trashed successfully");
      },
      onError: error => {
        toast.error(error.message);
      }
    }
  );
};
export const useRestoreBrand = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { brandId?: string }>(
    "brand-restoration",

    async variables => {
      const response = await fetch(
        `${API_URL}/brand/${id ? id : variables.brandId}/restore/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
            "content-type": "application/json"
          },
          body: "{}"
        }
      );
      if (!response.ok) {
        throw new Error("Error in restoring brand.");
      }
      return response.json();
    },
    {
      onError: error => {
        toast.error("An Error occured while restoring brand.");
      },
      onSuccess: () => {
        queryClient.invalidateQueries("brands");
        toast.success("Brands restored successfully.");
      }
    }
  );
};
