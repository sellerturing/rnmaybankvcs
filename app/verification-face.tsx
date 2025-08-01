import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import GradientButton from '@/components/ui/GradientButton';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Snackbar from 'react-native-snackbar';

export default function VerificationFace() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);

  const startFaceRecognition = () => {
    setIsScanning(true);
    // Simulate face recognition process
    setTimeout(() => {
      setIsScanning(false);
      // Show snackbar from top
      Snackbar.show({
        text: 'Verifikasi wajah berhasil! Mengalihkan ke panggilan video...',
        duration: Snackbar.LENGTH_LONG,
        backgroundColor: '#4CAF50',
        textColor: '#FFFFFF',
        action: {
          text: 'OK',
          textColor: '#FFFFFF',
          onPress: () => {
            // Dismiss snackbar and redirect
            Snackbar.dismiss();
            router.push('/verification-video-call');
          },
        },
      });
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        Snackbar.dismiss();
        router.push('/verification-video-call');
      }, 3000);
    }, 3000);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        <ScreenHeader
          title="Verifikasi Wajah"
          subheading="Posisikan wajah Anda di tengah kamera untuk memulai proses verifikasi"
        />

       

        <ThemedView style={styles.cameraPlaceholder}>
          <ThemedText style={styles.placeholderIcon}>
            📷
          </ThemedText>
          <ThemedText style={styles.placeholderText}>
            {isScanning ? 'Memindai wajah...' : 'Kamera akan muncul di sini'}
          </ThemedText>
          {isScanning && (
            <ThemedText style={styles.scanningText}>
              Harap tunggu sebentar...
            </ThemedText>
          )}
        </ThemedView>

        <ThemedView style={styles.instructionContainer}>
          <ThemedText style={styles.instructionTitle}>
            Panduan Verifikasi:
          </ThemedText>
          <ThemedText style={styles.instruction}>
            • Posisikan wajah Anda di tengah kamera
          </ThemedText>
          <ThemedText style={styles.instruction}>
            • Pastikan pencahayaan yang baik
          </ThemedText>
          <ThemedText style={styles.instruction}>
            • Jaga wajah tetap stabil selama pemindaian
          </ThemedText>
        </ThemedView>
      </ScrollView>

      <GradientButton
        title={isScanning ? "Memindai..." : "Mulai Verifikasi Wajah"}
        onPress={startFaceRecognition}
        style={[styles.nextButton, isScanning && styles.disabledButton]}
        disabled={isScanning}
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
    paddingTop: 100, // Space for the transparent header
    paddingBottom: 100, // Space for the fixed button
  },
  instructionContainer: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
    color: "#2c3e50",
  },
  instruction: {
    fontSize: 14,
    marginBottom: 8,
    color: "#2c3e50",
    fontWeight: "400",
  },
  cameraPlaceholder: {
    width: 250,
    height: 250,
    marginHorizontal: "auto",
    borderRadius: 125,
    borderWidth: 2,
    borderColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "#ffffff",
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  placeholderText: {
    color: "#2c3e50",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 5,
  },
  scanningText: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
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
});
