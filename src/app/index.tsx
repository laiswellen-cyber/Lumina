import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Formik, FormikHelpers } from "formik";
import React from "react";
import { Alert, Dimensions, Image, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import AuthContext from "../AuthContext";
import { Button, Loading, TextInput } from "../components";
import { GRAPHQL_ENDPOINT } from "../config/auth";

const SPORTS = ["Futebol", "Vôlei", "Basquete", "Natação", "Corrida", "Yoga", "Musculação", "Ciclismo"];
const DEFAULT_TOKEN = "demo-token";

const SIGN_UP_QUERY = `
  mutation SignUp($name: String!, $email: String!, $password: String!, $height: Float!, $weight: Float!) {
    signUp(name: $name, email: $email, password: $password, height: $height, weight: $weight) {
      token
    }
  }
`;

type SignUpValues = {
  name: string;
  email: string;
  password: string;
};

const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?: [A-Za-zÀ-ÖØ-öø-ÿ]+)+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

const LandingPage: React.FC = () => {
  const router = useRouter();
  const { token, loading, login } = React.useContext(AuthContext);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [sportsMenuOpen, setSportsMenuOpen] = React.useState(false);
  const [selectedSports, setSelectedSports] = React.useState<string[]>([]);
  const [signUpModalOpen, setSignUpModalOpen] = React.useState(false);
  const [signUpLoading, setSignUpLoading] = React.useState(false);

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

  const handleSignUp = async (
    values: SignUpValues,
    _helpers: FormikHelpers<SignUpValues>
  ) => {
    setSignUpLoading(true);

    try {
      const height = 0;
      const weight = 0;
      let tokenValue = DEFAULT_TOKEN;

      const endpoint = String(GRAPHQL_ENDPOINT || "");
      const canUseApi = endpoint.length > 0 && !endpoint.includes("your-graphql-endpoint.com");
      if (canUseApi) {
        const response = await fetch(GRAPHQL_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            query: SIGN_UP_QUERY,
            variables: {
              name: values.name,
              email: values.email,
              password: values.password,
              height,
              weight
            }
          })
        });

        const json = await response.json();
        if (!response.ok || json.errors) {
          const message = json.errors?.[0]?.message || "Erro ao criar conta";
          throw new Error(message);
        }

        tokenValue = json.data?.signUp?.token;
        if (!tokenValue) {
          throw new Error("Token não retornado");
        }
      } else {
        console.warn("GRAPHQL_ENDPOINT não configurado. Usando modo demo para cadastro.");
      }

      await login(tokenValue ?? DEFAULT_TOKEN);
      Alert.alert("Conta criada", "Cadastro realizado com sucesso.");
      setSignUpModalOpen(false);
      router.replace("/nearby");
    } catch (e) {
      console.log(e);
      Alert.alert("Erro!", `${e instanceof Error ? e.message : "Falha na requisição"}`);
    } finally {
      setSignUpLoading(false);
    }
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
        onPress={() => setSignUpModalOpen(true)}
        style={{ marginTop: 24, backgroundColor: "#8b5cf6", borderRadius: 16, paddingVertical: 14, alignItems: "center" }}
        textStyle={{ color: "#ffffff", fontWeight: "700", fontSize: 16, textAlign: "center" }}
      >
        Criar conta
      </Button>

      <Modal
        animationType="slide"
        transparent={true}
        visible={signUpModalOpen}
        onRequestClose={() => setSignUpModalOpen(false)}
      >
        <LinearGradient colors={["#050816", "#0b1120"]} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingVertical: 24 }}>
            <View style={{ width: "100%", alignItems: "center", marginBottom: 24 }}>
              <TouchableOpacity
                onPress={() => setSignUpModalOpen(false)}
                style={{ position: "absolute", top: 0, right: 0, zIndex: 10, padding: 12 }}
              >
                <Ionicons name="close" size={28} color="#f8fafc" />
              </TouchableOpacity>
              <Text style={{ color: "#f8fafc", fontSize: 28, fontWeight: "bold", textAlign: "center", marginTop: 20 }}>
                Criar Conta
              </Text>
            </View>

            <View style={{ width: "100%", alignItems: "center" }}>
              <Formik
                initialValues={{ name: "", email: "", password: "" }}
                validate={(values) => {
                  const errors: Partial<Record<keyof typeof values, string>> = {};

                  if (!values.name.trim()) {
                    errors.name = "Informe um nome real.";
                  } else if (!nameRegex.test(values.name.trim())) {
                    errors.name = "Use um nome real com pelo menos duas palavras.";
                  }

                  if (!values.email.trim()) {
                    errors.email = "Informe um e-mail válido.";
                  } else if (!emailRegex.test(values.email.trim())) {
                    errors.email = "Use um e-mail válido como gmail.com ou hotmail.com.";
                  }

                  if (!values.password) {
                    errors.password = "Informe uma senha forte.";
                  } else if (!passwordRegex.test(values.password)) {
                    errors.password = "Senha fraca: use 8+ caracteres, maiúscula, minúscula, número e símbolo.";
                  }

                  return errors;
                }}
                onSubmit={handleSignUp}
              >
                {({ values, handleChange, handleSubmit: submit, handleBlur, errors, touched }) => (
                  <View style={{ width: "100%", gap: 12 }}>
                    <TextInput
                      placeholder="Nome"
                      placeholderTextColor="#94a3b8"
                      value={values.name}
                      onChangeText={handleChange("name")}
                      onBlur={handleBlur("name")}
                      style={{
                        width: "100%",
                        color: "#f8fafc",
                        textAlign: "center",
                        borderWidth: 1,
                        borderColor: "#334155",
                        borderRadius: 14,
                        paddingVertical: 14,
                        paddingHorizontal: 16,
                        backgroundColor: "#0f172a"
                      }}
                    />
                    {touched.name && errors.name ? (
                      <Text style={{ color: "#f97316", textAlign: "center", marginTop: -8, marginBottom: 8 }}>
                        {errors.name}
                      </Text>
                    ) : null}
                    <TextInput
                      placeholder="E-mail"
                      placeholderTextColor="#94a3b8"
                      value={values.email}
                      onChangeText={handleChange("email")}
                      onBlur={handleBlur("email")}
                      style={{
                        width: "100%",
                        color: "#f8fafc",
                        textAlign: "center",
                        borderWidth: 1,
                        borderColor: "#334155",
                        borderRadius: 14,
                        paddingVertical: 14,
                        paddingHorizontal: 16,
                        backgroundColor: "#0f172a"
                      }}
                      keyboardType="email-address"
                    />
                    {touched.email && errors.email ? (
                      <Text style={{ color: "#f97316", textAlign: "center", marginTop: -8, marginBottom: 8 }}>
                        {errors.email}
                      </Text>
                    ) : null}
                    <TextInput
                      placeholder="Senha"
                      placeholderTextColor="#94a3b8"
                      value={values.password}
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
                      secureTextEntry
                      style={{
                        width: "100%",
                        color: "#f8fafc",
                        textAlign: "center",
                        borderWidth: 1,
                        borderColor: "#334155",
                        borderRadius: 14,
                        paddingVertical: 14,
                        paddingHorizontal: 16,
                        backgroundColor: "#0f172a"
                      }}
                    />
                    {touched.password && errors.password ? (
                      <Text style={{ color: "#f97316", textAlign: "center", marginTop: -8, marginBottom: 8 }}>
                        {errors.password}
                      </Text>
                    ) : null}
                    <Button
                      onPress={() => submit()}
                      disabled={signUpLoading}
                      style={{
                        backgroundColor: signUpLoading ? "#475569" : "#4f46e5",
                        borderRadius: 16,
                        paddingVertical: 16,
                        paddingHorizontal: 22,
                        alignItems: "center",
                        marginTop: 14,
                        width: "100%",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.28,
                        shadowRadius: 16,
                        elevation: 10
                      }}
                      textStyle={{
                        color: "#f8fafc",
                        fontWeight: "700",
                        fontSize: 16,
                        textAlign: "center"
                      }}
                    >
                      {signUpLoading ? <Loading color="#f8fafc" /> : "Criar Conta"}
                    </Button>
                  </View>
                )}
              </Formik>
            </View>
          </ScrollView>
        </LinearGradient>
      </Modal>

      </ScrollView>
    </View>
  );
};

export default LandingPage;
