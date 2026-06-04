import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import Animated from "react-native-reanimated";
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
          tabBarIcon: ({ color, size, focused }) => {
            let iconName: React.ComponentProps<typeof Ionicons>["name"] = "home";

            if (route.name === "projects") {
              iconName = "trophy";
            } else if (route.name === "nearby") {
              iconName = "map";
            } else if (route.name === "recover") {
              iconName = "barbell";
            }

            return (
              <Animated.View style={{ opacity: focused ? 1 : 0.6 }}>
                <Ionicons name={iconName} size={size} color={color} />
              </Animated.View>
            );
          },
        })}
      >
        <Tabs.Screen name="index" options={{ title: "Início" }} />
        <Tabs.Screen name="projects" options={{ title: "Projetos" }} />
        <Tabs.Screen name="nearby" options={{ title: "Locais" }} />
        <Tabs.Screen name="recover" options={{ title: "IMC" }} />
      </Tabs>
    </AuthProvider>
  );
};

export default Layout;
