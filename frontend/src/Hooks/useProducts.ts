import {
  UseMutationResult,
  useQuery,
  useMutation,
  UseQueryResult,
  useQueryClient
} from "react-query";

import { ProductsResponse, ProductData, Attachment } from "Interfaces/Products";
import { API_URL, getAccessToken } from "./api";
import { showSuccess, showError } from "../Components/Toaster";
import { useBrand } from "Context/BrandContext";
import { queryStringify } from "Utils/queryString";
import { toast } from "react-toastify";
import { QueryPagination } from "Interfaces/QueryFilters";
import { productParamsGeneralKeys } from "Utils/queryParamKeys";

export const useProducts = (searchParams: URLSearchParams) => {
  const { activeBrand: brand_id } = useBrand();
  const pagination: Partial<QueryPagination> = {
    count: searchParams.get("count") || "100",
    page: searchParams.get("page") || "1"
  };

  const generalParams: Record<string, string> = {
    brand_id: (searchParams.get("brand_id") as string) || brand_id,
    // If we're on the trash page, include the is_trash query param to search for trashed products.
    ...(searchParams.has("is_trash") ? { is_trash: "1" } : {})
  };

  productParamsGeneralKeys.forEach(key => {
    if (searchParams.has(key)) {
      generalParams[key] = searchParams.get(key) as string;
    }
  });

  return useQuery<ProductsResponse, Error>(
    ["products", searchParams.toString()],
    async () => {
      const response = await fetch(
        `${API_URL}/product/${queryStringify({
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
        throw new Error(response.statusText);
      }
      return response.json();
    }
  );
};

export const useSingleProduct = (id: string): UseQueryResult<ProductData, Error> => {
  return useQuery<ProductData, Error>(["products", id], async () => {
    const response = await fetch(`${API_URL}/product/${id}/`, {
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

export const useCreateProduct = () => {
  const { activeBrand: brand_id } = useBrand();

  return useMutation<ProductData, Error, Partial<ProductData>>(
    "create-product",

    async (variables: Partial<ProductData>) => {
      delete variables.status;
      const response = await fetch(`${API_URL}/product/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "content-type": "application/json"
        },
        body: JSON.stringify({ ...variables, brand_id: brand_id })
      });
      if (!response.ok) {
        throw new Error("Error in Creating Product");
      }
      return response.json();
    },
    {
      onSuccess: () => showSuccess("Product Created Successfully"),
      onError: () => showError("Error in creating product")
    }
  );
};

interface ImageProductInterface {
  url: string;
}
export const useAddProductImage = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<ImageProductInterface, Error, BodyInit | null | undefined>(
    "add-product-image",

    async variables => {
      const response = await fetch(`${API_URL}/product/${id}/image/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        },
        body: variables
      });
      if (!response.ok) {
        throw new Error("Error in Creating Product");
      }
      return response.json();
    },
    {
      onSuccess: () => {
        showSuccess("Product Image Added Successfully");
        queryClient.invalidateQueries(["products", id]);
      },
      onError: () => showError("Error in adding image product")
    }
  );
};

export const useEditProductImage = (productId: string) => {
  const queryClient = useQueryClient();
  return useMutation<
    Attachment,
    Error,
    {
      id: string;
      file?: File | null;
      is_cover?: boolean;
    }
  >(
    async variables => {
      const response = await fetch(
        `${API_URL}/product/${productId}/image/${variables.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
            "content-type": "application/json"
          },
          body: JSON.stringify(variables)
        }
      );
      if (!response.ok) {
        throw new Error("Error editing product image.");
      }
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["products", productId]);
        toast.success("Product edited successfully");
      },
      onError: () => {
        toast.error("Couldn't edit product image.");
      }
    }
  );
};

export const useTrashProductImage = (productId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string }>(
    async variables => {
      "delete-product-image";
      const response = await fetch(
        `${API_URL}/product/${productId}/image/${variables.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
            "content-type": "application/json"
          }
        }
      );
      if (!response.ok || response.status !== 204) {
        throw new Error("Error deleting product image.");
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["products", productId]);
        toast.success("Product image trashed successfully");
      },
      onError: error => {
        toast.error(error.message);
      }
    }
  );
};

export const useEditProduct = (
  id: string | undefined
): UseMutationResult<ProductData, Error, Partial<ProductData>> => {
  const queryClient = useQueryClient();
  const { activeBrand: brand_id } = useBrand();

  return useMutation<ProductData, Error, Partial<ProductData>>(
    ["product/", id],
    async (variables: Partial<ProductData>) => {
      delete variables.id;
      delete variables.created;
      if (variables.updated) delete variables.updated;
      const response = await fetch(`${API_URL}/product/${id}/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "content-type": "application/json"
        },
        body: JSON.stringify({ ...variables, brand_id: brand_id })
      });
      if (!response.ok) {
        throw new Error("Error in Creating Product");
      }
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["products", id]);
        showSuccess("Product has been edit Successfully");
      },
      onError: () => showError("Error in editing product")
    }
  );
};

export const useTrashProduct = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { productId?: string }>(
    async variables => {
      "delete-product";
      const response = await fetch(
        `${API_URL}/product/${id ? id : variables.productId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
            "content-type": "application/json"
          }
        }
      );
      if (!response.ok || response.status !== 204) {
        throw new Error("Error in deleting product.");
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("products");
        toast.success("Product trashed successfully");
      },
      onError: error => {
        toast.error(error.message);
      }
    }
  );
};

export const useRestoreProduct = (id?: string) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { productId?: string }>(
    "product-restoration",

    async variables => {
      const response = await fetch(
        `${API_URL}/product/${id ? id : variables.productId}/restore/`,
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
        throw new Error("Error in restoring product.");
      }
      return response.json();
    },
    {
      onError: error => {
        toast.error("An Error occured while restoring product.");
      },
      onSuccess: () => {
        queryClient.invalidateQueries("products");
        toast.success("Product restored successfully.");
      }
    }
  );
};

export const useAddDiscountCSV = (id?: string) => {
  const queryClient = useQueryClient();
  const { activeBrand: brand_id } = useBrand();
  return useMutation<void, Error, File>(
    "add-discount-csv",
    async variables => {
      const data = new FormData();
      data.append("skufile", variables);
      const response = await fetch(`${API_URL}/products/${brand_id}/discount/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        },
        body: data
      });
      if (!response.ok) {
        throw new Error("Error in adding discounts");
      }
      return response.json();
    },
    {
      onSuccess: () => {
        showSuccess("discounts added Successfully");
        queryClient.invalidateQueries(["products", id]);
      },
      onError: () => showError("Error in adding discounts to the product")
    }
  );
};
