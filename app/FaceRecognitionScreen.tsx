import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function FaceRecognitionScreen() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);

  const startFaceRecognition = () => {
    setIsScanning(true);
    // Simulate face recognition process
    setTimeout(() => {
      setIsScanning(false);
      Alert.alert(
        'Success', 
        'Face recognition completed successfully! Redirecting to video call...',
        [
          {
            text: 'OK',
            onPress: () => {
              router.push('/AgoraVideoCall2Screen');
            }
          }
        ]
      );
    }, 3000);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title} type="title">
        Face Recognition
      </ThemedText>
      
      <ThemedText style={styles.subtitle} type="subtitle">
        Verify your identity with face recognition
      </ThemedText>

      <ThemedView style={styles.instructionContainer}>
        <ThemedText style={styles.instruction}>
          • Position your face in the center of the camera
        </ThemedText>
        <ThemedText style={styles.instruction}>
          • Ensure good lighting conditions
        </ThemedText>
        <ThemedText style={styles.instruction}>
          • Keep your face steady during scanning
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.cameraPlaceholder}>
        <ThemedText style={styles.placeholderText}>
          {isScanning ? 'Scanning face...' : 'Camera will appear here'}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, isScanning && styles.disabledButton]} 
          onPress={startFaceRecognition}
          disabled={isScanning}
        >
          <ThemedText style={styles.buttonText}>
            {isScanning ? 'Scanning...' : 'Start Face Recognition'}
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.backButton]} 
          onPress={() => router.back()}
        >
          <ThemedText style={styles.buttonText}>Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 30,
    textAlign: 'center',
  },
  instructionContainer: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  instruction: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'left',
  },
  cameraPlaceholder: {
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 3,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#f5f5f5',
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
    width: '80%',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  backButton: {
    backgroundColor: '#999',
    marginTop: 20,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
