import React from "react";
import { View, Text, Alert, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Formik } from "formik";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TextInput, Button } from "../components";
import { GRAPHQL_ENDPOINT } from "../config/auth";
import AuthContext from "../AuthContext";

const PROFILE_KEY = "user_profile";

type ProfileValues = {
  name: string;
  email: string;
  height: string;
  weight: string;
};

const ProfilePage: React.FC = () => {
  const [initial, setInitial] = React.useState<ProfileValues>({ name: "", email: "", height: "", weight: "" });
  const authContext = React.useContext(AuthContext);

  React.useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PROFILE_KEY);
        if (raw) {
          setInitial(JSON.parse(raw));
        }
      } catch (e) {
        console.warn(e);
      }
    })();
  }, []);

  const save = async (values: ProfileValues) => {
    try {
      // Try to save to GraphQL API if configured
      const endpoint = String(GRAPHQL_ENDPOINT || "");
      const canUseApi = endpoint.length > 0 && !endpoint.includes("your-graphql-endpoint.com");

      if (canUseApi && authContext.token) {
        const UPDATE_PROFILE = `
          mutation UpdateProfile($name: String!, $email: String!, $height: Float, $weight: Float) {
            updateProfile(name: $name, email: $email, height: $height, weight: $weight) {
              success
            }
          }
        `;

        const variables = {
          name: values.name,
          email: values.email,
          height: values.height ? Number(values.height) : null,
          weight: values.weight ? Number(values.weight) : null
        };

        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authContext.token}`
            },
            body: JSON.stringify({ query: UPDATE_PROFILE, variables })
          });

          const json = await res.json();
          if (!res.ok || json.errors) {
            console.warn("GraphQL updateProfile failed", json.errors);
            // fallback to local save
            await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(values));
            Alert.alert("Perfil", "Dados salvos localmente (API indisponível).");
            return;
          }

          await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(values));
          Alert.alert("Perfil", "Dados salvos no servidor.");
          return;
        } catch (err) {
          console.warn("Falha ao chamar API de perfil", err);
          await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(values));
          Alert.alert("Perfil", "Dados salvos localmente (erro de rede).");
          return;
        }
      }

      // Fallback local save when API not configured or no token
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(values));
      Alert.alert("Perfil", "Dados salvos localmente.");
    } catch (e) {
      console.warn(e);
      Alert.alert("Erro", "Falha ao salvar perfil.");
    }
  };

  return (
    <LinearGradient colors={["#0c2c5a", "#071a3b"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ color: "#f8fafc", fontSize: 22, fontWeight: "800", marginBottom: 12 }}>Meu Perfil</Text>

        <Formik initialValues={initial} enableReinitialize onSubmit={save}>
          {({ values, handleChange, handleSubmit }) => (
            <View style={{ gap: 12 }}>
              <TextInput placeholder="Nome" value={values.name} onChangeText={handleChange("name")} />
              <TextInput placeholder="E-mail" value={values.email} onChangeText={handleChange("email")} keyboardType="email-address" />
              <TextInput placeholder="Altura (cm)" value={values.height} onChangeText={handleChange("height")} keyboardType="decimal-pad" />
              <TextInput placeholder="Peso (kg)" value={values.weight} onChangeText={handleChange("weight")} keyboardType="decimal-pad" />

              <Button onPress={() => handleSubmit()} style={{ marginTop: 8 }}>Salvar Perfil</Button>
            </View>
          )}
        </Formik>
      </ScrollView>
    </LinearGradient>
  );
};

export default ProfilePage;
