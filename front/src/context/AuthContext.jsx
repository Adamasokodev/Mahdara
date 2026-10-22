import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Au lancement : on récupère le token sauvegardé
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("token");
        if (saved) {
          setToken(saved);
          fetch(`${API_URL}/user`, {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${saved}`,
            },
          })
            .then(async (response) => {
              if (response.status === 401) {
                await AsyncStorage.removeItem("token");
                setToken(null);
                return;
              }
              if (!response.ok) {
                throw new Error(`Le profil n’a pas pu être chargé (erreur ${response.status}).`);
              }
              setUser(await response.json());
            })
            .catch((error) => {
              console.error("Chargement du profil connecté impossible.", error);
            });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = async (newToken, newUser) => {
    await AsyncStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
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
    setUser(null);

    if (logoutError) {
      throw logoutError;
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, signIn, signOut }}>
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
