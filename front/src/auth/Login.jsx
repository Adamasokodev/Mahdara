import React, { useState } from "react";
import {
  Alert,
  ImageBackground,
  Pressable,
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
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config/api";
import colors from "../theme/colors";

function Login({ navigation }) {
  const { signIn } = useAuth();
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

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
        throw new Error(
          "Le serveur a renvoyé une réponse illisible. Réessayez plus tard.",
        );
      }

      if (!result || typeof result !== "object" || Array.isArray(result)) {
        throw new Error(
          "Le serveur a renvoyé une réponse invalide. Réessayez plus tard.",
        );
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
        throw new Error(
          "La réponse du serveur est incomplète. Réessayez plus tard.",
        );
      }

      await signIn(result.token, result.user);
      navigation.replace("App");
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
    <ImageBackground
      source={{ uri: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=85" }}
      style={styles.background}
    >
      <View style={styles.backgroundWash} />
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          style={styles.wrapper}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Image
                source={require("../../assets/img/logo_mahdara.jpg")}
                style={styles.logo}
              />
              <Text style={styles.brandName}>Mahdara</Text>
              <Text style={styles.brandCaption}>Savoir · Transmission · Spiritualité</Text>
            </View>
            <View style={styles.container}>
              <Text style={styles.title}>Connexion</Text>
              <Text style={styles.subtitle}>Accédez à votre compte avec votre numéro de téléphone et votre mot de passe.</Text>
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorIcon}>!</Text>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Numéro de téléphone</Text>
                <View style={styles.inputShell}>
                  <Text style={styles.inputIcon}>⌕</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="+222 36 12 34 56"
                    placeholderTextColor="#89938B"
                    value={telephone}
                    onChangeText={setTelephone}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    autoCapitalize="none"
                    returnKeyType="next"
                    editable={!loading}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mot de passe</Text>
                <View style={styles.inputShell}>
                  <Text style={styles.inputIcon}>⌑</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Votre mot de passe"
                    placeholderTextColor="#89938B"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoComplete="current-password"
                    autoCapitalize="none"
                    returnKeyType="go"
                    onSubmitEditing={handleLogin}
                    editable={!loading}
                  />
                </View>
              </View>

              <View style={styles.optionsRow}>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: rememberMe }}
                  onPress={() => setRememberMe((current) => !current)}
                  style={styles.rememberOption}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    <Text style={styles.checkboxTick}>{rememberMe ? "✓" : ""}</Text>
                  </View>
                  <Text style={styles.rememberText}>Se souvenir de moi</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => Alert.alert("Mot de passe oublié", "Contactez l’équipe Mahdara pour réinitialiser votre mot de passe.")}
                >
                  <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
                </Pressable>
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Se connecter</Text>
                )}
              </TouchableOpacity>

              <View style={styles.divider}><View style={styles.dividerLine} /><Text style={styles.dividerLabel}>ou</Text><View style={styles.dividerLine} /></View>
              <Text style={styles.footerText}>
                Vous n’avez pas de compte ?{" "}
                <Text style={styles.link} onPress={() => navigation.navigate("Register")}>
                  Créer un compte
                </Text>
              </Text>
            </View>
            <View style={styles.backRow}>
              <Text style={styles.backLink} onPress={() => navigation.navigate("Welcome")}>‹  Retour à l’accueil</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#F7F6F1" },
  backgroundWash: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(247, 246, 241, 0.9)" },
  safeArea: { flex: 1 },
  wrapper: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 20, paddingVertical: 18 },
  header: { alignItems: "center", marginBottom: 18 },
  logo: { width: 49, height: 49, borderRadius: 25, marginBottom: 5 },
  brandName: { color: "#0B5D46", fontFamily: "Georgia", fontSize: 20, fontWeight: "700", marginTop: 2 },
  brandCaption: { color: "#78847C", fontSize: 8, marginTop: 2 },
  container: { width: "100%", maxWidth: 410, alignSelf: "center", padding: 19, borderWidth: 1, borderColor: "#EEECE4", borderRadius: 18, backgroundColor: "rgba(255,255,255,0.96)" },
  title: { color: "#22352B", fontSize: 22, fontWeight: "800", marginBottom: 5 },
  subtitle: { color: "#737E75", fontSize: 11, lineHeight: 16, marginBottom: 17 },
  inputGroup: { marginBottom: 12 },
  inputLabel: { color: "#34473C", fontSize: 10, fontWeight: "700", marginBottom: 5 },
  errorContainer: { flexDirection: "row", alignItems: "center", padding: 10, marginBottom: 13, borderRadius: 10, backgroundColor: "#FFF0EE" },
  errorIcon: { color: "#A6352C", fontSize: 16, fontWeight: "800", marginRight: 8 },
  errorText: { flex: 1, color: "#A6352C", fontSize: 11, fontWeight: "500" },
  inputShell: { minHeight: 46, flexDirection: "row", alignItems: "center", paddingHorizontal: 11, borderWidth: 1, borderColor: "#E8E6DE", borderRadius: 10, backgroundColor: "#FFFFFF" },
  inputIcon: { color: "#668072", fontSize: 17, marginRight: 8 },
  input: { flex: 1, color: "#263B30", fontSize: 12, paddingVertical: 9 },
  optionsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 1, marginBottom: 8 },
  rememberOption: { flexDirection: "row", alignItems: "center" },
  checkbox: { width: 15, height: 15, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#B8C5BC", borderRadius: 4, marginRight: 6 },
  checkboxChecked: { borderColor: colors.green600, backgroundColor: colors.green600 },
  checkboxTick: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  rememberText: { color: "#627067", fontSize: 9 },
  forgotText: { color: colors.green600, fontSize: 9, fontWeight: "700" },
  button: { minHeight: 44, alignItems: "center", justifyContent: "center", marginTop: 8, borderRadius: 11, backgroundColor: colors.green600 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  divider: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: 14 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#EEECE4" },
  dividerLabel: { color: "#98A198", fontSize: 9 },
  footerText: { color: "#737E75", textAlign: "center", fontSize: 10, marginTop: 12 },
  link: { color: colors.green600, fontWeight: "800" },
  backRow: { alignItems: "center", marginTop: 14 },
  backLink: { color: "#758078", fontSize: 10, fontWeight: "700", padding: 7 },
});

export default Login;
