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
import Home from "./src/screen/Home";
import Mahadra from "./src/screen/Mahadra";
import Profil from "./src/screen/Profil";
import Quiz from "./src/screen/Quiz";
import colors from "./src/theme/colors";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const CourseStack = createNativeStackNavigator();

function CourseFlow() {
  return (
    <CourseStack.Navigator screenOptions={{ headerShown: false }}>
      <CourseStack.Screen name="CoursListe" component={Cours} />
      <CourseStack.Screen name="CourseDetail" component={CoursDetail} options={{ animation: "slide_from_right" }} />
    </CourseStack.Navigator>
  );
}

const icons = {
  Accueil: { active: "home", inactive: "home-outline" },
  Cours: { active: "book", inactive: "book-outline" },
  Bibliotheque: { active: "library", inactive: "library-outline" },
  Quiz: { active: "checkmark-circle", inactive: "checkmark-circle-outline" },
  Profil: { active: "person", inactive: "person-outline" },
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
          height: 70,
          paddingBottom: 9,
          paddingTop: 8,
          elevation: 10,
          shadowColor: "#173C2C",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.07,
          shadowRadius: 9,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700", marginTop: 1 },
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
      <Tab.Screen name="Cours" component={CourseFlow} />
      <Tab.Screen name="Bibliotheque" component={Bibliotheque} options={{ tabBarLabel: "Bibliothèque" }} />
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
