import React from "react";
import { Image, ImageSourcePropType, Text, View, ImageStyle } from "react-native";

type IconProps = {
  name?: string; // optional key to map to asset
  emojiFallback?: string;
  style?: ImageStyle | any;
  size?: number;
};

const ICON_MAP: Record<string, ImageSourcePropType> = {
  // If you add images to assets/icons, map them here, e.g.
  // park: require("../../assets/icons/park.png"),
};

export const Icon: React.FC<IconProps> = ({ name, emojiFallback = "📍", size = 24, style }) => {
  if (name && ICON_MAP[name]) {
    return <Image source={ICON_MAP[name]} style={[{ width: size, height: size }, style as any]} />;
  }
  return (
    <View style={style}>
      <Text style={{ fontSize: size }}>{emojiFallback}</Text>
    </View>
  );
};

export default Icon;
