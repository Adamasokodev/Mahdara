<<<<<<< HEAD
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
=======
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import colors from "../theme/colors";
import { API_URL } from "../config/api";

const filters = [
  { id: "tout", label: "Tout" },
  { id: "livre", label: "Livres" },
  { id: "poeme", label: "Poèmes" },
  { id: "manuel", label: "Manuels" },
];
const languageNames = { ar: "Arabe", fr: "Français", wo: "Wolof", ff: "Pulaar" };

function Bibliotheque() {
  const [works, setWorks] = useState([]);
  const [filter, setFilter] = useState("tout");
  const [language, setLanguage] = useState("toutes");
  const [confrerie, setConfrerie] = useState("toutes");
  const [search, setSearch] = useState("");
  const [selectedWork, setSelectedWork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`${API_URL}/oeuvres`, { headers: { Accept: "application/json" } })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Catalogue indisponible")))
      .then((data) => { if (active) setWorks(Array.isArray(data) ? data : []); })
      .catch(() => { if (active) setError("La bibliothèque ne peut pas être chargée pour le moment."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const visibleWorks = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("fr");
    return works.filter((work) => {
      const matchesType = filter === "tout" || work.type === filter;
      const matchesLanguage = language === "toutes" || work.langue === language;
      const matchesConfrerie = confrerie === "toutes" || work.confrerie === confrerie;
      const matchesSearch = !term || [work.titre, work.auteur, work.langue, work.confrerie]
        .filter(Boolean).join(" ").toLocaleLowerCase("fr").includes(term);
      return matchesType && matchesLanguage && matchesConfrerie && matchesSearch;
    });
  }, [confrerie, filter, language, search, works]);
  const availableLanguages = useMemo(() => [...new Set(works.map((work) => work.langue).filter(Boolean))], [works]);
  const availableConfreries = useMemo(() => [...new Set(works.filter((work) => work.type === "poeme").map((work) => work.confrerie).filter(Boolean))], [works]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerAccent} />
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>LE FOYER DU SAVOIR</Text>
            <Text style={styles.title}>Bibliothèque</Text>
          </View>
          <Text style={styles.headerMark}>⌂</Text>
        </View>
        <Text style={styles.intro}>Livres étudiés dans les daaras, poèmes religieux et littéraires classés par confrérie, manuels et œuvres en wolof ou en pulaar.</Text>
        <TextInput
          accessibilityLabel="Rechercher dans la bibliothèque"
          value={search}
          onChangeText={setSearch}
          placeholder="Titre, auteur, langue, confrérie..."
          placeholderTextColor="#8A938D"
          style={styles.search}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {filters.map((item) => {
            const active = filter === item.id;
            return (
              <Pressable key={item.id} onPress={() => { setFilter(item.id); if (item.id !== "tout" && item.id !== "poeme") setConfrerie("toutes"); }} style={[styles.filter, active && styles.filterActive]}>
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{item.label}</Text>
>>>>>>> ca668bae1f09baef64fbc648ec3e40ecbcdb768b
              </Pressable>
            );
          })}
        </ScrollView>
<<<<<<< HEAD

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
=======
        {availableLanguages.length > 1 ? (
          <>
            <Text style={styles.filterHeading}>Langue</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
              {["toutes", ...availableLanguages].map((value) => {
                const active = language === value;
                return <Pressable key={value} onPress={() => setLanguage(value)} style={[styles.filter, active && styles.filterActive]}><Text style={[styles.filterText, active && styles.filterTextActive]}>{value === "toutes" ? "Toutes" : languageNames[value] || value}</Text></Pressable>;
              })}
            </ScrollView>
          </>
        ) : null}
        {availableConfreries.length > 0 && (filter === "tout" || filter === "poeme") ? (
          <>
            <Text style={styles.filterHeading}>Poèmes par confrérie</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
              {["toutes", ...availableConfreries].map((value) => {
                const active = confrerie === value;
                return <Pressable key={value} onPress={() => setConfrerie(value)} style={[styles.filter, active && styles.filterActive]}><Text style={[styles.filterText, active && styles.filterTextActive]}>{value === "toutes" ? "Toutes" : value}</Text></Pressable>;
              })}
            </ScrollView>
          </>
        ) : null}

        {loading ? <ActivityIndicator color={colors.green600} style={styles.loader} /> : null}
        {!loading && error ? <Text style={styles.empty}>{error}</Text> : null}
        {!loading && !error && visibleWorks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>▤</Text>
            <Text style={styles.emptyTitle}>{works.length ? "Aucune œuvre trouvée" : "La collection se prépare"}</Text>
            <Text style={styles.empty}>{works.length ? "Modifiez votre recherche ou choisissez une autre catégorie." : "Les livres, poèmes et manuels publiés par l’équipe apparaîtront ici."}</Text>
          </View>
        ) : null}

        {visibleWorks.map((work) => (
          <Pressable key={work.id} onPress={() => setSelectedWork(work)} style={({ pressed }) => [styles.workCard, pressed && styles.pressed]}>
            <View style={styles.workTop}>
              <View style={styles.workIcon}><Text style={styles.workIconText}>{work.type === "poeme" ? "✧" : "▤"}</Text></View>
              <View style={styles.workCopy}>
                <Text style={styles.workType}>{work.type === "poeme" ? "POÈME" : work.type === "manuel" ? "MANUEL" : "LIVRE"}</Text>
                <Text style={styles.workTitle}>{work.titre}</Text>
                <Text style={styles.workAuthor}>{work.auteur || "Auteur non renseigné"}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.meta}>{languageNames[work.langue] || work.langue}</Text>
              {work.confrerie ? <Text style={styles.meta}>· {work.confrerie}</Text> : null}
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <Modal animationType="fade" transparent visible={!!selectedWork} onRequestClose={() => setSelectedWork(null)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedWork(null)} />
          {selectedWork ? (
            <ScrollView style={styles.modalCard} contentContainerStyle={styles.modalContent}>
              <Text style={styles.workType}>{selectedWork.type?.toLocaleUpperCase("fr")}</Text>
              <Text style={styles.modalTitle}>{selectedWork.titre}</Text>
              <Text style={styles.workAuthor}>{selectedWork.auteur || "Auteur non renseigné"}</Text>
              {selectedWork.confrerie ? <Text style={styles.modalMeta}>Confrérie : {selectedWork.confrerie}</Text> : null}
              {selectedWork.description ? <Text style={styles.modalText}>{selectedWork.description}</Text> : null}
              {selectedWork.aide_pedagogique ? <><Text style={styles.modalHeading}>Aide pédagogique</Text><Text style={styles.modalText}>{selectedWork.aide_pedagogique}</Text></> : null}
              {selectedWork.url ? (
                <Pressable onPress={() => Linking.openURL(selectedWork.url)} style={styles.openButton}>
                  <Text style={styles.openButtonText}>Ouvrir la ressource</Text>
                </Pressable>
              ) : <Text style={styles.empty}>Aucun fichier ou lien n’est encore associé à cette œuvre.</Text>}
              <Pressable onPress={() => setSelectedWork(null)} style={styles.closeButton}><Text style={styles.closeText}>Fermer</Text></Pressable>
            </ScrollView>
          ) : null}
        </View>
      </Modal>
>>>>>>> ca668bae1f09baef64fbc648ec3e40ecbcdb768b
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.neutral50 },
<<<<<<< HEAD
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
=======
  content: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 30 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  headerAccent: { width: 4, height: 42, borderRadius: 3, backgroundColor: colors.green600, marginRight: 12 },
  headerCopy: { flex: 1 },
  eyebrow: { color: "#88928A", fontSize: 9, fontWeight: "800", letterSpacing: 1.4 },
  title: { color: colors.neutral900, fontSize: 26, fontFamily: "Georgia", fontWeight: "700", marginTop: 2 },
  headerMark: { color: colors.green600, fontSize: 28, paddingHorizontal: 8 },
  intro: { color: "#64736A", fontSize: 12, lineHeight: 19, marginBottom: 16 },
  search: { height: 45, paddingHorizontal: 13, borderRadius: 12, borderWidth: 1, borderColor: "#E5E7E0", backgroundColor: "#FFFFFF", color: colors.neutral900, fontSize: 12 },
  filters: { gap: 8, paddingVertical: 13 },
  filter: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 18, borderWidth: 1, borderColor: "#E5E7E0", backgroundColor: "#FFFFFF" },
  filterActive: { backgroundColor: colors.green600, borderColor: colors.green600 },
  filterText: { color: "#68746B", fontSize: 11, fontWeight: "700" },
  filterTextActive: { color: "#FFFFFF" },
  filterHeading: { color: "#53645A", fontSize: 10, fontWeight: "800", marginTop: 3 },
  loader: { padding: 25 },
  workCard: { padding: 13, marginBottom: 10, borderRadius: 15, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EAE9E3" },
  workTop: { flexDirection: "row", alignItems: "center" },
  workIcon: { width: 43, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 11, backgroundColor: "#EFF4ED", marginRight: 11 },
  workIconText: { color: colors.green600, fontSize: 23 },
  workCopy: { flex: 1 },
  workType: { color: "#A47C35", fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  workTitle: { color: colors.neutral900, fontFamily: "Georgia", fontSize: 15, fontWeight: "700", marginTop: 3 },
  workAuthor: { color: "#78827B", fontSize: 11, marginTop: 4 },
  arrow: { color: colors.green600, fontSize: 25, marginLeft: 8 },
  metaRow: { flexDirection: "row", gap: 7, marginTop: 12 },
  meta: { color: "#778178", fontSize: 10 },
  emptyCard: { alignItems: "center", padding: 22, marginTop: 10, borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EAE9E3" },
  emptyIcon: { color: colors.green600, fontSize: 30 },
  emptyTitle: { color: colors.neutral900, fontWeight: "800", fontSize: 14, marginTop: 8 },
  empty: { color: "#78827B", fontSize: 11, lineHeight: 17, textAlign: "center", marginTop: 7 },
  pressed: { opacity: 0.85 },
  modalBackdrop: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "rgba(14, 31, 22, 0.48)" },
  modalCard: { maxHeight: "85%", padding: 20, borderRadius: 18, backgroundColor: "#FFFFFF" },
  modalContent: { paddingBottom: 5 },
  modalTitle: { color: colors.neutral900, fontFamily: "Georgia", fontSize: 21, fontWeight: "700", marginTop: 7 },
  modalMeta: { color: colors.green600, fontSize: 11, fontWeight: "700", marginTop: 10 },
  modalHeading: { color: colors.neutral900, fontSize: 12, fontWeight: "800", marginTop: 15 },
  modalText: { color: "#49584F", fontSize: 12, lineHeight: 19, marginTop: 13 },
  openButton: { minHeight: 44, alignItems: "center", justifyContent: "center", backgroundColor: colors.green600, borderRadius: 11, marginTop: 18 },
  openButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  closeButton: { alignItems: "center", padding: 12, marginTop: 5 },
  closeText: { color: "#68746B", fontSize: 12, fontWeight: "700" },
>>>>>>> ca668bae1f09baef64fbc648ec3e40ecbcdb768b
});

export default Bibliotheque;
