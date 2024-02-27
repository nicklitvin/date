import { styled } from "nativewind";
import { View as RNView, TouchableOpacity as RNTouch, Text as RNText, TextInput as RNInput, ScrollView as RNScroll} from "react-native";
import { Image } from "expo-image";

export const StyledView = styled(RNView);
export const StyledButton = styled(RNTouch);
export const StyledText = styled(RNText);
export const StyledInput = styled(RNInput);
export const StyledScroll = styled(RNScroll);
export const StyledImage = styled(Image);