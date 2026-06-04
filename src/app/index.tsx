import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import AuthContext from "../AuthContext";
import { Button, Loading } from "../components";

const LandingPage: React.FC = () => {
  const router = useRouter();
  const { token, loading } = React.useContext(AuthContext);
  const [menuOpen, setMenuOpen] = React.useState(false);

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

  const { width } = Dimensions.get("window");

  return (
    <View style={{ flex: 1, backgroundColor: "#050816" }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}>
      <View style={{ position: "absolute", top: 24, right: 20, zIndex: 10 }}>
        <TouchableOpacity
          onPress={() => setMenuOpen((current) => !current)}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "rgba(255,255,255,0.08)",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Ionicons name="ellipsis-vertical" size={22} color="#f8fafc" />
        </TouchableOpacity>

        {menuOpen ? (
          <View
            style={{
              marginTop: 12,
              width: 160,
              borderRadius: 18,
              backgroundColor: "rgba(15, 23, 42, 0.96)",
              borderWidth: 1,
              borderColor: "rgba(148, 163, 184, 0.18)",
              padding: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.12,
              shadowRadius: 16,
              elevation: 10
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setMenuOpen(false);
                router.push("/profile");
              }}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 10,
                borderRadius: 14,
                backgroundColor: "rgba(255,255,255,0.04)"
              }}
            >
              <Text style={{ color: "#f8fafc", fontWeight: "700", fontSize: 15 }}>Perfil</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      <Image
        source={require("../../assets/images/volei.jpeg")}
        style={{ width: width - 40, height: 220, borderRadius: 16, alignSelf: "center", marginTop: 8 }}
        resizeMode="cover"
      />

      <Text style={{ color: "#f8fafc", fontSize: 30, fontWeight: "800", textAlign: "center", marginTop: 18 }}>Lumina</Text>
      <Text style={{ color: "#cbd5e1", fontSize: 16, textAlign: "center", marginTop: 8, lineHeight: 22 }}>
        Sua rotina de bem-estar começa aqui.
      </Text>

      <View style={{ marginTop: 18, backgroundColor: "rgba(15, 23, 42, 0.96)", borderRadius: 20, padding: 18, borderWidth: 1, borderColor: "rgba(129, 140, 248, 0.2)" }}>
        <View style={{ marginBottom: 18 }}>
          <Image
            source={require("../../assets/images/figurinhas.jpg")}
            style={{ width: "100%", height: 120, borderRadius: 12 }}
            resizeMode="cover"
          />
        </View>
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

      </ScrollView>
    </View>
  );
};

export default LandingPage;
