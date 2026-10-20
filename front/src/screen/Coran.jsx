import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import colors from "../theme/colors";

const TEXT_API_ROOT = "https://api.alquran.cloud/v1";
const MP3QURAN_API_ROOT = "https://www.mp3quran.net/api/v3";
const PLAYBACK_RATES = [0.75, 1, 1.5];

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
}

function getPreferredMoshaf(reciter) {
  return reciter?.moshaf?.reduce((preferred, current) => (
    !preferred || current.surah_total > preferred.surah_total ? current : preferred
  ), null) ?? null;
}

function formatTime(seconds = 0) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function Coran() {
  const [surahs, setSurahs] = useState([]);
  const [reciters, setReciters] = useState([]);
  const [language, setLanguage] = useState("eng");
  const [reciterSearch, setReciterSearch] = useState("");
  const [selectedReciterId, setSelectedReciterId] = useState(123);
  const [selectedMoshafId, setSelectedMoshafId] = useState(null);
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [ayahs, setAyahs] = useState([]);
  const [mode, setMode] = useState("lire");
  const [loadingSurahs, setLoadingSurahs] = useState(true);
  const [loadingAyahs, setLoadingAyahs] = useState(true);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [loadedAudioKey, setLoadedAudioKey] = useState(null);
  const [error, setError] = useState("");
  const [audioError, setAudioError] = useState("");
  const [playbackRateIndex, setPlaybackRateIndex] = useState(1);
  const screenActive = useRef(false);
  const player = useAudioPlayer(null);
  const playback = useAudioPlayerStatus(player);

  useEffect(() => {
    screenActive.current = true;

    return () => {
      screenActive.current = false;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoadingSurahs(true);
    setLoadingCatalog(true);

    Promise.all([
      fetchJson(`${MP3QURAN_API_ROOT}/suwar?language=${language}`, controller.signal),
      fetchJson(`${MP3QURAN_API_ROOT}/reciters?language=${language}`, controller.signal),
      fetchJson(`${TEXT_API_ROOT}/surah`, controller.signal),
    ])
      .then(([surahResult, reciterResult, textResult]) => {
        const textSurahs = new Map(
          (textResult.data || []).map((surah) => [surah.number, surah])
        );
        const availableSurahs = (surahResult.suwar || []).map((surah) => {
          const textSurah = textSurahs.get(surah.id);
          return {
            number: surah.id,
            displayName: surah.name.trim(),
            name: textSurah?.name || "",
            numberOfAyahs: textSurah?.numberOfAyahs,
            revelationType: textSurah?.revelationType,
          };
        });

        setSurahs(availableSurahs);
        setReciters(reciterResult.reciters || []);
        setLoadingSurahs(false);
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setError("Impossible de charger les récitateurs et les sourates. Vérifiez votre connexion Internet puis réessayez.");
          setLoadingSurahs(false);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingCatalog(false);
      });

    return () => controller.abort();
  }, [language]);

  const selectedReciter = reciters.find((reciter) => reciter.id === selectedReciterId)
    || reciters[0]
    || null;
  const selectedMoshaf = selectedReciter?.moshaf?.find(
    (moshaf) => moshaf.id === selectedMoshafId
  ) || getPreferredMoshaf(selectedReciter);
  const availableSurahIds = new Set(
    (selectedMoshaf?.surah_list || "")
      .split(",")
      .map((surahId) => Number(surahId))
      .filter(Number.isFinite)
  );
  const filteredReciters = reciters.filter((reciter) => (
    reciter.name.toLocaleLowerCase().includes(reciterSearch.trim().toLocaleLowerCase())
  ));

  useEffect(() => {
    const controller = new AbortController();
    setLoadingAyahs(true);
    setError("");

    fetchJson(`${TEXT_API_ROOT}/surah/${selectedSurah}`, controller.signal)
      .then((result) => {
        setAyahs(result.data?.ayahs || []);
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setAyahs([]);
          setError("Impossible de charger le texte. Vérifiez votre connexion Internet puis réessayez.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingAyahs(false);
      });

    return () => controller.abort();
  }, [selectedSurah]);

  const currentSurah = surahs.find((surah) => surah.number === selectedSurah);
  const audioKey = `${selectedMoshaf?.id ?? ""}-${selectedSurah}`;
  const canPlaySurah = selectedMoshaf && availableSurahIds.has(selectedSurah);

  useEffect(() => {
    if (screenActive.current) {
      player.pause();
    }
    setLoadedAudioKey(null);
    setAudioError("");
  }, [player, selectedSurah, selectedMoshaf?.id]);

  const togglePlayback = async () => {
    if (!screenActive.current) return;

    if (playback.playing) {
      player.pause();
      return;
    }

    try {
      await setAudioModeAsync({ playsInSilentMode: true });
      if (!screenActive.current) return;
      if (!canPlaySurah) {
        setAudioError("Cette sourate n’est pas disponible pour cette récitation.");
        return;
      }

      if (loadedAudioKey !== audioKey) {
        const server = selectedMoshaf.server.endsWith("/")
          ? selectedMoshaf.server
          : `${selectedMoshaf.server}/`;
        const surahNumber = String(selectedSurah).padStart(3, "0");
        player.replace(`${server}${surahNumber}.mp3`);
        setLoadedAudioKey(audioKey);
      }
      player.playbackRate = PLAYBACK_RATES[playbackRateIndex];
      player.play();
      setMode("écouter");
      setAudioError("");
    } catch {
      if (screenActive.current) {
        setAudioError("La récitation n’a pas pu démarrer. Vérifiez votre connexion puis réessayez.");
      }
    }
  };

  const skipAudio = (seconds) => {
    const nextTime = Math.max(0, Math.min(playback.duration || 0, playback.currentTime + seconds));
    player.seekTo(nextTime).catch(() => {});
  };

  const progress = playback.duration > 0
    ? Math.min(100, (playback.currentTime / playback.duration) * 100)
    : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerAccent} />
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>LECTURE & RÉCITATION</Text>
            <Text style={styles.title}>Le Coran</Text>
          </View>
          <View style={styles.headerSeal}><Text style={styles.sealText}>۞</Text></View>
        </View>

        <View style={styles.modeSwitch}>
          <Pressable onPress={() => setMode("lire")} style={[styles.modeOption, mode === "lire" && styles.modeSelected]}>
            <Text style={[styles.modeText, mode === "lire" && styles.modeTextSelected]}>Lire</Text>
          </Pressable>
          <Pressable onPress={() => setMode("écouter")} style={[styles.modeOption, mode === "écouter" && styles.modeSelected]}>
            <Text style={[styles.modeText, mode === "écouter" && styles.modeTextSelected]}>Écouter</Text>
          </Pressable>
        </View>

        <View style={styles.catalogHeading}>
          <Text style={styles.sectionTitle}>Récitateur</Text>
          <View style={styles.languageSwitch}>
            {["eng", "ar"].map((option) => (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected: language === option }}
                onPress={() => setLanguage(option)}
                style={[styles.languageOption, language === option && styles.languageOptionSelected]}
              >
                <Text style={[styles.languageText, language === option && styles.languageTextSelected]}>
                  {option === "eng" ? "EN" : "عربي"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        {loadingCatalog ? (
          <ActivityIndicator color={colors.green600} style={styles.loader} />
        ) : (
          <>
            <TextInput
              accessibilityLabel="Rechercher un récitateur"
              onChangeText={setReciterSearch}
              placeholder="Rechercher un récitateur"
              placeholderTextColor="#929A94"
              style={styles.reciterSearch}
              value={reciterSearch}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.surahList}>
              {filteredReciters.map((reciter) => {
                const selected = reciter.id === selectedReciter?.id;
                return (
                  <Pressable
                    key={reciter.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => {
                      setSelectedReciterId(reciter.id);
                      setSelectedMoshafId(getPreferredMoshaf(reciter)?.id ?? null);
                    }}
                    style={[styles.reciterChip, selected && styles.surahChipSelected]}
                  >
                    <Text style={[styles.reciterChipText, selected && styles.surahNameSelected]}>
                      {reciter.name}
                    </Text>
                  </Pressable>
                );
              })}
              {filteredReciters.length === 0 ? (
                <Text style={styles.emptyReciters}>Aucun récitateur trouvé.</Text>
              ) : null}
            </ScrollView>
            {selectedReciter?.moshaf?.length > 1 ? (
              <>
                <Text style={styles.rewayaLabel}>Version de récitation</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.surahList}>
                  {selectedReciter.moshaf.map((moshaf) => {
                    const selected = moshaf.id === selectedMoshaf?.id;
                    return (
                      <Pressable
                        key={moshaf.id}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        onPress={() => setSelectedMoshafId(moshaf.id)}
                        style={[styles.rewayaChip, selected && styles.surahChipSelected]}
                      >
                        <Text style={[styles.reciterChipText, selected && styles.surahNameSelected]}>
                          {moshaf.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </>
            ) : null}
          </>
        )}

        <View style={styles.surahHeading}>
          <Text style={styles.sectionTitle}>Choisir une sourate</Text>
          <Text style={styles.surahCount}>{loadingSurahs ? "…" : `${surahs.length} sourates`}</Text>
        </View>
        {loadingSurahs ? (
          <ActivityIndicator color={colors.green600} style={styles.loader} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.surahList}>
            {surahs.map((surah) => {
              const selected = surah.number === selectedSurah;
              const available = availableSurahIds.has(surah.number);
              return (
                <Pressable
                  key={surah.number}
                  accessibilityRole="button"
                  accessibilityState={{ selected, disabled: !available }}
                  onPress={() => setSelectedSurah(surah.number)}
                  disabled={!available}
                  style={[styles.surahChip, selected && styles.surahChipSelected, !available && styles.surahChipUnavailable]}
                >
                  <Text style={[styles.surahNumber, selected && styles.surahNumberSelected]}>{surah.number}</Text>
                  <Text style={[styles.surahName, selected && styles.surahNameSelected, !available && styles.surahNameUnavailable]}>
                    {surah.displayName}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        <View style={styles.surahCard}>
          <View style={styles.surahCardTop}>
            <View style={styles.surahIndex}><Text style={styles.surahIndexText}>{selectedSurah}</Text></View>
            <View style={styles.surahInfo}>
              <Text style={styles.surahLatin}>
                {currentSurah?.displayName || "Sourate"}
              </Text>
              <Text style={styles.surahMeta}>
                {currentSurah?.revelationType === "Meccan" ? "Mecquoise" : "Médinoise"}
                  {currentSurah ? ` · ${currentSurah.numberOfAyahs} versets` : ""}
              </Text>
            </View>
            <Text style={styles.surahArabicName}>{currentSurah?.name || "القرآن الكريم"}</Text>
          </View>
          <View style={styles.ornamentRule}><View style={styles.ornamentDiamond} /></View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {loadingAyahs ? (
            <ActivityIndicator color={colors.green600} style={styles.loader} />
          ) : (
            <View style={styles.ayahBlock}>
              {ayahs.map((ayah) => (
                <View key={ayah.number} style={styles.ayahRow}>
                  <Text style={styles.ayahText}>{ayah.text.trim()}</Text>
                  <View style={styles.ayahNumber}><Text style={styles.ayahNumberText}>{ayah.numberInSurah}</Text></View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.playerCard}>
          <View style={styles.playerTop}>
            <View style={styles.reciterMark}><Text style={styles.reciterGlyph}>♪</Text></View>
            <View style={styles.playerCopy}>
              <Text style={styles.playerTitle}>Récitation de la sourate</Text>
              <Text style={styles.playerSubtitle}>
                {selectedReciter?.name || "Choisissez un récitateur"}
              </Text>
            </View>
            <Pressable onPress={() => setPlaybackRateIndex((index) => (index + 1) % PLAYBACK_RATES.length)} style={styles.speedButton}>
              <Text style={styles.speedText}>{PLAYBACK_RATES[playbackRateIndex]}×</Text>
            </Pressable>
          </View>
          <View style={styles.track}>
            <View style={[styles.trackFill, { width: `${progress}%` }]} />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(playback.currentTime)}</Text>
            <Text style={styles.timeText}>{formatTime(playback.duration)}</Text>
          </View>
          <View style={styles.controls}>
            <Pressable accessibilityLabel="Reculer de 15 secondes" onPress={() => skipAudio(-15)} style={styles.skipButton}>
              <Text style={styles.skipText}>−15</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={playback.playing ? "Mettre en pause" : "Écouter la sourate"}
              onPress={togglePlayback}
              disabled={loadingAyahs || loadingCatalog || !currentSurah || !canPlaySurah}
              style={({ pressed }) => [
                styles.playButton,
                (!canPlaySurah || loadingCatalog) && styles.playButtonDisabled,
                pressed && styles.playPressed,
              ]}
            >
              <Text style={styles.playText}>{playback.playing ? "Ⅱ" : "▶"}</Text>
            </Pressable>
            <Pressable accessibilityLabel="Avancer de 15 secondes" onPress={() => skipAudio(15)} style={styles.skipButton}>
              <Text style={styles.skipText}>+15</Text>
            </Pressable>
          </View>
          {!canPlaySurah && selectedMoshaf ? (
            <Text style={styles.errorText}>Cette sourate n’est pas disponible pour cette récitation.</Text>
          ) : null}
          {audioError || playback.error ? (
            <Text style={styles.errorText}>
              {audioError || "La lecture audio a rencontré un problème. Vérifiez votre connexion."}
            </Text>
          ) : null}
        </View>
        <Text style={styles.credit}>Texte · Al Quran Cloud · Récitation · mp3quran.net</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.neutral50 },
  content: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 28 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  headerAccent: { width: 4, height: 40, borderRadius: 2, backgroundColor: colors.green600, marginRight: 12 },
  headerCopy: { flex: 1 },
  eyebrow: { color: "#8A938B", fontSize: 9, fontWeight: "800", letterSpacing: 1.3 },
  title: { color: colors.neutral900, fontSize: 26, fontFamily: "Georgia", fontWeight: "700", marginTop: 2 },
  headerSeal: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "#EAF1EB" },
  sealText: { color: colors.green600, fontSize: 25 },
  modeSwitch: { height: 45, flexDirection: "row", padding: 4, borderRadius: 13, backgroundColor: "#ECEEEB", marginBottom: 20 },
  modeOption: { flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  modeSelected: { backgroundColor: "#FFFFFF", shadowColor: "#17231C", shadowOpacity: 0.07, shadowRadius: 4, elevation: 1 },
  modeText: { color: "#78817A", fontSize: 12, fontWeight: "700" },
  modeTextSelected: { color: colors.green600 },
  catalogHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  languageSwitch: { flexDirection: "row", padding: 3, borderRadius: 9, backgroundColor: "#ECEEEB" },
  languageOption: { minWidth: 38, alignItems: "center", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 7 },
  languageOptionSelected: { backgroundColor: "#FFFFFF" },
  languageText: { color: "#78817A", fontSize: 10, fontWeight: "700" },
  languageTextSelected: { color: colors.green600 },
  reciterSearch: { height: 40, borderRadius: 11, borderWidth: 1, borderColor: "#E7E9E3", backgroundColor: "#FFFFFF", color: colors.neutral900, fontSize: 12, paddingHorizontal: 12, marginBottom: 9 },
  reciterChip: { maxWidth: 190, minHeight: 38, justifyContent: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: "#E7E9E3", backgroundColor: "#FFFFFF" },
  reciterChipText: { color: "#34453A", fontSize: 10, fontWeight: "700" },
  emptyReciters: { color: "#78817A", fontSize: 11, paddingVertical: 12 },
  rewayaLabel: { color: "#78817A", fontSize: 10, fontWeight: "700", marginTop: 2, marginBottom: 7 },
  rewayaChip: { maxWidth: 250, minHeight: 34, justifyContent: "center", paddingHorizontal: 11, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: "#E7E9E3", backgroundColor: "#FFFFFF" },
  surahHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  sectionTitle: { color: colors.neutral900, fontSize: 15, fontWeight: "800" },
  surahCount: { color: "#909890", fontSize: 10 },
  loader: { paddingVertical: 16 },
  surahList: { gap: 8, paddingBottom: 17 },
  surahChip: { minWidth: 88, paddingHorizontal: 10, paddingVertical: 9, borderRadius: 12, borderWidth: 1, borderColor: "#E7E9E3", backgroundColor: "#FFFFFF" },
  surahChipSelected: { borderColor: colors.green600, backgroundColor: colors.green600 },
  surahChipUnavailable: { opacity: 0.45 },
  surahNumber: { color: "#889188", fontSize: 9, fontWeight: "800" },
  surahNumberSelected: { color: "#DDF4E3" },
  surahName: { color: "#34453A", fontSize: 11, fontWeight: "700", marginTop: 3 },
  surahNameSelected: { color: "#FFFFFF" },
  surahNameUnavailable: { color: "#89928A" },
  surahCard: { padding: 16, borderRadius: 19, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EAE9E3", shadowColor: "#152A1E", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.045, shadowRadius: 10, elevation: 2 },
  surahCardTop: { flexDirection: "row", alignItems: "center" },
  surahIndex: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#EFF5EF" },
  surahIndexText: { color: colors.green600, fontSize: 12, fontWeight: "800" },
  surahInfo: { flex: 1, marginLeft: 10 },
  surahLatin: { color: colors.neutral900, fontSize: 14, fontWeight: "800" },
  surahMeta: { color: "#8A938B", fontSize: 10, marginTop: 3 },
  surahArabicName: { color: "#285740", fontSize: 18, writingDirection: "rtl" },
  ornamentRule: { height: 1, backgroundColor: "#E9EDE7", alignItems: "center", justifyContent: "center", marginTop: 16, marginBottom: 7 },
  ornamentDiamond: { width: 7, height: 7, backgroundColor: "#D9B96A", transform: [{ rotate: "45deg" }] },
  ayahBlock: { paddingTop: 5 },
  ayahRow: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: "#F0F1ED" },
  ayahText: { flex: 1, color: "#202D25", textAlign: "right", writingDirection: "rtl", fontSize: 25, lineHeight: 48, fontFamily: "serif" },
  ayahNumber: { width: 25, height: 25, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: "#EFF5EF", marginLeft: 9, marginTop: 9 },
  ayahNumberText: { color: colors.green600, fontSize: 9, fontWeight: "800" },
  playerCard: { padding: 15, borderRadius: 18, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E9E9E3", marginTop: 15 },
  playerTop: { flexDirection: "row", alignItems: "center" },
  reciterMark: { width: 39, height: 39, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: "#EAF1EB" },
  reciterGlyph: { color: colors.green600, fontSize: 20 },
  playerCopy: { flex: 1, marginLeft: 10 },
  playerTitle: { color: colors.neutral900, fontSize: 12, fontWeight: "800" },
  playerSubtitle: { color: "#858E87", fontSize: 10, marginTop: 3 },
  speedButton: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, backgroundColor: "#F3F5F1" },
  speedText: { color: colors.green600, fontSize: 10, fontWeight: "800" },
  track: { height: 5, borderRadius: 4, overflow: "hidden", backgroundColor: "#E9EDE8", marginTop: 15 },
  trackFill: { height: 5, borderRadius: 4, backgroundColor: colors.green400 },
  timeRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 5 },
  timeText: { color: "#929A94", fontSize: 9 },
  controls: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 28, marginTop: 9 },
  skipButton: { minWidth: 42, alignItems: "center", paddingVertical: 8 },
  skipText: { color: "#69776D", fontSize: 12, fontWeight: "700" },
  playButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 24, backgroundColor: colors.green600 },
  playButtonDisabled: { opacity: 0.45 },
  playPressed: { opacity: 0.8, transform: [{ scale: 0.96 }] },
  playText: { color: "#FFFFFF", fontSize: 17, fontWeight: "800", marginLeft: 2 },
  errorText: { color: "#B33D36", fontSize: 11, lineHeight: 16, marginVertical: 10 },
  credit: { color: "#9AA19B", fontSize: 9, textAlign: "center", marginTop: 14 },
});

export default Coran;
