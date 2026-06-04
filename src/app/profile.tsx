import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Formik, FormikHelpers } from "formik";
import React from "react";
import { Alert, Animated, Easing, ScrollView, Text } from "react-native";
import AuthContext from "../AuthContext";
import { Area, Button, Container, Loading, TextInput, Title } from "../components";
import { isFirebaseReady, loadProfileFromCloud, saveProfileToCloud } from "../config/firebase";
import { loadProfileLocally, saveProfileLocally } from "../config/dexie";

const PROFILE_STORAGE_KEY = "user_profile";
const DEFAULT_TOKEN = "demo-token";

type ProfileValues = {
  name: string;
  email: string;
  password?: string;
  residence?: string;
  sports: string;
  dance: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?: [A-Za-zÀ-ÖØ-öø-ÿ]+)+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

const defaultValues: ProfileValues = {
  name: "",
  email: "",
  password: "",
  residence: "",
  sports: "",
  dance: ""
};

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { token, login } = React.useContext(AuthContext);
  const [initialValues, setInitialValues] = React.useState<ProfileValues>(defaultValues);
  const [profileLoading, setProfileLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const fadeTitle = React.useRef(new Animated.Value(0)).current;
  const slideForm = React.useRef(new Animated.Value(24)).current;
  const glow = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        if (isFirebaseReady && token) {
          const cloudProfile = await loadProfileFromCloud(token);
          if (cloudProfile) {
            setInitialValues({ ...defaultValues, ...(cloudProfile as Partial<ProfileValues>) });
          }
        }

        const stored = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Partial<ProfileValues>;
          setInitialValues((prev) => ({ ...prev, ...parsed }));
        }

        const localProfile = await loadProfileLocally();
        if (localProfile) {
          setInitialValues((prev) => ({ ...prev, ...localProfile }));
        }
      } catch (e) {
        console.warn("Falha ao carregar perfil", e);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();

    Animated.parallel([
      Animated.timing(fadeTitle, {
        toValue: 1,
        duration: 550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(slideForm, {
        toValue: 0,
        duration: 650,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false
          }),
          Animated.timing(glow, {
            toValue: 0,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false
          })
        ])
      )
    ]).start();
  }, []);

  const handleSaveProfile = async (
    values: ProfileValues,
    _helpers: FormikHelpers<ProfileValues>
  ) => {
    setSaving(true);
    try {
      if (isFirebaseReady && token) {
        await saveProfileToCloud(token, values);
      }

      await saveProfileLocally(values as any);
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(values));
      setInitialValues(values);
      Alert.alert("Perfil salvo", "Seus dados foram atualizados com sucesso na nuvem e localmente.");
    } catch (e) {
      console.warn("Erro ao salvar perfil", e);
      Alert.alert("Erro", "Não foi possível salvar seus dados no momento.");
    } finally {
      setSaving(false);
    }
  };

  const handleRegister = async (
    values: ProfileValues,
    _helpers: FormikHelpers<ProfileValues>
  ) => {
    setSaving(true);
    try {
      const tokenValue = DEFAULT_TOKEN;
      await login(tokenValue);

      if (isFirebaseReady) {
        await saveProfileToCloud(tokenValue, values);
      }

      await saveProfileLocally(values as any);
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(values));
      Alert.alert("Conta criada", "Agora você pode acessar o aplicativo completo com sincronização local e em nuvem.");
      router.replace("/nearby");
    } catch (e) {
      console.warn("Erro ao registrar", e);
      Alert.alert("Erro", "Não foi possível criar sua conta no momento.");
    } finally {
      setSaving(false);
    }
  };

  const isAuthenticated = !!token;
  const tabTitle = isAuthenticated ? "Meu Perfil" : "Criar Conta";
  const tabSubtitle = isAuthenticated
    ? "Atualize seus dados, residência, preferências de esportes e dança."
    : "Cadastre-se para acessar seu perfil e salvar suas preferências.";

  const titleAnimation = {
    opacity: fadeTitle,
    transform: [
      {
        translateY: fadeTitle.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0]
        })
      }
    ]
  };

  const formAnimation = {
    opacity: fadeTitle,
    transform: [
      {
        translateY: slideForm
      }
    ]
  };

  const glowBackground = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(59, 130, 246, 0.8)", "rgba(56, 189, 248, 1)"]
  });

  return (
    <LinearGradient colors={["#050a1e", "#091325", "#0c1c3a"]} style={{ flex: 1 }}>
      <Container style={{ flex: 1, padding: 24 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 44, gap: 22 }}>
          <Animated.View style={[{ width: "100%", alignItems: "center" }, titleAnimation]}>
            <Animated.View
              style={[
                {
                  width: "100%",
                  borderRadius: 28,
                  padding: 24,
                  backgroundColor: "rgba(15, 23, 42, 0.88)",
                  borderWidth: 1,
                  borderColor: "rgba(96, 165, 250, 0.18)",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 18 },
                  shadowOpacity: 0.18,
                  shadowRadius: 24,
                  elevation: 10,
                  overflow: "hidden"
                },
                titleAnimation
              ]}
            >
              <Title style={{ color: "#e2e8f0", fontSize: 32, fontWeight: "900", textAlign: "center" }}>
                {tabTitle}
              </Title>
              <Text style={{ color: "#93c5fd", textAlign: "center", marginTop: 12, fontSize: 15, lineHeight: 22 }}>
                {tabSubtitle}
              </Text>
              <Area
                style={{
                  position: "absolute",
                  top: 18,
                  right: 20,
                  width: 10,
                  height: 10,
                  borderRadius: 12,
                  backgroundColor: "#38bdf8"
                }}
              />
              <Area
                style={{
                  position: "absolute",
                  top: 28,
                  right: 34,
                  width: 6,
                  height: 6,
                  borderRadius: 8,
                  backgroundColor: "#60a5fa"
                }}
              />
            </Animated.View>
          </Animated.View>

          <Animated.View style={[{ width: "100%", gap: 18 }, formAnimation]}>
            <Formik
              initialValues={initialValues}
              enableReinitialize={isAuthenticated}
              validate={(values) => {
                const errors: Partial<Record<keyof ProfileValues, string>> = {};
                if (!values.name?.trim()) {
                  errors.name = "Informe um nome real.";
                } else if (!nameRegex.test(values.name.trim())) {
                  errors.name = "Use um nome real com pelo menos duas palavras.";
                }

                if (!isAuthenticated) {
                  if (!values.email?.trim()) {
                    errors.email = "Informe um e-mail válido.";
                  } else if (!emailRegex.test(values.email.trim())) {
                    errors.email = "Use um e-mail válido.";
                  }

                  if (!values.password) {
                    errors.password = "Informe uma senha forte.";
                  } else if (!passwordRegex.test(values.password)) {
                    errors.password = "Senha fraca: use 8+ caracteres, maiúscula, minúscula, número e símbolo.";
                  }
                }

                return errors;
              }}
              onSubmit={isAuthenticated ? handleSaveProfile : handleRegister}
            >
              {({ values, handleChange, handleBlur, handleSubmit: submit, errors, touched }) => (
                <Area style={{ width: "100%", gap: 16 }}>
                  <Area
                    style={{
                      width: "100%",
                      borderRadius: 24,
                      borderWidth: 1,
                      borderColor: "rgba(59, 130, 246, 0.18)",
                      backgroundColor: "rgba(15, 23, 42, 0.92)",
                      padding: 18,
                      gap: 14
                    }}
                  >
                    {!isAuthenticated ? (
                      <>
                        <TextInput
                          placeholder="Nome"
                          placeholderTextColor="#94a3b8"
                          value={values.name}
                          onChangeText={handleChange("name")}
                          onBlur={handleBlur("name")}
                          style={{
                            width: "100%",
                            color: "#f8fafc",
                            textAlign: "left",
                            borderWidth: 1,
                            borderColor: "rgba(56, 189, 248, 0.42)",
                            borderRadius: 16,
                            paddingVertical: 16,
                            paddingHorizontal: 18,
                            backgroundColor: "rgba(15, 23, 42, 0.95)"
                          }}
                        />
                        {touched.name && errors.name ? (
                          <Text style={{ color: "#38bdf8", textAlign: "left", fontSize: 13 }}>
                            {errors.name}
                          </Text>
                        ) : null}

                        <TextInput
                          placeholder="E-mail"
                          placeholderTextColor="#94a3b8"
                          value={values.email}
                          onChangeText={handleChange("email")}
                          onBlur={handleBlur("email")}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          style={{
                            width: "100%",
                            color: "#f8fafc",
                            textAlign: "left",
                            borderWidth: 1,
                            borderColor: "rgba(56, 189, 248, 0.42)",
                            borderRadius: 16,
                            paddingVertical: 16,
                            paddingHorizontal: 18,
                            backgroundColor: "rgba(15, 23, 42, 0.95)"
                          }}
                        />
                        {touched.email && errors.email ? (
                          <Text style={{ color: "#38bdf8", textAlign: "left", fontSize: 13 }}>
                            {errors.email}
                          </Text>
                        ) : null}

                        <TextInput
                          placeholder="Senha"
                          placeholderTextColor="#94a3b8"
                          value={values.password ?? ""}
                          onChangeText={handleChange("password")}
                          onBlur={handleBlur("password")}
                          secureTextEntry
                          style={{
                            width: "100%",
                            color: "#f8fafc",
                            textAlign: "left",
                            borderWidth: 1,
                            borderColor: "rgba(56, 189, 248, 0.42)",
                            borderRadius: 16,
                            paddingVertical: 16,
                            paddingHorizontal: 18,
                            backgroundColor: "rgba(15, 23, 42, 0.95)"
                          }}
                        />
                        {touched.password && errors.password ? (
                          <Text style={{ color: "#38bdf8", textAlign: "left", fontSize: 13 }}>
                            {errors.password}
                          </Text>
                        ) : null}

                        <TextInput
                          placeholder="Residência"
                          placeholderTextColor="#94a3b8"
                          value={values.residence}
                          onChangeText={handleChange("residence")}
                          style={{
                            width: "100%",
                            color: "#f8fafc",
                            textAlign: "left",
                            borderWidth: 1,
                            borderColor: "rgba(56, 189, 248, 0.42)",
                            borderRadius: 16,
                            paddingVertical: 16,
                            paddingHorizontal: 18,
                            backgroundColor: "rgba(15, 23, 42, 0.95)"
                          }}
                        />
                      </>
                    ) : null}

                    <TextInput
                      placeholder="Esportes preferidos"
                      placeholderTextColor="#94a3b8"
                      value={values.sports}
                      onChangeText={handleChange("sports")}
                      style={{
                        width: "100%",
                        color: "#f8fafc",
                        textAlign: "left",
                        borderWidth: 1,
                        borderColor: "rgba(56, 189, 248, 0.42)",
                        borderRadius: 16,
                        paddingVertical: 16,
                        paddingHorizontal: 18,
                        backgroundColor: "rgba(15, 23, 42, 0.95)"
                      }}
                    />
                    <TextInput
                      placeholder="Dança preferida"
                      placeholderTextColor="#94a3b8"
                      value={values.dance}
                      onChangeText={handleChange("dance")}
                      style={{
                        width: "100%",
                        color: "#f8fafc",
                        textAlign: "left",
                        borderWidth: 1,
                        borderColor: "rgba(56, 189, 248, 0.42)",
                        borderRadius: 16,
                        paddingVertical: 16,
                        paddingHorizontal: 18,
                        backgroundColor: "rgba(15, 23, 42, 0.95)"
                      }}
                    />
                  </Area>

                  <Button
                    onPress={() => submit()}
                    disabled={saving}
                    style={{
                      backgroundColor: saving ? "rgba(59, 130, 246, 0.7)" : "#3b82f6",
                      borderRadius: 22,
                      paddingVertical: 18,
                      paddingHorizontal: 24,
                      alignItems: "center",
                      width: "100%",
                      shadowColor: "#2563eb",
                      shadowOffset: { width: 0, height: 12 },
                      shadowOpacity: 0.25,
                      shadowRadius: 22,
                      elevation: 9
                    }}
                    textStyle={{ color: "#f8fafc", fontWeight: "800", fontSize: 16, textAlign: "center" }}
                  >
                    {saving ? <Loading color="#f8fafc" /> : isAuthenticated ? "Salvar perfil" : "Criar conta"}
                  </Button>
                </Area>
              )}
            </Formik>
          </Animated.View>
        </ScrollView>
      </Container>
    </LinearGradient>
  );
};

export default ProfilePage;
