import {
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
  useQueryClient
} from "react-query";
import { UserData, UserResponse } from "../Interfaces/User";
import { API_URL, getAccessToken } from "./api";
import { UserQueryFilters } from "Interfaces/QueryFilters";
import { queryStringify } from "Utils/queryString";
import { showSuccess, showError } from "../Components/Toaster";

export const useUsers = (
  queryFilters?: UserQueryFilters
): UseQueryResult<UserResponse, Error> => {
  return useQuery<UserResponse, Error>(
    ["users", queryFilters],
    async () => {
      const response = await fetch(
        `${API_URL}/user/${queryStringify({
          ...queryFilters,
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
      enabled: !!getAccessToken(),
      staleTime: Infinity,
      cacheTime: Infinity
    }
  );
};

export const useCreateUser = (): UseMutationResult<
  Partial<UserData>,
  Error,
  Partial<UserData>
> => {
  const queryClient = useQueryClient();
  return useMutation<Partial<UserData>, Error, Partial<UserData>>(
    "create-user",
    async (variables: Partial<UserData>) => {
      const response = await fetch(`${API_URL}/user/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "content-type": "application/json"
        },
        body: JSON.stringify(variables)
      });
      if (!response.ok) {
        throw new Error("Error in Creating User");
      }
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("users");
        showSuccess("User created successfully");
      },
      onError: () => showError("Error occured while creating user")
    }
  );
};
