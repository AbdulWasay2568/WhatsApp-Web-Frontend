// context/Auth.tsx
import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  userId: string | null;
  token: string | null;
  setUser: (id: string, token: string) => void;  // now also takes token
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const setUser = (id: string, authToken: string) => {
    setUserId(id);
    setToken(authToken);
  };

  const logout = () => {
    setUserId(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ userId, token, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
