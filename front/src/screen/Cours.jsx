import React, { useMemo, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

const categories = ["Tout", "Le Coran", "Langue arabe", "Sciences islamiques"];

const courses = [
  {
    id: "coran-lecture",
    title: "Premiers pas dans la lecture du Coran",
    category: "Le Coran",
    description:
      "Découvrez les lettres arabes et les bases pour lire le Coran avec confiance.",
    level: "Débutant",
    duration: 25,
    icon: "📖",
    color: "#F3E9CC",
  },
  {
    id: "coran-recitation",
    title: "Les règles essentielles de récitation",
    category: "Le Coran",
    description:
      "Approfondissez les règles de récitation et avancez à votre rythme.",
    level: "Intermédiaire",
    duration: 35,
    icon: "۞",
    color: "#E9E3F2",
  },
  {
    id: "arabe-alphabet",
    title: "L’alphabet arabe, pas à pas",
    category: "Langue arabe",
    description:
      "Familiarisez-vous avec les lettres, leurs sons et leurs différentes formes.",
    level: "Débutant",
    duration: 20,
    icon: "أ",
    color: "#DCEBE3",
  },
  {
    id: "arabe-vocabulaire",
    title: "Vocabulaire arabe du quotidien",
    category: "Langue arabe",
    description:
      "Enrichissez votre vocabulaire et progressez dans la compréhension de l’arabe.",
    level: "Intermédiaire",
    duration: 30,
    icon: "ع",
    color: "#E4ECE8",
  },
  {
    id: "foi-fondements",
    title: "Les fondements de la foi",
    category: "Sciences islamiques",
    description:
      "Une introduction accessible aux notions essentielles des sciences islamiques.",
    level: "Débutant",
    duration: 30,
    icon: "🌙",
    color: "#E9E3F2",
  },
  {
    id: "vie-prophete",
    title: "À la découverte de la vie du Prophète",
    category: "Sciences islamiques",
    description:
      "Parcourez les grands repères de la vie et des enseignements du Prophète.",
    level: "Intermédiaire",
    duration: 40,
    icon: "✦",
    color: "#F3E9CC",
  },
];

function Cours() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tout");
  const [favorites, setFavorites] = useState([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const filteredCourses = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("fr");

    return courses.filter((course) => {
      const matchesCategory =
        selectedCategory === "Tout" || course.category === selectedCategory;
      const matchesSearch =
        !normalizedSearch ||
        `${course.title} ${course.category} ${course.level}`
          .toLocaleLowerCase("fr")
          .includes(normalizedSearch);
      const matchesFavorites =
        !favoritesOnly || favorites.includes(course.id);

      return matchesCategory && matchesSearch && matchesFavorites;
    });
  }, [favorites, favoritesOnly, search, selectedCategory]);

  const toggleFavorite = (courseId) => {
    setFavorites((current) =>
      current.includes(courseId)
        ? current.filter((id) => id !== courseId)
        : [...current, courseId],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
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
          <Text style={styles.eyebrow}>APPRENDRE À SON RYTHME</Text>
          <Text style={styles.title}>Les cours</Text>
          <Text style={styles.subtitle}>
            Explorez les enseignements de la Mahdara et choisissez votre
            prochain apprentissage.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => setSelectedCourse(courses[0])}
          style={({ pressed }) => [
            styles.featuredCard,
            pressed && styles.buttonPressed,
          ]}
        >
          <View style={styles.featuredOrb} />
          <View style={styles.featuredCopy}>
            <Text style={styles.featuredEyebrow}>À DÉCOUVRIR</Text>
            <Text style={styles.featuredTitle}>
              Premiers pas dans la lecture du Coran
            </Text>
            <Text style={styles.featuredMeta}>Le Coran  ·  25 min  ·  Débutant</Text>
            <View style={styles.featuredButton}>
              <Text style={styles.featuredButtonText}>Voir le cours</Text>
              <Text style={styles.featuredArrow}>→</Text>
            </View>
          </View>
          <View style={styles.featuredSeal}>
            <Text style={styles.featuredSealText}>۞</Text>
          </View>
        </Pressable>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            accessibilityLabel="Rechercher un cours"
            value={search}
            onChangeText={setSearch}
            placeholder="Rechercher un cours ou un domaine"
            placeholderTextColor="#92978F"
            returnKeyType="search"
            style={styles.searchInput}
          />
          {search.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Effacer la recherche"
              hitSlop={10}
              onPress={() => setSearch("")}
            >
              <Text style={styles.clearSearch}>×</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>Explorer par domaine</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: favoritesOnly }}
            onPress={() => setFavoritesOnly((current) => !current)}
            style={[
              styles.favoritesFilter,
              favoritesOnly && styles.favoritesFilterActive,
            ]}
          >
            <Text
              style={[
                styles.favoritesFilterText,
                favoritesOnly && styles.favoritesFilterTextActive,
              ]}
            >
              ♡  Favoris
            </Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {categories.map((category) => {
            const isSelected = selectedCategory === category;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.categoryTextSelected,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionEyebrow}>VOTRE PARCOURS</Text>
            <Text style={styles.sectionTitle}>
              {favoritesOnly ? "Vos favoris" : "Cours à découvrir"}
            </Text>
          </View>
          <Text style={styles.courseCount}>{filteredCourses.length} cours</Text>
        </View>

        {filteredCourses.length > 0 ? (
          <View style={styles.courseList}>
            {filteredCourses.map((course) => {
              const isFavorite = favorites.includes(course.id);

              return (
                <View key={course.id} style={styles.courseCard}>
                  <View
                    style={[
                      styles.courseIcon,
                      { backgroundColor: course.color },
                    ]}
                  >
                    <Text style={styles.courseIconText}>{course.icon}</Text>
                  </View>
                  <View style={styles.courseBody}>
                    <View style={styles.courseMeta}>
                      <Text style={styles.courseCategory}>
                        {course.category.toLocaleUpperCase("fr")}
                      </Text>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={
                          isFavorite
                            ? `Retirer ${course.title} des favoris`
                            : `Ajouter ${course.title} aux favoris`
                        }
                        accessibilityState={{ selected: isFavorite }}
                        hitSlop={8}
                        onPress={() => toggleFavorite(course.id)}
                      >
                        <Text
                          style={[
                            styles.favoriteIcon,
                            isFavorite && styles.favoriteIconSelected,
                          ]}
                        >
                          {isFavorite ? "♥" : "♡"}
                        </Text>
                      </Pressable>
                    </View>
                    <Text style={styles.courseTitle}>{course.title}</Text>
                    <View style={styles.courseDetails}>
                      <Text style={styles.courseDetail}>{course.level}</Text>
                      <Text style={styles.detailDivider}>·</Text>
                      <Text style={styles.courseDetail}>
                        {course.duration} min
                      </Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setSelectedCourse(course)}
                      style={({ pressed }) => [
                        styles.detailsButton,
                        pressed && styles.buttonPressed,
                      ]}
                    >
                      <Text style={styles.detailsButtonText}>
                        Découvrir le cours
                      </Text>
                      <Text style={styles.detailsArrow}>→</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>
              {favoritesOnly ? "♡" : "⌕"}
            </Text>
            <Text style={styles.emptyTitle}>
              {favoritesOnly
                ? "Aucun favori pour le moment"
                : "Aucun cours trouvé"}
            </Text>
            <Text style={styles.emptyDescription}>
              {favoritesOnly
                ? "Ajoutez un cours à vos favoris pour le retrouver ici."
                : "Essayez un autre mot-clé ou choisissez un autre domaine."}
            </Text>
          </View>
        )}

        <View style={styles.footerCard}>
          <Text style={styles.footerOrnament}>۞</Text>
          <View style={styles.footerCopy}>
            <Text style={styles.footerTitle}>Le savoir se cultive chaque jour.</Text>
            <Text style={styles.footerDescription}>
              Des enseignements pour nourrir la connaissance et grandir à son
              rythme.
            </Text>
          </View>
        </View>
        <Text style={styles.footer}>
          MAHDARA · SAVOIR ISLAMIQUE ET ENSEIGNEMENT TRADITIONNEL
        </Text>
      </ScrollView>

      <Modal
        animationType="fade"
        onRequestClose={() => setSelectedCourse(null)}
        transparent
        visible={selectedCourse !== null}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fermer les détails du cours"
            onPress={() => setSelectedCourse(null)}
            style={StyleSheet.absoluteFill}
          />
          {selectedCourse ? (
            <View style={styles.modalCard}>
              <View
                style={[
                  styles.modalIcon,
                  { backgroundColor: selectedCourse.color },
                ]}
              >
                <Text style={styles.modalIconText}>{selectedCourse.icon}</Text>
              </View>
              <Text style={styles.modalCategory}>
                {selectedCourse.category.toLocaleUpperCase("fr")}
              </Text>
              <Text style={styles.modalTitle}>{selectedCourse.title}</Text>
              <Text style={styles.modalDescription}>
                {selectedCourse.description}
              </Text>
              <View style={styles.modalMeta}>
                <Text style={styles.modalMetaText}>
                  Niveau {selectedCourse.level.toLocaleLowerCase("fr")}
                </Text>
                <Text style={styles.detailDivider}>·</Text>
                <Text style={styles.modalMetaText}>
                  {selectedCourse.duration} minutes
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => toggleFavorite(selectedCourse.id)}
                style={({ pressed }) => [
                  styles.modalFavoriteButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.modalFavoriteText}>
                  {favorites.includes(selectedCourse.id)
                    ? "♥  Retirer des favoris"
                    : "♡  Ajouter aux favoris"}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => setSelectedCourse(null)}
                style={({ pressed }) => [
                  styles.modalCloseButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.modalCloseText}>Fermer</Text>
              </Pressable>
            </View>
          ) : null}
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
    paddingBottom: 28,
  },
  header: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
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
    marginBottom: 20,
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
  featuredCard: {
    minHeight: 176,
    flexDirection: "row",
    overflow: "hidden",
    padding: 18,
    marginBottom: 22,
    borderRadius: 19,
    backgroundColor: "#103F32",
  },
  featuredOrb: {
    position: "absolute",
    width: 160,
    height: 160,
    top: -86,
    right: -34,
    borderWidth: 1,
    borderColor: "rgba(228, 196, 109, 0.35)",
    borderRadius: 80,
  },
  featuredCopy: {
    flex: 1,
    justifyContent: "center",
    zIndex: 1,
  },
  featuredEyebrow: {
    color: "#E4C46D",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  featuredTitle: {
    maxWidth: 240,
    color: "#FFFDF6",
    fontSize: 19,
    fontWeight: "800",
    lineHeight: 25,
    marginTop: 7,
  },
  featuredMeta: {
    color: "#D5E1D9",
    fontSize: 10,
    marginTop: 7,
  },
  featuredButton: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 11,
    marginTop: 11,
    borderRadius: 9,
    backgroundColor: "#E4C46D",
  },
  featuredButtonText: {
    color: "#173D30",
    fontSize: 10,
    fontWeight: "800",
  },
  featuredArrow: {
    color: "#173D30",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },
  featuredSeal: {
    width: 45,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "rgba(228, 196, 109, 0.5)",
    borderRadius: 23,
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    marginLeft: 6,
  },
  featuredSealText: {
    color: "#E4C46D",
    fontSize: 26,
  },
  searchBox: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#EEECE4",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },
  searchIcon: {
    color: "#78847C",
    fontSize: 25,
    lineHeight: 28,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "#183D32",
    fontSize: 13,
    paddingVertical: 12,
  },
  clearSearch: {
    color: "#78847C",
    fontSize: 23,
    paddingLeft: 8,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  filterTitle: {
    color: "#183D32",
    fontSize: 14,
    fontWeight: "700",
  },
  favoritesFilter: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#E5DFCC",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  favoritesFilterActive: {
    borderColor: "#103F32",
    backgroundColor: "#103F32",
  },
  favoritesFilterText: {
    color: "#6F786F",
    fontSize: 11,
    fontWeight: "700",
  },
  favoritesFilterTextActive: {
    color: "#FFFFFF",
  },
  categoryList: {
    gap: 8,
    paddingBottom: 26,
  },
  categoryChip: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E8E5DA",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
  },
  categoryChipSelected: {
    borderColor: "#103F32",
    backgroundColor: "#103F32",
  },
  categoryText: {
    color: "#69736B",
    fontSize: 11,
    fontWeight: "700",
  },
  categoryTextSelected: {
    color: "#FFFFFF",
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 14,
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
  courseCount: {
    color: "#78847C",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 3,
  },
  courseList: {
    gap: 12,
  },
  courseCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderWidth: 1,
    borderColor: "#EEECE4",
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
  },
  courseIcon: {
    width: 47,
    height: 47,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  courseIconText: {
    color: "#24483A",
    fontSize: 23,
    fontWeight: "700",
  },
  courseBody: {
    flex: 1,
    marginLeft: 12,
  },
  courseMeta: {
    minHeight: 19,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  courseCategory: {
    flex: 1,
    color: "#B28B2E",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
  },
  favoriteIcon: {
    color: "#899087",
    fontSize: 21,
    lineHeight: 23,
  },
  favoriteIconSelected: {
    color: "#B28B2E",
  },
  courseTitle: {
    color: "#1C3F34",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 3,
  },
  courseDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },
  courseDetail: {
    color: "#858B84",
    fontSize: 11,
  },
  detailDivider: {
    color: "#B9B8AD",
    fontSize: 14,
    marginHorizontal: 7,
  },
  detailsButton: {
    minHeight: 35,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 11,
    marginTop: 11,
    borderRadius: 9,
    backgroundColor: "#F3F5F0",
  },
  buttonPressed: {
    opacity: 0.75,
  },
  detailsButtonText: {
    color: "#103F32",
    fontSize: 11,
    fontWeight: "700",
  },
  detailsArrow: {
    color: "#B28B2E",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 32,
    borderWidth: 1,
    borderColor: "#EEECE4",
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
  },
  emptyIcon: {
    color: "#B28B2E",
    fontSize: 30,
    marginBottom: 8,
  },
  emptyTitle: {
    color: "#1C3F34",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyDescription: {
    color: "#858B84",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    textAlign: "center",
  },
  footerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 17,
    marginTop: 24,
    borderRadius: 17,
    backgroundColor: "#EFEDE2",
  },
  footerOrnament: {
    color: "#B28B2E",
    fontSize: 30,
    marginRight: 14,
  },
  footerCopy: {
    flex: 1,
  },
  footerTitle: {
    color: "#1C3F34",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 19,
  },
  footerDescription: {
    color: "#737B72",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },
  footer: {
    color: "#92978F",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginTop: 19,
    textAlign: "center",
  },
  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
    backgroundColor: "rgba(18, 39, 31, 0.55)",
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    padding: 23,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
  },
  modalIcon: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    marginBottom: 18,
  },
  modalIconText: {
    color: "#24483A",
    fontSize: 28,
    fontWeight: "700",
  },
  modalCategory: {
    color: "#B28B2E",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.3,
  },
  modalTitle: {
    color: "#183D32",
    fontSize: 23,
    fontWeight: "800",
    lineHeight: 29,
    marginTop: 7,
  },
  modalDescription: {
    color: "#717A73",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },
  modalMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  modalMetaText: {
    color: "#68746B",
    fontSize: 12,
    fontWeight: "600",
  },
  modalFavoriteButton: {
    minHeight: 47,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    borderRadius: 12,
    backgroundColor: "#103F32",
  },
  modalFavoriteText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  modalCloseButton: {
    minHeight: 43,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  modalCloseText: {
    color: "#717A73",
    fontSize: 13,
    fontWeight: "700",
  },
});

export default Cours;
