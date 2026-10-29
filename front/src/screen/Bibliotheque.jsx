import React, { useMemo, useRef, useState } from "react";
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
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../theme/colors";
import AppHeader from "../components/common/AppHeader";

const categories = ["Tout", "Livres", "Poèmes", "Patrimoine"];

const resources = [
  {
    id: "prophete",
    category: "Livres",
    title: "La vie du Prophète",
    author: "Oustaz Ahmed",
    pages: "126 pages",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "regles",
    category: "Livres",
    title: "Les règles de la foi",
    author: "Abdelkader Sidi",
    pages: "98 pages",
    image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "comportement",
    category: "Poèmes",
    title: "Le comportement musulman",
    author: "Oustaz Ahmed",
    pages: "76 pages",
    image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "histoire",
    category: "Patrimoine",
    title: "Histoire de l’Islam en Afrique",
    author: "Mamadou Diallo",
    pages: "112 pages",
    image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=400&q=80",
  },
];

function Bibliotheque({ navigation }) {
  const [category, setCategory] = useState("Tout");
  const [search, setSearch] = useState("");
  const searchRef = useRef(null);

  const visibleResources = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("fr");
    return resources.filter((resource) => (
      (category === "Tout" || resource.category === category)
      && (!term || `${resource.title} ${resource.author} ${resource.category}`.toLocaleLowerCase("fr").includes(term))
    ));
  }, [category, search]);

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AppHeader
          title="Bibliothèque"
          showBack
          rightIcon="search-outline"
          onBackPress={() => navigation.navigate("Accueil")}
          onRightPress={() => searchRef.current?.focus()}
          horizontalInset={17}
        />

        <ImageBackground
          source={{ uri: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1000&q=85" }}
          style={styles.hero}
          imageStyle={styles.heroImage}
        >
          <View style={styles.heroShade} />
          <Text style={styles.heroTitle}>Livres, poèmes et patrimoine</Text>
          <Text style={styles.heroSubtitle}>Une richesse culturelle et spirituelle à portée de main.</Text>
        </ImageBackground>

        <View style={styles.searchBox}>
          <Text style={styles.searchGlyph}>⌕</Text>
          <TextInput
            accessibilityLabel="Rechercher dans la bibliothèque"
            onChangeText={setSearch}
            ref={searchRef}
            placeholder="Rechercher un livre, un auteur..."
            placeholderTextColor="#8A938B"
            returnKeyType="search"
            style={styles.searchInput}
            value={search}
          />
          {search ? (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Text style={styles.clearSearch}>×</Text>
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          horizontal
          contentContainerStyle={styles.categories}
          showsHorizontalScrollIndicator={false}
        >
          {categories.map((item) => {
            const selected = category === item;
            return (
              <Pressable
                key={item}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setCategory(item)}
                style={[styles.categoryChip, selected && styles.categoryChipSelected]}
              >
                <Text style={[styles.categoryText, selected && styles.categoryTextSelected]}>{item}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>{category === "Tout" ? "Livres populaires" : category}</Text>
          <Text style={styles.seeAll}>{visibleResources.length} ouvrages</Text>
        </View>

        {visibleResources.length ? visibleResources.map((resource) => (
          <Pressable
            key={resource.id}
            accessibilityRole="button"
            onPress={() => Alert.alert(resource.title, "La lecture de cet ouvrage sera bientôt disponible.")}
            style={({ pressed }) => [styles.resourceCard, pressed && styles.pressed]}
          >
            <ImageBackground source={{ uri: resource.image }} style={styles.cover} imageStyle={styles.coverImage}>
              <View style={styles.coverShade} />
              <Text style={styles.coverMark}>م</Text>
            </ImageBackground>
            <View style={styles.resourceCopy}>
              <Text style={styles.resourceTitle}>{resource.title}</Text>
              <Text style={styles.resourceAuthor}>{resource.author}</Text>
              <Text style={styles.resourcePages}>▤  {resource.pages}</Text>
            </View>
            <View style={styles.readBadge}><Text style={styles.readBadgeText}>Lire</Text></View>
          </Pressable>
        )) : (
          <Text style={styles.emptyState}>Aucun ouvrage ne correspond à votre recherche.</Text>
        )}

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.getParent()?.navigate("Mahadras")}
          style={({ pressed }) => [styles.mahdaraLink, pressed && styles.pressed]}
        >
          <Text style={styles.mahdaraGlyph}>⌂</Text>
          <View style={styles.mahdaraCopy}>
            <Text style={styles.mahdaraTitle}>Découvrir les mahadras</Text>
            <Text style={styles.mahdaraSubtitle}>Lieux de savoir et de transmission</Text>
          </View>
          <Text style={styles.mahdaraArrow}>›</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.neutral50 },
  content: { paddingHorizontal: 17, paddingTop: 0, paddingBottom: 28 },
  hero: { height: 145, justifyContent: "flex-end", overflow: "hidden", padding: 14, marginBottom: 13, borderRadius: 16, backgroundColor: "#315545" },
  heroImage: { borderRadius: 16 },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(12, 24, 17, 0.48)" },
  heroTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  heroSubtitle: { maxWidth: 250, color: "#F0F1E8", fontSize: 10, lineHeight: 15, marginTop: 4 },
  searchBox: { minHeight: 42, flexDirection: "row", alignItems: "center", paddingHorizontal: 11, marginBottom: 12, borderWidth: 1, borderColor: "#E8E6DE", borderRadius: 12, backgroundColor: "#FFFFFF" },
  searchGlyph: { color: "#758078", fontSize: 21, marginRight: 7 },
  searchInput: { flex: 1, color: "#26342C", fontSize: 11, paddingVertical: 0 },
  clearSearch: { color: "#68746B", fontSize: 20, paddingHorizontal: 4 },
  categories: { gap: 7, paddingBottom: 16 },
  categoryChip: { paddingHorizontal: 13, paddingVertical: 7, borderRadius: 16, borderWidth: 1, borderColor: "#E5E5DE", backgroundColor: "#FFFFFF" },
  categoryChipSelected: { backgroundColor: colors.green600, borderColor: colors.green600 },
  categoryText: { color: "#6E7870", fontSize: 10, fontWeight: "600" },
  categoryTextSelected: { color: "#FFFFFF" },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 9 },
  sectionTitle: { color: colors.neutral900, fontSize: 15, fontWeight: "800" },
  seeAll: { color: "#54806A", fontSize: 10, fontWeight: "700" },
  resourceCard: { minHeight: 79, flexDirection: "row", alignItems: "center", padding: 8, marginBottom: 8, borderRadius: 13, borderWidth: 1, borderColor: "#E9E8E1", backgroundColor: "#FFFFFF" },
  pressed: { opacity: 0.84 },
  cover: { width: 61, height: 61, alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: 9, backgroundColor: "#315545" },
  coverImage: { borderRadius: 9 },
  coverShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(10, 35, 23, 0.34)" },
  coverMark: { color: "#F3DE9D", fontFamily: "Georgia", fontSize: 26, fontWeight: "700" },
  resourceCopy: { flex: 1, marginLeft: 10 },
  resourceTitle: { color: "#263B30", fontSize: 11, fontWeight: "800" },
  resourceAuthor: { color: "#78827B", fontSize: 9, marginTop: 3 },
  resourcePages: { color: "#78827B", fontSize: 9, marginTop: 5 },
  readBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: colors.green600 },
  readBadgeText: { color: "#FFFFFF", fontSize: 9, fontWeight: "800" },
  emptyState: { color: "#768078", fontSize: 12, textAlign: "center", paddingVertical: 24 },
  mahdaraLink: { minHeight: 58, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, marginTop: 7, borderRadius: 13, borderWidth: 1, borderColor: "#E9E8E1", backgroundColor: "#FFFFFF" },
  mahdaraGlyph: { color: colors.green600, fontSize: 23, marginRight: 10 },
  mahdaraCopy: { flex: 1 },
  mahdaraTitle: { color: "#244333", fontSize: 11, fontWeight: "800" },
  mahdaraSubtitle: { color: "#7A847D", fontSize: 9, marginTop: 3 },
  mahdaraArrow: { color: "#54806A", fontSize: 22 },
});

export default Bibliotheque;
