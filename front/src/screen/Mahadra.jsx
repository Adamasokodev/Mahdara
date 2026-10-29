import React, { useEffect, useState } from "react";
import { ActivityIndicator, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../config/api";
import colors from "../theme/colors";
import AppHeader from "../components/common/AppHeader";

function Mahadra({ navigation }) {
  const [mahdaras, setMahadaras] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    Promise.all(["mahdara", "cheikh", "cours"].map(async (resource) => {
      const response = await fetch(`${API_URL}/${resource}`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Les données (${resource}) ne sont pas accessibles (erreur ${response.status}).`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error(`La réponse (${resource}) est invalide.`);
      }
      return data;
    }))
      .then(([mahdaraData, cheikhData, courseData]) => {
        if (!active) return;
        setMahadaras(mahdaraData.map((mahdara) => ({
          id: mahdara.id,
          name: mahdara.nom,
          location: [mahdara.wilaya, mahdara.localisation].filter(Boolean).join(" · "),
          description: mahdara.description || "Aucune description renseignée pour cette mahdara.",
          scholars: cheikhData
            .filter((cheikh) => cheikh.mahdara_id === mahdara.id && cheikh.user)
            .map((cheikh) => `${cheikh.user.prenom || ""} ${cheikh.user.name || ""}`.trim()),
          courses: courseData
            .filter((course) => course.mahdara_id === mahdara.id)
            .map((course) => course.titre),
          count: `${courseData.filter((course) => course.mahdara_id === mahdara.id).length} cours`,
        })));
      })
      .catch((error) => {
        if (active) setLoadError(error.message || "Les mahadras ne sont pas accessibles.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader
          title={selected?.name || "Mahadras"}
          showBack
          onBackPress={() => selected ? setSelected(null) : navigation.goBack()}
          horizontalInset={18}
        />
        {!selected ? (
          <Text style={styles.subtitle}>
            Découvrez les lieux et communautés qui font vivre l’enseignement traditionnel.
          </Text>
        ) : null}
        {selected ? (
          <>
            <View style={styles.detailHero}>
              <Text style={styles.heroIcon}>⌂</Text>
              <Text style={styles.detailTitle}>{selected.name}</Text>
              <Text style={styles.detailLocation}>⌖ {selected.location}</Text>
            </View>
            <Text style={styles.sectionTitle}>À propos</Text>
            <Text style={styles.description}>{selected.description}</Text>
            <Text style={styles.sectionTitle}>Cheikhs enseignants</Text>
            {selected.scholars.length === 0 ? (
              <Text style={styles.emptyState}>Aucun cheikh actif n’est encore rattaché à cette mahdara.</Text>
            ) : selected.scholars.map((scholar) => (
              <View key={scholar} style={styles.personRow}>
                <View style={styles.personIcon}>
                  <Text style={styles.personGlyph}>♙</Text>
                </View>
                <Text style={styles.personName}>{scholar}</Text>
              </View>
            ))}
            <Text style={styles.sectionTitle}>Cours proposés</Text>
            {selected.courses.length === 0 ? (
              <Text style={styles.emptyState}>Aucun cours publié pour cette mahdara.</Text>
            ) : selected.courses.map((course) => (
              <View key={course} style={styles.courseRow}>
                <Text style={styles.courseGlyph}>▤</Text>
                <Text style={styles.courseName}>{course}</Text>
                <Text style={styles.courseChevron}>›</Text>
              </View>
            ))}
          </>
        ) : (
          <>
            <View style={styles.banner}>
              <Text style={styles.bannerIcon}>⌂</Text>
              <View style={styles.bannerCopy}>
                <Text style={styles.bannerTitle}>
                  La connaissance se partage
                </Text>
                <Text style={styles.bannerText}>
                  Parcourez les mahadras et leurs enseignements.
                </Text>
              </View>
            </View>
            <Text style={styles.sectionTitle}>Explorer par région</Text>
            {loading ? <ActivityIndicator color={colors.green600} style={styles.loader} /> : null}
            {loadError ? <Text style={styles.loadError}>{loadError}</Text> : null}
            {!loading && !loadError && mahdaras.length === 0 ? (
              <Text style={styles.emptyState}>Aucune mahdara n’a encore été publiée.</Text>
            ) : null}
            {mahdaras.map((item, index) => (
              <Pressable
                key={item.id}
                onPress={() => setSelected(item)}
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.pressed,
                ]}
              >
                <ImageBackground
                  source={{ uri: [
                    "https://images.unsplash.com/photo-1590075865003-e48277faa558?auto=format&fit=crop&w=900&q=85",
                    "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=900&q=85",
                    "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=900&q=85",
                  ][index % 3] }}
                  style={[
                    styles.cardArt,
                    index === 1 && styles.cardArtGold,
                    index === 2 && styles.cardArtLavender,
                  ]}
                  imageStyle={styles.cardArtImage}
                >
                  <View style={styles.cardArtShade} />
                  <Text style={styles.cardArtIcon}>⌂</Text>
                  <Text style={styles.courseCount}>{item.count}</Text>
                </ImageBackground>
                <View style={styles.cardCopy}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardLocation}>⌖ {item.location}</Text>
                  <View style={styles.cardBottom}>
                    <Text style={styles.scholarCount}>♙ {item.scholars.length} cheikh(s)</Text>
                    <Text style={styles.detailsLink}>Découvrir →</Text>
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
  content: { paddingHorizontal: 18, paddingTop: 0, paddingBottom: 28 },
  subtitle: {
    color: "#53675A",
    fontSize: 12,
    lineHeight: 17,
    paddingHorizontal: 4,
    paddingTop: 6,
  },
  banner: {
    minHeight: 104,
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 17,
    backgroundColor: "#174838",
    marginBottom: 22,
  },
  bannerIcon: { color: "#E6CE83", fontSize: 34, marginRight: 14 },
  bannerCopy: { flex: 1 },
  bannerTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  bannerText: { color: "#D8E2DA", fontSize: 11, lineHeight: 16, marginTop: 5 },
  sectionTitle: {
    color: "#263B30",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 17,
    marginBottom: 11,
  },
  card: {
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9E8E1",
    marginBottom: 13,
  },
  pressed: { opacity: 0.88 },
  loader: { marginVertical: 20 },
  loadError: { color: "#A6352C", fontSize: 12, lineHeight: 18, marginVertical: 12 },
  emptyState: { color: "#768078", fontSize: 12, lineHeight: 18, paddingVertical: 12 },
  cardArt: {
    height: 105,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 19,
    backgroundColor: "#DCE9E1",
  },
  cardArtImage: { resizeMode: "cover" },
  cardArtShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(12, 31, 20, 0.32)" },
  cardArtGold: { backgroundColor: "#F2E8D1" },
  cardArtLavender: { backgroundColor: "#E9E3F2" },
  cardArtIcon: { color: "#FFFFFF", fontSize: 42, zIndex: 1 },
  courseCount: {
    overflow: "hidden",
    color: "#315744",
    backgroundColor: "rgba(255,255,255,0.75)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 13,
    fontSize: 10,
    fontWeight: "700",
  },
  cardCopy: { padding: 14 },
  cardTitle: { color: colors.neutral900, fontSize: 16, fontWeight: "800" },
  cardLocation: { color: "#7A837D", fontSize: 11, marginTop: 6 },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  scholarCount: { color: "#6D786F", fontSize: 10 },
  detailsLink: { color: colors.green600, fontSize: 10, fontWeight: "800" },
  backButton: { alignSelf: "flex-start", paddingVertical: 8, marginBottom: 12 },
  backText: { color: colors.green600, fontSize: 12, fontWeight: "700" },
  detailHero: {
    minHeight: 185,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderRadius: 18,
    backgroundColor: "#174838",
    marginBottom: 18,
  },
  heroIcon: { color: "#E8CD80", fontSize: 42 },
  detailTitle: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    fontFamily: "Georgia",
    marginTop: 8,
  },
  detailLocation: { color: "#D7E2DA", fontSize: 12, marginTop: 9 },
  description: { color: "#69756D", fontSize: 13, lineHeight: 20 },
  personRow: {
    minHeight: 53,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
  },
  personIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: "#F1EBDD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  personGlyph: { color: "#9A7146", fontSize: 19 },
  personName: { color: "#34463B", fontSize: 12, fontWeight: "700" },
  courseRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E9E8E1",
  },
  courseGlyph: { color: "#B1884D", fontSize: 19, marginRight: 10 },
  courseName: { flex: 1, color: "#46534A", fontSize: 12 },
  courseChevron: { color: "#64806F", fontSize: 22 },
  footer: {
    color: "#9A9D94",
    fontSize: 9,
    textAlign: "center",
    letterSpacing: 1,
    marginTop: 20,
  },
});

export default Mahadra;
