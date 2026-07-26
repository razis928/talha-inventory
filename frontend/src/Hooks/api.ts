export const API_URL = import.meta.env.VITE_API_URL;

export const getAccessToken = (): string => {
  const token = localStorage.getItem("access_token");
  if (token) return token;
  return "";
};

export const getRefreshToken = (): string => {
  const token = localStorage.getItem("refresh_token");
  if (token) return token;
  return "";
};

export const getBrandId = (): string => {
  const token = localStorage.getItem("brand_id");
  if (token) return token;
  return "";
};
