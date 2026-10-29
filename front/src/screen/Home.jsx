import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "@react-navigation/native";
import colors from "../theme/colors";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config/api";
import { toCatalogCourse } from "../utils/courseCatalog";
import AppHeader from "../components/common/AppHeader";

const mahdaras = [
  { name: "Mahadra de Nouakchott", location: "Nouakchott · Tevragh Zeina" },
  { name: "Mahadra de Boutilimit", location: "Trarza · Boutilimit" },
  { name: "Mahadra d’Atar", location: "Adrar · Atar" },
];

function Home({ navigation }) {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tout");

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoadingCourses(true);
    setCoursesError("");
    fetch(`${API_URL}/cours`, {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Cours indisponibles")))
      .then((data) => {
        if (!active) return;
        if (!Array.isArray(data)) throw new Error("Réponse de cours invalide");
        const items = data.map(toCatalogCourse);
        setCourses(items.sort((left, right) => Number(right.id) - Number(left.id)));
      })
      .catch(() => { if (active) setCoursesError("Les cours ne sont pas accessibles pour le moment."); })
      .finally(() => { if (active) setLoadingCourses(false); });

    return () => { active = false; };
  }, [token]));

  const categories = useMemo(
    () => ["Tout", ...new Set(courses.map((course) => course.category).filter(Boolean))],
    [courses],
  );
  const visibleCourses = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("fr");
    return courses.filter((course) => {
      const matchesCategory =
        category === "Tout" || course.category === category;
      const matchesSearch =
        !term ||
        `${course.title} ${course.teacher} ${course.category} ${course.description} ${course.book} ${course.mahdara}`
          .toLocaleLowerCase("fr")
          .includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [courses, category, search]);
  const visibleMahdaras = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("fr");
    if (!term) return [];
    return mahdaras.filter((item) =>
      `${item.name} ${item.location}`.toLocaleLowerCase("fr").includes(term),
    );
  }, [search]);

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AppHeader
          title="Mahdara"
          subtitle="Savoir · Transmission · Spiritualité"
          showLogo
          rightIcon="notifications-outline"
          onRightPress={() => Alert.alert(
            "Notifications",
            "Vous êtes à jour. Les nouvelles annonces de vos cheikhs apparaîtront ici.",
          )}
          horizontalInset={18}
        />
        <Text style={styles.welcome}>Assalamu alaykum 👋</Text>
        <Text style={styles.welcomeSubtitle}>Un foyer numérique pour apprendre et transmettre les savoirs d’Afrique de l’Ouest.</Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.getParent()?.navigate("CoranDetail")}
          style={({ pressed }) => [styles.featuredCard, pressed && styles.pressed]}
        >
          <ImageBackground
            source={{ uri: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=1200&q=85" }}
            imageStyle={styles.featuredImage}
            style={styles.featuredImage}
          >
            <View style={styles.featuredShade} />
            <View style={styles.featuredCopy}>
              <Text style={styles.featuredEyebrow}>À DÉCOUVRIR</Text>
              <Text style={styles.featuredTitle}>Le Saint Coran</Text>
              <Text style={styles.featuredSubtitle}>Lisez, écoutez et apprenez à votre rythme.</Text>
            </View>
            <View style={styles.featuredArrow}><Text style={styles.featuredArrowText}>›</Text></View>
          </ImageBackground>
        </Pressable>

        <View style={styles.shortcutsRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.getParent()?.navigate("CoranDetail")}
            style={({ pressed }) => [styles.shortcutCard, pressed && styles.pressed]}
          >
            <View style={styles.shortcutIcon}><Text style={styles.shortcutGlyph}>۞</Text></View>
            <Text style={styles.shortcutTitle}>Lire & écouter le Coran</Text>
            <Text style={styles.shortcutSubtitle}>Récitation audio</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate("Bibliotheque")}
            style={({ pressed }) => [styles.shortcutCard, styles.libraryShortcut, pressed && styles.pressed]}
          >
            <View style={[styles.shortcutIcon, styles.libraryShortcutIcon]}><Text style={styles.libraryShortcutGlyph}>▤</Text></View>
            <Text style={styles.shortcutTitle}>Livres & patrimoine</Text>
            <Text style={styles.shortcutSubtitle}>Bibliothèque</Text>
          </Pressable>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            accessibilityLabel="Rechercher un cours, un cheikh ou une mahdara"
            value={search}
            onChangeText={setSearch}
            placeholder="Cours, cheikh, mahdara..."
            placeholderTextColor="#8A938D"
            returnKeyType="search"
            style={styles.searchInput}
          />
          {search.length > 0 ? (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Text style={styles.clearSearch}>×</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>
            {user?.role === "cheikh" || user?.role === "assistant"
              ? "Votre espace d’enseignement"
              : user?.role === "admin"
                ? "Espace administration"
                : user?.role === "student"
                  ? "Votre espace étudiant"
                  : "Bienvenue sur Mahdara"}
          </Text>
          <Text style={styles.sectionHint}>
            {user ? "Selon votre rôle" : "Accès visiteur"}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate("Cours")}
          style={({ pressed }) => [styles.resumeCard, pressed && styles.pressed]}
        >
          <View style={styles.resumeTop}>
            <View style={styles.resumeBook}>
              <Text style={styles.resumeBookIcon}>
                {user?.role === "cheikh" || user?.role === "assistant" ? "✎" : "▤"}
              </Text>
            </View>
            <View style={styles.resumeCopy}>
              <Text style={styles.resumeEyebrow}>
                {user?.role === "cheikh" || user?.role === "assistant"
                  ? "GESTION DES COURS"
                  : user?.role === "admin"
                    ? "CATALOGUE PUBLIC"
                    : "DÉCOUVRIR"}
              </Text>
              <Text style={styles.resumeTitle}>
                {user?.role === "cheikh" || user?.role === "assistant"
                  ? "Organiser les cours"
                  : "Explorer les cours"}
              </Text>
              <Text style={styles.resumeMeta}>
                {user?.role === "student"
                  ? "Consultez les cours et leurs supports"
                  : user?.role === "cheikh" || user?.role === "assistant"
                    ? "Ajouter, modifier et organiser les cours"
                    : "Parcourez le catalogue sans créer de compte"}
              </Text>
            </View>
            <View style={styles.playButton}><Text style={styles.playIcon}>▶</Text></View>
          </View>
          <Text style={styles.progressText}>
            {user?.role === "admin"
              ? "Administration complète disponible sur le panel web."
              : user?.role === "student"
                ? "La progression et les téléchargements seront ajoutés prochainement."
                : user?.role === "cheikh"
                  ? "Les statistiques et les questions seront ajoutées prochainement."
                  : user?.role === "assistant"
                    ? "Vous intervenez au nom du cheikh qui vous est rattaché."
                    : "Les extraits audio sont disponibles sur les fiches de cours."}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.getParent()?.navigate("Mahadras")}
          style={({ pressed }) => [styles.mahdaraLink, pressed && styles.pressed]}
        >
          <Text style={styles.mahdaraIcon}>⌂</Text>
          <View style={styles.mahdaraCopy}>
            <Text style={styles.mahdaraTitle}>Découvrir les madahras</Text>
            <Text style={styles.mahdaraDescription}>Cheikhs, enseignements et lieux de transmission</Text>
          </View>
          <Text style={styles.mahdaraArrow}>›</Text>
        </Pressable>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Explorer les matières</Text>
          <Pressable onPress={() => navigation.navigate("Cours")}>
            <Text style={styles.seeAll}>Tout voir</Text>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipList}
        >
          {categories.map((item) => {
            const selected = item === category;
            return (
              <Pressable
                key={item}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setCategory(item)}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{item}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Cours disponibles</Text>
          <Text style={styles.sectionHint}>{visibleCourses.length} cours</Text>
        </View>
        {loadingCourses ? (
          <ActivityIndicator color={colors.green600} style={styles.loadingCourses} />
        ) : visibleCourses.length ? visibleCourses.map((course) => (
          <Pressable
            key={course.id}
            accessibilityRole="button"
            onPress={() => navigation.navigate("Cours", { screen: "CoursListe", params: { matiereId: course.matiereId, matiereNom: course.category } })}
            style={({ pressed }) => [styles.courseCard, pressed && styles.pressed]}
          >
            <ImageBackground source={course.image ? { uri: course.image } : undefined} style={[styles.courseImage, !course.image && styles.courseImageFallback]} imageStyle={styles.courseImageCorners}>
              <View style={styles.imageShade} />
              <Text style={styles.categoryBadge}>{course.category}</Text>
              {!course.image ? <Text style={styles.courseFallbackIcon}>{course.icon}</Text> : null}
              <View style={styles.newBadge}><Text style={styles.newBadgeText}>Disponible</Text></View>
            </ImageBackground>
            <View style={styles.courseCopy}>
              <Text style={styles.courseTitle}>{course.title}</Text>
              <Text style={styles.teacher}>{course.teacher}</Text>
              <View style={styles.courseMetaRow}>
                <Text style={styles.courseMeta}>·  {course.duration ? `${course.duration} min` : "Durée non précisée"}</Text>
                {course.level ? <Text style={styles.levelBadge}>{course.level}</Text> : null}
                <Text style={styles.courseArrow}>↗</Text>
              </View>
            </View>
          </Pressable>
        )) : coursesError ? (
          <Text style={styles.noResults}>{coursesError}</Text>
        ) : (
          <Text style={styles.noResults}>Aucun cours ne correspond à votre recherche.</Text>
        )}
        {visibleMahdaras.length > 0 ? (
          <View style={styles.searchMahdaras}>
            <Text style={styles.searchMahdarasTitle}>Mahadras correspondantes</Text>
            {visibleMahdaras.map((item) => (
              <Pressable key={item.name} onPress={() => navigation.getParent()?.navigate("Mahadras")} style={styles.searchMahdaraRow}>
                <Text style={styles.mahdaraIcon}>⌂</Text>
                <View style={styles.mahdaraCopy}>
                  <Text style={styles.mahdaraTitle}>{item.name}</Text>
                  <Text style={styles.mahdaraDescription}>{item.location}</Text>
                </View>
                <Text style={styles.mahdaraArrow}>›</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <Text style={styles.footer}>MAHDARA · SAVOIR & TRANSMISSION</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.neutral50 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 0, paddingBottom: 28 },
  welcomeCard: { padding: 13, marginTop: -20, borderRadius: 17, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#ECEAE2", marginBottom: 13 },
  welcome: { color: colors.neutral900, fontSize: 21, fontWeight: "800", fontFamily: "Georgia", marginTop: 4 },
  welcomeSubtitle: { color: colors.neutral600, fontSize: 12, lineHeight: 18, marginTop: 5, marginBottom: 14 },
  featuredCard: { overflow: "hidden", height: 150, borderRadius: 17, backgroundColor: colors.green700, marginBottom: 11, elevation: 2 },
  featuredImage: { flex: 1, justifyContent: "flex-end", borderRadius: 17 },
  featuredShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(4, 31, 23, 0.38)" },
  featuredCopy: { maxWidth: "78%", padding: 15 },
  featuredEyebrow: { color: "#E8D69E", fontSize: 9, fontWeight: "800", letterSpacing: 1.2 },
  featuredTitle: { color: colors.white, fontSize: 18, fontWeight: "800", marginTop: 5 },
  featuredSubtitle: { color: "#F2F3EB", fontSize: 11, lineHeight: 16, marginTop: 4 },
  featuredArrow: { position: "absolute", right: 12, bottom: 12, width: 31, height: 31, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "#F4E8C7" },
  featuredArrowText: { color: colors.green700, fontSize: 25, lineHeight: 28, marginTop: -2 },
  shortcutsRow: { flexDirection: "row", gap: 9, marginBottom: 16 },
  shortcutCard: { flex: 1, minHeight: 108, padding: 11, borderRadius: 15, backgroundColor: colors.green100, borderWidth: 1, borderColor: "#DCE8DF" },
  shortcutIcon: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: colors.white, marginBottom: 7 },
  shortcutGlyph: { color: colors.green600, fontSize: 22 },
  libraryShortcut: { backgroundColor: "#FBF7EF", borderColor: "#EFE5D2" },
  libraryShortcutIcon: { backgroundColor: colors.white },
  libraryShortcutGlyph: { color: colors.gold400, fontSize: 20 },
  shortcutTitle: { color: colors.neutral900, fontSize: 11, lineHeight: 15, fontWeight: "800" },
  shortcutSubtitle: { color: colors.neutral600, fontSize: 9, marginTop: 4 },
  searchBox: { height: 48, flexDirection: "row", alignItems: "center", paddingHorizontal: 13, borderRadius: 13, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.neutral200, marginBottom: 22 },
  searchIcon: { color: "#758078", fontSize: 24, marginRight: 8 },
  searchInput: { flex: 1, color: "#26342C", fontSize: 13, paddingVertical: 0 },
  clearSearch: { color: "#68746B", fontSize: 22, paddingHorizontal: 4 },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 11 },
  sectionTitle: { color: colors.neutral900, fontSize: 17, fontWeight: "800" },
  sectionHint: { color: "#8A928B", fontSize: 11 },
  resumeCard: { padding: 14, borderRadius: 17, backgroundColor: colors.green700, marginBottom: 16 },
  resumeTop: { flexDirection: "row", alignItems: "center" },
  resumeBook: { width: 45, height: 45, borderRadius: 13, backgroundColor: "#2D6652", alignItems: "center", justifyContent: "center" },
  resumeBookIcon: { color: "#F0DCA1", fontSize: 25 },
  resumeCopy: { flex: 1, marginLeft: 11 },
  resumeEyebrow: { color: "#D9CA91", fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  resumeTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", marginTop: 3 },
  resumeMeta: { color: "#D5E1D9", fontSize: 10, marginTop: 3 },
  playButton: { width: 35, height: 35, borderRadius: 18, backgroundColor: colors.green600, alignItems: "center", justifyContent: "center" },
  playIcon: { color: "#FFFFFF", fontSize: 13, marginLeft: 2 },
  progressTrack: { height: 5, borderRadius: 4, backgroundColor: "#3D6A59", marginTop: 14 },
  progressFill: { width: "35%", height: 5, borderRadius: 4, backgroundColor: colors.green400 },
  progressText: { color: "#DAE5DE", fontSize: 10, marginTop: 7 },
  progressPercent: { color: "#F0D77C", fontWeight: "800" },
  seeAll: { color: "#458065", fontSize: 12, fontWeight: "700" },
  chipList: { gap: 8, paddingBottom: 22 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 1, borderColor: "#E5E5DE", backgroundColor: "#FFFFFF" },
  chipSelected: { backgroundColor: colors.green600, borderColor: colors.green600 },
  chipText: { color: "#6E7870", fontSize: 11, fontWeight: "600" },
  chipTextSelected: { color: "#FFFFFF" },
  courseCard: { flexDirection: "row", alignItems: "center", padding: 7, borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8E7E0", marginBottom: 8 },
  pressed: { opacity: 0.88 },
  courseImage: { width: 74, height: 76, justifyContent: "flex-end", overflow: "hidden", borderRadius: 10, backgroundColor: "#B9AD98" },
  courseImageFallback: { backgroundColor: "#DCEBE3", alignItems: "center" },
  courseImageCorners: { borderRadius: 10 },
  courseFallbackIcon: { position: "absolute", alignSelf: "center", color: "#174838", fontSize: 36, opacity: 0.8 },
  imageShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(18, 28, 21, 0.25)" },
  categoryBadge: { alignSelf: "flex-start", overflow: "hidden", margin: 5, paddingHorizontal: 5, paddingVertical: 3, borderRadius: 6, color: "#FFFFFF", backgroundColor: colors.green600, fontSize: 7, fontWeight: "800" },
  newBadge: { position: "absolute", top: 4, right: 4, paddingHorizontal: 4, paddingVertical: 3, borderRadius: 6, backgroundColor: colors.gold50 },
  newBadgeText: { color: colors.gold400, fontSize: 7, fontWeight: "800" },
  courseCopy: { flex: 1, paddingHorizontal: 9, paddingVertical: 3 },
  courseTitle: { color: colors.neutral900, fontFamily: "Georgia", fontSize: 11, lineHeight: 15, fontWeight: "700" },
  teacher: { color: "#69746D", fontSize: 9, marginTop: 3 },
  courseMetaRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  courseMeta: { color: "#69746D", fontSize: 8 },
  levelBadge: { overflow: "hidden", color: "#B57B4A", backgroundColor: "#F9EFE5", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, fontSize: 10, marginLeft: "auto" },
  courseArrow: { color: "#FFFFFF", backgroundColor: "#174838", overflow: "hidden", textAlign: "center", textAlignVertical: "center", width: 22, height: 22, borderRadius: 11, fontSize: 13, marginLeft: 6 },
  noResults: { color: "#768178", textAlign: "center", padding: 18 },
  loadingCourses: { padding: 24 },
  searchMahdaras: { marginTop: 2, marginBottom: 15 },
  searchMahdarasTitle: { color: "#203B2F", fontSize: 14, fontWeight: "800", marginBottom: 8 },
  searchMahdaraRow: { minHeight: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, borderRadius: 12, backgroundColor: "#FFFFFF", marginBottom: 7 },
  mahdaraLink: { minHeight: 55, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, marginTop: 0, marginBottom: 12, borderRadius: 13, backgroundColor: "#E8F0E9", borderWidth: 1, borderColor: "#DCE8DF" },
  mahdaraIcon: { color: "#B48750", fontSize: 23, marginRight: 10 },
  mahdaraCopy: { flex: 1 },
  mahdaraTitle: { color: "#244333", fontSize: 11, fontWeight: "800" },
  mahdaraDescription: { color: "#7A847D", fontSize: 9, marginTop: 3 },
  mahdaraArrow: { color: "#54806A", fontSize: 22, marginLeft: 7 },
  footer: { color: "#9A9D94", textAlign: "center", fontSize: 9, fontWeight: "700", letterSpacing: 1, marginTop: 22 },
});

export default Home;
