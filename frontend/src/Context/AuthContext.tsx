import * as React from "react";
import { User } from "../Interfaces/User";

type TokenType = "refresh_token" | "access_token";

interface TokenInfo {
  type: TokenType;
  token: string;
}
interface IUserContext {
  user: User;
  setUser(user: string): void;
  setToken(tokenInfo: TokenInfo): void;
  logout(): void;
}

export const UserContext = React.createContext<IUserContext>({} as IUserContext);

export const AuthProvider: React.FC = ({ children }) => {
  // Check if the user is stored in localStorage
  const storedUser = localStorage.getItem("user");
  const parsedUser = storedUser ? JSON.parse(storedUser) : {};
  const [user, setUserValue] = React.useState<User>(parsedUser as User);

  React.useEffect(() => {
    if (!user.id) {
      localStorage.clear();
    }
  }, [user.id]);

  const logout = () => {
    setUserValue({} as User);
    localStorage.clear();
  };

  const parseJwt = (
    token: string
  ): {
    data: User;
  } => {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  };

  const setUser = (token: string) => {
    const user = parseJwt(token).data;
    setUserValue(user);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const setToken = (tokenInfo: TokenInfo): void => {
    localStorage.setItem(tokenInfo.type, tokenInfo.token);
  };

  return (
    <UserContext.Provider value={{ user, setUser, setToken, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export function useAuth() {
  return React.useContext(UserContext);
}
