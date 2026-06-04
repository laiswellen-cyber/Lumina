import { Formik, FormikHelpers } from "formik";
import React from "react";
import { Animated, Easing, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Area, Button, Container, TextInput, Title } from "../components";

type ImcValues = {
  weight: string;
  height: string;
};

const getImcCategory = (imc: number) => {
  if (imc < 18.5) return "Abaixo do peso";
  if (imc < 25) return "Peso correto";
  if (imc < 30) return "Acima do peso";
  return "Obesidade";
};

const getHealthTip = (category: string) => {
  switch (category) {
    case "Abaixo do peso":
      return "Inclua alimentos nutritivos e pratique exercícios de resistência para ganhar massa magra.";
    case "Peso correto":
      return "Mantenha uma alimentação equilibrada e continue praticando atividade física regular.";
    case "Acima do peso":
      return "Aumente a atividade aeróbica e controle porções para reduzir o percentual de gordura.";
    case "Obesidade":
      return "Consulte um profissional de saúde e aumente gradualmente a atividade física com orientação.";
    default:
      return "Mantenha hábitos saudáveis e monitore seu peso regularmente.";
  }
};

const RecoverPage: React.FC = () => {
  const router = useRouter();
  const [result, setResult] = React.useState<string | null>(null);
  const [imc, setImc] = React.useState<number | null>(null);
  const [category, setCategory] = React.useState<string | null>(null);
  const [tip, setTip] = React.useState<string | null>(null);
  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(24)).current;

  const handleSubmit = (
    values: ImcValues,
    _helpers: FormikHelpers<ImcValues>
  ) => {
    const weight = Number(values.weight.replace(",", "."));
    const height = Number(values.height.replace(",", ".")) / 100;

    if (!weight || !height || height <= 0) {
      setResult("Informe peso e altura válidos.");
      setImc(null);
      setCategory(null);
      return;
    }

    const calculatedImc = weight / (height * height);
    const normalized = Number(calculatedImc.toFixed(1));
    const categoryValue = getImcCategory(normalized);
    const tipValue = getHealthTip(categoryValue);

    // Armazenar resultado localmente e exibir na mesma tela (estado único)
    setImc(normalized);
    setCategory(categoryValue);
    setTip(tipValue);
    setResult(`IMC: ${normalized} — ${categoryValue}`);
  };

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

  const handleBack = () => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true
      }),
      Animated.timing(slide, {
        toValue: 12,
        duration: 160,
        useNativeDriver: true
      })
    ]).start(() => router.back());
  };

  return (
    <LinearGradient colors={["#0c2c5a", "#071a3b"]} style={{ flex: 1 }}>
      <Container style={{ flex: 1, padding: 24, justifyContent: "center" }}>
        <Area style={{ width: "100%", alignItems: "center", marginBottom: 24 }}>
          <Title style={{ color: "#f8fafc", fontSize: 28, fontWeight: "bold", textAlign: "center" }}>
            IMC
          </Title>
          <Title style={{ color: "#c7d2fe", fontSize: 16, fontWeight: "500", marginTop: 10, textAlign: "center" }}>
            Descubra se você está abaixo, no peso correto ou acima do peso.
          </Title>
        </Area>

        <Area style={{ width: "100%", alignItems: "center" }}>
          <Formik
            initialValues={{ weight: "", height: "" }}
            onSubmit={handleSubmit}
          >
            {({ values, handleChange, handleSubmit: submit, resetForm }) => (
              <Area style={{ width: "100%", gap: 14 }}>
                <TextInput
                  placeholder="Peso em kg"
                  placeholderTextColor="#94a3b8"
                  value={values.weight}
                  onChangeText={handleChange("weight")}
                  keyboardType="decimal-pad"
                  style={{
                    width: "100%",
                    color: "#f8fafc",
                    textAlign: "center",
                    borderWidth: 1,
                    borderColor: "#14532d",
                    borderRadius: 14,
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    backgroundColor: "#07270d"
                  }}
                />
                <TextInput
                  placeholder="Altura em cm"
                  placeholderTextColor="#94a3b8"
                  value={values.height}
                  onChangeText={handleChange("height")}
                  keyboardType="decimal-pad"
                  style={{
                    width: "100%",
                    color: "#f8fafc",
                    textAlign: "center",
                    borderWidth: 1,
                    borderColor: "#14532d",
                    borderRadius: 14,
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    backgroundColor: "#07270d"
                  }}
                />
                <Button
                  onPress={() => submit()}
                  style={{
                    backgroundColor: "#22c55e",
                    borderRadius: 16,
                    paddingVertical: 16,
                    paddingHorizontal: 22,
                    alignItems: "center",
                    width: "100%",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.18,
                    shadowRadius: 12,
                    elevation: 8
                  }}
                  textStyle={{ color: "#052e16", fontWeight: "700", fontSize: 16, textAlign: "center" }}
                >
                  Calcular IMC
                </Button>
                <Button
                  onPress={() => {
                    resetForm();
                    setResult(null);
                    setImc(null);
                    setCategory(null);
                  }}
                  style={{
                    backgroundColor: "transparent",
                    borderWidth: 1,
                    borderColor: "#94a3b8",
                    borderRadius: 16,
                    paddingVertical: 16,
                    alignItems: "center",
                    width: "100%"
                  }}
                  textStyle={{ color: "#d1fae5", fontWeight: "700", fontSize: 16, textAlign: "center" }}
                >
                  Limpar
                </Button>
                {result ? (
                  <Area style={{ width: "100%", borderRadius: 16, backgroundColor: "rgba(255,255,255,0.03)", padding: 14 }}>
                    <Text style={{ color: "#22d3ee", fontSize: 14, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.2 }}>
                      IMC calculado
                    </Text>
                    <Text style={{ color: "#f8fafc", fontSize: 28, fontWeight: "800", marginTop: 6 }}>{imc !== null ? imc.toFixed(1) : "0.0"}</Text>
                    <Text style={{ color: "#86efac", fontSize: 16, fontWeight: "700", marginTop: 6 }}>{category}</Text>
                    <Text style={{ color: "#e2e8f0", fontSize: 14, lineHeight: 20, marginTop: 10 }}>{tip}</Text>

                    {category ? (
                      <React.Fragment>
                        <Text style={{ color: "#f8fafc", fontSize: 16, fontWeight: "800", marginTop: 12 }}>O que fazer agora</Text>
                        <Text style={{ color: "#bfdbfe", fontSize: 14, lineHeight: 20, marginTop: 6 }}>{tip}</Text>
                        {(() => {
                          const plan = ((): string[] => {
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
                                return ["Mantenha rotina ativa e acompanhe seu peso e energia."];
                            }
                          })();

                          return plan.map((item, idx) => (
                            <Text key={idx} style={{ color: "#e2e8f0", fontSize: 14, lineHeight: 20 }}>{`• ${item}`}</Text>
                          ));
                        })()}
                      </React.Fragment>
                    ) : null}
                  </Area>
                ) : null}
              </Area>
            )}
          </Formik>
        </Area>

        <Animated.View
          style={{
            position: "absolute",
            left: 24,
            right: 24,
            bottom: 24,
            alignItems: "center",
            opacity: fade,
            transform: [{ translateY: slide }]
          }}
        >
          <Area style={{ width: "100%" }}>
            <Button
              onPress={handleBack}
              style={{
                backgroundColor: "transparent",
                borderWidth: 1,
                borderColor: "#14532d",
                borderRadius: 16,
                paddingVertical: 14,
                width: "100%",
                alignItems: "center"
              }}
              textStyle={{ color: "#d1fae5", fontWeight: "700", textAlign: "center" }}
            >
              Voltar
            </Button>
          </Area>
        </Animated.View>
      </Container>
    </LinearGradient>
  );
};

export default RecoverPage;
