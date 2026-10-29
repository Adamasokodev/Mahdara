import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioPlayer, useAudioRecorder, useAudioRecorderState } from "expo-audio";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../theme/colors";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config/api";
import { getCoursePlaceholder, toCatalogCourse } from "../utils/courseCatalog";
import AppHeader from "../components/common/AppHeader";

function Cours({ navigation, route }) {
  const { token } = useAuth();
  const [publishedCourses, setPublishedCourses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [canPublish, setCanPublish] = useState(false);
  const [isAssistant, setIsAssistant] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [savingCourse, setSavingCourse] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [courseError, setCourseError] = useState("");
  const [draft, setDraft] = useState({
    titre: "", matiere_id: "", livre: "", contenu: "", type_media: "audio",
    fichier_url: "", extrait_url: "", niveau: "Débutant", duree_minutes: "",
  });
  const [search, setSearch] = useState("");
  const searchRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState("Tout");
  const [selectedMatiereId, setSelectedMatiereId] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [recordedUri, setRecordedUri] = useState(null);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [recordingError, setRecordingError] = useState("");
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const recordingPlayer = useAudioPlayer(recordedUri || null);

  useEffect(() => {
    const { matiereId, matiereNom } = route?.params || {};
    if (!matiereId) return;
    setSelectedMatiereId(String(matiereId));
    setSelectedCategory(matiereNom || "Tout");
    navigation.setParams({ matiereId: undefined, matiereNom: undefined });
  }, [navigation, route?.params?.matiereId, route?.params?.matiereNom]);

  useEffect(() => {
    let active = true;
    const headers = {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    setPublishedCourses([]);
    setCourseError("");
    if (token) {
      fetch(`${API_URL}/user`, { headers })
        .then((response) => response.ok ? response.json() : Promise.reject(new Error("Profil indisponible")))
        .then((user) => {
          if (!active) return;
          const activeStaff = user.status === "active";
          setCanPublish(activeStaff && ["cheikh", "assistant"].includes(user.role));
          setIsAssistant(activeStaff && user.role === "assistant");
        })
        .catch(() => {
          if (active) setCourseError("Votre profil n’est pas accessible pour le moment.");
        });
    } else {
      setCanPublish(false);
      setIsAssistant(false);
    }

    fetch(`${API_URL}/cours`, { headers })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Cours indisponibles")))
      .then((data) => {
        if (!active) return;
        if (!Array.isArray(data)) throw new Error("La réponse des cours est invalide.");
        setPublishedCourses(data.map(toCatalogCourse));
      })
      .catch(() => { if (active) setCourseError("Les cours publiés ne sont pas accessibles pour le moment."); })
      .finally(() => { if (active) setLoadingCourses(false); });

    fetch(`${API_URL}/matiere`, { headers })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Matières indisponibles")))
      .then((data) => { if (active) setMatieres(Array.isArray(data) ? data : []); })
      .catch(() => { if (active) setCourseError("Les matières ne sont pas accessibles pour le moment."); });

    return () => { active = false; };
  }, [token]);

  const allCourses = publishedCourses;
  const courseCategories = useMemo(
    () => ["Tout", ...new Set(allCourses.map((course) => course.category).filter(Boolean))],
    [allCourses],
  );

  const filteredCourses = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("fr");

    return allCourses.filter((course) => {
      const matchesCategory = selectedMatiereId
        ? String(course.matiereId) === String(selectedMatiereId)
        : selectedCategory === "Tout" || course.category === selectedCategory;
      const matchesSearch =
        !normalizedSearch ||
        `${course.title} ${course.category} ${course.level} ${course.book} ${course.teacher} ${course.description} ${course.mahdara}`
          .toLocaleLowerCase("fr")
          .includes(normalizedSearch);
      const matchesFavorites =
        !favoritesOnly || favorites.includes(course.id);

      return matchesCategory && matchesSearch && matchesFavorites;
    });
  }, [allCourses, favorites, favoritesOnly, search, selectedCategory, selectedMatiereId]);

  const updateDraft = (key, value) => setDraft((current) => ({ ...current, [key]: value }));

  const openCourse = (course) => {
    navigation.navigate("CourseDetail", { course });
  };

  const toggleRecording = async () => {
    setRecordingError("");
    try {
      if (recorderState.isRecording) {
        await recorder.stop();
        setRecordedUri(recorder.uri);
        setRecordedDuration(recorderState.durationMillis || 0);
        return;
      }
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) throw new Error("L’accès au microphone est nécessaire pour enregistrer le cours.");
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true, interruptionMode: "doNotMix" });
      await recorder.prepareToRecordAsync({
        ...RecordingPresets.HIGH_QUALITY,
        numberOfChannels: 1,
        bitRate: 64000,
      });
      recorder.record();
      setRecordedUri(null);
      updateDraft("fichier_url", "");
    } catch (error) {
      const reason = error?.cause?.message || error?.message || "Erreur audio";
      setRecordingError(`L’enregistreur n’a pas pu démarrer. Vérifiez l’autorisation du microphone dans les réglages du téléphone, puis réessayez. (${reason})`);
    }
  };

  const discardRecording = async () => {
    if (recorderState.isRecording) await recorder.stop();
    recordingPlayer.pause();
    setRecordedUri(null);
    setRecordedDuration(0);
    setRecordingError("");
  };

  const uploadRecording = async () => {
    if (!recordedUri) return null;
    const form = new FormData();
    if (typeof window !== "undefined" && recordedUri.startsWith("blob:")) {
      const blob = await (await fetch(recordedUri)).blob();
      const mimeType = blob.type || "audio/webm";
      const extension = mimeType.includes("ogg") ? "ogg"
        : mimeType.includes("mp4") || mimeType.includes("m4a") ? "m4a"
          : mimeType.includes("mpeg") || mimeType.includes("mp3") ? "mp3"
            : mimeType.includes("wav") ? "wav" : "webm";
      form.append("audio", blob, `cours.${extension}`);
    } else {
      const extension = recordedUri.split(/[?#]/)[0].split(".").pop()?.toLowerCase();
      const mimeType = extension === "3gp" ? "audio/3gpp"
        : extension === "aac" ? "audio/aac"
          : extension === "wav" ? "audio/wav"
            : extension === "mp3" ? "audio/mpeg"
              : "audio/mp4";
      form.append("audio", {
        uri: recordedUri,
        name: `cours.${extension && /^[a-z0-9]+$/.test(extension) ? extension : "m4a"}`,
        type: mimeType,
      });
    }
    const result = await new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open("POST", `${API_URL}/cours/audio`);
      request.setRequestHeader("Accept", "application/json");
      request.setRequestHeader("Authorization", `Bearer ${token}`);
      request.onload = () => {
        let payload = {};
        try { payload = JSON.parse(request.responseText || "{}"); } catch {}
        if (request.status >= 200 && request.status < 300) resolve(payload);
        else reject(new Error(payload.errors ? Object.values(payload.errors).flat()[0] : payload.message || "L’enregistrement n’a pas pu être envoyé."));
      };
      request.onerror = () => reject(new Error(`Impossible de joindre l’API (${API_URL}/cours/audio). Vérifiez que le téléphone et l’ordinateur sont connectés au même réseau et que Laravel est démarré.`));
      request.send(form);
    });
    return result.path;
  };

  const publishCourse = async () => {
    setCourseError("");
    if (!draft.matiere_id) {
      setCourseError("Choisissez une matière enseignée avant de publier le cours.");
      return;
    }
    if (!draft.contenu.trim()) {
      setCourseError("Ajoutez le texte du cours pour accompagner le vocal.");
      return;
    }
    setSavingCourse(true);
    try {
      const response = await fetch(
        `${API_URL}/cours${editingCourseId ? `/${editingCourseId}` : ""}`,
        {
          method: editingCourseId ? "PATCH" : "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            ...draft,
            langue: draft.langue || "ar",
            statut: "publie",
            fichier_url: await uploadRecording() || draft.fichier_url,
            duree_minutes: draft.duree_minutes ? Number(draft.duree_minutes) : null,
          }),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        const validation = result.errors ? Object.values(result.errors).flat()[0] : result.message;
        throw new Error(validation || "Le cours n’a pas pu être publié.");
      }
      const course = result.cours;
      const updatedCourse = toCatalogCourse(course);
      setPublishedCourses((current) => editingCourseId
        ? current.map((item) => item.serverId === editingCourseId ? updatedCourse : item)
        : [updatedCourse, ...current]);
      setDraft({ titre: "", matiere_id: "", livre: "", contenu: "", type_media: "audio", fichier_url: "", extrait_url: "", niveau: "Débutant", duree_minutes: "" });
      setEditingCourseId(null);
      setRecordedUri(null);
      setRecordedDuration(0);
      setShowCourseForm(false);
    } catch (error) {
      setCourseError(error.message || "Une erreur est survenue lors de la publication.");
    } finally {
      setSavingCourse(false);
    }
  };

  const editCourse = (course) => {
    setCourseError("");
    setDraft({
      titre: course.title,
      matiere_id: String(course.matiereId || ""),
      livre: course.book || "",
      contenu: course.description,
      type_media: course.mediaType,
      fichier_url: course.mediaUrl,
      extrait_url: course.excerptUrl || "",
      niveau: course.level,
      duree_minutes: course.duration ? String(course.duration) : "",
    });
    setEditingCourseId(course.serverId);
    setRecordedUri(null);
    setRecordedDuration(0);
    setShowCourseForm(true);
  };

  const deleteCourse = (course) => {
    if (savingCourse) return;

    Alert.alert(
      "Supprimer ce cours ?",
      `Le cours « ${course.title} » sera définitivement supprimé.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            setCourseError("");
            setSavingCourse(true);
            try {
              const response = await fetch(`${API_URL}/cours/${course.serverId}`, {
                method: "DELETE",
                headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
              });
              const result = await response.json();
              if (!response.ok) {
                throw new Error(result.message || "Le cours n’a pas pu être supprimé.");
              }
              setPublishedCourses((current) => current.filter((item) => item.serverId !== course.serverId));
              if (editingCourseId === course.serverId) {
                setEditingCourseId(null);
                setShowCourseForm(false);
              }
            } catch (error) {
              setCourseError(error.message || "Une erreur est survenue lors de la suppression.");
            } finally {
              setSavingCourse(false);
            }
          },
        },
      ],
    );
  };

  const toggleFavorite = (courseId) => {
    setFavorites((current) =>
      current.includes(courseId)
        ? current.filter((id) => id !== courseId)
        : [...current, courseId],
    );
  };

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AppHeader
          title="Cours"
          subtitle="Apprendre à votre rythme"
          subtitle="Apprendre à votre rythme"
          showBack
          rightIcon="search-outline"
          onBackPress={() => navigation.getParent()?.navigate("Accueil")}
          onRightPress={() => searchRef.current?.focus()}
          horizontalInset={20}
        />

        <ImageBackground
          source={{ uri: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=85" }}
          imageStyle={styles.courseHeroImage}
          style={styles.courseHero}
        >
          <View style={styles.courseHeroShade} />
          <Text style={styles.courseHeroEyebrow}>SAVOIR & TRANSMISSION</Text>
          <Text style={styles.courseHeroTitle}>Des cours pour approfondir votre foi</Text>
          <Text style={styles.courseHeroSubtitle}>Apprenez à votre rythme, où que vous soyez.</Text>
        </ImageBackground>

        {canPublish ? (
          <View style={styles.publishPanel}>
            <View style={styles.publishPanelHeader}>
              <View>
                <Text style={styles.publishTitle}>Espace enseignant</Text>
                <Text style={styles.publishHint}>{isAssistant ? "Gestion des cours du cheikh" : "Publiez vos enseignements"}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => { setCourseError(""); setShowCourseForm((value) => !value); }}
                style={styles.publishButton}
              >
                <Text style={styles.publishButtonText}>
                  {showCourseForm ? "Fermer" : editingCourseId ? "Modifier" : "+ Ajouter"}
                </Text>
              </Pressable>
            </View>
            {showCourseForm ? (
              <View style={styles.courseForm}>
                <TextInput placeholder="Titre du cours" value={draft.titre} onChangeText={(value) => updateDraft("titre", value)} style={styles.formInput} />
                <Text style={styles.formLabel}>Matière enseignée</Text>
                {matieres.length ? matieres.map((matiere) => {
                  const selected = String(matiere.id) === String(draft.matiere_id);
                  return (
                    <Pressable
                      key={matiere.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => updateDraft("matiere_id", String(matiere.id))}
                      style={[styles.matiereOption, selected && styles.matiereOptionSelected]}
                    >
                      <Text style={[styles.matiereOptionText, selected && styles.matiereOptionTextSelected]}>{matiere.nom}</Text>
                    </Pressable>
                  );
                }) : <Text style={styles.formHint}>Aucune matière n’est associée à votre profil. Demandez à l’administrateur de vous l’attribuer.</Text>}
                <TextInput placeholder="Nom du livre étudié" value={draft.livre} onChangeText={(value) => updateDraft("livre", value)} style={styles.formInput} />
                <TextInput placeholder="Niveau (ex. Débutant)" value={draft.niveau} onChangeText={(value) => updateDraft("niveau", value)} style={styles.formInput} />
                <TextInput placeholder="Durée en minutes (facultatif)" keyboardType="number-pad" value={draft.duree_minutes} onChangeText={(value) => updateDraft("duree_minutes", value)} style={styles.formInput} />
                <Text style={styles.formLabel}>Type de support</Text>
                <View style={styles.mediaTypeRow}>
                  {["audio", "video"].map((type) => (
                    <Pressable key={type} onPress={() => { updateDraft("type_media", type); if (type === "video") { setRecordedUri(null); setRecordedDuration(0); } }} style={[styles.mediaTypeButton, draft.type_media === type && styles.mediaTypeButtonSelected]}>
                      <Text style={[styles.mediaTypeText, draft.type_media === type && styles.mediaTypeTextSelected]}>{type === "audio" ? "Audio" : "Vidéo"}</Text>
                    </Pressable>
                  ))}
                </View>
                <TextInput placeholder="Lien public vers l'audio ou la vidéo (https://…)" autoCapitalize="none" keyboardType="url" value={draft.fichier_url} onChangeText={(value) => updateDraft("fichier_url", value)} style={styles.formInput} />
                {draft.type_media === "audio" ? (
                  <View style={styles.recordingBox}>
                    <Text style={styles.formLabel}>Ou enregistrez le cours ici</Text>
                    <Pressable onPress={toggleRecording} style={[styles.mediaOpenButton, recorderState.isRecording && styles.recordingActive]}>
                      <Text style={styles.mediaOpenButtonText}>{recorderState.isRecording ? "■ Arrêter l’enregistrement" : "● Enregistrer un vocal"}</Text>
                    </Pressable>
                    {recordedUri ? (
                      <View style={styles.recordingActions}>
                        <Text style={styles.recordingReady}>Vocal prêt · {Math.floor(recordedDuration / 1000)} s</Text>
                        <View style={styles.mediaTypeRow}>
                          <Pressable onPress={() => recordingPlayer.playing ? recordingPlayer.pause() : recordingPlayer.play()} style={[styles.mediaTypeButton, styles.previewButton]}>
                            <Text style={styles.mediaTypeText}>{recordingPlayer.playing ? "Pause" : "▶ Écouter"}</Text>
                          </Pressable>
                          <Pressable onPress={discardRecording} style={[styles.mediaTypeButton, styles.discardButton]}>
                            <Text style={styles.discardText}>Supprimer / refaire</Text>
                          </Pressable>
                        </View>
                      </View>
                    ) : null}
                    {recordingError ? <Text style={styles.formError}>{recordingError}</Text> : null}
                  </View>
                ) : null}
                <TextInput placeholder="Lien audio d’extrait pour les visiteurs (facultatif)" autoCapitalize="none" keyboardType="url" value={draft.extrait_url} onChangeText={(value) => updateDraft("extrait_url", value)} style={styles.formInput} />
                <TextInput placeholder="Texte du cours à afficher avec le vocal (obligatoire)" multiline textAlignVertical="top" value={draft.contenu} onChangeText={(value) => updateDraft("contenu", value)} style={[styles.formInput, styles.formTextArea]} />
                {courseError ? <Text style={styles.formError}>{courseError}</Text> : null}
                <Pressable disabled={savingCourse} onPress={publishCourse} style={[styles.publishButton, savingCourse && styles.buttonPressed]}>
                  {savingCourse ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.publishButtonText}>{editingCourseId ? "Enregistrer les modifications" : "Publier le cours"}</Text>}
                </Pressable>
                {editingCourseId ? (
                  <Pressable
                    disabled={savingCourse}
                    onPress={() => {
                      setEditingCourseId(null);
                      setDraft({ titre: "", matiere_id: "", livre: "", contenu: "", type_media: "audio", fichier_url: "", extrait_url: "", niveau: "Débutant", duree_minutes: "" });
                      setShowCourseForm(false);
                    }}
                    style={styles.cancelEditButton}
                  >
                    <Text style={styles.cancelEditButtonText}>Annuler la modification</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}

        {loadingCourses ? <ActivityIndicator color={colors.green600} style={styles.courseLoader} /> : null}
        {!loadingCourses && courseError && (!canPublish || !showCourseForm) ? <Text style={styles.loadError}>{courseError}</Text> : null}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            accessibilityLabel="Rechercher un cours"
            ref={searchRef}
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
          {courseCategories.map((category) => {
            const isSelected = selectedCategory === category;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                key={category}
                onPress={() => { setSelectedCategory(category); setSelectedMatiereId(null); }}
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
            <Text style={styles.sectionTitle}>
              {favoritesOnly ? "Favoris" : selectedMatiereId ? selectedCategory : "Tous les cours"}
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
                  <ImageBackground
                    source={{ uri: course.image || getCoursePlaceholder(course.category) }}
                    style={[styles.courseIcon, { backgroundColor: course.color }]}
                    imageStyle={styles.courseIconImage}
                  >
                    <View style={styles.courseIconShade} />
                    <Text style={styles.courseIconText}>{course.icon}</Text>
                  </ImageBackground>
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
                      {course.level ? <Text style={styles.courseDetail}>{course.level}</Text> : null}
                      {course.duration ? (
                        <>
                          <Text style={styles.detailDivider}>·</Text>
                          <Text style={styles.courseDetail}>{course.duration} min</Text>
                        </>
                      ) : null}
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => openCourse(course)}
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
                    {canPublish && course.serverId ? (
                      <View style={styles.courseManageActions}>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => editCourse(course)}
                          style={styles.courseManageButton}
                        >
                          <Text style={styles.courseManageText}>Modifier</Text>
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => deleteCourse(course)}
                          style={styles.courseManageButton}
                        >
                          <Text style={styles.courseDeleteText}>Supprimer</Text>
                        </Pressable>
                      </View>
                    ) : null}
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

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral50,
  },
  courseHero: { minHeight: 144, justifyContent: "flex-end", overflow: "hidden", padding: 17, marginBottom: 14, borderRadius: 17, backgroundColor: colors.green700 },
  courseHeroImage: { borderRadius: 17 },
  courseHeroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(3, 35, 25, 0.48)" },
  courseHeroEyebrow: { color: "#E8D69E", fontSize: 9, fontWeight: "800", letterSpacing: 1.1 },
  courseHeroTitle: { maxWidth: 270, color: colors.white, fontSize: 18, lineHeight: 23, fontWeight: "800", marginTop: 6 },
  courseHeroSubtitle: { color: "#F3F2EB", fontSize: 11, marginTop: 5 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 7,
    paddingBottom: 24,
  },
  header: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 14,
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
    marginBottom: 14,
  },
  publishPanel: {
    padding: 12,
    marginBottom: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5DFCC",
    backgroundColor: "#FFFFFF",
  },
  publishPanelHeader: { minHeight: 42, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  publishTitle: { color: "#183D32", fontSize: 13, fontWeight: "800" },
  publishHint: { color: "#717A73", fontSize: 11, lineHeight: 16, marginTop: 5 },
  publishButton: { minHeight: 36, alignItems: "center", justifyContent: "center", paddingHorizontal: 13, marginLeft: 10, borderRadius: 10, backgroundColor: colors.green600 },
  publishButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  courseForm: { marginTop: 10 },
  cancelEditButton: { alignItems: "center", padding: 10, marginTop: 5 },
  cancelEditButtonText: { color: "#68746B", fontSize: 11, fontWeight: "700" },
  formInput: { minHeight: 43, paddingHorizontal: 11, marginTop: 8, borderWidth: 1, borderColor: "#E8E5DA", borderRadius: 9, backgroundColor: "#FBFAF6", color: "#183D32", fontSize: 12 },
  formTextArea: { minHeight: 115, paddingTop: 11 },
  formLabel: { color: "#68746B", fontSize: 11, fontWeight: "700", marginTop: 12 },
  matiereOption: { minHeight: 38, justifyContent: "center", paddingHorizontal: 11, marginTop: 7, borderWidth: 1, borderColor: "#E8E5DA", borderRadius: 9, backgroundColor: "#FBFAF6" },
  matiereOptionSelected: { borderColor: colors.green600, backgroundColor: "#EAF1EB" },
  matiereOptionText: { color: "#68746B", fontSize: 12, fontWeight: "600" },
  matiereOptionTextSelected: { color: colors.green600, fontWeight: "700" },
  formHint: { color: "#A6352C", fontSize: 11, lineHeight: 16, marginTop: 7 },
  recordingBox: { padding: 11, marginTop: 10, borderRadius: 10, backgroundColor: "#F4F7F3", borderWidth: 1, borderColor: "#E1E9E1" },
  recordingActive: { backgroundColor: "#A6352C" },
  recordingReady: { color: "#315243", fontSize: 11, marginTop: 8 },
  recordingActions: { marginTop: 2 },
  previewButton: { backgroundColor: "#EAF1EB", borderColor: "#D7E5D9" },
  discardButton: { borderColor: "#F0D9D6", backgroundColor: "#FFF8F7" },
  discardText: { color: "#A6352C", fontSize: 12, fontWeight: "700" },
  mediaTypeRow: { flexDirection: "row", gap: 8, marginTop: 7 },
  mediaTypeButton: { flex: 1, minHeight: 38, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E8E5DA", borderRadius: 9 },
  mediaTypeButtonSelected: { borderColor: colors.green600, backgroundColor: "#EAF1EB" },
  mediaTypeText: { color: "#68746B", fontSize: 12, fontWeight: "700" },
  mediaTypeTextSelected: { color: colors.green600 },
  formError: { color: "#A6352C", fontSize: 11, lineHeight: 16, marginTop: 9 },
  loadError: { color: "#A6352C", fontSize: 11, marginBottom: 14 },
  courseLoader: { marginBottom: 15 },
  eyebrow: {
    color: "#B28B2E",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    color: colors.neutral900,
    fontSize: 27,
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
    minHeight: 126,
    overflow: "hidden",
    padding: 14,
    marginBottom: 22,
    borderRadius: 16,
    backgroundColor: "#174838",
  },
  featuredImage: { ...StyleSheet.absoluteFillObject },
  featuredImageCorners: { borderRadius: 16 },
  featuredImageShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(9, 28, 19, 0.55)" },
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
    maxWidth: 270,
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
    backgroundColor: colors.green600,
  },
  featuredButtonText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  featuredArrow: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },
  searchBox: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 16,
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
    borderColor: colors.green600,
    backgroundColor: colors.green600,
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
    paddingBottom: 18,
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
    borderColor: colors.green600,
    backgroundColor: colors.green600,
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
    marginBottom: 10,
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
    fontSize: 19,
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
    padding: 12,
    borderWidth: 1,
    borderColor: "#EEECE4",
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
  },
  courseIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 14,
  },
  courseIconImage: { borderRadius: 14 },
  courseIconShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(12, 35, 23, 0.32)" },
  courseIconText: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "700",
  },
  courseBody: {
    flex: 1,
    marginLeft: 12,
  },
  courseManageActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  courseManageButton: {
    minHeight: 32,
    justifyContent: "center",
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E8E5DA",
    borderRadius: 8,
  },
  courseManageText: {
    color: "#24483A",
    fontSize: 10,
    fontWeight: "700",
  },
  courseDeleteText: {
    color: "#A6352C",
    fontSize: 10,
    fontWeight: "700",
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
    fontSize: 13,
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
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 11,
    marginTop: 8,
    borderRadius: 9,
    backgroundColor: colors.green600,
  },
  buttonPressed: {
    opacity: 0.75,
  },
  detailsButtonText: {
    color: "#FFFFFF",
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
    justifyContent: "flex-end",
    paddingHorizontal: 2,
    paddingTop: 2,
    backgroundColor: "rgba(18, 39, 31, 0.55)",
  },
  modalCard: {
    width: "100%",
    maxWidth: 520,
    minHeight: "94%",
    maxHeight: "98%",
    padding: 0,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  modalCardContent: { flexGrow: 1, paddingHorizontal: 44, paddingTop: 43, paddingBottom: 28 },
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
    color: colors.green600,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.3,
  },
  modalTitle: {
    color: "#183D32",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 29,
    marginTop: 5,
  },
  modalDescription: {
    color: "#717A73",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },
  modalBook: { color: "#315243", fontSize: 12, fontWeight: "700", marginTop: 12 },
  modalTeacher: { color: "#717A73", fontSize: 11, marginTop: 6 },
  partsHeading: { color: "#183D32", fontSize: 16, fontWeight: "800", marginTop: 23, marginBottom: 10 },
  partRow: { minHeight: 66, flexDirection: "row", alignItems: "center", padding: 10, marginTop: 8, borderWidth: 1, borderColor: "#E8E9DF", borderRadius: 13, backgroundColor: "#F8FAF6" },
  partNumber: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#E2ECE4" },
  partNumberText: { color: "#1A6041", fontSize: 15, fontWeight: "800" },
  partCopy: { flex: 1, marginLeft: 11 },
  partTitle: { color: "#183D32", fontSize: 13, fontWeight: "700" },
  partMeta: { color: "#78847C", fontSize: 10, marginTop: 4 },
  backToParts: { alignSelf: "flex-start", paddingVertical: 7, paddingRight: 12, marginBottom: 17 },
  backToPartsText: { color: "#1A6041", fontSize: 12, fontWeight: "700" },
  readerCourseTitle: { color: "#78847C", fontSize: 13, lineHeight: 19, marginTop: 7 },
  partNumberBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 6, marginTop: 19, borderRadius: 12, backgroundColor: "#EAF1EB" },
  partNumberBadgeText: { color: "#1A6041", fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  partContent: { color: "#263B32", fontSize: 15, lineHeight: 27, marginTop: 10, padding: 15, borderRadius: 13, backgroundColor: "#F8F6EF" },
  loginPrompt: { padding: 12, marginTop: 16, borderRadius: 12, backgroundColor: "#F1F5F1", borderWidth: 1, borderColor: "#DCE8DE" },
  loginPromptText: { color: "#315243", fontSize: 12, lineHeight: 18 },
  mediaOpenButton: { minHeight: 44, alignItems: "center", justifyContent: "center", marginTop: 16, borderRadius: 11, backgroundColor: colors.green600 },
  mediaOpenButtonDisabled: { opacity: 0.65 },
  mediaOpenButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  lessonTextHeading: { color: "#183D32", fontSize: 13, fontWeight: "800", marginTop: 17 },
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
