import React from "react";
import { View, Text, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Area, Button, Container, Title } from "../components";

const PROJECTS = [
  {
    id: "esporte_na_praca",
    title: "Esporte na Praça",
    description: "Aulas gratuitas de ginástica, zumba e alongamento em praças públicas de Itapevi, com instrutores municipais.",
    highlight: "Circuito de exercícios ao ar livre para toda a família."
  },
  {
    id: "jovem_atleta",
    title: "Jovem Atleta Itapeviense",
    description: "Programa de bolsas e treinos para jovens em escolinhas de futebol, basquete e atletismo das regiões próximas.",
    highlight: "Apoio a talentos locais com seleção municipal e competições."
  },
  {
    id: "academia_ao_ar_livre",
    title: "Academia ao Ar Livre",
    description: "Instalação de estações de força e alongamento em parques e praças para promover atividade física gratuita.",
    highlight: "Espaços integrados para saúde, com orientação e acesso livre."
  },
  {
    id: "circuito_da_saude",
    title: "Circuito da Saúde",
    description: "Rotas de caminhada e corrida sinalizadas em bairros estratégicos com pontos de hidratação e informações de saúde.",
    highlight: "Percursos seguros para caminhadas diárias e treinos ao ar livre."
  }
];

const ProjectsPage: React.FC = () => {
  const router = useRouter();

  return (
    <LinearGradient colors={["#050816", "#0b1120"]} style={{ flex: 1 }}>
      <Container style={{ flex: 1, padding: 24 }}>
        <Area style={{ marginBottom: 20 }}>
          <Title style={{ color: "#f8fafc", fontSize: 28, fontWeight: "bold", textAlign: "center" }}>
            Projetos esportivos de Itapevi
          </Title>
        </Area>

        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {PROJECTS.map((project) => (
            <View
              key={project.id}
              style={{
                backgroundColor: "#071028",
                borderRadius: 18,
                padding: 16,
                marginBottom: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 4
              }}
            >
              <Text style={{ color: "#e2e8f0", fontSize: 18, fontWeight: "700", marginBottom: 8 }}>{project.title}</Text>
              <Text style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 20 }}>{project.description}</Text>
              <Text style={{ color: "#60a5fa", marginTop: 10, fontWeight: "700" }}>{project.highlight}</Text>
            </View>
          ))}
        </ScrollView>

        <Area style={{ width: "100%", marginTop: 8 }}>
          <Button
            onPress={() => router.push("/")}
            style={{
              backgroundColor: "transparent",
              borderWidth: 1,
              borderColor: "#475569",
              borderRadius: 16,
              paddingVertical: 14,
              width: "100%"
            }}
            textStyle={{ color: "#cbd5e1", fontWeight: "700", textAlign: "center" }}
          >
            Voltar para Início
          </Button>
        </Area>
      </Container>
    </LinearGradient>
  );
};

export default ProjectsPage;
