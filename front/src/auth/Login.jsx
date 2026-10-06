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
} from "react-native";

function Login({navigation}) {
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
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
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    Alert.alert("Succès", `Connexion de ${telephone}`);
    // TODO: Ajouter la logique d'authentification ici
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
              onChangeText={setTelephone}
              keyboardType="phone-pad"
              autoCapitalize="none"
              editable={true}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>🔑 Mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="Votre mot de passe"
              placeholderTextColor="#999"
              onChangeText={setPassword}
              secureTextEntry={true}
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Se connecter</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Pas encore de compte ? <Text style={styles.link} onPress={() => navigation.navigate("Register")}>S'inscrire</Text>
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
