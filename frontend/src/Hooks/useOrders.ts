import { useNavigate } from "react-router-dom";
import { InvoiceResponse } from "Interfaces/Invoices";
import { QueryPagination } from "Interfaces/QueryFilters";
import { useQuery, useMutation, UseQueryResult, useQueryClient } from "react-query";
import { toast } from "react-toastify";
import { queryStringify } from "Utils/queryString";
import {
  OrderResponse,
  OrderData,
  OrderNote,
  OrderProduct,
  OrderShipmentResponse,
  OrderProductShipping,
  OrderProductReturnShipment,
  OrderRefund,
  BulkShipment
} from "Interfaces/Order";
import { API_URL, getAccessToken } from "./api";
import {
  orderBillingShippingParamKeys,
  orderCompanyParamKeys,
  orderParamsGeneralKeys
} from "Utils/queryParamKeys";
import { useBrand } from "Context/BrandContext";

export const useOrders = (searchParams: URLSearchParams) => {
  const { activeBrand } = useBrand();
  const pagination: Partial<QueryPagination> = {
    count: searchParams.get("count") || "100",
    page: searchParams.get("page") || "1"
  };

  const companyParams: Record<string, string> = {};
  const billingShippingParams: Record<string, string> = {};
  const generalParams: Record<string, string> = {
    brand_id: (searchParams.get("brand_id") as string) || activeBrand,
    // If we're on the trash page, include the is_trash query param to search for trashed orders.
    ...(searchParams.has("is_trash") ? { is_trash: "1" } : {})
  };

  orderParamsGeneralKeys.forEach(key => {
    if (searchParams.has(key)) {
      generalParams[key] = searchParams.get(key) as string;
    }
  });

  orderCompanyParamKeys.forEach(key => {
    if (searchParams.has(key)) {
      companyParams[key] = searchParams.get(key) as string;
    }
  });

  orderBillingShippingParamKeys.forEach(key => {
    if (searchParams.has("search_by_bill_to") && searchParams.has(key)) {
      billingShippingParams[`company__billing__${key}`] = searchParams.get(key) as string;
    }

    if (searchParams.has("search_by_ship_to") && searchParams.has(key)) {
      billingShippingParams[`company__shipping__${key}`] = searchParams.get(
        key
      ) as string;
    }
  });

  return useQuery<OrderResponse, Error>(["orders", searchParams.toString()], async () => {
    const response = await fetch(
      `${API_URL}/order/${queryStringify({
        ...pagination,
        ...generalParams,
        ...billingShippingParams,
        ...companyParams,
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
  });
};

export const useOrder = (id: string): UseQueryResult<OrderData, Error> => {
  return useQuery<OrderData, Error>(
    ["orders", id],
    async () => {
      const response = await fetch(`${API_URL}/order/${id}/`, {
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

interface OrderRequest {
  readonly company_id: string;
  readonly brand_id: string;
  readonly contact_id: string;
}

export const useCreateOrder = () => {
  const navigate = useNavigate();
  return useMutation<OrderData, Error, OrderRequest>(
    "create-order",
    async (variables: OrderRequest) => {
      const response = await fetch(`${API_URL}/order/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "content-type": "application/json"
        },
        body: JSON.stringify(variables)
      });
      if (!response.ok) {
        throw new Error("Error in creating order.");
      }
      return response.json();
    },
    {
      onSuccess: data => {
        localStorage.setItem("current_order", data.id);

        navigate(`/orders/${data.id}`, {
          state: { customerId: data.company_id }
        });
      },
      onError: () => {
        toast.error(
          "Error in creating order. Customer might not have billing and shipping contacts."
        );
      }
    }
  );
};

interface SendInvoiceInterface {
  email_subject: string;
  email_body: string;
  email_to: string[];
  email_cc: string[];
  email_bcc: string[];
}
export const useSendEmailInvoice = (id: string, invoice?: string) => {
  return useMutation<SendInvoiceInterface, Error, SendInvoiceInterface>(
    "create-order",
    async (variables: SendInvoiceInterface) => {
      const response = await fetch(`${API_URL}/order/${id}/send/invoice/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "content-type": "application/json"
        },
        body: JSON.stringify(variables)
      });
      if (!response.ok) {
        throw new Error("Error in creating order.");
      }
      return response.json();
    },
    {
      onSuccess: () => {
        toast.success("Email Invoice Sent Successfully");
      },
      onError: () => {
        toast.error("Couldn't send Email Invoice ");
      }
    }
  );
};

interface AddOrderProps {
  product_id: string;
}
interface AddOrderProducts {
  product_ids: string[];
}

export const useAddOrderProducts = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<OrderData, Error, AddOrderProducts>(
    async (variables: AddOrderProducts) => {
      const response = await fetch(`${API_URL}/order/${id}/products/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "content-type": "application/json"
        },
        body: JSON.stringify(variables)
      });
      if (!response.ok) {
        throw new Error("Error in adding products in order.");
      }
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["orders", id]);
        toast.success("Products successfully added to the order.");
      },
      onError: error => {
        toast.error(error.message);
      }
    }
  );
};

