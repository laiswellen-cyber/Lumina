import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { GRAPHQL_ENDPOINT } from "../config/auth";
import AuthContext from "../AuthContext";
import { isFirebaseReady, savePreferredSportsToCloud } from "../config/firebase";

const SPORTS = ["Futebol", "Vôlei", "Basquete", "Natação", "Corrida", "Yoga", "Musculação", "Ciclismo"];
const STORAGE_KEY = "preferred_sports";

const SportsPage: React.FC = () => {
  const [selected, setSelected] = React.useState<string[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setSelected(JSON.parse(raw));
      } catch (e) {
        console.warn(e);
      }
    })();
  }, []);

  const authContext = React.useContext(AuthContext);

  const toggle = async (sport: string) => {
    const updated = selected.includes(sport) ? selected.filter(s => s !== sport) : [...selected, sport];
    setSelected(updated);

    const endpoint = String(GRAPHQL_ENDPOINT || "");
    const canUseApi = endpoint.length > 0 && !endpoint.includes("your-graphql-endpoint.com");

    if (canUseApi && authContext.token) {
      const MUTATION = `
        mutation UpdatePreferredSports($sports: [String!]!) {
          updatePreferredSports(sports: $sports) {
            success
          }
        }
      `;

        try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authContext.token}`
          },
          body: JSON.stringify({ query: MUTATION, variables: { sports: updated } })
        });

        const json = await res.json();
        if (!res.ok || json.errors) {
          console.warn("GraphQL updatePreferredSports failed", json.errors);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          Alert.alert("Esportes", "Preferências atualizadas localmente (API indisponível).");
          return;
        }

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        Alert.alert("Esportes", "Preferências atualizadas no servidor.");
        return;
        } catch (err) {
          console.warn("Erro ao chamar API de esportes", err);
          // Try saving to Firebase if available
          if (isFirebaseReady && authContext.token) {
            try {
              await savePreferredSportsToCloud(String(authContext.token), updated);
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
              Alert.alert("Esportes", "Preferências atualizadas no Firebase (fallback).");
              return;
            } catch (ferr) {
              console.warn("Falha ao salvar esportes no Firebase", ferr);
            }
          }

          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          Alert.alert("Esportes", "Preferências atualizadas localmente (erro de rede).");
          return;
        }
    }

    // If GraphQL not available, try Firebase
    if (isFirebaseReady && authContext.token) {
      try {
        await savePreferredSportsToCloud(String(authContext.token), updated);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        Alert.alert("Esportes", "Preferências atualizadas no Firebase.");
        return;
      } catch (ferr) {
        console.warn("Falha ao salvar esportes no Firebase", ferr);
      }
    }

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      Alert.alert("Esportes", "Preferências atualizadas.");
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <LinearGradient colors={["#0c2c5a", "#071a3b"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ color: "#f8fafc", fontSize: 22, fontWeight: "800", marginBottom: 12 }}>Meus Esportes</Text>
        {SPORTS.map(sport => (
          <TouchableOpacity key={sport} onPress={() => toggle(sport)} style={{ paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ color: "#e2e8f0", fontSize: 16 }}>{sport}</Text>
            {selected.includes(sport) ? <Ionicons name="checkmark-circle" size={20} color="#fbbf24" /> : <Ionicons name="ellipse-outline" size={18} color="#94a3b8" />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
};

export default SportsPage;
