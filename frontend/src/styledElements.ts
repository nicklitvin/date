import { styled } from "nativewind";
import { View as RNView, TouchableOpacity as RNTouch, Text as RNText, TextInput as RNInput, ScrollView as RNScroll, Modal} from "react-native";
import { Image } from "expo-image";
import Slider from "@react-native-community/slider";

export const StyledView = styled(RNView);
export const StyledButton = styled(RNTouch);
export const StyledText = styled(RNText);
export const StyledInput = styled(RNInput);
export const StyledScroll = styled(RNScroll);
export const StyledImage = styled(Image);
export const StyledSlider = styled(Slider);
export const StyledModal = styled(Modal);