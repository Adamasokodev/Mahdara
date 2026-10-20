import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../theme/colors";

const assessments = [
  {
    id: "coran",
    type: "Quiz",
    subject: "Le Coran",
    title: "Les bases de la récitation",
    detail: "3 questions · environ 3 minutes",
    questions: [
      { prompt: "Combien de lettres compte l’alphabet arabe ?", options: ["24", "28", "32"], answer: 1 },
      { prompt: "Que signifie le tajwid ?", options: ["Les règles de récitation", "La calligraphie", "La traduction"], answer: 0 },
      { prompt: "Dans quel sens lit-on l’arabe ?", options: ["De gauche à droite", "De droite à gauche", "De haut en bas"], answer: 1 },
    ],
  },
  {
    id: "fiqh",
    type: "Évaluation",
    subject: "Fiqh · Mukhtasar Khalil",
    title: "Vérifiez vos acquis du chapitre 3",
    detail: "3 questions · résultat à la fin",
    questions: [
      { prompt: "À quoi sert une évaluation de fin de chapitre ?", options: ["À suivre sa compréhension", "À remplacer le cours", "À changer de niveau automatiquement"], answer: 0 },
      { prompt: "Que faire si une notion reste difficile ?", options: ["Revoir le chapitre", "Ignorer la question", "Passer directement à la fin"], answer: 0 },
      { prompt: "Où retrouver votre résultat ?", options: ["Dans votre bilan", "Dans les notifications système", "Il n’est pas conservé"], answer: 0 },
    ],
  },
  {
    id: "arabe",
    type: "Quiz",
    subject: "Langue arabe",
    title: "Premiers mots en arabe",
    detail: "3 questions · niveau débutant",
    questions: [
      { prompt: "Comment dit-on ‘livre’ en arabe ?", options: ["باب", "كتاب", "قلم"], answer: 1 },
      { prompt: "Que signifie ‘سلام’ ?", options: ["Paix", "Maison", "Savoir"], answer: 0 },
      { prompt: "Comment dit-on ‘porte’ ?", options: ["كتاب", "نور", "باب"], answer: 2 },
    ],
  },
];

