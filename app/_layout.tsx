import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [loaded] = useFonts({
        SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    });

    if (!loaded) {
        // Async font loading only occurs in development.
        return null;
    }

    return (
        <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
            <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen
                    name="verification-info"
                    options={{
                        headerShown: false,
                        title: "",
                    }}
                />
                <Stack.Screen
                    name="verification-identity"
                    options={{
                        headerShown: true,
                        title: "",
                        headerStyle: {
                            backgroundColor: 'transparent',
                        },
                        headerShadowVisible: false,
                        headerTitleStyle: {
                            color: '#2c3e50',
                            fontSize: 18,
                            fontWeight: '600',
                        },
                        headerTransparent: true,
                    }}
                />
                <Stack.Screen
                    name="verification-face"
                    options={{
                        headerShown: true,
                        title: "",
                        headerStyle: {
                            backgroundColor: 'transparent',
                        },
                        headerShadowVisible: false,
                        headerTitleStyle: {
                            color: '#2c3e50',
                            fontSize: 18,
                            fontWeight: '600',
                        },
                        headerTransparent: true,
                    }}
                />
                <Stack.Screen
                    name="verification-video-call"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
        </ThemeProvider>
    );
}
