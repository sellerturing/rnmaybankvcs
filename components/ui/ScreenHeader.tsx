import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { StyleSheet, View } from "react-native";

interface ScreenHeaderProps {
    title: string;
    subheading?: string;
    titleStyle?: any;
    subheadingStyle?: any;
    containerStyle?: any;
}

export default function ScreenHeader({
    title,
    subheading,
    titleStyle,
    subheadingStyle,
    containerStyle,
}: ScreenHeaderProps) {
    return (
        <View style={[styles.container, containerStyle]}>
            <ThemedText style={[styles.title, titleStyle]}>{title}</ThemedText>
            {subheading && (
                <ThemedText style={[styles.subheading, subheadingStyle]}>
                    {subheading}
                </ThemedText>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 30,
        marginTop: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 10,
        color: "#2c3e50",
    },
    subheading: {
        fontSize: 16,
        textAlign: "center",
        color: "#7f8c8d",
        lineHeight: 22,
        width: "80%",
        alignSelf: "center",
    },
});
