import React, { useState } from "react";
import {
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

const learningTools = [
  {
    icon: "▤",
    title: "Mes cours",
    description: "Retrouvez vos enseignements",
    color: "#DCEBE3",
  },
  {
    icon: "◷",
    title: "Progression",
    description: "Suivez votre parcours",
    color: "#F3E9CC",
  },
  {
    icon: "✦",
    title: "Les cheikhs",
    description: "Découvrez vos enseignants",
    color: "#E9E3F2",
  },
  {
    icon: "⌂",
    title: "Les mahdaras",
    description: "Apprenez au sein d’une communauté",
    color: "#E4ECE8",
  },
];

function Profil() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [draftName, setDraftName] = useState(name);
  const [draftEmail, setDraftEmail] = useState(email);
  const [draftTelephone, setDraftTelephone] = useState(telephone);
  const [editVisible, setEditVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notice, setNotice] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  const { signOut } = useAuth();

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      Alert.alert("Déconnexion", error.message);
    } finally {
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

  const openProfileEditor = () => {
    setDraftName(name);
    setDraftEmail(email);
    setDraftTelephone(telephone);
    setEditVisible(true);
  };

  const saveProfile = () => {
    setName(draftName.trim());
    setEmail(draftEmail.trim());
    setTelephone(draftTelephone.trim());
    setEditVisible(false);
    setNotice("Profil mis à jour sur cet appareil.");
  };

  const showComingSoon = (feature) => {
    setNotice(`${feature} sera disponible après la connexion au service.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image
              source={require("../../assets/img/logo_mahdara.jpg")}
              style={styles.logo}
              resizeMode="cover"
            />
            <View>
              <Text style={styles.brandName}>Mahdara</Text>
              <Text style={styles.brandCaption}>SAVOIR & TRANSMISSION</Text>
            </View>
          </View>
          <View style={styles.headerMark}>
            <Text style={styles.headerMarkText}>م</Text>
          </View>
        </View>

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
                {name ? name.charAt(0).toLocaleUpperCase("fr") : "م"}
              </Text>
            </View>
            <View style={styles.profileIdentity}>
              <Text style={styles.profileName}>{name || "Étudiant Mahdara"}</Text>
              <Text style={styles.profileRole}>MEMBRE DE LA MAHDARA</Text>
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
                {email || telephone || "Complétez vos informations"}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={openProfileEditor}
              style={({ pressed }) => [
                styles.editButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.editButtonText}>Modifier</Text>
              <Text style={styles.editArrow}>↗</Text>
            </Pressable>
          </View>
        </View>

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
            <Text style={styles.sectionEyebrow}>APPRENDRE & PROGRESSER</Text>
            <Text style={styles.sectionTitle}>Votre parcours</Text>
          </View>
          <Text style={styles.sectionOrnament}>۞</Text>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <View style={styles.progressIcon}>
              <Text style={styles.progressIconText}>◷</Text>
            </View>
            <View style={styles.progressCopy}>
              <Text style={styles.progressTitle}>Un pas après l’autre</Text>
              <Text style={styles.progressDescription}>
                Votre espace de suivi des apprentissages
              </Text>
            </View>
            <Text style={styles.progressArrow}>→</Text>
          </View>
          <View style={styles.progressRule} />
          <Text style={styles.progressFootnote}>
            Vos cours et votre progression apparaîtront ici.
          </Text>
        </View>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionEyebrow}>LES RESSOURCES</Text>
            <Text style={styles.sectionTitle}>Explorez Mahdara</Text>
          </View>
        </View>

        <View style={styles.toolsGrid}>
          {learningTools.map((tool) => (
            <Pressable
              accessibilityRole="button"
              key={tool.title}
              onPress={() => showComingSoon(tool.title)}
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
            onPress={() => showComingSoon("Aide & accompagnement")}
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
          MAHDARA · SAVOIR ISLAMIQUE ET ENSEIGNEMENT TRADITIONNEL
        </Text>

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
      </ScrollView>

      <Modal
        animationType="fade"
        onRequestClose={() => setEditVisible(false)}
        transparent
        visible={editVisible}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fermer la fenêtre de modification"
            onPress={() => setEditVisible(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalEyebrow}>VOTRE ESPACE</Text>
            <Text style={styles.modalTitle}>Compléter le profil</Text>
            <Text style={styles.modalDescription}>
              Ces informations sont enregistrées localement pour cet aperçu.
            </Text>

            <Text style={styles.inputLabel}>Nom affiché</Text>
            <TextInput
              autoCapitalize="words"
              onChangeText={setDraftName}
              placeholder="Votre nom"
              placeholderTextColor="#92978F"
              style={styles.input}
              value={draftName}
            />
            <Text style={styles.inputLabel}>Adresse e-mail</Text>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setDraftEmail}
              placeholder="vous@exemple.com"
              placeholderTextColor="#92978F"
              style={styles.input}
              value={draftEmail}
            />
            <Text style={styles.inputLabel}>Téléphone</Text>
            <TextInput
              keyboardType="phone-pad"
              onChangeText={setDraftTelephone}
              placeholder="+222"
              placeholderTextColor="#92978F"
              style={styles.input}
              value={draftTelephone}
            />
            <Pressable
              accessibilityRole="button"
              onPress={saveProfile}
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.saveButtonText}>Enregistrer l’aperçu</Text>
              <Text style={styles.saveButtonArrow}>→</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setEditVisible(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F7F1",
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 30,
  },
  header: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 27,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    marginRight: 11,
  },
  brandName: {
    color: "#103F32",
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  brandCaption: {
    color: "#78847C",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1.1,
    marginTop: 3,
  },
  headerMark: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5DFCC",
    backgroundColor: "#FFFFFF",
  },
  headerMarkText: {
    color: "#B28B2E",
    fontSize: 21,
    fontWeight: "700",
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
    color: "#183D32",
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
    backgroundColor: "#103F32",
  },
  profileDecoration: {
    position: "absolute",
    width: 160,
    height: 160,
    right: -66,
    top: -100,
    borderWidth: 1,
    borderColor: "rgba(228, 196, 109, 0.3)",
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
    borderColor: "rgba(228, 196, 109, 0.75)",
    backgroundColor: "#1C5845",
  },
  avatarText: {
    color: "#F2D98D",
    fontSize: 27,
    fontWeight: "700",
  },
  profileIdentity: {
    flex: 1,
    marginLeft: 13,
  },
  profileName: {
    color: "#FFFDF6",
    fontSize: 17,
    fontWeight: "800",
  },
  profileRole: {
    color: "#D8C781",
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
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  memberBadgeText: {
    color: "#E4C46D",
    fontSize: 17,
  },
  profileDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
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
    color: "#B9CCBE",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1.1,
  },
  contactValue: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 5,
  },
  editButton: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    borderRadius: 10,
    backgroundColor: "#E4C46D",
  },
  editButtonText: {
    color: "#173D30",
    fontSize: 11,
    fontWeight: "800",
  },
  editArrow: {
    color: "#173D30",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 7,
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
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 11,
  },
  toolCard: {
    width: "48%",
    minHeight: 146,
    padding: 13,
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
    width: 39,
    height: 39,
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
    marginTop: 11,
  },
  toolDescription: {
    maxWidth: 145,
    color: "#858B84",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },
  toolArrow: {
    position: "absolute",
    right: 12,
    bottom: 12,
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
  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(18, 39, 31, 0.55)",
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    padding: 21,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  modalEyebrow: {
    color: "#B28B2E",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.3,
  },
  modalTitle: {
    color: "#183D32",
    fontSize: 23,
    fontWeight: "800",
    marginTop: 6,
  },
  modalDescription: {
    color: "#717A73",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 13,
  },
  inputLabel: {
    color: "#315243",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    minHeight: 45,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E8E5DA",
    borderRadius: 10,
    backgroundColor: "#FBFAF6",
    color: "#183D32",
    fontSize: 13,
  },
  saveButton: {
    minHeight: 47,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: "#103F32",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  saveButtonArrow: {
    color: "#E4C46D",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 9,
  },
  cancelButton: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  cancelButtonText: {
    color: "#717A73",
    fontSize: 12,
    fontWeight: "700",
  },
});

export default Profil;
