import React from "react";
import { View, Text, Switch, Alert, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isFirebaseReady, saveSettingsToCloud } from "../config/firebase";
import AuthContext from "../AuthContext";
import { Button } from "../components";

const SETTINGS_KEY = "app_settings";

const SettingsPage: React.FC = () => {
  const [notifications, setNotifications] = React.useState<boolean>(true);
  const [darkMode, setDarkMode] = React.useState<boolean>(true);
  const auth = React.useContext(AuthContext);

  React.useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SETTINGS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setNotifications(Boolean(parsed.notifications));
          setDarkMode(Boolean(parsed.darkMode));
        }
      } catch (e) {
        console.warn(e);
      }
    })();
  }, []);

  const save = async () => {
    try {
      const payload = { notifications, darkMode };

      // Try Firebase if available
      if (isFirebaseReady) {
        try {
          if (auth && auth.token) {
            await saveSettingsToCloud(String(auth.token), payload);
            await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(payload));
            Alert.alert("Configurações", "Preferências salvas no Firebase.");
            return;
          }
        } catch (ferr) {
          console.warn("Falha ao salvar configurações no Firebase", ferr);
        }
      }

      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(payload));
      Alert.alert("Configurações", "Preferências salvas.");
    } catch (e) {
      console.warn(e);
      Alert.alert("Erro", "Não foi possível salvar as configurações.");
    }
  };

  return (
    <LinearGradient colors={["#0c2c5a", "#071a3b"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ color: "#f8fafc", fontSize: 22, fontWeight: "800", marginBottom: 16 }}>Configurações</Text>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Text style={{ color: "#e2e8f0", fontSize: 16 }}>Notificações</Text>
          <Switch value={notifications} onValueChange={setNotifications} thumbColor={notifications ? "#fbbf24" : undefined} />
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Text style={{ color: "#e2e8f0", fontSize: 16 }}>Modo escuro</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} thumbColor={darkMode ? "#fbbf24" : undefined} />
        </View>

        <Button onPress={save} style={{ marginTop: 20 }}>
          Salvar
        </Button>
      </ScrollView>
    </LinearGradient>
  );
};

export default SettingsPage;
