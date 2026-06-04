import { useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import AuthContext from "../AuthContext";
import { Button, Loading } from "../components";

const LandingPage: React.FC = () => {
  const router = useRouter();
  const { token, loading } = React.useContext(AuthContext);

  React.useEffect(() => {
    if (loading) return;

    if (token) {
      router.replace("/nearby");
    }
  }, [loading, router, token]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#050816" }}>
        <Loading color="#8b5cf6" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#050816", paddingHorizontal: 20, paddingVertical: 32, justifyContent: "center" }}>
      <Text style={{ color: "#f8fafc", fontSize: 30, fontWeight: "800", textAlign: "center" }}>Lumina</Text>
      <Text style={{ color: "#cbd5e1", fontSize: 16, textAlign: "center", marginTop: 8, lineHeight: 22 }}>
        Sua rotina de bem-estar começa aqui.
      </Text>

      <View style={{ marginTop: 24, backgroundColor: "rgba(15, 23, 42, 0.96)", borderRadius: 20, padding: 18, borderWidth: 1, borderColor: "rgba(129, 140, 248, 0.2)" }}>
        <Text style={{ color: "#e2e8f0", fontSize: 18, fontWeight: "700", marginBottom: 6 }}>Benefícios do esporte</Text>
        <Text style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 20 }}>
          Praticar esportes melhora a saúde física, aumenta a disposição, fortalece o bem-estar mental e ajuda a criar hábitos mais ativos no dia a dia.
        </Text>
        <Text style={{ color: "#bfdbfe", fontSize: 14, lineHeight: 20, marginTop: 10 }}>
          Além disso, a saúde e o bem-estar ajudam a sociedade a formar pessoas mais saudáveis, com mais energia e resistência, reduzindo a chance de doenças e promovendo uma vida mais equilibrada.
        </Text>
      </View>

      <Button
        onPress={() => router.push("/sign-up")}
        style={{ marginTop: 24, backgroundColor: "#8b5cf6", borderRadius: 16, paddingVertical: 14, alignItems: "center" }}
        textStyle={{ color: "#ffffff", fontWeight: "700", fontSize: 16, textAlign: "center" }}
      >
        Criar conta
      </Button>
    </View>
  );
};

export default LandingPage;
