import React, { useMemo, useState } from "react";
import {
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
import colors from "../theme/colors";
import { useAuth } from "../context/AuthContext";

const categories = ["Tout", "Fiqh", "Coran", "Langue arabe", "Seerah"];

const courses = [
  {
    id: "fiqh",
    category: "Fiqh",
    title: "Mukhtasar Khalil : Introduction",
    teacher: "Cheikh Abdallah bin Bayyah",
    duration: "12 semaines",
    image:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "nahw",
    category: "Langue arabe",
    title: "Al-Ajurrumiyya : les bases de la grammaire",
    teacher: "Cheikh Muhammad Al-Hasan",
    duration: "8 semaines",
    image:
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "coran",
    category: "Coran",
    title: "Les bases de la récitation",
    teacher: "Cheikhs de la Mahdara",
    duration: "6 semaines",
    image:
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "seerah",
    category: "Seerah",
    title: "Vie du Prophète (PSL)",
    teacher: "Dr Salih Al-Munajjid",
    duration: "16 semaines",
    image:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1000&q=80",
  },
];

const mahdaras = [
  { name: "Mahadra de Nouakchott", location: "Nouakchott · Tevragh Zeina" },
  { name: "Mahadra de Boutilimit", location: "Trarza · Boutilimit" },
  { name: "Mahadra d’Atar", location: "Adrar · Atar" },
];

function Home({ navigation }) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tout");

  const visibleCourses = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("fr");
    return courses.filter((course) => {
      const matchesCategory =
        category === "Tout" || course.category === category;
      const matchesSearch =
        !term ||
        `${course.title} ${course.teacher} ${course.category}`
          .toLocaleLowerCase("fr")
          .includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [category, search]);
  const visibleMahdaras = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("fr");
    if (!term) return [];
    return mahdaras.filter((item) =>
      `${item.name} ${item.location}`.toLocaleLowerCase("fr").includes(term),
    );
  }, [search]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerBrand}>
            <View style={styles.headerAccent} />
            <Text numberOfLines={1} style={styles.headerTitle}>Mahdara</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            onPress={() =>
              Alert.alert(
                "Notifications",
                "Vous êtes à jour. Les nouvelles annonces de vos cheikhs apparaîtront ici.",
              )
            }
            style={({ pressed }) => [styles.notificationButton, pressed && styles.pressed]}
          >
            <View style={styles.bellBody} />
            <View style={styles.bellBase} />
            <View style={styles.bellClapper} />
            <View style={styles.notificationDot} />
          </Pressable>
        </View>

        <Text style={styles.welcome}>Assalamu alaykum 👋</Text>
        <Text style={styles.welcomeSubtitle}>Que souhaitez-vous apprendre aujourd’hui ?</Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate("Coran")}
          style={({ pressed }) => [styles.quranShortcut, pressed && styles.pressed]}
        >
          <View style={styles.quranShortcutIcon}><Text style={styles.quranShortcutGlyph}>۞</Text></View>
          <View style={styles.quranShortcutCopy}>
            <Text style={styles.quranShortcutTitle}>Lire & écouter le Coran</Text>
            <Text style={styles.quranShortcutSubtitle}>Texte arabe · Récitation audio</Text>
          </View>
          <Text style={styles.quranShortcutArrow}>›</Text>
        </Pressable>

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
          <Text style={styles.sectionTitle}>Nouveaux cours</Text>
          <Text style={styles.sectionHint}>{visibleCourses.length} cours</Text>
        </View>
        {visibleCourses.length ? visibleCourses.map((course) => (
          <Pressable
            key={course.id}
            accessibilityRole="button"
            onPress={() => navigation.navigate("Cours")}
            style={({ pressed }) => [styles.courseCard, pressed && styles.pressed]}
          >
            <ImageBackground source={{ uri: course.image }} style={styles.courseImage} imageStyle={styles.courseImageCorners}>
              <View style={styles.imageShade} />
              <Text style={styles.categoryBadge}>{course.category}</Text>
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>Nouveau</Text>
              </View>
            </ImageBackground>
            <View style={styles.courseCopy}>
              <Text style={styles.courseTitle}>{course.title}</Text>
              <Text style={styles.teacher}>{course.teacher}</Text>
              <View style={styles.courseMetaRow}>
                <Text style={styles.courseMeta}>◷  {course.duration}</Text>
                <Text style={styles.levelBadge}>Débutant</Text>
                <Text style={styles.courseArrow}>↗</Text>
              </View>
            </View>
          </Pressable>
        )) : (
          <Text style={styles.noResults}>Aucun cours ne correspond à votre recherche.</Text>
        )}

        {visibleMahdaras.length > 0 ? (
          <View style={styles.searchMahdaras}>
            <Text style={styles.searchMahdarasTitle}>Mahadras correspondantes</Text>
            {visibleMahdaras.map((item) => (
              <Pressable key={item.name} onPress={() => navigation.navigate("Mahadra")} style={styles.searchMahdaraRow}>
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

        <View style={styles.learningHeading}>
          <Text style={styles.sectionTitle}>Apprendre autrement</Text>
          <Text style={styles.sectionHint}>Quiz et évaluations</Text>
        </View>
        <View style={styles.toolsRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate("Quiz")}
            style={({ pressed }) => [styles.toolCard, styles.quizCard, pressed && styles.pressed]}
          >
            <View style={styles.toolIconBubble}><Text style={styles.toolIcon}>✎</Text></View>
            <Text style={styles.toolTitle}>Quiz</Text>
            <Text style={styles.toolDescription}>Testez vos connaissances</Text>
            <Text style={styles.toolLink}>Faire un quiz  →</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate("Quiz", { screen: "evaluations" })}
            style={({ pressed }) => [styles.toolCard, styles.evaluationCard, pressed && styles.pressed]}
          >
            <View style={styles.toolIconBubble}><Text style={styles.toolIcon}>✓</Text></View>
            <Text style={styles.toolTitle}>Évaluations</Text>
            <Text style={styles.toolDescription}>Suivez vos acquis</Text>
            <Text style={styles.toolLink}>Voir mon bilan  →</Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate("Mahadra")}
          style={styles.mahdaraLink}
        >
          <Text style={styles.mahdaraIcon}>⌂</Text>
          <View style={styles.mahdaraCopy}>
            <Text style={styles.mahdaraTitle}>Découvrir les mahadras</Text>
            <Text style={styles.mahdaraDescription}>Cheikhs, enseignements et lieux de transmission</Text>
          </View>
          <Text style={styles.mahdaraArrow}>›</Text>
        </Pressable>

        <Text style={styles.footer}>MAHDARA · SAVOIR & TRANSMISSION</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.neutral50 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 26 },
  header: { height: 68, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 17, marginHorizontal: -18, marginTop: -8, marginBottom: 21, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E9E9E3", shadowColor: "#173C2C", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.045, shadowRadius: 9, elevation: 2 },
  headerBrand: { flex: 1, flexDirection: "row", alignItems: "center" },
  headerAccent: { width: 4, height: 31, borderRadius: 2, backgroundColor: colors.green600, marginRight: 12 },
  headerTitle: { flex: 1, color: colors.neutral900, fontSize: 25, fontFamily: "Georgia", fontWeight: "700", letterSpacing: -0.55 },
  notificationButton: { width: 46, height: 46, borderRadius: 16, backgroundColor: "#F7F9F6", borderWidth: 1, borderColor: "#E7EBE6", alignItems: "center", justifyContent: "center", marginLeft: 12 },
  bellBody: { width: 15, height: 15, borderWidth: 1.8, borderBottomWidth: 0, borderColor: "#355344", borderTopLeftRadius: 9, borderTopRightRadius: 9, marginTop: 3 },
  bellBase: { width: 20, height: 5, borderTopWidth: 1.8, borderColor: "#355344", borderBottomLeftRadius: 4, borderBottomRightRadius: 4 },
  bellClapper: { position: "absolute", bottom: 12, width: 4, height: 4, borderRadius: 2, backgroundColor: "#355344" },
  notificationDot: { position: "absolute", right: 9, top: 8, width: 9, height: 9, borderRadius: 5, backgroundColor: colors.gold400, borderWidth: 1.5, borderColor: "#F7F9F6" },
  welcome: { color: colors.neutral900, fontSize: 24, fontWeight: "800", fontFamily: "Georgia" },
  welcomeSubtitle: { color: "#78827B", fontSize: 13, marginTop: 5, marginBottom: 17 },
  quranShortcut: { minHeight: 68, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, borderRadius: 15, backgroundColor: "#EDF4EE", borderWidth: 1, borderColor: "#DEE9E0", marginBottom: 17 },
  quranShortcutIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: "#FFFFFF", marginRight: 11 },
  quranShortcutGlyph: { color: colors.green600, fontSize: 23 },
  quranShortcutCopy: { flex: 1 },
  quranShortcutTitle: { color: colors.neutral900, fontSize: 13, fontWeight: "800" },
  quranShortcutSubtitle: { color: "#77847B", fontSize: 10, marginTop: 4 },
  quranShortcutArrow: { color: colors.green600, fontSize: 24, marginLeft: 6 },
  searchBox: { height: 48, flexDirection: "row", alignItems: "center", paddingHorizontal: 13, borderRadius: 13, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E9E8E1", marginBottom: 22 },
  searchIcon: { color: "#758078", fontSize: 24, marginRight: 8 },
  searchInput: { flex: 1, color: "#26342C", fontSize: 13, paddingVertical: 0 },
  clearSearch: { color: "#68746B", fontSize: 22, paddingHorizontal: 4 },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 11 },
  sectionTitle: { color: colors.neutral900, fontSize: 17, fontWeight: "800" },
  sectionHint: { color: "#8A928B", fontSize: 11 },
  resumeCard: { padding: 14, borderRadius: 17, backgroundColor: "#174838", marginBottom: 22 },
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
  courseCard: { overflow: "hidden", borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8E7E0", marginBottom: 13 },
  pressed: { opacity: 0.88 },
  courseImage: { height: 145, justifyContent: "flex-end", backgroundColor: "#B9AD98" },
  courseImageCorners: { borderTopLeftRadius: 15, borderTopRightRadius: 15 },
  imageShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(18, 28, 21, 0.25)" },
  categoryBadge: { alignSelf: "flex-start", overflow: "hidden", margin: 11, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, color: "#FFFFFF", backgroundColor: colors.green600, fontSize: 11, fontWeight: "800" },
  newBadge: { position: "absolute", top: 11, right: 11, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8, backgroundColor: colors.gold50 },
  newBadgeText: { color: colors.gold400, fontSize: 10, fontWeight: "800" },
  courseCopy: { paddingHorizontal: 13, paddingTop: 11, paddingBottom: 12 },
  courseTitle: { color: colors.neutral900, fontFamily: "Georgia", fontSize: 17, lineHeight: 23, fontWeight: "700" },
  teacher: { color: "#69746D", fontSize: 12, marginTop: 4 },
  courseMetaRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  courseMeta: { color: "#69746D", fontSize: 11 },
  levelBadge: { overflow: "hidden", color: "#B57B4A", backgroundColor: "#F9EFE5", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, fontSize: 10, marginLeft: "auto" },
  courseArrow: { color: "#FFFFFF", backgroundColor: "#174838", overflow: "hidden", textAlign: "center", textAlignVertical: "center", width: 28, height: 28, borderRadius: 15, fontSize: 16, marginLeft: 9 },
  noResults: { color: "#768178", textAlign: "center", padding: 18 },
  searchMahdaras: { marginTop: 2, marginBottom: 15 },
  searchMahdarasTitle: { color: "#203B2F", fontSize: 14, fontWeight: "800", marginBottom: 8 },
  searchMahdaraRow: { minHeight: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, borderRadius: 12, backgroundColor: "#FFFFFF", marginBottom: 7 },
  learningHeading: { marginTop: 8, marginBottom: 11 },
  toolsRow: { flexDirection: "row", gap: 11 },
  toolCard: { flex: 1, minHeight: 150, padding: 13, borderRadius: 16, borderWidth: 1 },
  quizCard: { backgroundColor: "#EDF2FF", borderColor: "#DAE4FA" },
  evaluationCard: { backgroundColor: "#F8F0E5", borderColor: "#EEE1CE" },
  toolIconBubble: { width: 33, height: 33, borderRadius: 11, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  toolIcon: { color: "#4F70B6", fontSize: 19, fontWeight: "700" },
  toolTitle: { color: "#263D34", fontSize: 14, fontWeight: "800" },
  toolDescription: { color: "#748078", fontSize: 10, marginTop: 4 },
  toolLink: { color: colors.green600, fontSize: 10, fontWeight: "800", marginTop: 10 },
  mahdaraLink: { minHeight: 72, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, marginTop: 17, borderRadius: 15, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E9E8E1" },
  mahdaraIcon: { color: "#B48750", fontSize: 25, marginRight: 12 },
  mahdaraCopy: { flex: 1 },
  mahdaraTitle: { color: "#244333", fontSize: 13, fontWeight: "800" },
  mahdaraDescription: { color: "#7A847D", fontSize: 10, marginTop: 4 },
  mahdaraArrow: { color: "#54806A", fontSize: 24, marginLeft: 7 },
  footer: { color: "#9A9D94", textAlign: "center", fontSize: 9, fontWeight: "700", letterSpacing: 1, marginTop: 22 },
});

export default Home;
