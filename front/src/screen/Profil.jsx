import React, { useState } from "react";
import {
  Image,
  Alert,
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../components/common/AppHeader";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config/api";
import colors from "../theme/colors";

const roleLabels = {
  student: "Étudiant",
  cheikh: "Cheikh",
  assistant: "Assistant",
  admin: "Administrateur",
};

const toolsByRole = {
  guest: [
    { icon: "▤", title: "Catalogue des cours", description: "Cours publics et extraits", color: "#DCEBE3", action: "courses" },
    { icon: "▣", title: "Bibliothèque", description: "Livres, poèmes et patrimoine", color: "#F3E9CC", action: "library" },
    { icon: "✦", title: "Cheikhs", description: "Enseignants actifs", color: "#E9E3F2", action: "mahadras" },
    { icon: "⌂", title: "Mahadras", description: "Lieux d’enseignement", color: "#E4ECE8", action: "mahadras" },
  ],
  student: [
    { icon: "▤", title: "Mes cours", description: "Accéder aux cours", color: "#DCEBE3", action: "courses" },
    { icon: "▣", title: "Bibliothèque", description: "Livres, poèmes et patrimoine", color: "#F3E9CC", action: "library" },
    { icon: "◷", title: "Progression", description: "Suivi bientôt disponible", color: "#F3E9CC", action: "progress" },
    { icon: "⇩", title: "Téléchargements", description: "Bientôt disponible", color: "#E4ECE8", action: "downloads" },
    { icon: "⌂", title: "Les mahadras", description: "Lieux d’enseignement", color: "#E9E3F2", action: "mahadras" },
  ],
  cheikh: [
    { icon: "▤", title: "Gérer mes cours", description: "Créer et organiser", color: "#DCEBE3", action: "courses" },
    { icon: "▣", title: "Bibliothèque", description: "Livres, poèmes et patrimoine", color: "#F3E9CC", action: "library" },
    { icon: "◷", title: "Statistiques", description: "Bientôt disponible", color: "#F3E9CC", action: "statistics" },
    { icon: "✉", title: "Questions", description: "Réponses bientôt disponibles", color: "#E9E3F2", action: "questions" },
    { icon: "⌂", title: "Ma mahdara", description: "Voir les mahadras", color: "#E4ECE8", action: "mahadras" },
  ],
  assistant: [
    { icon: "▤", title: "Gérer les cours", description: "Au nom du cheikh référent", color: "#DCEBE3", action: "courses" },
    { icon: "▣", title: "Bibliothèque", description: "Livres, poèmes et patrimoine", color: "#F3E9CC", action: "library" },
    { icon: "⌂", title: "Les mahadras", description: "Lieux d’enseignement", color: "#E4ECE8", action: "mahadras" },
  ],
  admin: [
    { icon: "⚙", title: "Panel web", description: "Gestion complète", color: "#F3E9CC", action: "admin" },
    { icon: "▣", title: "Bibliothèque", description: "Livres, poèmes et patrimoine", color: "#F3E9CC", action: "library" },
    { icon: "▤", title: "Catalogue des cours", description: "Consulter les cours", color: "#DCEBE3", action: "courses" },
    { icon: "⌂", title: "Mahadras & cheikhs", description: "Consulter les structures", color: "#E4ECE8", action: "mahadras" },
  ],
};

function Profil({ navigation }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notice, setNotice] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  const { token, user, signOut } = useAuth();
  const roleTools = toolsByRole[user?.role] || toolsByRole.guest;

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      Alert.alert("Déconnexion", error.message);
    } finally {
      navigation.getParent()?.reset({
        index: 0,
        routes: [{ name: "Welcome" }],
      });
      setSigningOut(false);
    }
  };

  const confirmSignOut = () => {
    if (signingOut) return;

    Alert.alert("Déconnexion", "Voulez-vous vraiment vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Se déconnecter",
        style: "destructive",
        onPress: handleSignOut,
      },
    ]);
  };

  const openPanel = async () => {
    const panelUrl = `${API_URL.replace(/\/api\/?$/, "")}/admin`;
    if (await Linking.canOpenURL(panelUrl)) {
      await Linking.openURL(panelUrl);
    } else {
      setNotice("Le panel web n’est pas accessible depuis cet appareil.");
    }
  };

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader
          title="Profil"
          showBack
          onBackPress={() => navigation.navigate("Accueil")}
          horizontalInset={22}
        />

        <View style={styles.intro}>
          <Text style={styles.eyebrow}>VOTRE ESPACE PERSONNEL</Text>
          <Text style={styles.title}>Mon profil</Text>
          <Text style={styles.subtitle}>
            Retrouvez votre parcours d’apprentissage et les ressources de la
            Mahdara.
          </Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileDecoration} />
          <View style={styles.profileTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user
                  ? `${user.prenom?.[0] || ""}${user.name?.[0] || ""}`.toLocaleUpperCase("fr") || "م"
                  : "م"}
              </Text>
            </View>
            <View style={styles.profileIdentity}>
              <Text style={styles.profileName}>
                {user ? `${user.prenom || ""} ${user.name || ""}`.trim() : "Visiteur"}
              </Text>
              <Text style={styles.profileRole}>
                {user ? roleLabels[user.role] || user.role : "SANS COMPTE"}
              </Text>
            </View>
            <View style={styles.memberBadge}>
              <Text style={styles.memberBadgeText}>✦</Text>
            </View>
          </View>
          <View style={styles.profileDivider} />
          <View style={styles.profileBottom}>
            <View style={styles.profileContact}>
              <Text style={styles.contactLabel}>CONTACT</Text>
              <Text style={styles.contactValue}>
                {user?.email || user?.telephone || "Catalogue public"}
              </Text>
            </View>
            {user?.status ? (
              <Text style={styles.accountStatus}>
                {user.status === "active" ? "Compte actif" : "Compte en attente"}
              </Text>
            ) : null}
          </View>
        </View>

        {!token ? (
          <View style={styles.guestCard}>
            <Text style={styles.guestTitle}>Explorez Mahdara librement</Text>
            <Text style={styles.guestDescription}>
              Consultez les cours, les mahadras et les cheikhs sans vous connecter.
              La connexion est nécessaire uniquement pour accéder aux fonctions de votre compte.
            </Text>
            <View style={styles.guestActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.getParent()?.navigate("Login")}
                style={styles.guestPrimaryButton}
              >
                <Text style={styles.guestPrimaryText}>Se connecter</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.getParent()?.navigate("Register")}
                style={styles.guestSecondaryButton}
              >
                <Text style={styles.guestSecondaryText}>Créer un compte</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {notice ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fermer le message"
            onPress={() => setNotice("")}
            style={styles.notice}
          >
            <Text style={styles.noticeIcon}>✓</Text>
            <Text style={styles.noticeText}>{notice}</Text>
            <Text style={styles.noticeClose}>×</Text>
          </Pressable>
        ) : null}

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionEyebrow}>VOTRE ESPACE PERSONNEL</Text>
            <Text style={styles.sectionTitle}>Mon compte</Text>
          </View>
        </View>

        <View style={styles.toolsGrid}>
          {roleTools.map((tool) => (
            <Pressable
              accessibilityRole="button"
              key={tool.title}
              onPress={() => {
                if (tool.action === "courses") {
                  navigation.navigate("Cours");
                } else if (tool.action === "library") {
                  navigation.navigate("Bibliotheque");
                } else if (tool.action === "mahadras") {
                  navigation.getParent()?.navigate("Mahadras");
                } else if (tool.action === "progress") {
                  navigation.navigate("Quiz", { screen: "evaluations" });
                } else if (tool.action === "admin") {
                  openPanel();
                } else {
                  const unavailable = {
                    progress: "Le suivi de progression sera disponible dans une prochaine version.",
                    downloads: "Les téléchargements ne sont pas encore disponibles.",
                    statistics: "Les statistiques des cheikhs ne sont pas encore disponibles.",
                    questions: "La messagerie des questions n’est pas encore disponible.",
                  };
                  setNotice(unavailable[tool.action] || "Cette fonctionnalité sera disponible prochainement.");
                }
              }}
              style={({ pressed }) => [
                styles.toolCard,
                pressed && styles.toolCardPressed,
              ]}
            >
              <View style={[styles.toolIcon, { backgroundColor: tool.color }]}>
                <Text style={styles.toolIconText}>{tool.icon}</Text>
              </View>
              <Text style={styles.toolTitle}>{tool.title}</Text>
              <Text style={styles.toolDescription}>{tool.description}</Text>
              <Text style={styles.toolArrow}>↗</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.settingsCard}>
          <View style={styles.settingsHeading}>
            <View>
              <Text style={styles.sectionEyebrow}>PRÉFÉRENCES</Text>
              <Text style={styles.settingsTitle}>Votre expérience</Text>
            </View>
            <Text style={styles.settingsOrnament}>✳</Text>
          </View>
          <View style={styles.settingsRow}>
            <View style={styles.settingsIcon}>
              <Text style={styles.settingsIconText}>♧</Text>
            </View>
            <View style={styles.settingsCopy}>
              <Text style={styles.settingsLabel}>Rappels d’apprentissage</Text>
              <Text style={styles.settingsDescription}>
                Recevoir des rappels pour étudier
              </Text>
            </View>
            <Switch
              accessibilityLabel="Rappels d’apprentissage"
              onValueChange={setNotificationsEnabled}
              thumbColor="#FFFFFF"
              trackColor={{ false: "#D9D8CF", true: "#47705C" }}
              value={notificationsEnabled}
            />
          </View>
          <View style={styles.settingsDivider} />
          <Pressable
            accessibilityRole="button"
            onPress={() => setNotice("Contactez l’équipe Mahdara pour obtenir de l’aide.")}
            style={({ pressed }) => [
              styles.helpRow,
              pressed && styles.buttonPressed,
            ]}
          >
            <View style={styles.helpIcon}>
              <Text style={styles.helpIconText}>?</Text>
            </View>
            <View style={styles.settingsCopy}>
              <Text style={styles.settingsLabel}>Aide & accompagnement</Text>
              <Text style={styles.settingsDescription}>
                Nous sommes là pour vous guider
              </Text>
            </View>
            <Text style={styles.helpArrow}>→</Text>
          </Pressable>
        </View>

        <View style={styles.quoteCard}>
          <View style={styles.quoteRule} />
          <View style={styles.quoteCopy}>
            <Text style={styles.quoteEyebrow}>L’ESPRIT MAHDARA</Text>
            <Text style={styles.quoteTitle}>
              Le savoir se partage et grandit.
            </Text>
            <Text style={styles.quoteDescription}>
              Un chemin d’apprentissage guidé par la transmission et la
              bienveillance.
            </Text>
          </View>
          <Text style={styles.quoteOrnament}>۞</Text>
        </View>

        <Text style={styles.footer}>
          MAHDARA · SAVOIR & TRANSMISSION
        </Text>

        {token ? (
          <View style={styles.logoutSection}>
            <Text style={styles.logoutEyebrow}>VOTRE COMPTE</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Se déconnecter"
              accessibilityState={{ disabled: signingOut, busy: signingOut }}
              disabled={signingOut}
              onPress={confirmSignOut}
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && !signingOut && styles.buttonPressed,
                signingOut && styles.logoutButtonDisabled,
              ]}
            >
              <View style={styles.logoutIcon}>
                <Text style={styles.logoutIconText}>↪</Text>
              </View>
              <View style={styles.logoutCopy}>
                <Text style={styles.logoutButtonTitle}>
                  {signingOut ? "Déconnexion en cours…" : "Se déconnecter"}
                </Text>
                <Text style={styles.logoutButtonSubtitle}>
                  Terminer votre session sur cet appareil
                </Text>
              </View>
              {signingOut ? (
                <ActivityIndicator color="#A33B34" />
              ) : (
                <Text style={styles.logoutArrow}>›</Text>
              )}
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral50,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 0,
    paddingBottom: 30,
  },
  intro: {
    marginBottom: 21,
  },
  eyebrow: {
    color: "#B28B2E",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 7,
  },
  title: {
    color: colors.neutral900,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  subtitle: {
    color: "#717A73",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  profileCard: {
    overflow: "hidden",
    padding: 18,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E6DE",
  },
  profileDecoration: {
    position: "absolute",
    width: 160,
    height: 160,
    right: -66,
    top: -100,
    borderWidth: 1,
    borderColor: "rgba(8, 114, 83, 0.12)",
    borderRadius: 80,
  },
  profileTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 29,
    borderWidth: 2,
    borderColor: "#D5E8DB",
    backgroundColor: "#E5EFE8",
  },
  avatarText: {
    color: colors.green600,
    fontSize: 27,
    fontWeight: "700",
  },
  profileIdentity: {
    flex: 1,
    marginLeft: 13,
  },
  profileName: {
    color: colors.neutral900,
    fontSize: 17,
    fontWeight: "800",
  },
  profileRole: {
    color: "#718078",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginTop: 5,
  },
  memberBadge: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: "#FBF5E8",
  },
  memberBadgeText: {
    color: colors.gold400,
    fontSize: 17,
  },
  profileDivider: {
    height: 1,
    backgroundColor: "#EEECE4",
    marginVertical: 17,
  },
  profileBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileContact: {
    flex: 1,
    marginRight: 10,
  },
  contactLabel: {
    color: "#8A938B",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1.1,
  },
  contactValue: {
    color: colors.neutral900,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 5,
  },
  accountStatus: {
    color: colors.green600,
    fontSize: 10,
    fontWeight: "700",
  },
  guestCard: {
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#E5DFCC",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  guestTitle: {
    color: "#183D32",
    fontSize: 15,
    fontWeight: "800",
  },
  guestDescription: {
    color: "#717A73",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6,
  },
  guestActions: {
    flexDirection: "row",
    gap: 9,
    marginTop: 12,
  },
  guestPrimaryButton: {
    minHeight: 40,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: colors.green600,
  },
  guestPrimaryText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  guestSecondaryButton: {
    minHeight: 40,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D9DCCF",
    borderRadius: 10,
  },
  guestSecondaryText: {
    color: "#24483A",
    fontSize: 11,
    fontWeight: "800",
  },
  adminPanelButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 14,
    borderRadius: 11,
    backgroundColor: colors.green600,
  },
  adminPanelButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  adminPanelArrow: {
    color: "#E4C46D",
    fontSize: 16,
    fontWeight: "800",
  },
  buttonPressed: {
    opacity: 0.78,
  },
  logoutSection: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#EAE7DC",
  },
  logoutEyebrow: {
    color: "#78847C",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 11,
  },
  logoutButton: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#F0D9D5",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  logoutButtonDisabled: {
    opacity: 0.7,
  },
  logoutIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: "#FCEDEC",
  },
  logoutIconText: {
    color: "#A33B34",
    fontSize: 24,
    fontWeight: "700",
  },
  logoutCopy: {
    flex: 1,
    marginLeft: 13,
  },
  logoutButtonTitle: {
    color: "#A33B34",
    fontSize: 14,
    fontWeight: "800",
  },
  logoutButtonSubtitle: {
    color: "#78847C",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  logoutArrow: {
    color: "#A33B34",
    fontSize: 25,
    fontWeight: "400",
    marginLeft: 10,
  },
  notice: {
    minHeight: 43,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginTop: 12,
    borderRadius: 11,
    backgroundColor: "#E6F0E9",
  },
  noticeIcon: {
    color: "#2E6C4C",
    fontSize: 15,
    fontWeight: "800",
    marginRight: 9,
  },
  noticeText: {
    flex: 1,
    color: "#315A43",
    fontSize: 11,
    lineHeight: 16,
  },
  noticeClose: {
    color: "#53735D",
    fontSize: 20,
    marginLeft: 8,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 28,
    marginBottom: 13,
  },
  sectionEyebrow: {
    color: "#B28B2E",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: 5,
  },
  sectionTitle: {
    color: "#183D32",
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  sectionOrnament: {
    color: "#D2BF81",
    fontSize: 25,
  },
  progressCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#EEECE4",
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
  },
  progressTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressIcon: {
    width: 45,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#F3E9CC",
  },
  progressIconText: {
    color: "#9A7A2C",
    fontSize: 22,
    fontWeight: "700",
  },
  progressCopy: {
    flex: 1,
    marginLeft: 12,
  },
  progressTitle: {
    color: "#1C3F34",
    fontSize: 14,
    fontWeight: "800",
  },
  progressDescription: {
    color: "#858B84",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  progressArrow: {
    color: "#B28B2E",
    fontSize: 20,
    marginLeft: 8,
  },
  progressRule: {
    height: 1,
    backgroundColor: "#F0EEE6",
    marginTop: 14,
  },
  progressFootnote: {
    color: "#78847C",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 10,
  },
  toolsGrid: {
    gap: 7,
  },
  toolCard: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#EEECE4",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  toolCardPressed: {
    opacity: 0.8,
    backgroundColor: "#F3F5F0",
  },
  toolIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  toolIconText: {
    color: "#24483A",
    fontSize: 21,
    fontWeight: "700",
  },
  toolTitle: {
    color: "#1C3F34",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 0,
    marginLeft: 10,
  },
  toolDescription: {
    flex: 1,
    color: "#858B84",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 0,
    marginLeft: 7,
  },
  toolArrow: {
    marginLeft: 8,
    color: "#B28B2E",
    fontSize: 15,
    fontWeight: "700",
  },
  settingsCard: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    marginTop: 25,
    borderWidth: 1,
    borderColor: "#EEECE4",
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
  },
  settingsHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 9,
  },
  settingsTitle: {
    color: "#183D32",
    fontSize: 17,
    fontWeight: "800",
  },
  settingsOrnament: {
    color: "#D2BF81",
    fontSize: 22,
  },
  settingsRow: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
  },
  settingsIcon: {
    width: 37,
    height: 37,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#E4ECE8",
  },
  settingsIconText: {
    color: "#315A43",
    fontSize: 19,
  },
  settingsCopy: {
    flex: 1,
    marginLeft: 11,
  },
  settingsLabel: {
    color: "#1C3F34",
    fontSize: 12,
    fontWeight: "700",
  },
  settingsDescription: {
    color: "#858B84",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: "#F0EEE6",
  },
  helpRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
  },
  helpIcon: {
    width: 37,
    height: 37,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F3E9CC",
  },
  helpIconText: {
    color: "#9A7A2C",
    fontSize: 19,
    fontWeight: "700",
  },
  helpArrow: {
    color: "#B28B2E",
    fontSize: 18,
    marginLeft: 8,
  },
  quoteCard: {
    minHeight: 130,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    padding: 16,
    marginTop: 22,
    borderRadius: 17,
    backgroundColor: "#EFEDE2",
  },
  quoteRule: {
    width: 3,
    alignSelf: "stretch",
    borderRadius: 2,
    backgroundColor: "#C5A64E",
    marginRight: 13,
  },
  quoteCopy: {
    flex: 1,
  },
  quoteEyebrow: {
    color: "#9A7A2C",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 7,
  },
  quoteTitle: {
    color: "#173F32",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
  },
  quoteDescription: {
    color: "#6F776F",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5,
  },
  quoteOrnament: {
    color: "#D2C28F",
    fontSize: 31,
    marginLeft: 9,
  },
  footer: {
    color: "#92978F",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.8,
    lineHeight: 14,
    marginTop: 20,
    textAlign: "center",
  },
});

export default Profil;
