import React from "react";
import { View, Text, Alert, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "../components";

const PrivacyPage: React.FC = () => {
  const handleClear = () => {
    Alert.alert("Privacidade", "Dados locais limpos (demo).");
  };

  return (
    <LinearGradient colors={["#0c2c5a", "#071a3b"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ color: "#f8fafc", fontSize: 22, fontWeight: "800", marginBottom: 12 }}>Privacidade</Text>
        <Text style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 20, marginBottom: 16 }}>
          Aqui você pode gerenciar suas preferências de privacidade. Em versões futuras será possível exportar, apagar ou revisar dados pessoais.
        </Text>

        <Button onPress={handleClear} style={{ marginTop: 8 }}>
          Limpar dados locais
        </Button>
      </ScrollView>
    </LinearGradient>
  );
};

export default PrivacyPage;
