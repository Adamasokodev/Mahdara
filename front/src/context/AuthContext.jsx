import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:8000/api"
    : "http://127.0.0.1:8000/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Au lancement : on récupère le token sauvegardé
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("token");
        if (saved) setToken(saved);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = async (newToken) => {
    await AsyncStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const signOut = async () => {
    let logoutError;

    try {
      const currentToken = token || (await AsyncStorage.getItem("token"));
      if (currentToken) {
        const response = await fetch(`${API_URL}/logout`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${currentToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(
            `Le serveur n’a pas pu invalider la session (erreur ${response.status}).`,
          );
        }
      }
    } catch (error) {
      logoutError =
        error instanceof TypeError
          ? new Error(
              "La session a été fermée sur cet appareil, mais le serveur n’a pas pu être joint.",
            )
          : error;
    }

    await AsyncStorage.removeItem("token");
    setToken(null);

    if (logoutError) {
      throw logoutError;
    }
  };

  return (
    <AuthContext.Provider value={{ token, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};