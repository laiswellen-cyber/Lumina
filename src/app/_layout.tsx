import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AuthProvider } from "../AuthContext";

const Layout: React.FC = () => {
  return (
    <AuthProvider>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "#f8fafc",
          tabBarInactiveTintColor: "#94a3b8",
          tabBarStyle: {
            backgroundColor: "#050816",
            borderTopColor: "#0b1120",
            height: 70,
            paddingBottom: 8,
          },
          tabBarIcon: ({ color, size }) => {
            let iconName: React.ComponentProps<typeof Ionicons>["name"] = "home";

            if (route.name === "projects") {
              iconName = "trophy";
            } else if (route.name === "nearby") {
              iconName = "map";
            } else if (route.name === "recover") {
              iconName = "barbell";
            } else if (route.name === "profile") {
              iconName = "person";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tabs.Screen name="index" options={{ title: "Início" }} />
        <Tabs.Screen name="projects" options={{ title: "Projetos" }} />
        <Tabs.Screen name="nearby" options={{ title: "Locais" }} />
        <Tabs.Screen name="recover" options={{ title: "IMC" }} />
        <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
      </Tabs>
    </AuthProvider>
  );
};

export default Layout;
