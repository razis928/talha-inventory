import {
  // UseMutationResult,
  // useQuery,
  useMutation
  // UseQueryResult,
  // useQueryClient
} from "react-query";

import {
  //PurchaseOrderResponse,
  PurchaseOrderData
} from "Interfaces/PurchaseOrder";
import { API_URL, getAccessToken } from "./api";
import { showSuccess, showError } from "../Components/Toaster";
//   import { queryStringify } from "Utils/queryString";
//   import { toast } from "react-toastify";
//   import { QueryPagination } from "Interfaces/QueryFilters";
//   import { purchaseOrderParamsGeneralKeys } from "Utils/queryParamKeys";

export const useCreateProduct = () => {
  // const { activeBrand: brand_id } = useBrand();

  return useMutation<PurchaseOrderData, Error, Partial<PurchaseOrderData>>(
    "create-product",

    async (variables: Partial<PurchaseOrderData>) => {
      delete variables.status;
      const response = await fetch(`${API_URL}/purchase-order/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "content-type": "application/json"
        },
        body: JSON.stringify({ ...variables, brand_id: 0 })
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
