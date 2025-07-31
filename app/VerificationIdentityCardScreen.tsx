import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import GradientButton from "@/components/ui/GradientButton";
import ScreenHeader from "@/components/ui/ScreenHeader";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, ScrollView, StyleSheet } from "react-native";

export default function VerificationIdentityCardScreen() {
    const router = useRouter();
    const [image, setImage] = useState(null);

    const requestPermissions = async () => {
        const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permission needed",
                "We need camera roll permissions to upload images."
            );
            return false;
        }
        return true;
    };

    const requestCameraPermissions = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permission needed",
                "We need camera permissions to take photos."
            );
            return false;
        }
        return true;
    };

    const pickImage = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const captureImage = async () => {
        const hasPermission = await requestCameraPermissions();
        if (!hasPermission) return;

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
            >
                <ScreenHeader
                    title="Verifikasi Identitas"
                    subheading="Unggah atau ambil foto e-KTP Anda untuk melanjutkan proses pendaftaran"
                />

                {image ? (
                    <ThemedView style={styles.previewContainer}>
                        <ThemedText style={styles.previewLabel}>
                            Preview e-KTP:
                        </ThemedText>
                        <Image source={{ uri: image }} style={styles.preview} />
                    </ThemedView>
                ) : (
                    <ThemedView style={styles.placeholderContainer}>
                        <ThemedText style={styles.placeholderIcon}>
                            📄
                        </ThemedText>
                        <ThemedText style={styles.placeholderText}>
                            Belum ada gambar yang dipilih
                        </ThemedText>
                        <ThemedText style={styles.placeholderSubtext}>
                            Unggah foto e-KTP Anda
                        </ThemedText>
                    </ThemedView>
                )}

                <ThemedView style={styles.actionContainer}>
                    <GradientButton
                        title="📁 Pilih dari Galeri"
                        onPress={pickImage}
                        style={styles.actionButton}
                        gradientColors={["#4A90E2", "#357ABD", "#2E6DA4"]}
                        borderColor="#4A90E2"
                    />

                    <GradientButton
                        title="📷 Gunakan Kamera"
                        onPress={captureImage}
                        style={styles.actionButton}
                        gradientColors={["#5CB85C", "#449D44", "#398439"]}
                        borderColor="#5CB85C"
                    />
                </ThemedView>
            </ScrollView>
            
            <GradientButton
                title="Lanjutkan"
                onPress={() => router.push("/FaceRecognitionScreen")}
                style={styles.nextButton}
                disabled={!image}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100, // Space for the fixed button
    },
    previewContainer: {
        alignItems: "center",
        marginBottom: 30,
        backgroundColor: "#ffffff",
        padding: 20,
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    previewLabel: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 15,
        color: "#2c3e50",
    },
    preview: {
        width: "100%",
        height: 200,
        borderRadius: 12,
        borderWidth: 3,
        borderColor: "#FFD700",
    },
    placeholderContainer: {
        width: "100%",
        height: 220,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: "#e0e0e0",
        borderStyle: "dashed",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 30,
        backgroundColor: "#ffffff",
    },
    placeholderIcon: {
        fontSize: 48,
        marginBottom: 10,
    },
    placeholderText: {
        color: "#7f8c8d",
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 5,
    },
    placeholderSubtext: {
        color: "#bdc3c7",
        fontSize: 14,
    },
    actionContainer: {
        gap: 15,
        marginBottom: 20,
    },
    actionButton: {
        marginBottom: 0,
    },
    nextButton: {
        position: "absolute",
        bottom: 30,
        left: 20,
        right: 20,
    },
});
