import { useMutation, useQueryClient, useQuery } from "react-query";
import { useBrand } from "Context/BrandContext";
import { toast } from "react-toastify";
import { API_URL, getAccessToken } from "./api";
import {
  Filter,
  FilterResponse,
  ReportTemplate,
  ReportTemplateRequest,
  ReportTemplateResponse,
  TemplateFilter,
  TemplateFilterRequest,
  TemplateFilterResponse
} from "Interfaces/Reports";

export const useFilters = (id: string) => {
  return useQuery<FilterResponse, Error>(
    ["filters", id],
    async () => {
      const response = await fetch(`${API_URL}/report/${id}/filter/`, {
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

export const useCreateFilter = () => {
  const queryClient = useQueryClient();
  const { activeBrand: brand_id } = useBrand();
  // Random company ID to make it work

  return useMutation<Filter, Error, Partial<Filter>>(
    "create-filter",
    async (variables: Partial<Filter>) => {
      const response = await fetch(`${API_URL}/report/filter/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "content-type": "application/json"
        },
        body: JSON.stringify({ ...variables, brand_id })
      });
      if (!response.ok) {
        throw new Error("Error in creating filter.");
      }
      return response.json();
    },
    {
      onSuccess: () => {
        toast.success("Successfully created filter");
        queryClient.invalidateQueries("filters");
      },
      onError: () => {
        toast.error("Error in creating filter");
      }
    }
  );
};

export const useReportTemplates = () => {
  return useQuery<ReportTemplateResponse, Error>(["reports"], async () => {
    const response = await fetch(`${API_URL}/report/`, {
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

export const useDeleteReport = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string }>(
    "delete-report",
    async variables => {
      const response = await fetch(`${API_URL}/report/${variables.id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        },
        redirect: "follow"
      });
      if (!response.ok && response.status !== 204) {
        throw new Error("Error in Deleting filter.");
      }
    },
    {
      onSuccess: () => {
        toast.success("Successfully deleted report template.");
        queryClient.invalidateQueries("reports");
      },
      onError: () => {
        toast.error("Error in deleting report template");
      }
    }
  );
};

export const useCreateReportTemplate = () => {
  const queryClient = useQueryClient();
  const { activeBrand: brand_id } = useBrand();

  return useMutation<ReportTemplate, Error, ReportTemplateRequest>(
    "create-report-template",
    async (variables: ReportTemplateRequest) => {
      const response = await fetch(`${API_URL}/report/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "content-type": "application/json"
        },
        body: JSON.stringify({ ...variables, brand_id })
      });
      if (!response.ok) {
        throw new Error("Error in creating report template.");
      }
      return response.json();
    },
    {
      onSuccess: () => {
        toast.success("Successfully created report template");
        queryClient.invalidateQueries("reports");
      },
      onError: () => {
        toast.error("Error in creating report template");
      }
    }
  );
};

export const useDeleteFilter = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { filterId: string }>(
    "create-filter",
    async ({ filterId }: { filterId: string }) => {
      const response = await fetch(`${API_URL}/report/filter/${filterId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "content-type": "application/json"
        }
      });
      if (!response.ok && response.status !== 204) {
        throw new Error("Error in Deleting filter.");
      }
    },
    {
      onSuccess: () => {
        toast.success("Successfully Deleted filter.");
        queryClient.invalidateQueries("filters");
      },
      onError: () => {
        toast.error("Error in deleting filter");
      }
    }
  );
};

export const useTemplateFilter = () => {
  return useQuery<TemplateFilterResponse, Error>("template-filters", async () => {
    const response = await fetch(`${API_URL}/report/template/filter/`, {
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

export const useCreateTemplateFilter = () => {
  return useMutation<TemplateFilter, Error, TemplateFilterRequest>(
    "create-template-filter",
    async (variables: TemplateFilterRequest) => {
      const response = await fetch(`${API_URL}/report/template/filter/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "content-type": "application/json"
        },
        body: JSON.stringify(variables)
      });
      if (!response.ok) {
        throw new Error("Error in creating template filter.");
      }
      return response.json();
    },
    {
      onSuccess: () => {
        toast.success("Successfully created report template filter");
      },
      onError: () => {
        toast.error("Error in creating report template filter");
      }
    }
  );
};

export const useDownloadReport = (id: string, name: string) => {
  return useMutation<void, Error, void>(
    ["download-report", id],
    async () => {
      const response = await fetch(`${API_URL}/report/download/${id}/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
      if (response.ok) {
        const csv = await response.blob();
        const url = URL.createObjectURL(csv);
        const link = document.createElement("a");
        link.href = url;
        link.download = name;
        link.click();
        link.remove();
      }

      if (!response.ok) {
        throw new Error(response.statusText);
      }
    },
    {
      onError: error => {
        toast.error(error.message);
      }
    }
  );
};
