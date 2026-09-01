import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";

function Register() {
  // États des champs
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [nni, setNni] = useState("");
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

  // Validation téléphone (format: +213 ou 0, suivi de 9 chiffres)
  const isValidPhone = (phone) => {
    const phoneRegex = /^(?:\+213|0)[567]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  // Calcul de la force du mot de passe
  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 8) strength++;
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

    // Validations
    if (!nom.trim()) {
      setError("Le nom est requis");
      return;
    }
    if (!prenom.trim()) {
      setError("Le prénom est requis");
      return;
    }

    if (!telephone.trim()) {
      setError("Le téléphone est requis");
      return;
    }
    if (!isValidPhone(telephone)) {
      setError("Format téléphone invalide (ex: +222 46565458)");
      return;
    }
    if (!nni.trim()) {
      setError("Le NNI est requis");
      return;
    }
    if (nni.trim().length !== 9) {
      setError("Le NNI doit contenir 9 caractères");
      return;
    }
    if (!password) {
      setError("Le mot de passe est requis");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
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
      // TODO: Ajouter l'appel API d'authentification ici
      // const response = await registerAPI({ nom, prenom, email, telephone, nni, password });

      // Simulation d'un délai réseau
      setTimeout(() => {
        Alert.alert(
          "Succès",
          `Inscription de ${nom} ${prenom} effectuée avec succès!`,
        );
        // Réinitialiser le formulaire
        setNom("");
        setPrenom("");
        setTelephone("");
        setNni("");
        setPassword("");
        setConfirmPassword("");
        setAcceptTerms(false);
        setLoading(false);
      }, 1500);
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de l'inscription");
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
          <Text style={styles.title}>Inscription</Text>
          <Text style={styles.subtitle}>Créez votre compte Mahdara</Text>
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
              editable={!loading}
            />
          </View>

          {/* Téléphone */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📱 Téléphone</Text>
            <TextInput
              style={styles.input}
              placeholder="+222 46565458"
              placeholderTextColor="#999"
              value={telephone}
              onChangeText={setTelephone}
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>

          {/* NNI */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>🆔 NNI</Text>
            <TextInput
              style={styles.input}
              placeholder="9 caractères"
              placeholderTextColor="#999"
              value={nni}
              onChangeText={setNni}
              autoCapitalize="characters"
              maxLength={9}
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
                editable={!loading}
              />
              <TouchableOpacity
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
                          ? "#d32f2f"
                          : passwordStrength < 4
                            ? "#ff9800"
                            : "#4caf50",
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
                        ? "#d32f2f"
                        : passwordStrength < 4
                          ? "#ff9800"
                          : "#4caf50",
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
                editable={!loading}
              />
              <TouchableOpacity
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
              J'accepte les{" "}
              <Text style={styles.link}>conditions d'utilisation</Text> et la{" "}
              <Text style={styles.link}>politique de confidentialité</Text>
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
            <Text style={styles.link}>Se connecter</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingTop: 40,
    marginBottom: 40,
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
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    backgroundColor: "#f8f9fa",
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: "#333",
  },
  togglePassword: {
    fontSize: 18,
    paddingHorizontal: 8,
  },
  strengthContainer: {
    height: 6,
    backgroundColor: "#e0e0e0",
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
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#0e8a56",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: "#0e8a56",
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
    backgroundColor: "#0d6d42",
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

export default Register;