export const useAddOrderProduct = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<OrderData, Error, AddOrderProps>(
    async (variables: AddOrderProps) => {
      const response = await fetch(`${API_URL}/order/${id}/product/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "content-type": "application/json"
        },
        body: JSON.stringify(variables)
      });
      if (!response.ok) {
        throw new Error("Error in adding product in order.");
      }
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["orders", id]);
        toast.success("Product successfully added to the order.");
      },
      onError: () => {
        toast.error("Couldn't add product to the order.");
      }
    }
  );
};

export const useEditOrder = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<
    OrderData,
    Error,
    {
      source?: string;
      shipping_cost?: number;
      is_standing_order?: boolean;
      category?: string;
      tax_rate?: number;
      company_id?: string;
      contact_id?: string;
    }
  >(
    async variables => {
      const response = await fetch(`${API_URL}/order/${id}/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "content-type": "application/json"
        },
        body: JSON.stringify(variables)
      });
      if (!response.ok) {
        throw new Error("Error in adding products in order.");
      }
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["orders", id]);
        toast.success("Order Edit Successfully");
      },
      onError: () => {
        toast.error("Couldn't edit the order.");
      }
    }
  );
};

interface customTaxRate {
  has_custom_tax_rate: boolean;
  custom_tax_percentage: number;
}

export const useEditOrderTaxRate = (orderId: string) => {
  const queryClient = useQueryClient();
  return useMutation<customTaxRate, Error, customTaxRate>(
    "edit-order-tax",
    async variables => {
      const response = await fetch(`${API_URL}/order/${orderId}/tax/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(variables)
      });
      if (!response.ok) {
        throw new Error("Error in editing order tax rate.");
      }
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["orders", orderId]);
        toast.success("Order tax rate updated successfully.");
      },
      onError: () => {
        toast.error("Error in editing order tax rate.");
      }
    }
  );
};

export const useEditOrderProduct = (orderId: string, productId: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation<OrderData, Error, Partial<OrderProduct>>(
    "add-order-product",
    async variables => {
      const { id = "" } = variables;
      const withoutId = { ...variables };
      delete withoutId?.id;
      delete withoutId.product_id;
      const response = await fetch(
        `${API_URL}/order/${orderId}/product/${id ? id : productId}/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(withoutId)
        }
      );
      if (!response.ok) {
        throw new Error("Error in editing products in order.");
      }
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["orders", orderId]);
        toast.success("Line item updated successfully.");
      },
      onError: () => {
        toast.error("Error in Editing line item.");
      }
    }
  );
};

export const useDeleteOrderProduct = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<OrderData, Error, AddOrderProps>(
    async variables => {
      "delete-order-products";
      const response = await fetch(
        `${API_URL}/order/${id}/product/${variables?.product_id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
            "content-type": "application/json"
          }
        }
      );
      if (!response.ok) {
        throw new Error("Error in deleting line item.");
      }
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["orders", id]);
        toast.success("Line item deleted from the order.");
      },
      onError: error => {
        toast.error(error.message);
      }
    }
  );
};

export const useCreateOrderNote = (orderID: string) => {
  const queryClient = useQueryClient();
  return useMutation<OrderNote, Error, Omit<OrderNote, "id" | "created">>(
    async variables => {
      const response = await fetch(`${API_URL}/order/${orderID}/note/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "content-type": "application/json"
        },
        body: JSON.stringify(variables)
      });
      if (!response.ok) {
        throw new Error("Error in creating order.");
      }
      return response.json();
    },
    {
      onSuccess: data => {
        queryClient.invalidateQueries(["orders", orderID]);
        toast.success(`A ${data.type} note has been added to the order.`);
      }
    }
  );
};

export const useDeleteOrderNote = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { noteId: string }>(
    async variables => {
      "delete-order-note";
      const response = await fetch(`${API_URL}/order/${id}/note/${variables?.noteId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
      if (!response.ok && response.status !== 204) {
        throw new Error("Error deleting order note.");
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["orders", id]);
        toast.success("Order Note deleted successfully.");
      },
      onError: error => {
        toast.error(error.message);
      }
    }
  );
};

export const useOrderShipment = (orderId: string) => {
  return useQuery<OrderShipmentResponse, Error>(
    ["order-shipments", orderId],
    async () => {
      const response = await fetch(`${API_URL}/order/${orderId}/shipping/`, {
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
      enabled: !!orderId
    }
  );
};

export const useGetInvoices = (orderId: string) => {
  return useQuery<InvoiceResponse, Error>("order-invoices", async () => {
    const response = await fetch(`${API_URL}/order/${orderId}/invoice/`, {
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

export const useAddOrderReturn = (orderId: string) => {
  const queryClient = useQueryClient();
  return useMutation<
    OrderProductReturnShipment,
    Error,
    { quantity: number; product_id: string }
  >(
    ["create-order-return", orderId],
    async variables => {
      const response = await fetch(
        `${API_URL}/order/${orderId}/return/${variables.product_id}/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
            "content-type": "application/json"
          },
          body: JSON.stringify({ quantity: variables.quantity })
        }
      );
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["orders", orderId]);
        toast.success("Return added successfully");
      },
      onError: () => {
        toast.error("Something went wrong. Please try again later.");
      }
    }
  );
};

