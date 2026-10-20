import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../theme/colors";

const mahdaras = [
  {
    id: "nouakchott",
    name: "Mahadra de Nouakchott",
    location: "Nouakchott · Tevragh Zeina",
    description: "Un centre d’apprentissage et de transmission des sciences islamiques au cœur de la capitale.",
    scholars: ["Cheikh Abdallah bin Bayyah", "Cheikh Muhammad Al-Hasan"],
    courses: ["Mukhtasar Khalil", "Al-Ajurrumiyya", "Les bases de la récitation"],
    count: "12 cours",
  },
  {
    id: "boutlimit",
    name: "Mahadra de Boutilimit",
    location: "Trarza · Boutilimit",
    description: "Une tradition reconnue d’étude, de mémorisation et d’enseignement du savoir.",
    scholars: ["Cheikhs et enseignants de la région"],
    courses: ["Sciences islamiques", "Langue arabe"],
    count: "8 cours",
  },
  {
    id: "atar",
    name: "Mahadra d’Atar",
    location: "Adrar · Atar",
    description: "Des enseignements ancrés dans la vie des communautés de l’Adrar.",
    scholars: ["Cheikhs et enseignants de la région"],
    courses: ["Fiqh", "Coran et récitation"],
    count: "6 cours",
  },
];

