// import { useOrg } from "Context/OrgContext";
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult
} from "react-query";
import { queryStringify } from "Utils/queryString";
import { API_URL, getAccessToken } from "./api";
import { QueryPagination } from "Interfaces/QueryFilters";
import { toast } from "react-toastify";
import { vendorsParamsGeneralKeys } from "Utils/queryParamKeys";
import { VendorData, VendorResponse } from "Interfaces/Vendors";
import { showError, showSuccess } from "Components/Toaster";

export const useVendors = (
  searchParams?: URLSearchParams
): UseQueryResult<VendorResponse, Error> => {
  const pagination: Partial<QueryPagination> = {
    count: searchParams?.get("count") || "100",
    page: searchParams?.get("page") || "1"
  };
  //   const { activeOrg: organization_id } = useOrg();
  const generalParams: Record<string, string> = {
    // organization_id: (searchParams?.get("organization_id") as string) || organization_id,
    // If on the trash page, send the is_trash query param.
    ...(searchParams?.has("is_trash") ? { is_trash: "1" } : {})
  };

  vendorsParamsGeneralKeys.forEach(key => {
    if (searchParams?.has(key)) {
      generalParams[key] = searchParams?.get(key) as string;
    }
  });

  return useQuery<VendorResponse, Error>(
    ["vendors", searchParams?.toString()],
    async () => {
      const response = await fetch(
        `${API_URL}/vendor/${queryStringify({
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
      //   enabled: !!organization_id,
      staleTime: Infinity,
      cacheTime: Infinity
    }
  );
};

export const useVendorsList = () => {
  return useQuery<VendorResponse, Error>("vendorsLists", async () => {
    const response = await fetch(`${API_URL}/vendor/`, {
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

export const useVendorById = (id?: string): UseQueryResult<VendorData, Error> => {
  return useQuery<VendorData, Error>(
    ["vendor", id],
    async () => {
      const response = await fetch(`${API_URL}/vendor/${id}/`, {
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
      enabled: !!id
    }
  );
};

export const useTrashVendor = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { vendorId?: string }>(
    async variables => {
      "delete-vendor";
      const response = await fetch(`${API_URL}/vendor/${id ? id : variables.vendorId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "content-type": "application/json"
        }
      });
      if (!response.ok || response.status !== 204) {
        throw new Error("Error in deleting vendor.");
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("vendors");
        toast.success("Vendor trashed successfully");
      },
      onError: error => {
        toast.error(error.message);
      }
    }
  );
};
export const useRestoreVendor = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { vendorId?: string }>(
    "vendor-restoration",

    async variables => {
      const response = await fetch(
        `${API_URL}/vendor/${id ? id : variables.vendorId}/restore/`,
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
        throw new Error("Error in restoring vendor.");
      }
      return response.json();
    },
    {
      onError: error => {
        toast.error("An Error occurred while restoring vendor.");
      },
      onSuccess: () => {
        queryClient.invalidateQueries("vendors");
        toast.success("vendor restored successfully.");
      }
    }
  );
};

export const useCreateVendor = (): UseMutationResult<
  Partial<VendorData>,
  Error,
  Partial<VendorData>
> => {
  const queryClient = useQueryClient();
  return useMutation<Partial<VendorData>, Error, Partial<VendorData>>(
    "create-vendor",
    async (variables: Partial<VendorData>) => {
      const response = await fetch(`${API_URL}/vendor/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "content-type": "application/json"
        },
        body: JSON.stringify(variables)
      });
      if (!response.ok) {
        throw new Error("Error in Creating Vendor.");
      }
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("vendors");
        queryClient.invalidateQueries("vendorsLists");
        showSuccess("Vendor created successfully");
      },
      onError: () => showError("Error occurred while creating vendor.")
    }
  );
};