export const useAddOrderRefund = (orderId: string) => {
  const queryClient = useQueryClient();
  return useMutation<
    OrderRefund,
    Error,
    {
      payment_id?: string;
      user_id: string;
      brand_id: string;
      company_id: string;
      order_id: string;
      payment_provider: string;
      total: number;
      receipt?: string;
    }
  >(
    ["create-order-refund", orderId],
    async variables => {
      const withoutId = { ...variables };
      delete withoutId.payment_id;
      const response = await fetch(
        `${API_URL}/order/${orderId}/refund/${variables.payment_id}/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
            "content-type": "application/json"
          },
          body: JSON.stringify(withoutId)
        }
      );
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["orders", orderId]);
        toast.success("Refund added successfully");
      },
      onError: error => {
        toast.error(error.message || "something went wrong.");
      }
    }
  );
};

export const useAddOrderShipment = (orderId: string) => {
  const queryClient = useQueryClient();
  return useMutation<
    OrderShipmentResponse,
    Error,
    Omit<OrderProductShipping, "id" | "created">
  >(
    ["create-order-shipment", orderId],
    async variables => {
      const response = await fetch(`${API_URL}/order/${orderId}/shipping/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "content-type": "application/json"
        },
        body: JSON.stringify(variables)
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["orders", orderId]);
        toast.success("Shipment added successfully");
      },
      onError: () => {
        toast.error("Something went wrong. Please try again later.");
      }
    }
  );
};

export const useEditOrderProductShipping = (orderId: string) => {
  const queryClient = useQueryClient();
  return useMutation<
    OrderProductShipping,
    Error,
    {
      ordered_product_id: string;
      quantity?: number;
      ship_date?: string;
      shipmentId?: string;
    }
  >(
    async variables => {
      const { shipmentId = "" } = variables;
      const withoutId = { ...variables };
      delete withoutId.shipmentId;
      const response = await fetch(
        `${API_URL}/order/${orderId}/shipping/${shipmentId}/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
            "content-type": "application/json"
          },
          body: JSON.stringify(withoutId)
        }
      );
      if (!response.ok) {
        throw new Error("Error editing order's product's shipping.");
      }
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["orders", orderId]);
        queryClient.invalidateQueries(["order-shipments", orderId]);
        toast.success("Order's product's shipping edited successfully");
      },
      onError: () => {
        toast.error("Couldn't edit the order's product's shipping.");
      }
    }
  );
};

export const useTrashOrder = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { orderId?: string }>(
    async variables => {
      "delete-order";
      const response = await fetch(`${API_URL}/order/${id ? id : variables.orderId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "content-type": "application/json"
        }
      });
      if (!response.ok || response.status !== 204) {
        throw new Error("Error in deleting order.");
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("orders");
        toast.success("Order trashed successfully");
      },
      onError: error => {
        toast.error(error.message);
      }
    }
  );
};

export const useRestoreOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { orderId: string }>(
    "order-restoration",
    async variables => {
      const response = await fetch(`${API_URL}/order/${variables.orderId}/restore/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "content-type": "application/json"
        },
        body: "{}"
      });
      if (!response.ok) {
        throw new Error("Error in restoring order.");
      }
      return response.json();
    },
    {
      onError: error => {
        toast.error("An Error occured while restoring order.");
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["orders"]);
        toast.success("Order restored successfully.");
      }
    }
  );
};

export const useBulkShipment = () => {
  const { activeBrand } = useBrand();

  return useMutation<void, Error, BulkShipment>(
    "bulk-shipment",
    async variables => {
      const response = await fetch(
        `${API_URL}/orders/${activeBrand}/products/mark_shipped/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
            "content-type": "application/json"
          },
          body: JSON.stringify(variables)
        }
      );
      if (response.ok) {
        if (response.headers.get("content-type") === "application/zip") {
          const file = await response.blob();
          const url = URL.createObjectURL(file);
          const link = document.createElement("a");
          link.href = url;
          link.download = "Bulk shipments";
          link.click();
          link.remove();
        } else {
          throw new Error("No orders Changed.");
        }
      }
      if (!response.ok) {
        throw new Error("An error occured while adding bulk shipment.");
      }
    },
    {
      onError: error => {
        toast.error(error.message);
      },
      onSuccess: () => {
        toast.success("Shipments added.");
      }
    }
  );
};
