import { Formik, FormikHelpers } from "formik";
import React from "react";
import { Alert, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import AuthContext from "../AuthContext";
import { Area, Button, Container, Loading, TextInput, Title } from "../components";
import { GRAPHQL_ENDPOINT } from "../config/auth";

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

const SignUpPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const { login } = React.useContext(AuthContext);

  const handleSubmit = async (
    values: SignUpValues,
    _helpers: FormikHelpers<SignUpValues>
  ) => {
    setLoading(true);

    try {
      const height = 0;
      const weight = 0;
      let token = DEFAULT_TOKEN;

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

        token = json.data?.signUp?.token;
        if (!token) {
          throw new Error("Token não retornado");
        }
      } else {
        console.warn("GRAPHQL_ENDPOINT não configurado. Usando modo demo para cadastro.");
      }

      await login(token ?? DEFAULT_TOKEN);
      Alert.alert("Conta criada", "Cadastro realizado com sucesso.");
      router.push("/nearby");
    } catch (e) {
      console.log(e);
      Alert.alert("Erro!", `${e instanceof Error ? e.message : "Falha na requisição"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#050816", "#0b1120"]} style={{ flex: 1 }}>
      <Container style={{ flex: 1, padding: 24, justifyContent: "center" }}>
        <Area style={{ width: "100%", alignItems: "center", marginBottom: 24 }}>
          <Title style={{ fontSize: 28, fontWeight: "bold", textAlign: "center", color: "#f8fafc" }}>
            Criar Conta
          </Title>
        </Area>

        <Area style={{ width: "100%", alignItems: "center" }}>
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
            onSubmit={handleSubmit}
          >
            {({ values, handleChange, handleSubmit: submit, handleBlur, errors, touched }) => (
              <Area style={{ width: "100%", gap: 12 }}>
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
                  disabled={loading}
                  style={{
                    backgroundColor: loading ? "#475569" : "#4f46e5",
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
                  {loading ? <Loading color="#f8fafc" /> : "Criar Conta"}
                </Button>
              </Area>
            )}
          </Formik>
        </Area>

        <Area style={{ width: "100%", alignItems: "center", marginTop: 18 }}>
          <Button
            onPress={() => router.push("/recover")}
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
            Já tenho conta, recuperar acesso
          </Button>
        </Area>
      </Container>
    </LinearGradient>
  );
};

export default SignUpPage;
