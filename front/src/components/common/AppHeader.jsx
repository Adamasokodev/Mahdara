import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "../../theme/colors";

const iconLabels = {
  "search-outline": "Rechercher",
  "notifications-outline": "Notifications",
  "settings-outline": "Paramètres",
  "bookmark-outline": "Favoris",
  "ellipsis-horizontal": "Menu",
};

function AppHeader({
  title,
  subtitle,
  showBack = false,
  showLogo = false,
  onBackPress,
  rightIcon,
  onRightPress,
  horizontalInset = 0,
}) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const expanded = true;
  const totalHeight = 110 + insets.top;
  const curveEdge = totalHeight - 28;

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View
      style={[
        styles.container,
        expanded ? styles.expandedContainer : styles.compactContainer,
        {
          height: totalHeight,
          marginHorizontal: -horizontalInset,
          paddingTop: insets.top,
        },
      ]}
    >
      {expanded ? (
        <Svg
          width="100%"
          height={totalHeight}
          viewBox={`0 0 400 ${totalHeight}`}
          preserveAspectRatio="none"
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
        >
          <Path
            d={`M0 ${curveEdge} Q200 ${totalHeight + 20} 400 ${curveEdge} V${totalHeight} H0 Z`}
            fill={colors.neutral50}
          />
          <Path
            d="M54 12 L74 24 L74 48 L54 60 L34 48 L34 24 Z M54 12 V60 M34 24 L74 48 M74 24 L34 48 M138 7 L161 20 L161 47 L138 60 L115 47 L115 20 Z M138 7 V60 M115 20 L161 47 M161 20 L115 47 M222 13 L242 25 L242 49 L222 61 L202 49 L202 25 Z M222 13 V61 M202 25 L242 49 M242 25 L202 49 M306 8 L329 21 L329 48 L306 61 L283 48 L283 21 Z M306 8 V61 M283 21 L329 48 M329 21 L283 48 M370 4 L390 16 L390 39 L370 51 L350 39 L350 16 Z M370 4 V51 M350 16 L390 39 M390 16 L350 39"
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity={0.1}
            strokeWidth={1}
          />
          <Path
            d={`M0 ${curveEdge} Q200 ${totalHeight + 20} 400 ${curveEdge}`}
            fill="none"
            stroke="#C7A45D"
            strokeOpacity={0.35}
            strokeWidth={0.8}
          />
        </Svg>
      ) : null}
      <View style={styles.row}>
        {showBack ? (
          <Pressable
            accessibilityLabel="Retour"
            accessibilityRole="button"
            hitSlop={10}
            onPress={handleBackPress}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
        ) : showLogo ? (
          <View accessibilityLabel="Logo Mahdara" accessibilityRole="image" style={styles.logoWrap}>
            <Svg width={62} height={66} viewBox="0 0 62 66">
              <Path d="M31 2 L56 15 V35 C56 48 45 58 31 64 C17 58 6 48 6 35 V15 Z" fill="rgba(255,255,255,0.04)" stroke="#E2C46D" strokeWidth={2} />
              <Path d="M31 25 C25 21 19 21 15 24 V42 C20 39 26 40 31 44 Z" fill="#F6F2E7" />
              <Path d="M31 25 C37 21 43 21 47 24 V42 C42 39 36 40 31 44 Z" fill="#F6F2E7" />
              <Path d="M31 24 V45 M19 28 L27 30 M19 33 L27 35 M35 30 L43 28 M35 35 L43 33" stroke="#174B3B" strokeWidth={1.2} strokeLinecap="round" />
              <Path d="M27 19 Q31 14 35 19" fill="none" stroke="#E2C46D" strokeWidth={1.6} strokeLinecap="round" />
            </Svg>
          </View>
        ) : null}
        <View style={[styles.titleBlock, showBack && styles.backTitle, showLogo && styles.logoTitle]}>
          <Text numberOfLines={1} style={[styles.title, !expanded && styles.compactTitle]}>{title}</Text>
          {expanded && subtitle ? <Text numberOfLines={1} style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <View style={styles.spacer} />
        {rightIcon ? (
          <Pressable
            accessibilityLabel={iconLabels[rightIcon] || "Action"}
            accessibilityRole="button"
            disabled={!onRightPress}
            hitSlop={6}
            onPress={onRightPress}
            style={styles.actionButton}
          >
            <Ionicons name={rightIcon} size={23} color="#FFFFFF" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
    backgroundColor: colors.green700,
    overflow: "hidden",
    position: "relative",
  },
  expandedContainer: { borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
  compactContainer: { borderBottomColor: "rgba(255,255,255,0.12)" },
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  compactRow: { paddingHorizontal: 14 },
  backButton: {
    width: 24,
    height: 44,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  logo: {
    width: 62,
    height: 66,
  },
  logoWrap: { width: 62, height: 66, alignItems: "center", justifyContent: "center" },
  logoTitle: {
    marginLeft: 8,
  },
  titleBlock: { flexShrink: 1 },
  title: {
    flexShrink: 1,
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
  },
  compactTitle: { fontSize: 16, fontWeight: "700" },
  backTitle: {
    marginLeft: 14,
  },
  subtitle: { color: "rgba(255,255,255,0.8)", fontSize: 9, marginTop: 2, letterSpacing: 0.2 },
  spacer: {
    flex: 1,
  },
  actionButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AppHeader;
