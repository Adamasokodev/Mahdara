import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ImageBackground,
  Pressable,
  Share,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config/api";
import colors from "../theme/colors";
import { getCoursePlaceholder } from "../utils/courseCatalog";
import AppHeader from "../components/common/AppHeader";

const mapPart = (part) => ({
  id: part.id,
  order: Number(part.ordre || 1),
  title: part.titre,
  content: part.contenu,
  audioUrl: part.audio_url || null,
  duration: Number(part.duree_secondes || 0),
});

export default function CoursDetail({ navigation, route }) {
  const { token } = useAuth();
  const course = route.params?.course || {};
  const [parts, setParts] = useState([]);
  const [part, setPart] = useState(null);
  const [loading, setLoading] = useState(Boolean(course.serverId));
  const [error, setError] = useState("");
  const [playbackError, setPlaybackError] = useState("");
  const player = useAudioPlayer(part?.audioUrl || null);
  const playerStatus = useAudioPlayerStatus(player);

  useEffect(() => {
    let mounted = true;
    const legacyPart = {
      id: "legacy",
      order: 1,
      title: course.title || "Introduction",
      content: token ? course.description || "" : null,
      audioUrl: token ? course.mediaUrl || null : null,
      duration: Number(course.duration || 0) * 60,
    };

    if (!course.serverId) {
      setParts([legacyPart]);
      setLoading(false);
      return () => { mounted = false; };
    }

    fetch(`${API_URL}/cours/${course.serverId}/parties`, {
      headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Les parties de ce cours sont momentanément indisponibles.")))
      .then((data) => {
        if (!mounted) return;
        const loaded = (Array.isArray(data) ? data : []).map(mapPart);
        setParts(loaded.length ? loaded : [legacyPart]);
      })
      .catch((fetchError) => {
        if (!mounted) return;
        setError(fetchError.message || "Impossible de charger les parties du cours.");
        setParts([legacyPart]);
      })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [course.description, course.duration, course.mediaUrl, course.serverId, course.title, token]);

  const durationLabel = useMemo(() => {
    if (!part?.duration) return "Audio du cours";
    const minutes = Math.floor(part.duration / 60);
    const seconds = part.duration % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")} min`;
  }, [part]);

  const trackListen = async (selected) => {
    if (!token || !course.serverId) return;
    const endpoint = selected?.id && selected.id !== "legacy"
      ? `/cours/${course.serverId}/parties/${selected.id}/ecoute`
      : `/cours/${course.serverId}/ecoute`;
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Le comptage de l’écoute a échoué.");
  };

  const toggleAudio = async () => {
    if (!token) {
      navigation.getParent()?.getParent()?.navigate("Login");
      return;
    }
    if (!part?.audioUrl) {
      Alert.alert("Audio indisponible", "Aucun enregistrement n’est associé à cette partie.");
      return;
    }
    setPlaybackError("");
    try {
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true, interruptionMode: "doNotMix" });
      if (player.playing) player.pause();
      else {
        trackListen(part).catch(() => {});
        player.play();
      }
    } catch (playError) {
      setPlaybackError(playError.message || "La lecture audio n’a pas pu démarrer.");
    }
  };

  const downloadAudio = async () => {
    if (!token || !course.serverId) return;
    const endpoint = part?.id && part.id !== "legacy"
      ? `/cours/${course.serverId}/parties/${part.id}/telechargement`
      : `/cours/${course.serverId}/telechargement`;
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok || !result.url) throw new Error(result.message || "Téléchargement indisponible.");
      await Linking.openURL(result.url);
    } catch (downloadError) {
      Alert.alert("Téléchargement impossible", downloadError.message || "Réessayez plus tard.");
    }
  };

  const back = () => {
    player.pause();
    if (part) setPart(null);
    else navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <StatusBar style="light" />
<AppHeader
        title={part ? part.title : course.category || "Cours"}
        subtitle={part ? "LECTURE" : "ESPACE APPRENTISSAGE"}
        showBack
        onBackPress={back}
      />
      {part ? (
        <>
          <ScrollView contentContainerStyle={styles.readerContent} showsVerticalScrollIndicator={false}>
            <Pressable onPress={back} style={styles.readerBack}><Text style={styles.readerBackText}>‹  Toutes les parties</Text></Pressable>
            <Text style={styles.category}>{course.category?.toLocaleUpperCase("fr") || "COURS"}</Text>
            <Text style={styles.readerCourse}>{course.title}</Text>
            <View style={styles.readerTitleRow}>
              <View style={styles.readerNumber}><Text style={styles.readerNumberText}>{part.order}</Text></View>
              <View style={styles.readerHeadingCopy}><Text style={styles.readerTitle}>{part.title}</Text><Text style={styles.readerSubtitle}>PARTIE {part.order}  ·  {durationLabel}</Text></View>
            </View>
            {!token || part.content === null ? (
              <View style={styles.accessCard}>
                <Text style={styles.accessIcon}>◉</Text>
                <Text style={styles.accessTitle}>{token ? "Activez votre compte étudiant" : "Poursuivez votre apprentissage"}</Text>
                <Text style={styles.accessText}>{token ? "Le contenu complet sera disponible après activation de votre compte." : "Connectez-vous pour accéder au texte intégral et à l’écoute audio."}</Text>
                {!token ? <Pressable onPress={() => navigation.getParent()?.getParent()?.navigate("Login")} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Se connecter</Text></Pressable> : null}
              </View>
            ) : (
              <>
                <View style={styles.lessonPaper}>
                  <View style={styles.lessonLabelRow}><View style={styles.lessonDot} /><Text style={styles.lessonLabel}>LEÇON</Text></View>
                  <Text style={styles.lessonText}>{part.content || "Le texte de cette partie n’a pas encore été ajouté."}</Text>
                </View>
                {playbackError || playerStatus.error ? <Text style={styles.errorText}>{playbackError || playerStatus.error}</Text> : null}
              </>
            )}
          </ScrollView>
          {token && part.content !== null ? (
            <View style={styles.playerDock}>
              <View style={styles.playerInfo}><Text style={styles.playerEyebrow}>ÉCOUTE DE LA PARTIE {part.order}</Text><Text numberOfLines={1} style={styles.playerTitle}>{part.title}</Text></View>
              <Pressable accessibilityRole="button" onPress={toggleAudio} style={styles.playerButton}><Text style={styles.playerButtonText}>{player.playing ? "Ⅱ" : "▶"}</Text></Pressable>
              <Pressable accessibilityRole="button" onPress={downloadAudio} style={styles.downloadButton}><Text style={styles.downloadGlyph}>↓</Text></Pressable>
            </View>
          ) : null}
        </>
      ) : (
        <ScrollView contentContainerStyle={styles.courseContent} showsVerticalScrollIndicator={false}>
          <ImageBackground
            source={{ uri: course.image || getCoursePlaceholder(course.category) }}
            style={styles.detailCover}
            imageStyle={styles.detailCoverImage}
          >
            <View style={styles.detailCoverShade} />
            <View style={styles.coverActions}>
              <View style={styles.availableBadge}><View style={styles.availableDot} /><Text style={styles.availableText}>Disponible</Text></View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Partager ce cours"
                onPress={() => Share.share({ message: `${course.title || "Cours Mahdara"}\n${course.description || ""}` })}
                style={styles.shareButton}
              >
                <Text style={styles.shareGlyph}>↗</Text>
              </Pressable>
            </View>
          </ImageBackground>
          <View style={styles.hero}>
            <View style={styles.heroOrb} />
            <View style={styles.heroTop}><Text style={styles.heroTag}>{course.category || "COURS"}</Text><Text style={styles.heroIcon}>{course.icon || "♫"}</Text></View>
            <Text style={styles.heroTitle}>{course.title || "Cours"}</Text>
            {course.teacher ? <Text style={styles.teacherName}>{course.teacher}</Text> : null}
            <View style={styles.heroMeta}><Text style={styles.heroMetaText}>{course.level || "Tous niveaux"}</Text><View style={styles.heroMetaDot} /><Text style={styles.heroMetaText}>{course.duration ? `${course.duration} min` : "À votre rythme"}</Text></View>
          </View>

          <View style={styles.partsHeader}><View><Text style={styles.sectionEyebrow}>VOTRE PARCOURS</Text><Text style={styles.sectionTitle}>Parties</Text></View><Text style={styles.partsCount}>{parts.length} {parts.length === 1 ? "leçon" : "leçons"}</Text></View>
          {loading ? <ActivityIndicator color={colors.green600} style={styles.loader} /> : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {!loading && parts.map((item) => (
            <Pressable key={item.id} accessibilityRole="button" onPress={() => { player.pause(); setPlaybackError(""); setPart(item); }} style={({ pressed }) => [styles.partCard, pressed && styles.pressed]}>
              <View style={styles.partIndex}><Text style={styles.partIndexText}>{String(item.order).padStart(2, "0")}</Text></View>
              <View style={styles.partCopy}><Text numberOfLines={1} style={styles.partName}>{item.title}</Text><Text style={styles.partMeta}>{item.audioUrl ? "Lecture et audio" : "Lecture"}{item.duration ? `  ·  ${Math.ceil(item.duration / 60)} min` : ""}</Text></View>
              <View style={styles.partArrow}><Text style={styles.partArrowText}>›</Text></View>
            </Pressable>
          ))}
          {!loading && !parts.length ? <Text style={styles.emptyText}>Aucune partie n’a encore été ajoutée à ce cours.</Text> : null}
          <Text style={styles.footerNote}>Avancez à votre rythme, une leçon après l’autre.</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.neutral50 },
  courseContent: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 38 },
  detailCover: { height: 210, overflow: "hidden", justifyContent: "flex-start", padding: 13, borderRadius: 19, backgroundColor: colors.green700 },
  detailCoverImage: { borderRadius: 19 },
  detailCoverShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(3, 25, 18, 0.2)" },
  coverActions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  availableBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 7, borderRadius: 15, backgroundColor: colors.white },
  availableDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#3B9A62", marginRight: 6 },
  availableText: { color: colors.green700, fontSize: 10, fontWeight: "800" },
  shareButton: { width: 37, height: 37, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.92)" },
  shareGlyph: { color: colors.green700, fontSize: 20, fontWeight: "700" },
  hero: { overflow: "hidden", padding: 17, marginTop: -1, borderBottomLeftRadius: 18, borderBottomRightRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.neutral200 },
  heroOrb: { position: "absolute", top: -92, right: -35, width: 220, height: 220, borderWidth: 1, borderColor: "rgba(228,196,109,0.2)", borderRadius: 110 },
  heroTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heroTag: { color: colors.gold400, fontSize: 9, fontWeight: "800", letterSpacing: 1.4 },
  heroIcon: { width: 44, height: 44, textAlign: "center", textAlignVertical: "center", overflow: "hidden", borderRadius: 15, backgroundColor: "rgba(255,255,255,0.12)", color: "#F7E7B2", fontSize: 23 },
  heroTitle: { maxWidth: 320, color: colors.neutral900, fontSize: 22, fontWeight: "800", lineHeight: 28, marginTop: 11 },
  teacherName: { color: colors.neutral600, fontSize: 12, marginTop: 5 },
  heroMeta: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  heroMetaText: { color: colors.green600, fontSize: 10, fontWeight: "700" },
  heroMetaDot: { width: 4, height: 4, borderRadius: 2, marginHorizontal: 9, backgroundColor: "#D0AD54" },
  statsCard: { minHeight: 82, flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingVertical: 12, marginTop: 13, borderWidth: 1, borderColor: "#E9ECE5", borderRadius: 17, backgroundColor: "#FFFFFF" },
  stat: { flex: 1, alignItems: "center" },
  statValue: { color: "#174735", fontSize: 19, fontWeight: "800" },
  statLabel: { color: "#8B958D", fontSize: 8, fontWeight: "800", letterSpacing: 0.8, marginTop: 4 },
  statDivider: { width: 1, height: 31, backgroundColor: "#E8ECE5" },
  infoCard: { paddingHorizontal: 15, marginTop: 13, borderWidth: 1, borderColor: "#E9ECE5", borderRadius: 17, backgroundColor: "#FFFFFF" },
  infoLine: { minHeight: 63, flexDirection: "row", alignItems: "center" },
  infoLineBorder: { borderTopWidth: 1, borderTopColor: "#EEF0EA" },
  infoIcon: { width: 34, height: 34, textAlign: "center", textAlignVertical: "center", overflow: "hidden", borderRadius: 11, backgroundColor: "#EFF5EF", color: "#1A6948", fontSize: 17, marginRight: 11 },
  infoLabel: { color: "#929A92", fontSize: 8, fontWeight: "800", letterSpacing: 1 },
  infoValue: { color: "#24483A", fontSize: 12, fontWeight: "700", marginTop: 4 },
  partsHeader: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 27, marginBottom: 12 },
  sectionEyebrow: { color: "#B28B2E", fontSize: 8, fontWeight: "800", letterSpacing: 1.3, marginBottom: 4 },
  sectionTitle: { color: "#183D32", fontSize: 19, fontWeight: "800" },
  partsCount: { color: "#63766B", fontSize: 11, fontWeight: "700", paddingBottom: 3 },
  loader: { padding: 22 },
  partCard: { minHeight: 76, flexDirection: "row", alignItems: "center", paddingHorizontal: 13, marginTop: 9, borderWidth: 1, borderColor: "#E5E9E1", borderRadius: 17, backgroundColor: "#FFFFFF" },
  partIndex: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "#E9F1EA" },
  partIndexText: { color: "#176241", fontSize: 14, fontWeight: "800" },
  partCopy: { flex: 1, marginLeft: 12 },
  partName: { color: "#183D32", fontSize: 13, fontWeight: "800" },
  partMeta: { color: "#879188", fontSize: 10, marginTop: 5 },
  partArrow: { width: 27, height: 27, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "#F8F5E9" },
  partArrowText: { color: "#B28B2E", fontSize: 22, lineHeight: 24, marginTop: -2 },
  emptyText: { color: "#77837A", fontSize: 12, lineHeight: 18, padding: 18, borderRadius: 14, backgroundColor: "#FFFFFF" },
  footerNote: { color: "#929A92", fontSize: 10, textAlign: "center", marginTop: 22 },
  readerContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  readerBack: { alignSelf: "flex-start", paddingVertical: 8, paddingRight: 14 },
  readerBackText: { color: "#176241", fontSize: 12, fontWeight: "800" },
  category: { color: "#B28B2E", fontSize: 9, fontWeight: "800", letterSpacing: 1.5, marginTop: 12 },
  readerCourse: { color: "#839087", fontSize: 12, lineHeight: 18, marginTop: 5 },
  readerTitleRow: { flexDirection: "row", alignItems: "center", marginTop: 18, marginBottom: 18 },
  readerNumber: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 15, backgroundColor: "#E1EEE4" },
  readerNumberText: { color: "#176241", fontSize: 18, fontWeight: "800" },
  readerHeadingCopy: { flex: 1, marginLeft: 12 },
  readerTitle: { color: "#183D32", fontSize: 20, fontWeight: "800" },
  readerSubtitle: { color: "#89948B", fontSize: 9, fontWeight: "700", letterSpacing: 0.8, marginTop: 5 },
  lessonPaper: { paddingHorizontal: 19, paddingTop: 17, paddingBottom: 23, borderWidth: 1, borderColor: "#E8E3D5", borderRadius: 18, backgroundColor: "#FFFEFA" },
  lessonLabelRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  lessonDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#BD9B49", marginRight: 8 },
  lessonLabel: { color: "#748176", fontSize: 9, fontWeight: "800", letterSpacing: 1.3 },
  lessonText: { color: "#283B32", fontSize: 16, lineHeight: 30, writingDirection: "auto" },
  accessCard: { padding: 20, borderWidth: 1, borderColor: "#E4EAE2", borderRadius: 18, backgroundColor: "#FFFFFF" },
  accessIcon: { color: "#B28B2E", fontSize: 22 },
  accessTitle: { color: "#183D32", fontSize: 16, fontWeight: "800", marginTop: 12 },
  accessText: { color: "#7A867D", fontSize: 12, lineHeight: 19, marginTop: 6 },
  primaryButton: { minHeight: 45, alignItems: "center", justifyContent: "center", marginTop: 16, borderRadius: 13, backgroundColor: "#16A34A" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  playerDock: { minHeight: 78, flexDirection: "row", alignItems: "center", paddingHorizontal: 18, borderTopWidth: 1, borderTopColor: "#E6EAE4", backgroundColor: "#FFFFFF" },
  playerInfo: { flex: 1, marginRight: 12 },
  playerEyebrow: { color: "#9A8A57", fontSize: 8, fontWeight: "800", letterSpacing: 1 },
  playerTitle: { color: "#183D32", fontSize: 12, fontWeight: "700", marginTop: 5 },
  playerButton: { width: 46, height: 46, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "#16A34A" },
  playerButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  downloadButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center", marginLeft: 8, borderRadius: 14, backgroundColor: "#EFF4EF" },
  downloadGlyph: { color: "#176241", fontSize: 21, fontWeight: "700" },
  errorText: { color: "#A6352C", fontSize: 11, lineHeight: 17, marginTop: 10 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
});
