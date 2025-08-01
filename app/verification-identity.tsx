import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import GradientButton from "@/components/ui/GradientButton";
import ScreenHeader from "@/components/ui/ScreenHeader";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import ActionSheet from "react-native-actions-sheet";

export default function VerificationIdentity() {
    const router = useRouter();
    const [image, setImage] = useState(null);
    const actionSheetRef = useRef<any>(null);

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
            setImage(result.assets[0].uri as any);
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
            setImage(result.assets[0].uri as any);
        }
    };

    const showActionSheet = () => {
        actionSheetRef.current?.show();
    };

    const handleActionSheetPress = (action: string) => {
        actionSheetRef.current?.hide();
        if (action === 'gallery') {
            pickImage();
        } else if (action === 'camera') {
            captureImage();
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

                <TouchableOpacity onPress={showActionSheet} activeOpacity={0.8}>
                    {image ? (
                        <ThemedView style={styles.previewContainer}>
                            <ThemedText style={styles.previewLabel}>
                                Preview e-KTP:
                            </ThemedText>
                            <Image source={{ uri: image }} style={styles.preview} />
                            <ThemedText style={styles.tapToChangeText}>
                                Tap untuk mengubah gambar
                            </ThemedText>
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
                                Tap untuk memilih foto e-KTP
                            </ThemedText>
                        </ThemedView>
                    )}
                </TouchableOpacity>
            </ScrollView>

            <GradientButton
                title="Lanjutkan"
                onPress={() => router.push("/verification-face")}
                style={[styles.nextButton, !image && styles.disabledButton]}
                disabled={!image}
            />

            <ActionSheet
                ref={actionSheetRef}
                containerStyle={styles.actionSheetContainer}
                indicatorStyle={styles.actionSheetIndicator}
                gestureEnabled={true}
                defaultOverlayOpacity={0.3}
            >
                <ThemedView style={styles.actionSheetContent}>
                    <ThemedText style={styles.actionSheetTitle}>
                        Pilih Sumber Gambar
                    </ThemedText>
                    
                    <TouchableOpacity
                        style={styles.actionSheetButton}
                        onPress={() => handleActionSheetPress('gallery')}
                    >
                        <ThemedText style={styles.actionSheetButtonText}>
                            Pilih dari Galeri
                        </ThemedText>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.actionSheetButton}
                        onPress={() => handleActionSheetPress('camera')}
                    >
                        <ThemedText style={styles.actionSheetButtonText}>
                            Gunakan Kamera
                        </ThemedText>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[styles.actionSheetButton, styles.cancelButton]}
                        onPress={() => actionSheetRef.current?.hide()}
                    >
                        <ThemedText style={styles.cancelButtonText}>
                            Batal
                        </ThemedText>
                    </TouchableOpacity>
                </ThemedView>
            </ActionSheet>
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
        paddingTop: 100, // Space for the transparent header
        paddingBottom: 100, // Space for the fixed button
    },
    previewContainer: {
        alignItems: "center",
        marginBottom: 20,
        backgroundColor: "#ffffff",
        padding: 20,
        borderRadius: 12,
    },
    previewLabel: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 15,
        color: "#2c3e50",
    },
    preview: {
        width: "100%",
        height: 200,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#FFD700",
    },
    tapToChangeText: {
        fontSize: 12,
        color: "#2c3e50",
        marginTop: 10,
        fontWeight: "600",
    },
    placeholderContainer: {
        width: "100%",
        height: 220,
        borderRadius: 12,
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
        color: "#2c3e50",
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 5,
    },
    placeholderSubtext: {
        color: "#2c3e50",
        fontSize: 12,
        fontWeight: "400",
    },
    nextButton: {
        position: "absolute",
        bottom: 30,
        left: 20,
        right: 20,
    },
    disabledButton: {
        opacity: 0.6,
    },
    // Action Sheet Styles
    actionSheetContainer: {
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        backgroundColor: "#ffffff",
    },
    actionSheetIndicator: {
        backgroundColor: "#e0e0e0",
        width: 40,
        height: 4,
    },
    actionSheetContent: {
        padding: 20,
        paddingTop: 10,
    },
    actionSheetTitle: {
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 20,
        color: "#2c3e50",
    },
    actionSheetButton: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: "#f8f9fa",
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#e9ecef",
    },
    actionSheetButtonText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#2c3e50",
        textAlign: "center",
    },
    cancelButton: {
        backgroundColor: "#ffffff",
        borderColor: "#dc3545",
        marginTop: 10,
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#dc3545",
        textAlign: "center",
    },
});
