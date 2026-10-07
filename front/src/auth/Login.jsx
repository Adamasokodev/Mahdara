import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Image,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../context/AuthContext";

const API_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:8000/api"
    : "http://127.0.0.1:8000/api";

function Login({ navigation }) {
  const { signIn } = useAuth();
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidPhone = (phone) =>
    /^(?:\+222)?[234]\d{7}$/.test(phone.replace(/\s/g, ""));

  const handleLogin = async () => {
    setError("");

    if (!telephone.trim()) {
      setError("Le téléphone est requis");
      return;
    }
    if (!isValidPhone(telephone)) {
      setError("Format téléphone invalide (ex: +222 46565458)");
      return;
    }
    if (!password) {
      setError("Le mot de passe est requis");
      return;
    }
    const normalizedTelephone = telephone.replace(/\s/g, "");
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          telephone: normalizedTelephone,
          password,
        }),
      });
      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error("Le serveur a renvoyé une réponse illisible. Réessayez plus tard.");
      }

      if (!result || typeof result !== "object" || Array.isArray(result)) {
        throw new Error("Le serveur a renvoyé une réponse invalide. Réessayez plus tard.");
      }

      if (!response.ok) {
        const validationErrors = Object.values(result.errors || {}).flat();
        throw new Error(
          validationErrors[0] ||
            result.message ||
            `La connexion a échoué (erreur ${response.status}).`,
        );
      }

      if (!result?.token || !result?.user) {
        throw new Error("La réponse du serveur est incomplète. Réessayez plus tard.");
      }

      await signIn(result.token);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Impossible de joindre le serveur. Vérifiez que l’API est démarrée et accessible depuis cet appareil."
          : err.message || "Une erreur est survenue lors de la connexion.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.wrapper} behavior="padding">
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Image
            source={require("../../assets/img/logo_mahdara.jpg")}
            style={styles.logo}
          />
          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>Bienvenue sur Mahdara</Text>
        </View>

        <View style={styles.container}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}> Téléphone</Text>
            <TextInput
              style={styles.input}
              placeholder="Numéro de téléphone"
              placeholderTextColor="#999"
              value={telephone}
              onChangeText={setTelephone}
              keyboardType="phone-pad"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>🔑 Mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="Votre mot de passe"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Pas encore de compte ?{" "}
            <Text
              style={styles.link}
              onPress={() => navigation.navigate("Register")}
            >
              S'inscrire
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  headerIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  container: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  errorContainer: {
    flexDirection: "row",
    backgroundColor: "#ffe0e0",
    borderLeftWidth: 4,
    borderLeftColor: "#d32f2f",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  errorIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    backgroundColor: "#f8f9fa",
    color: "#333",
  },
  button: {
    backgroundColor: "#0e8a56",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#0e8a56",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  footerText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  link: {
    color: "#0e8a56",
    fontWeight: "600",
  },
});

export default Login;
