import React from "react";
import { ScrollView, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Area, Button, Container, Title } from "../components";

const getDiagnosis = (category: string) => {
  switch (category) {
    case "Abaixo do peso":
      return "Seu IMC está abaixo do ideal. Foque em uma alimentação mais energética e em treino de resistência para ganhar força e massa muscular.";
    case "Peso correto":
      return "Seu IMC está dentro da faixa saudável. Continue mantendo hábitos regulares e use a atividade física para melhorar resistência e disposição.";
    case "Acima do peso":
      return "Seu IMC está acima do ideal. Combine caminhadas, treino aeróbico e força para melhorar condicionamento e controlar a composição corporal.";
    case "Obesidade":
      return "Seu IMC indica risco maior para a saúde. Comece com pequenos passos: caminhada diária, treino leve e acompanhamento profissional se necessário.";
    default:
      return "Continue mantendo hábitos saudáveis e acompanhando seu progresso.";
  }
};

const getFitnessPlan = (category: string) => {
  switch (category) {
    case "Abaixo do peso":
      return [
        "Inclua 3 refeições completas com proteínas, carboidratos e gorduras boas.",
        "Adicione treino de força 2 a 3 vezes por semana para ganhar massa muscular.",
        "Evite pular refeições e mantenha hidratação regular."
      ];
    case "Peso correto":
      return [
        "Mantenha 150 minutos de atividade física por semana, como caminhadas ou bike.",
        "Inclua 2 sessões de treino de força para fortalecer pernas, core e braços.",
        "Priorize sono, hidratação e uma alimentação equilibrada."
      ];
    case "Acima do peso":
      return [
        "Faça caminhadas de 30 minutos, 5 vezes por semana.",
        "Adicione treino de força 2 vezes por semana para acelerar o metabolismo.",
        "Reduza porções e mantenha o consumo de água em dia."
      ];
    case "Obesidade":
      return [
        "Comece com caminhada leve de 15 a 20 minutos por dia.",
        "Aumente gradualmente a intensidade e faça exercícios de mobilidade.",
        "Busque orientação profissional para montar um plano seguro e sustentável."
      ];
    default:
      return ["Mantenha rotina ativa e acompanhe seu peso e energia." ];
  }
};

const ImcResultPage: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    imc?: string;
    category?: string;
    tip?: string;
  }>();

  const imc = Number(params.imc ?? 0);
  const category = params.category ?? "Peso correto";
  const diagnosis = getDiagnosis(category);
  const plan = getFitnessPlan(category);

  return (
    <LinearGradient colors={["#071a3b", "#0f172a"]} style={{ flex: 1 }}>
      <Container style={{ flex: 1, padding: 24 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          <Area style={{ width: "100%", alignItems: "center", marginBottom: 18 }}>
            <Title style={{ color: "#f8fafc", fontSize: 28, fontWeight: "800", textAlign: "center" }}>
              Resultado do IMC
            </Title>
            <Text style={{ color: "#bfdbfe", fontSize: 15, textAlign: "center", marginTop: 8 }}>
              Veja como está sua condição física e o que pode ajudar a melhorar sua aptidão.
            </Text>
          </Area>

          <Area style={{ width: "100%", borderRadius: 24, backgroundColor: "rgba(15, 23, 42, 0.92)", borderWidth: 1, borderColor: "rgba(147, 197, 253, 0.18)", padding: 18, gap: 10 }}>
            <Text style={{ color: "#22d3ee", fontSize: 14, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.4 }}>
              IMC calculado
            </Text>
            <Text style={{ color: "#f8fafc", fontSize: 36, fontWeight: "800" }}>{Number.isFinite(imc) ? imc.toFixed(1) : "0.0"}</Text>
            <Text style={{ color: "#86efac", fontSize: 18, fontWeight: "700" }}>{category}</Text>
            <Text style={{ color: "#e2e8f0", fontSize: 14, lineHeight: 20 }}>{diagnosis}</Text>
          </Area>

          <Area style={{ width: "100%", marginTop: 18, borderRadius: 24, backgroundColor: "rgba(15, 23, 42, 0.92)", borderWidth: 1, borderColor: "rgba(147, 197, 253, 0.18)", padding: 18, gap: 10 }}>
            <Text style={{ color: "#f8fafc", fontSize: 18, fontWeight: "800" }}>O que fazer agora</Text>
            <Text style={{ color: "#bfdbfe", fontSize: 14, lineHeight: 20 }}>{params.tip ?? "Mantenha uma rotina saudável e acompanhe seu progresso."}</Text>
            {plan.map((item, index) => (
              <Text key={index} style={{ color: "#e2e8f0", fontSize: 14, lineHeight: 20 }}>{`• ${item}`}</Text>
            ))}
          </Area>

          <Area style={{ width: "100%", marginTop: 18 }}>
            <Button
              onPress={() => router.back()}
              style={{
                backgroundColor: "#22c55e",
                borderRadius: 16,
                paddingVertical: 15,
                alignItems: "center",
                width: "100%"
              }}
              textStyle={{ color: "#052e16", fontWeight: "700", fontSize: 16, textAlign: "center" }}
            >
              Voltar para o cálculo
            </Button>
          </Area>
        </ScrollView>
      </Container>
    </LinearGradient>
  );
};

export default ImcResultPage;
