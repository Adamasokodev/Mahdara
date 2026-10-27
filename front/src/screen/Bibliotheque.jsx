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
              </Pressable>
            );
          })}
        </ScrollView>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.neutral50 },
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
});

export default Bibliotheque;
