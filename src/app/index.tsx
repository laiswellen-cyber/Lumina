import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthContext from "../AuthContext";
import { Button, Loading } from "../components";

const SPORTS = ["Futebol", "Vôlei", "Basquete", "Natação", "Corrida", "Yoga", "Musculação", "Ciclismo"];

const LandingPage: React.FC = () => {
  const router = useRouter();
  const { token, loading } = React.useContext(AuthContext);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [sportsMenuOpen, setSportsMenuOpen] = React.useState(false);
  const [selectedSports, setSelectedSports] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (loading) return;

    if (token) {
      router.replace("/nearby");
    }

    // Carregar preferências de esportes salvas
    const loadSports = async () => {
      try {
        const saved = await AsyncStorage.getItem("preferred_sports");
        if (saved) {
          setSelectedSports(JSON.parse(saved));
        }
      } catch (e) {
        console.warn("Erro ao carregar esportes preferidos", e);
      }
    };
    loadSports();
  }, [loading, router, token]);

  const handleToggleSport = async (sport: string) => {
    setSelectedSports((prev) => {
      const updated = prev.includes(sport)
        ? prev.filter((s) => s !== sport)
        : [...prev, sport];
      
      // Salvar no AsyncStorage
      AsyncStorage.setItem("preferred_sports", JSON.stringify(updated)).catch(
        (e) => console.warn("Erro ao salvar esportes preferidos", e)
      );
      
      return updated;
    });
  };

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
              width: 200,
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
                backgroundColor: "rgba(255,255,255,0.04)",
                marginBottom: 4
              }}
            >
              <Text style={{ color: "#f8fafc", fontWeight: "700", fontSize: 15 }}>Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSportsMenuOpen(!sportsMenuOpen)}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 10,
                borderRadius: 14,
                backgroundColor: "rgba(255,255,255,0.04)",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <Text style={{ color: "#f8fafc", fontWeight: "700", fontSize: 15 }}>Esportes</Text>
              <Ionicons name={sportsMenuOpen ? "chevron-up" : "chevron-down"} size={16} color="#f8fafc" />
            </TouchableOpacity>

            {sportsMenuOpen ? (
              <View style={{ paddingLeft: 10, marginTop: 8, borderLeftWidth: 1, borderLeftColor: "rgba(148, 163, 184, 0.2)" }}>
                {SPORTS.map((sport) => (
                  <TouchableOpacity
                    key={sport}
                    onPress={() => handleToggleSport(sport)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8
                    }}
                  >
                    <View
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        borderWidth: 2,
                        borderColor: selectedSports.includes(sport) ? "#8b5cf6" : "#94a3b8",
                        backgroundColor: selectedSports.includes(sport) ? "#8b5cf6" : "transparent",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      {selectedSports.includes(sport) && (
                        <Ionicons name="checkmark" size={12} color="#f8fafc" />
                      )}
                    </View>
                    <Text style={{ color: "#e2e8f0", fontWeight: "500", fontSize: 13 }}>{sport}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
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
