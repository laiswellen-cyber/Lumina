import React from "react";
import {
    ActivityIndicator,
    ActivityIndicatorProps,
    TextInput as RNTextInput,
    Text,
    TextProps,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
    ViewProps
} from "react-native";

export const Container: React.FC<ViewProps> = ({ children, ...rest }) => (
  <View {...rest}>{children}</View>
);

export const Area: React.FC<ViewProps> = ({ children, ...rest }) => (
  <View {...rest}>{children}</View>
);

type ButtonProps = TouchableOpacityProps & {
  children: React.ReactNode;
  textStyle?: TextStyle;
};

export const Button: React.FC<ButtonProps> = ({ children, textStyle, style, ...rest }) => (
  <TouchableOpacity style={style} {...rest}>
    <Text style={textStyle}>{children}</Text>
  </TouchableOpacity>
);

export const Loading: React.FC<ActivityIndicatorProps> = (props) => <ActivityIndicator {...props} />;

export const TextInput: React.FC<any> = (props) => <RNTextInput {...props} />;

export const Title: React.FC<TextProps> = (props) => <Text {...props} />;

export { Icon } from "./Icon";

export default {
  Container,
  Area,
  Button,
  Loading,
  TextInput,
  Title
};