function Quiz({ route }) {
  const [tab, setTab] = useState(route?.params?.screen === "evaluations" ? "Évaluations" : "Quiz");
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState({});

  useEffect(() => {
    if (route?.params?.screen === "evaluations") setTab("Évaluations");
  }, [route?.params?.screen]);

  const visibleAssessments = assessments.filter((item) =>
    tab === "Évaluations" ? item.type === "Évaluation" : item.type === tab,
  );
  const currentQuestion = activeAssessment?.questions[questionIndex];

  const startAssessment = (assessment) => {
    setActiveAssessment(assessment);
    setQuestionIndex(0);
    setAnswers([]);
  };

  const finishAssessment = (finalAnswers) => {
    const score = finalAnswers.reduce(
      (total, answer, index) => total + (answer === activeAssessment.questions[index].answer ? 1 : 0),
      0,
    );
    setResults((current) => ({ ...current, [activeAssessment.id]: score }));
    setActiveAssessment(null);
  };

  const chooseAnswer = (optionIndex) => {
    const nextAnswers = [...answers, optionIndex];
    if (questionIndex === activeAssessment.questions.length - 1) {
      finishAssessment(nextAnswers);
    } else {
      setAnswers(nextAnswers);
      setQuestionIndex((current) => current + 1);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topline}>
          <View>
            <Text style={styles.eyebrow}>VOTRE APPRENTISSAGE</Text>
            <Text style={styles.title}>{activeAssessment ? "À vous de jouer" : "Quiz & évaluations"}</Text>
          </View>
          <View style={styles.mark}><Text style={styles.markText}>✎</Text></View>
        </View>

        {activeAssessment ? (
          <View style={styles.questionCard}>
            <Pressable onPress={() => setActiveAssessment(null)} style={styles.backButton}>
              <Text style={styles.backText}>‹  Quitter</Text>
            </Pressable>
            <Text style={styles.questionMeta}>{activeAssessment.subject}</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${((questionIndex + 1) / activeAssessment.questions.length) * 100}%` }]} />
            </View>
            <Text style={styles.questionCount}>QUESTION {questionIndex + 1} / {activeAssessment.questions.length}</Text>
            <Text style={styles.questionPrompt}>{currentQuestion.prompt}</Text>
            <View style={styles.options}>
              {currentQuestion.options.map((option, index) => (
                <Pressable key={option} onPress={() => chooseAnswer(index)} style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}>
                  <View style={styles.optionIndex}><Text style={styles.optionIndexText}>{String.fromCharCode(65 + index)}</Text></View>
                  <Text style={styles.optionText}>{option}</Text>
                  <Text style={styles.optionArrow}>›</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <>
            <View style={styles.hero}>
              <View style={styles.heroIcon}><Text style={styles.heroGlyph}>✦</Text></View>
              <View style={styles.heroCopy}>
                <Text style={styles.heroTitle}>Apprenez en pratiquant</Text>
                <Text style={styles.heroSubtitle}>Des quiz rapides et des évaluations pour mesurer vos progrès.</Text>
              </View>
            </View>

            <View style={styles.tabs}>
              {["Quiz", "Évaluations"].map((item) => (
                <Pressable key={item} onPress={() => setTab(item)} style={[styles.tab, tab === item && styles.tabActive]}>
                  <Text style={[styles.tabText, tab === item && styles.tabTextActive]}>{item}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.listHeading}>{tab === "Quiz" ? "Pour réviser" : "Votre parcours"}</Text>
            {visibleAssessments.map((assessment, index) => (
              <View key={assessment.id} style={styles.assessmentCard}>
                <View style={[styles.assessmentIcon, index % 2 ? styles.iconGold : styles.iconBlue]}>
                  <Text style={styles.assessmentGlyph}>{index % 2 ? "✓" : "✎"}</Text>
                </View>
                <View style={styles.assessmentCopy}>
                  <Text style={styles.subject}>{assessment.subject}</Text>
                  <Text style={styles.assessmentTitle}>{assessment.title}</Text>
                  <Text style={styles.detail}>{assessment.detail}</Text>
                  {results[assessment.id] !== undefined ? (
                    <Text style={styles.resultText}>Dernier résultat : {results[assessment.id]} / {assessment.questions.length}</Text>
                  ) : null}
                  <Pressable onPress={() => startAssessment(assessment)} style={styles.startButton}>
                    <Text style={styles.startText}>{results[assessment.id] !== undefined ? "Recommencer" : tab === "Quiz" ? "Commencer le quiz" : "Démarrer l’évaluation"}  →</Text>
                  </Pressable>
                </View>
              </View>
            ))}
            <View style={styles.tipCard}>
              <Text style={styles.tipIcon}>✧</Text>
              <Text style={styles.tipText}>Prenez le temps de revoir vos cours. Chaque étape compte dans votre progression.</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.neutral50 },
  content: { padding: 19, paddingBottom: 30 },
  topline: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 21 },
  eyebrow: { color: "#A67A4E", fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  title: { color: colors.neutral900, fontSize: 26, fontWeight: "800", marginTop: 5, fontFamily: "Georgia" },
  mark: { width: 43, height: 43, borderRadius: 14, backgroundColor: "#E9EFFC", alignItems: "center", justifyContent: "center" },
  markText: { color: "#4B70BC", fontSize: 23 },
  hero: { minHeight: 116, flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 18, backgroundColor: "#3F68B8", marginBottom: 18 },
  heroIcon: { width: 50, height: 50, borderRadius: 16, backgroundColor: "#6D8CD0", alignItems: "center", justifyContent: "center" },
  heroGlyph: { color: "#FFFFFF", fontSize: 26 },
  heroCopy: { flex: 1, marginLeft: 13 },
  heroTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  heroSubtitle: { color: "#E2E9F8", fontSize: 11, lineHeight: 16, marginTop: 5 },
  tabs: { flexDirection: "row", padding: 4, borderRadius: 13, backgroundColor: "#ECEEEB", marginBottom: 20 },
  tab: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10 },
  tabActive: { backgroundColor: "#FFFFFF", shadowColor: "#263B30", shadowOpacity: 0.08, shadowRadius: 4, elevation: 1 },
  tabText: { color: "#78817A", fontSize: 12, fontWeight: "700" },
  tabTextActive: { color: colors.green600 },
  listHeading: { color: colors.neutral900, fontSize: 17, fontWeight: "800", marginBottom: 11 },
  assessmentCard: { flexDirection: "row", padding: 14, borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E9E8E1", marginBottom: 11 },
  assessmentIcon: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  iconBlue: { backgroundColor: "#E8EEFB" },
  iconGold: { backgroundColor: "#F7EDDB" },
  assessmentGlyph: { color: "#436CB4", fontSize: 22, fontWeight: "700" },
  assessmentCopy: { flex: 1, marginLeft: 12 },
  subject: { color: "#A8794D", fontSize: 10, fontWeight: "800", letterSpacing: 0.6 },
  assessmentTitle: { color: "#283A30", fontSize: 14, lineHeight: 20, fontWeight: "800", marginTop: 4 },
  detail: { color: "#808982", fontSize: 11, marginTop: 4 },
  resultText: { color: colors.green600, fontSize: 11, fontWeight: "700", marginTop: 7 },
  startButton: { alignSelf: "flex-start", paddingVertical: 7, marginTop: 4 },
  startText: { color: colors.green600, fontSize: 11, fontWeight: "800" },
  tipCard: { flexDirection: "row", alignItems: "center", padding: 15, borderRadius: 15, backgroundColor: "#F2EFE4", marginTop: 8 },
  tipIcon: { color: "#B68A45", fontSize: 25, marginRight: 11 },
  tipText: { flex: 1, color: "#677168", fontSize: 11, lineHeight: 16 },
  questionCard: { padding: 18, borderRadius: 18, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8E7E1" },
  backButton: { alignSelf: "flex-start", paddingVertical: 5 },
  backText: { color: "#47715B", fontSize: 12, fontWeight: "700" },
  questionMeta: { color: "#A8794D", fontSize: 11, fontWeight: "800", marginTop: 17 },
  progressTrack: { height: 6, borderRadius: 4, backgroundColor: "#E8EBE7", marginTop: 11 },
  progressFill: { height: 6, borderRadius: 4, backgroundColor: colors.green400 },
  questionCount: { color: "#8A938B", fontSize: 10, fontWeight: "800", letterSpacing: 1, marginTop: 19 },
  questionPrompt: { color: colors.neutral900, fontSize: 20, lineHeight: 28, fontWeight: "800", marginTop: 8, marginBottom: 19 },
  options: { gap: 10 },
  option: { minHeight: 54, flexDirection: "row", alignItems: "center", paddingHorizontal: 11, borderRadius: 13, borderWidth: 1, borderColor: "#E7E9E4", backgroundColor: "#FCFCFA" },
  optionPressed: { borderColor: colors.green600, backgroundColor: "#F0F6F1" },
  optionIndex: { width: 29, height: 29, borderRadius: 10, backgroundColor: "#EDF1FB", alignItems: "center", justifyContent: "center" },
  optionIndexText: { color: "#456BB0", fontSize: 12, fontWeight: "800" },
  optionText: { flex: 1, color: "#3C4941", fontSize: 13, marginLeft: 10 },
  optionArrow: { color: "#93A098", fontSize: 21 },
});

export default Quiz;
