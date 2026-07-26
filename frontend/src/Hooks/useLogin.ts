import { useMutation, useQuery } from "react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthResponse, UserResponse } from "../Interfaces/AuthToken";
import { useAuth } from "Context/AuthContext";
import { API_URL, getAccessToken, getRefreshToken } from "./api";
import { ILocation } from "Interfaces/Router";

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthToken {
  accessToken: string;
}

export const useAuthToken = () => {
  const navigate = useNavigate();
  const { state } = useLocation() as ILocation;
  const { setUser, setToken } = useAuth();
  const previousLocation = state?.from || "/";

  return useMutation<AuthResponse, Error, LoginCredentials>(
    "auth-token",
    async (variables: LoginCredentials) => {
      const response = await fetch(`${API_URL}/token-auth/`, {
        method: "POST",
        headers: {
          "content-type": "application/json;charset=UTF-8"
        },
        body: JSON.stringify(variables)
      });
      if (!response.ok) {
        throw new Error("Username or password not correct.");
      }
      return response.json();
    },
    {
      onSuccess: data => {
        setToken({ type: "access_token", token: data.access_token });
        setToken({ type: "refresh_token", token: data.refresh_token });
        setUser(data.refresh_token);
        navigate(previousLocation, { replace: true });
      }
    }
  );
};

export const useRefreshToken = () => {
  return useQuery<AuthResponse, Error>(
    "refresh-token",
    async () => {
      const response = await fetch(`${API_URL}/token-refresh/`, {
        method: "POST",
        headers: {
          "content-type": "application/json;charset=UTF-8",
          Authorization: `Bearer ${getRefreshToken()}`
        }
      });
      if (!response.ok) {
        throw new Error("TOKEN_EXPIRED");
      }
      return response.json();
    },
    {
      enabled: Boolean(getRefreshToken()) && Boolean(getAccessToken()),
      refetchInterval: 60 * 60 * 1000,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: true
    }
  );
};

export const useUsers = () => {
  return useMutation<UserResponse, Error, AuthToken>("user-login", async variables => {
    const response = await fetch(`${API_URL}/user/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${variables.accessToken}`
      }
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  });
};
