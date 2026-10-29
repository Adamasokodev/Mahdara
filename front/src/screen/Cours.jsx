import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Linking,
  Modal,
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
  const [canPublish, setCanPublish] = useState(false);
  const [isAssistant, setIsAssistant] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [savingCourse, setSavingCourse] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [courseError, setCourseError] = useState("");
  const [draft, setDraft] = useState({
    titre: "", matiere: "", livre: "", contenu: "", type_media: "audio",
    fichier_url: "", extrait_url: "", niveau: "Débutant", duree_minutes: "",
  });
  const [search, setSearch] = useState("");
  const searchRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState("Tout");
  const [favorites, setFavorites] = useState([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [recordedUri, setRecordedUri] = useState(null);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [recordingError, setRecordingError] = useState("");
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const audioPlayer = useAudioPlayer(selectedCourse?.mediaUrl || null);
  const recordingPlayer = useAudioPlayer(recordedUri || null);

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
      const matchesCategory =
      selectedCategory === "Tout" || course.category === selectedCategory;
      const matchesSearch =
        !normalizedSearch ||
        `${course.title} ${course.category} ${course.level} ${course.book} ${course.teacher} ${course.description} ${course.mahdara}`
          .toLocaleLowerCase("fr")
          .includes(normalizedSearch);
      const matchesFavorites =
        !favoritesOnly || favorites.includes(course.id);

      return matchesCategory && matchesSearch && matchesFavorites;
    });
  }, [allCourses, favorites, favoritesOnly, search, selectedCategory]);

  useEffect(() => {
    const requestedCourseId = route?.params?.courseId;
    if (requestedCourseId == null) return;
    const requestedCourse = allCourses.find(
      (course) => String(course.serverId) === String(requestedCourseId),
    );
    if (requestedCourse) setSelectedCourse(requestedCourse);
  }, [allCourses, route?.params?.courseId, route?.params?.courseSelectionKey]);

  const updateDraft = (key, value) => setDraft((current) => ({ ...current, [key]: value }));

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
      form.append("audio", blob, "cours.webm");
    } else {
      form.append("audio", { uri: recordedUri, name: "cours.m4a", type: "audio/mp4" });
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
      setDraft({ titre: "", matiere: "", livre: "", contenu: "", type_media: "audio", fichier_url: "", extrait_url: "", niveau: "Débutant", duree_minutes: "" });
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
      matiere: course.category,
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
              if (selectedCourse?.serverId === course.serverId) setSelectedCourse(null);
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
          showBack
          rightIcon="search-outline"
          onBackPress={() => navigation.navigate("Accueil")}
          onRightPress={() => searchRef.current?.focus()}
          horizontalInset={22}
        />

        <View style={styles.intro}>
          <Text style={styles.eyebrow}>APPRENDRE À SON RYTHME</Text>
          <Text style={styles.title}>Les cours</Text>
          <Text style={styles.subtitle}>
            Explorez les enseignements de la Mahdara et choisissez votre
            prochain apprentissage.
          </Text>
        </View>

        {canPublish ? (
          <View style={styles.publishPanel}>
            <Text style={styles.publishTitle}>{isAssistant ? "Espace assistant" : "Espace cheikh"}</Text>
            <Text style={styles.publishHint}>
              {isAssistant
                ? "Organisez et publiez les cours au nom du cheikh auquel vous êtes rattaché."
                : "Publiez un cours avec son texte de révision et son support audio ou vidéo."}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => { setCourseError(""); setShowCourseForm((value) => !value); }}
              style={styles.publishButton}
            >
              <Text style={styles.publishButtonText}>
                {showCourseForm
                  ? "Fermer le formulaire"
                  : editingCourseId
                    ? "Modifier le cours"
                    : "+ Ajouter un cours"}
              </Text>
            </Pressable>
            {showCourseForm ? (
              <View style={styles.courseForm}>
                <TextInput placeholder="Titre du cours" value={draft.titre} onChangeText={(value) => updateDraft("titre", value)} style={styles.formInput} />
                <TextInput placeholder="Matière (ex. Fiqh, Coran)" value={draft.matiere} onChangeText={(value) => updateDraft("matiere", value)} style={styles.formInput} />
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
                      setDraft({ titre: "", matiere: "", livre: "", contenu: "", type_media: "audio", fichier_url: "", extrait_url: "", niveau: "Débutant", duree_minutes: "" });
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

        {allCourses[0] ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setSelectedCourse(allCourses[0])}
            style={({ pressed }) => [
              styles.featuredCard,
              pressed && styles.buttonPressed,
            ]}
          >
            <ImageBackground
              source={{ uri: allCourses[0].image || getCoursePlaceholder(allCourses[0].category) }}
              style={styles.featuredImage}
              imageStyle={styles.featuredImageCorners}
            >
              <View style={styles.featuredImageShade} />
            </ImageBackground>
            <View style={styles.featuredCopy}>
              <Text style={styles.featuredEyebrow}>À DÉCOUVRIR</Text>
              <Text style={styles.featuredTitle}>{allCourses[0].title}</Text>
              <Text style={styles.featuredMeta}>
                {allCourses[0].category}
                {allCourses[0].duration ? `  ·  ${allCourses[0].duration} min` : ""}
                {allCourses[0].level ? `  ·  ${allCourses[0].level}` : ""}
              </Text>
              <View style={styles.featuredButton}>
                <Text style={styles.featuredButtonText}>Voir le cours</Text>
                <Text style={styles.featuredArrow}>→</Text>
              </View>
            </View>
          </Pressable>
        ) : null}

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
                      <Text style={styles.courseDetail}>{course.level}</Text>
                      {course.duration ? (
                        <>
                          <Text style={styles.detailDivider}>·</Text>
                          <Text style={styles.courseDetail}>{course.duration} min</Text>
                        </>
                      ) : null}
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
        animationType="slide"
        onRequestClose={() => setSelectedCourse(null)}
        visible={selectedCourse !== null}
      >
        <View style={styles.modalBackdrop}>
          {selectedCourse ? (
            <ScrollView style={styles.modalCard} contentContainerStyle={styles.modalCardContent} showsVerticalScrollIndicator={false}>
              <ImageBackground
                source={{ uri: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=1000&q=85" }}
                style={styles.modalHero}
                imageStyle={styles.modalHeroImage}
              >
                <View style={styles.modalHeroShade} />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Fermer les détails du cours"
                  onPress={() => setSelectedCourse(null)}
                  style={styles.modalCloseIcon}
                >
                  <Text style={styles.modalCloseIconText}>‹</Text>
                </Pressable>
                <View style={styles.modalHeroCopy}>
                  <Text style={styles.modalCategory}>{selectedCourse.category.toLocaleUpperCase("fr")}</Text>
                  <Text style={styles.modalTitle}>{selectedCourse.title}</Text>
                  <Text style={styles.modalTeacher}>{selectedCourse.teacher || "Enseignants de la Mahdara"}</Text>
                </View>
              </ImageBackground>
              <View style={styles.modalDetails}>
              <Text style={styles.modalRating}>
                {selectedCourse.duration ? `◷ ${selectedCourse.duration} min` : "Durée non précisée"}
              </Text>
              <Text style={styles.modalLevel}>{selectedCourse.level}</Text>
              {selectedCourse.description ? <Text style={styles.lessonTextHeading}>Texte du cours</Text> : null}
              <Text style={styles.modalDescription}>
                {selectedCourse.description}
              </Text>
              <View style={styles.modalMeta}>
                <Text style={styles.modalMetaText}>
                  Niveau {selectedCourse.level.toLocaleLowerCase("fr")}
                </Text>
                <Text style={styles.detailDivider}>·</Text>
                <Text style={styles.modalMetaText}>
                  {selectedCourse.duration ? `${selectedCourse.duration} minutes` : "Durée non précisée"}
                </Text>
              </View>
              {selectedCourse.book ? <Text style={styles.modalBook}>Livre étudié : {selectedCourse.book}</Text> : null}
              {selectedCourse.mahdara ? <Text style={styles.modalBook}>Mahdara : {selectedCourse.mahdara}</Text> : null}
              {selectedCourse.language ? <Text style={styles.modalBook}>Langue : {selectedCourse.language}</Text> : null}
              {selectedCourse.mediaUrl ? (
                <Pressable accessibilityRole="button" onPress={() => selectedCourse.mediaType === "video" ? Linking.openURL(selectedCourse.mediaUrl) : (audioPlayer.playing ? audioPlayer.pause() : audioPlayer.play())} style={styles.mediaOpenButton}>
                  <Text style={styles.mediaOpenButtonText}>{selectedCourse.mediaType === "video" ? "Voir la vidéo" : audioPlayer.playing ? "Mettre en pause" : "▶ Écouter le cours"}</Text>
                </Pressable>
              ) : null}
              {selectedCourse.excerptUrl ? (
                <Pressable accessibilityRole="button" onPress={() => Linking.openURL(selectedCourse.excerptUrl)} style={styles.mediaOpenButton}>
                  <Text style={styles.mediaOpenButtonText}>Écouter un extrait</Text>
                </Pressable>
              ) : null}
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
            </ScrollView>
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral50,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 0,
    paddingBottom: 28,
  },
  intro: {
    marginBottom: 20,
  },
  publishPanel: {
    padding: 15,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5DFCC",
    backgroundColor: "#FFFFFF",
  },
  publishTitle: { color: "#183D32", fontSize: 15, fontWeight: "800" },
  publishHint: { color: "#717A73", fontSize: 11, lineHeight: 16, marginTop: 5 },
  publishButton: { minHeight: 42, alignItems: "center", justifyContent: "center", paddingHorizontal: 14, marginTop: 11, borderRadius: 10, backgroundColor: colors.green600 },
  publishButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  courseForm: { marginTop: 10 },
  cancelEditButton: { alignItems: "center", padding: 10, marginTop: 5 },
  cancelEditButtonText: { color: "#68746B", fontSize: 11, fontWeight: "700" },
  formInput: { minHeight: 43, paddingHorizontal: 11, marginTop: 8, borderWidth: 1, borderColor: "#E8E5DA", borderRadius: 9, backgroundColor: "#FBFAF6", color: "#183D32", fontSize: 12 },
  formTextArea: { minHeight: 115, paddingTop: 11 },
  formLabel: { color: "#68746B", fontSize: 11, fontWeight: "700", marginTop: 12 },
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
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 7,
  },
  title: {
    color: colors.neutral900,
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
    backgroundColor: "#F7F6F1",
  },
  modalCard: {
    flex: 1,
    backgroundColor: "#F7F6F1",
  },
  modalCardContent: { paddingBottom: 26 },
  modalHero: { height: 230, justifyContent: "space-between", padding: 15, backgroundColor: "#174838" },
  modalHeroImage: { resizeMode: "cover" },
  modalHeroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(9, 28, 19, 0.42)" },
  modalCloseIcon: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 17, backgroundColor: "rgba(0,0,0,0.3)" },
  modalCloseIconText: { color: "#FFFFFF", fontSize: 28, lineHeight: 30 },
  modalHeroCopy: { marginHorizontal: -15, paddingHorizontal: 15, paddingTop: 10, paddingBottom: 11, backgroundColor: "#FFFFFF", borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  modalDetails: { padding: 18 },
  modalRating: { color: "#657269", fontSize: 10, fontWeight: "600" },
  modalLevel: { alignSelf: "flex-start", color: "#A8794D", fontSize: 9, paddingHorizontal: 8, paddingVertical: 4, marginTop: 8, borderRadius: 10, backgroundColor: "#F9EFE5" },
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
  modalTeacher: { color: "#78827B", fontSize: 10, marginTop: 5 },
  mediaOpenButton: { minHeight: 44, alignItems: "center", justifyContent: "center", marginTop: 16, borderRadius: 11, backgroundColor: colors.green600 },
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
