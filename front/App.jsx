import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import Login from "./src/auth/Login";
import Register from "./src/auth/Register";
import Welcome from "./src/auth/Welcome";
import Cours from "./src/screen/Cours";
import CoursDetail from "./src/screen/CoursDetail";
import Bibliotheque from "./src/screen/Bibliotheque";
import Coran from "./src/screen/Coran";
import Bibliotheque from "./src/screen/Bibliotheque";
import Home from "./src/screen/Home";
import Mahadra from "./src/screen/Mahadra";
import Profil from "./src/screen/Profil";
import Quiz from "./src/screen/Quiz";
import colors from "./src/theme/colors";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const icons = {
<<<<<<< HEAD
  Accueil: { active: "home", inactive: "home-outline" },
  Cours: { active: "book", inactive: "book-outline" },
  Bibliothèque: { active: "library", inactive: "library-outline" },
  Quiz: { active: "checkmark-circle", inactive: "checkmark-circle-outline" },
  Profil: { active: "person", inactive: "person-outline" },
=======
  Bibliothèque: "▤",
  Accueil: "⌂",
  Cours: "▤",
  Coran: "۞",
  Quiz: "✎",
  Mahadra: "◉",
  Profil: "♙",
>>>>>>> ca668bae1f09baef64fbc648ec3e40ecbcdb768b
};

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.green600,
        tabBarInactiveTintColor: "#9A9D94",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E8E6DE",
          borderTopWidth: 1,
          height: 66,
          paddingBottom: 8,
          paddingTop: 7,
          elevation: 8,
          shadowColor: "#173C2C",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700" },
        tabBarIcon: ({ focused, color }) => (
          <Ionicons
            name={focused ? icons[route.name].active : icons[route.name].inactive}
            size={22}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Accueil" component={Home} />
      <Tab.Screen name="Cours" component={Cours} />
<<<<<<< HEAD
      <Tab.Screen name="Bibliothèque" component={Bibliotheque} />
=======
      <Tab.Screen name="Bibliothèque" component={Bibliotheque} options={{ tabBarLabel: "Biblio" }} />
      <Tab.Screen name="Coran" component={Coran} />
>>>>>>> ca668bae1f09baef64fbc648ec3e40ecbcdb768b
      <Tab.Screen name="Quiz" component={Quiz} />
      <Tab.Screen name="Profil" component={Profil} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { loading, token } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#103F32" />
      </View>
    );
  }

  return (
    <Stack.Navigator initialRouteName={token ? "App" : "Welcome"} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="App" component={AppTabs} />
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="CoranDetail" component={Coran} />
      <Stack.Screen name="Mahadras" component={Mahadra} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="CourseDetail" component={CoursDetail} options={{ animation: "slide_from_right" }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
