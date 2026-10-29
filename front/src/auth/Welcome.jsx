import React from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

function Welcome({ navigation }) {
  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=90",
      }}
      style={styles.background}
    >
      <View style={styles.shade} />
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.content}>
          <View style={styles.brand}>
            <View style={styles.logoSeal}>
              <Text style={styles.logoGlyph}>۞</Text>
            </View>
            <Text style={styles.brandName}>Mahdara</Text>
            <Text style={styles.brandCaption}>Savoir · Transmission · Spiritualité</Text>
          </View>

          <View style={styles.actions}>
            <Text style={styles.message}>
              Apprenez, explorez, avancez dans la lumière de la connaissance
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate("Login")}
              style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}
            >
              <Text style={styles.loginButtonText}>Se connecter</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate("Register")}
              style={({ pressed }) => [styles.registerButton, pressed && styles.pressed]}
            >
              <Text style={styles.registerButtonText}>Créer un compte</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.replace("App")}
              style={styles.exploreButton}
            >
              <Text style={styles.exploreButtonText}>Explorer sans compte</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#064B3A" },
  shade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(4, 48, 36, 0.72)" },
  safeArea: { flex: 1 },
  content: { flex: 1, justifyContent: "space-between", alignItems: "center", paddingHorizontal: 26, paddingVertical: 36 },
  brand: { alignItems: "center", marginTop: 24 },
  logoSeal: { width: 70, height: 70, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#E6CE83", borderRadius: 35, backgroundColor: "rgba(255,255,255,0.08)" },
  logoGlyph: { color: "#F0D98F", fontSize: 41 },
  brandName: { color: "#FFFFFF", fontFamily: "Georgia", fontSize: 29, fontWeight: "700", marginTop: 10 },
  brandCaption: { color: "#E0E7DF", fontSize: 10, letterSpacing: 0.7, marginTop: 4 },
  actions: { width: "100%", maxWidth: 390, alignItems: "stretch", marginBottom: 16 },
  message: { color: "#FFFFFF", textAlign: "center", fontSize: 19, lineHeight: 27, fontWeight: "700", marginBottom: 24 },
  loginButton: { minHeight: 49, alignItems: "center", justifyContent: "center", borderRadius: 15, backgroundColor: "#FFFFFF" },
  loginButtonText: { color: "#0B5D46", fontSize: 13, fontWeight: "800" },
  registerButton: { minHeight: 49, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E6CE83", borderRadius: 15, marginTop: 10 },
  registerButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  exploreButton: { alignSelf: "center", paddingHorizontal: 16, paddingVertical: 12, marginTop: 8 },
  exploreButtonText: { color: "#E0E7DF", fontSize: 11, fontWeight: "700" },
  pressed: { opacity: 0.8 },
});

export default Welcome;
