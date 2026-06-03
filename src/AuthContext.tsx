import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthContextShape = {
  token: string | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

const defaultAuth: AuthContextShape = {
  token: null,
  loading: true,
  login: async () => {
    // noop default for type-checking
  },
  logout: async () => {
    // noop default for type-checking
  }
};

const AuthContext = React.createContext<AuthContextShape>(defaultAuth);

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [token, setToken] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadToken = async () => {
      try {
        const stored = await AsyncStorage.getItem("auth_token");
        if (stored) setToken(stored);
      } catch (e) {
        console.warn("Falha ao carregar token de autenticação", e);
      } finally {
        setLoading(false);
      }
    };
    loadToken();
  }, []);

  const login = async (newToken: string) => {
    setToken(newToken);
    try {
      await AsyncStorage.setItem("auth_token", newToken);
    } catch (e) {
      console.warn("Falha ao salvar token de autenticação", e);
    }
  };

  const logout = async () => {
    setToken(null);
    try {
      await AsyncStorage.removeItem("auth_token");
    } catch (e) {
      console.warn("Falha ao remover token de autenticação", e);
    }
  };

  return <AuthContext.Provider value={{ token, loading, login, logout }}>{children}</AuthContext.Provider>;
};

export default AuthContext;
