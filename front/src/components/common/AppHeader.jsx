import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "../../theme/colors";

const LOGO = require("../../../assets/img/logo_mahdara.jpg");

const iconLabels = {
  "search-outline": "Rechercher",
  "notifications-outline": "Notifications",
  "settings-outline": "Paramètres",
  "bookmark-outline": "Favoris",
  "ellipsis-horizontal": "Menu",
};

function AppHeader({
  title,
  showBack = false,
  showLogo = false,
  onBackPress,
  rightIcon,
  onRightPress,
  horizontalInset = 0,
}) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const totalHeight = 58 + insets.top;
  const curveEdge = totalHeight - 14;

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
        {
          height: totalHeight,
          marginHorizontal: -horizontalInset,
          paddingTop: insets.top,
        },
      ]}
    >
      <Svg
        width="100%"
        height={totalHeight}
        viewBox={`0 0 400 ${totalHeight}`}
        preserveAspectRatio="none"
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      >
        <Path
          d={`M0 ${curveEdge} Q200 ${totalHeight + 4} 400 ${curveEdge} V${totalHeight} H0 Z`}
          fill={colors.neutral50}
        />
      </Svg>
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
          <Image source={LOGO} resizeMode="cover" style={styles.logo} />
        ) : null}
        <Text
          numberOfLines={1}
          style={[
            styles.title,
            showBack && styles.backTitle,
            showLogo && styles.logoTitle,
          ]}
        >
          {title}
        </Text>
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
    backgroundColor: "#064C3B",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    overflow: "hidden",
    position: "relative",
  },
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backButton: {
    width: 24,
    height: 44,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  logo: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
  },
  logoTitle: {
    marginLeft: 9,
  },
  title: {
    flexShrink: 1,
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
  },
  backTitle: {
    marginLeft: 14,
  },
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
