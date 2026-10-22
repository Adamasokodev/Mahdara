import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import Login from "./src/auth/Login";
import Register from "./src/auth/Register";
import Cours from "./src/screen/Cours";
import Coran from "./src/screen/Coran";
import Home from "./src/screen/Home";
import Mahadra from "./src/screen/Mahadra";
import Profil from "./src/screen/Profil";
import Quiz from "./src/screen/Quiz";
import colors from "./src/theme/colors";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const icons = {
  Accueil: "⌂",
  Cours: "▤",
  Coran: "۞",
  Quiz: "✎",
  Mahadra: "◉",
  Profil: "♙",
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
          borderTopColor: "#EEECE4",
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700" },
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
            {icons[route.name]}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="Accueil" component={Home} />
      <Tab.Screen name="Cours" component={Cours} />
      <Tab.Screen name="Coran" component={Coran} />
      <Tab.Screen name="Quiz" component={Quiz} />
      <Tab.Screen name="Mahadra" component={Mahadra} />
      <Tab.Screen name="Profil" component={Profil} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#103F32" />
      </View>
    );
  }

  return (
    <Stack.Navigator initialRouteName="App" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="App" component={AppTabs} />
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
