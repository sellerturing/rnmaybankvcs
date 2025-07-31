import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import GradientButton from "@/components/ui/GradientButton";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, TextInput } from "react-native";

export default function RegisterScreen() {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");

    const handleRegister = () => {
        router.push("/verification-identity");
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
            >
                <ScreenHeader
                    title="Nasabah Baru"
                    subheading="Siapkan terlebih dulu e-KTP dan NPWP untuk memudahkan pengisian data"
                />

                <ThemedText style={styles.label}>Nama Lengkap</ThemedText>
                <TextInput
                    style={styles.input}
                    placeholder="Masukkan Nama Lengkap"
                    value={fullName}
                    onChangeText={setFullName}
                />

                <ThemedText style={styles.label}>Alamat</ThemedText>
                <TextInput
                    style={styles.input}
                    placeholder="Masukkan alamat lengkap"
                    value={address}
                    onChangeText={setAddress}
                    multiline
                />

                <ThemedText style={styles.label}>Nomor Telepon</ThemedText>
                <TextInput
                    style={styles.input}
                    placeholder="Masukkan nomor telepon"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                />
            </ScrollView>

            <GradientButton
                title="Daftar"
                onPress={handleRegister}
                style={styles.button}
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
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 2,
        color: "#34495e",
    },
    input: {
        height: 50,
        borderColor: "#e0e0e0",
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 15,
        borderRadius: 10,
        backgroundColor: "#ffffff",
        fontSize: 16,
    },
    button: {
        position: "absolute",
        bottom: 30,
        left: 20,
        right: 20,
    },
});