function Mahadra() {
  const [selected, setSelected] = useState(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {selected ? (
          <>
            <Pressable onPress={() => setSelected(null)} style={styles.backButton}>
              <Text style={styles.backText}>‹  Toutes les mahadras</Text>
            </Pressable>
            <View style={styles.detailHero}>
              <Text style={styles.heroIcon}>⌂</Text>
              <Text style={styles.detailTitle}>{selected.name}</Text>
              <Text style={styles.detailLocation}>⌖  {selected.location}</Text>
            </View>
            <Text style={styles.sectionTitle}>À propos</Text>
            <Text style={styles.description}>{selected.description}</Text>
            <Text style={styles.sectionTitle}>Cheikhs enseignants</Text>
            {selected.scholars.map((scholar) => (
              <View key={scholar} style={styles.personRow}>
                <View style={styles.personIcon}><Text style={styles.personGlyph}>♙</Text></View>
                <Text style={styles.personName}>{scholar}</Text>
              </View>
            ))}
            <Text style={styles.sectionTitle}>Cours proposés</Text>
            {selected.courses.map((course) => (
              <View key={course} style={styles.courseRow}>
                <Text style={styles.courseGlyph}>▤</Text>
                <Text style={styles.courseName}>{course}</Text>
                <Text style={styles.courseChevron}>›</Text>
              </View>
            ))}
          </>
        ) : (
          <>
            <Text style={styles.eyebrow}>SAVOIR & TRANSMISSION</Text>
            <Text style={styles.title}>Les mahadras</Text>
            <Text style={styles.subtitle}>Découvrez les lieux et communautés qui font vivre l’enseignement traditionnel.</Text>
            <View style={styles.banner}>
              <Text style={styles.bannerIcon}>⌂</Text>
              <View style={styles.bannerCopy}>
                <Text style={styles.bannerTitle}>La connaissance se partage</Text>
                <Text style={styles.bannerText}>Parcourez les mahadras et leurs enseignements.</Text>
              </View>
            </View>
            <Text style={styles.sectionTitle}>Explorer par région</Text>
            {mahwdaras.map((item, index) => (
              <Pressable key={item.id} onPress={() => setSelected(item)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
                <View style={[styles.cardArt, index === 1 && styles.cardArtGold, index === 2 && styles.cardArtLavender]}>
                  <Text style={styles.cardArtIcon}>⌂</Text>
                  <Text style={styles.courseCount}>{item.count}</Text>
                </View>
                <View style={styles.cardCopy}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardLocation}>⌖  {item.location}</Text>
                  <View style={styles.cardBottom}>
                    <Text style={styles.scholarCount}>♙  {item.scholars.length} cheikh(s)</Text>
                    <Text style={styles.detailsLink}>Découvrir  →</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </>
        )}
        <Text style={styles.footer}>MAHDARA · SAVOIR & TRANSMISSION</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.neutral50 },
  content: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 28 },
  eyebrow: { color: "#A67A4E", fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  title: { color: colors.neutral900, fontSize: 27, fontFamily: "Georgia", fontWeight: "700", marginTop: 5 },
  subtitle: { color: "#768078", fontSize: 13, lineHeight: 19, marginTop: 7, marginBottom: 18 },
  banner: { minHeight: 104, flexDirection: "row", alignItems: "center", padding: 15, borderRadius: 17, backgroundColor: "#174838", marginBottom: 22 },
  bannerIcon: { color: "#E6CE83", fontSize: 34, marginRight: 14 },
  bannerCopy: { flex: 1 },
  bannerTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  bannerText: { color: "#D8E2DA", fontSize: 11, lineHeight: 16, marginTop: 5 },
  sectionTitle: { color: "#263B30", fontSize: 17, fontWeight: "800", marginTop: 17, marginBottom: 11 },
  card: { overflow: "hidden", borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E9E8E1", marginBottom: 13 },
  pressed: { opacity: 0.88 },
  cardArt: { height: 105, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 19, backgroundColor: "#DCE9E1" },
  cardArtGold: { backgroundColor: "#F2E8D1" },
  cardArtLavender: { backgroundColor: "#E9E3F2" },
  cardArtIcon: { color: "#28553F", fontSize: 48 },
  courseCount: { overflow: "hidden", color: "#315744", backgroundColor: "rgba(255,255,255,0.75)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 13, fontSize: 10, fontWeight: "700" },
  cardCopy: { padding: 14 },
  cardTitle: { color: colors.neutral900, fontSize: 16, fontWeight: "800" },
  cardLocation: { color: "#7A837D", fontSize: 11, marginTop: 6 },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  scholarCount: { color: "#6D786F", fontSize: 10 },
  detailsLink: { color: colors.green600, fontSize: 10, fontWeight: "800" },
  backButton: { alignSelf: "flex-start", paddingVertical: 8, marginBottom: 12 },
  backText: { color: colors.green600, fontSize: 12, fontWeight: "700" },
  detailHero: { minHeight: 185, alignItems: "center", justifyContent: "center", padding: 20, borderRadius: 18, backgroundColor: "#174838", marginBottom: 18 },
  heroIcon: { color: "#E8CD80", fontSize: 42 },
  detailTitle: { color: "#FFFFFF", textAlign: "center", fontSize: 22, fontWeight: "800", fontFamily: "Georgia", marginTop: 8 },
  detailLocation: { color: "#D7E2DA", fontSize: 12, marginTop: 9 },
  description: { color: "#69756D", fontSize: 13, lineHeight: 20 },
  personRow: { minHeight: 53, flexDirection: "row", alignItems: "center", paddingHorizontal: 11, borderRadius: 12, backgroundColor: "#FFFFFF", marginBottom: 8 },
  personIcon: { width: 32, height: 32, borderRadius: 11, backgroundColor: "#F1EBDD", alignItems: "center", justifyContent: "center", marginRight: 10 },
  personGlyph: { color: "#9A7146", fontSize: 19 },
  personName: { color: "#34463B", fontSize: 12, fontWeight: "700" },
  courseRow: { minHeight: 48, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: "#E9E8E1" },
  courseGlyph: { color: "#B1884D", fontSize: 19, marginRight: 10 },
  courseName: { flex: 1, color: "#46534A", fontSize: 12 },
  courseChevron: { color: "#64806F", fontSize: 22 },
  footer: { color: "#9A9D94", fontSize: 9, textAlign: "center", letterSpacing: 1, marginTop: 20 },
});

export default Mahadra;
