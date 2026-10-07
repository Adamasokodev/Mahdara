import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Login from './src/auth/Login';
import Register from './src/auth/Register';
import Home from './src/screen/Home';
import Cours from './src/screen/Cours';
import Profil from './src/screen/Profil';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ActivityIndicator, Text, View } from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const icons = { Accueil: "🏠", Cours: "📖", Profil: "👤" };

function AppTabs(){
   return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#103F32",
        tabBarInactiveTintColor: "#9A9D94",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#EEECE4",
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
            {icons[route.name]}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="Accueil" component={Home} />
      <Tab.Screen name="Cours" component={Cours} />
      <Tab.Screen name="Profil" component={Profil} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#103F32" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        // Connecté : seulement l'application
        <Stack.Screen name="App" component={AppTabs} />
      ) : (
        // Non connecté : seulement l'authentification
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
        </>
      )}
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
