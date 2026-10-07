import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const API_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:8000/api"
    : "http://127.0.0.1:8000/api";

function Register({ navigation }) {
  // États des champs
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // États d'affichage
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Validation email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Le backend accepte huit chiffres, avec ou sans l'indicatif +222.
  const isValidPhone = (phone) => {
    const phoneRegex = /^(?:\+222)?[234]\d{7}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  // Calcul de la force du mot de passe
  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*]/.test(pwd)) strength++;
    return strength;
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    setPasswordStrength(calculatePasswordStrength(text));
  };

  const handleRegister = async () => {
    setError("");

    if (!nom.trim()) {
      setError("Le nom est requis");
      return;
    }
    if (!prenom.trim()) {
      setError("Le prénom est requis");
      return;
    }

    const normalizedTelephone = telephone.replace(/\s/g, "");
    const normalizedEmail = email.trim().toLocaleLowerCase("fr");

    if (!normalizedTelephone) {
      setError("Le téléphone est requis");
      return;
    }
    if (!isValidPhone(normalizedTelephone)) {
      setError("Format téléphone invalide (ex: +222 46565458)");
      return;
    }
    if (!normalizedEmail) {
      setError("L'email est requis");
      return;
    }
    if (!isValidEmail(normalizedEmail)) {
      setError("Format email invalide");
      return;
    }

    if (!password) {
      setError("Le mot de passe est requis");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (!acceptTerms) {
      setError("Vous devez accepter les conditions d'utilisation");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: nom.trim(),
          prenom: prenom.trim(),
          email: normalizedEmail,
          telephone: normalizedTelephone,
          password,
          password_confirmation: confirmPassword,
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
        const firstError =
          validationErrors[0] ||
          result.message ||
          `La création du compte a échoué (erreur ${response.status}).`;
        throw new Error(firstError);
      }

      Alert.alert(
        "Compte créé",
        "Votre compte Mahdara a été créé. Vous pouvez maintenant vous connecter.",
        [
          {
            text: "Se connecter",
            onPress: () => navigation.navigate("Login"),
          },
        ],
      );
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Impossible de joindre le serveur. Vérifiez que l’API est démarrée et que son adresse est accessible depuis cet appareil."
          : err.message || "Une erreur est survenue lors de l'inscription.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
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
          <Text style={styles.eyebrow}>SAVOIR & TRANSMISSION</Text>
          <Text style={styles.title}>Inscription</Text>
          <Text style={styles.subtitle}>
            Créez votre espace et commencez votre parcours avec Mahdara.
          </Text>
        </View>

        <View style={styles.container}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Nom */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>👤 Nom</Text>
            <TextInput
              style={styles.input}
              placeholder="Votre nom de famille"
              placeholderTextColor="#999"
              value={nom}
              onChangeText={setNom}
              autoCapitalize="words"
              autoComplete="name"
              returnKeyType="next"
              editable={!loading}
            />
          </View>

          {/* Prénom */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>👤 Prénom</Text>
            <TextInput
              style={styles.input}
              placeholder="Votre prénom"
              placeholderTextColor="#999"
              value={prenom}
              onChangeText={setPrenom}
              autoCapitalize="words"
              autoComplete="given-name"
              returnKeyType="next"
              editable={!loading}
            />
          </View>

          {/* Téléphone */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📱 Téléphone</Text>
            <TextInput
              style={styles.input}
              placeholder="46565458 ou +222 46565458"
              placeholderTextColor="#999"
              value={telephone}
              onChangeText={setTelephone}
              keyboardType="phone-pad"
              autoComplete="tel"
              returnKeyType="next"
              editable={!loading}
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>🆔 Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Votre email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              editable={!loading}
            />
          </View>

          {/* Mot de passe */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>🔑 Mot de passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Entrez un mot de passe sécurisé"
                placeholderTextColor="#999"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
                editable={!loading}
              />
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <Text style={styles.togglePassword}>
                  {showPassword ? "👁️" : "🚫"}
                </Text>
              </TouchableOpacity>
            </View>
            {password ? (
              <View style={styles.strengthContainer}>
                <View
                  style={[
                    styles.strengthBar,
                    {
                      width: `${(passwordStrength / 5) * 100}%`,
                      backgroundColor:
                        passwordStrength < 2
                          ? "#C8493D"
                          : passwordStrength < 4
                            ? "#C89532"
                            : "#47705C",
                    },
                  ]}
                />
              </View>
            ) : null}
            {password ? (
              <Text
                style={[
                  styles.strengthText,
                  {
                    color:
                      passwordStrength < 2
                        ? "#C8493D"
                        : passwordStrength < 4
                          ? "#C89532"
                          : "#47705C",
                  },
                ]}
              >
                {passwordStrength < 2
                  ? "Faible"
                  : passwordStrength < 4
                    ? "Moyen"
                    : "Fort"}
              </Text>
            ) : null}
          </View>

          {/* Confirmer le mot de passe */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>🔑 Confirmer le mot de passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirmez votre mot de passe"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
                editable={!loading}
              />
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={
                  showConfirmPassword
                    ? "Masquer la confirmation du mot de passe"
                    : "Afficher la confirmation du mot de passe"
                }
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                <Text style={styles.togglePassword}>
                  {showConfirmPassword ? "👁️" : "🚫"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Conditions d'utilisation */}
          <TouchableOpacity
            accessibilityRole="checkbox"
            accessibilityState={{ checked: acceptTerms }}
            style={styles.termsContainer}
            onPress={() => setAcceptTerms(!acceptTerms)}
            disabled={loading}
          >
            <View
              style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}
            >
              <Text style={styles.checkboxText}>{acceptTerms ? "✓" : ""}</Text>
            </View>
            <Text style={styles.termsText}>
              J’accepte les conditions d’utilisation et la politique de
              confidentialité.
            </Text>
          </TouchableOpacity>

          {/* Bouton S'inscrire */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>S'inscrire</Text>
            )}
          </TouchableOpacity>

          {/* Lien connexion */}
          <Text style={styles.footerText}>
            Vous avez déjà un compte ?{" "}
            <Text
              style={styles.link}
              onPress={() => navigation.navigate("Login")}
              accessibilityRole="link"
            >
              Se connecter
            </Text>
          </Text>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F7F1",
  },
  wrapper: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 25,
  },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 24,
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
  },
  eyebrow: {
    color: "#B28B2E",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 7,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#183D32",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#717A73",
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 310,
  },
  container: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#EEECE4",
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#315243",
    marginBottom: 7,
  },
  errorContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF0EE",
    borderLeftWidth: 3,
    borderLeftColor: "#C8493D",
    borderRadius: 10,
    padding: 11,
    marginBottom: 17,
    alignItems: "center",
  },
  errorIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  errorText: {
    color: "#A6352C",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#E8E5DA",
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 14,
    backgroundColor: "#FBFAF6",
    color: "#183D32",
  },
  passwordContainer: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E5DA",
    borderRadius: 11,
    backgroundColor: "#FBFAF6",
    paddingRight: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 14,
    color: "#183D32",
  },
  togglePassword: {
    fontSize: 17,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  strengthContainer: {
    height: 6,
    backgroundColor: "#E8E5DA",
    borderRadius: 3,
    marginTop: 8,
    overflow: "hidden",
  },
  strengthBar: {
    height: "100%",
    borderRadius: 3,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 17,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#103F32",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: "#103F32",
  },
  checkboxText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  termsText: {
    fontSize: 12,
    color: "#555",
    flex: 1,
  },
  button: {
    backgroundColor: "#103F32",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#103F32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
    backgroundColor: "#315A43",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  footerText: {
    fontSize: 13,
    color: "#717A73",
    textAlign: "center",
    marginTop: 20,
  },
  link: {
    color: "#47705C",
    fontWeight: "600",
  },
});

export default Register;
