import React, { useRef } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const learningAreas = [
  {
    icon: "📖",
    title: "Le Coran",
    description: "Lecture et mémorisation",
    color: "#F3E9CC",
  },
  {
    icon: "🔤",
    title: "Langue arabe",
    description: "Apprendre à son rythme",
    color: "#DCEBE3",
  },
  {
    icon: "🌙",
    title: "Sciences islamiques",
    description: "Découvrir les enseignements",
    color: "#E9E3F2",
  },
];

function Home() {
  const scrollRef = useRef(null);
  const areasTop = useRef(0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
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

        <View style={styles.hero}>
          <View style={styles.heroOrb} />
          <Text style={styles.heroEyebrow}>BIENVENUE À LA MAHDARA</Text>
          <Text style={styles.heroTitle}>Le savoir se cultive chaque jour.</Text>
          <Text style={styles.heroDescription}>
            Un lieu d’apprentissage et de transmission, guidé par la tradition
            et ouvert à tous.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              scrollRef.current?.scrollTo({
                y: areasTop.current,
                animated: true,
              })
            }
            style={({ pressed }) => [
              styles.heroButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.heroButtonText}>Commencer à explorer</Text>
            <Text style={styles.heroButtonArrow}>→</Text>
          </Pressable>
          <View style={styles.heroDecoration} />
        </View>

        <View
          onLayout={({ nativeEvent }) => {
            areasTop.current = nativeEvent.layout.y;
          }}
          style={styles.sectionHeading}
        >
          <View>
            <Text style={styles.sectionEyebrow}>APPRENDRE</Text>
            <Text style={styles.sectionTitle}>Explorez nos domaines</Text>
          </View>
          <Text style={styles.sectionOrnament}>✳</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Des enseignements pour nourrir la connaissance et grandir à son rythme.
        </Text>

        <View style={styles.areas}>
          {learningAreas.map((area, index) => (
            <View
              key={area.title}
              style={[
                styles.areaCard,
                index === learningAreas.length - 1 && styles.areaCardLast,
              ]}
            >
              <View style={[styles.areaIcon, { backgroundColor: area.color }]}>
                <Text style={styles.areaIconText}>{area.icon}</Text>
              </View>
              <View style={styles.areaCopy}>
                <Text style={styles.areaTitle}>{area.title}</Text>
                <Text style={styles.areaDescription}>{area.description}</Text>
              </View>
              <Text style={styles.areaArrow}>↗</Text>
            </View>
          ))}
        </View>

        <View style={styles.quoteCard}>
          <View style={styles.quoteRule} />
          <View style={styles.quoteContent}>
            <Text style={styles.quoteEyebrow}>NOTRE ESPRIT</Text>
            <Text style={styles.quoteTitle}>Un héritage vivant, un savoir partagé.</Text>
            <Text style={styles.quoteDescription}>
              La Mahdara fait vivre l’enseignement traditionnel dans un cadre
              bienveillant et accessible.
            </Text>
          </View>
          <Text style={styles.quoteMotif}>۞</Text>
        </View>

        <Text style={styles.footer}>MAHDARA · SAVOIR ISLAMIQUE ET ENSEIGNEMENT TRADITIONNEL</Text>
      </ScrollView>
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
    paddingBottom: 30,
  },
  header: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
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
  hero: {
    minHeight: 280,
    overflow: "hidden",
    justifyContent: "center",
    padding: 25,
    borderRadius: 24,
    backgroundColor: "#103F32",
    marginBottom: 32,
  },
  heroOrb: {
    position: "absolute",
    width: 190,
    height: 190,
    top: -90,
    right: -55,
    borderRadius: 95,
    backgroundColor: "#1C5845",
  },
  heroEyebrow: {
    color: "#E4C46D",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  heroTitle: {
    maxWidth: 290,
    color: "#FFFDF6",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 37,
    letterSpacing: -0.6,
  },
  heroDescription: {
    maxWidth: 290,
    color: "#D5E1D9",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 11,
  },
  heroButton: {
    minHeight: 47,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: "#E4C46D",
  },
  buttonPressed: {
    opacity: 0.82,
  },
  heroButtonText: {
    color: "#173D30",
    fontSize: 13,
    fontWeight: "800",
  },
  heroButtonArrow: {
    color: "#173D30",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
  },
  heroDecoration: {
    position: "absolute",
    width: 115,
    height: 115,
    right: -40,
    bottom: -55,
    borderRadius: 58,
    borderWidth: 1,
    borderColor: "rgba(228, 196, 109, 0.45)",
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  sectionEyebrow: {
    color: "#B28B2E",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  sectionTitle: {
    color: "#183D32",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  sectionOrnament: {
    color: "#D7BD77",
    fontSize: 28,
    marginBottom: 2,
  },
  sectionDescription: {
    color: "#717A73",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
    marginBottom: 16,
  },
  areas: {
    gap: 11,
  },
  areaCard: {
    minHeight: 79,
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEECE4",
  },
  areaCardLast: {
    marginBottom: 2,
  },
  areaIcon: {
    width: 49,
    height: 49,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  areaIconText: {
    fontSize: 23,
  },
  areaCopy: {
    flex: 1,
    marginLeft: 13,
  },
  areaTitle: {
    color: "#1C3F34",
    fontSize: 15,
    fontWeight: "700",
  },
  areaDescription: {
    color: "#858B84",
    fontSize: 12,
    marginTop: 4,
  },
  areaArrow: {
    color: "#B28B2E",
    fontSize: 19,
    fontWeight: "600",
    marginHorizontal: 5,
  },
  quoteCard: {
    minHeight: 155,
    flexDirection: "row",
    overflow: "hidden",
    marginTop: 23,
    padding: 19,
    borderRadius: 18,
    backgroundColor: "#EFEDE2",
  },
  quoteRule: {
    width: 3,
    borderRadius: 2,
    backgroundColor: "#C5A64E",
    marginRight: 14,
  },
  quoteContent: {
    flex: 1,
    justifyContent: "center",
  },
  quoteEyebrow: {
    color: "#9A7A2C",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  quoteTitle: {
    color: "#173F32",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800",
  },
  quoteDescription: {
    color: "#6F776F",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  quoteMotif: {
    alignSelf: "center",
    color: "#D2C28F",
    fontSize: 38,
    marginLeft: 6,
  },
  footer: {
    color: "#9A9D94",
    fontSize: 8,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.8,
    lineHeight: 14,
    marginTop: 22,
  },
});

export default Home;
