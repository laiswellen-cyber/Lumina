import React from "react";
import { Text, Animated, Easing, Image, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Area, Button, Container, Title } from "../components";

let VOLEI_IMAGE: any = null;
try {
  VOLEI_IMAGE = require("../../assets/images/volei.jpeg");
} catch (e) {
  VOLEI_IMAGE = null;
}
let FIGURINHAS_IMAGE: any = null;
try {
  FIGURINHAS_IMAGE = require("../../assets/images/figurinhas.jpg");
} catch (e) {
  FIGURINHAS_IMAGE = null;
}

const LandingPage: React.FC = () => {
  const router = useRouter();
  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(24)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      })
    ]).start();
  }, [fade, slide]);

  return (
    <View style={{ flex: 1, backgroundColor: "#1f7a1f" }}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 40, alignItems: "center" }}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
          <Title style={{ color: "#ffffff", fontSize: 32, fontWeight: "bold", textAlign: "center" }}>Lumina</Title>
        </Animated.View>

        {FIGURINHAS_IMAGE ? (
          <Image source={FIGURINHAS_IMAGE} style={{ width: "100%", height: 180, marginTop: 20, borderRadius: 16 }} resizeMode="contain" />
        ) : null}

        {VOLEI_IMAGE ? (
          <View style={{ width: "100%", marginTop: 24, backgroundColor: "rgba(0,0,0,0.35)", borderRadius: 18, padding: 16, alignItems: "center" }}>
            <Image source={VOLEI_IMAGE} style={{ width: "100%", height: 220, borderRadius: 16 }} resizeMode="contain" />
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", marginTop: 16, marginBottom: 8, textAlign: "center" }}>Benefícios do Esporte</Text>
            <Text style={{ color: "#e2e8f0", fontSize: 15, lineHeight: 22, textAlign: "center" }}>
              Praticar esportes melhora a saúde física, aumenta a disposição e fortalece o bem-estar mental. Venha se exercitar e aproveite atividades em grupo como vôlei para socializar e manter-se ativo.
            </Text>
          </View>
        ) : null}

        <Button
          onPress={() => router.push("/profile")}
          style={{
            marginTop: 24,
            backgroundColor: "#2563eb",
            paddingVertical: 14,
            paddingHorizontal: 22,
            borderRadius: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.16,
            shadowRadius: 12,
            elevation: 6
          }}
          textStyle={{ color: "#ffffff", fontSize: 16, fontWeight: "700", textAlign: "center" }}
        >
          Editar Perfil
        </Button>
      </View>
    </View>
  );
};

export default LandingPage;
