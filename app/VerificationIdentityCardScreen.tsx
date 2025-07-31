import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function VerificationIdentityCardScreen() {
  const router = useRouter();
  const [image, setImage] = useState(null);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera roll permissions to upload images.');
      return false;
    }
    return true;
  };

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera permissions to take photos.');
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
      <ThemedText style={styles.title} type="title">
        Identity Card Verification
      </ThemedText>
      
      <ThemedText style={styles.subtitle} type="subtitle">
        Please upload or capture your identity card
      </ThemedText>

      {image ? (
        <ThemedView style={styles.previewContainer}>
          <ThemedText style={styles.previewLabel}>Preview:</ThemedText>
          <Image source={{ uri: image }} style={styles.preview} />
        </ThemedView>
      ) : (
        <ThemedView style={styles.placeholderContainer}>
          <ThemedText style={styles.placeholderText}>No image selected</ThemedText>
        </ThemedView>
      )}

      <ThemedView style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <ThemedText style={styles.buttonText}>Upload from Gallery</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={captureImage}>
          <ThemedText style={styles.buttonText}>Use Camera</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.nextButton]} onPress={() => router.push('/FaceRecognitionScreen')}>
          <ThemedText style={styles.buttonText}>Next</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.backButton]} onPress={() => router.back()}>
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
  previewContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  preview: {
    width: 300,
    height: 200,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  placeholderContainer: {
    width: 300,
    height: 200,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
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
  nextButton: {
    backgroundColor: '#4CAF50',
    marginTop: 10,
  },
  backButton: {
    backgroundColor: '#999',
    marginTop: 10,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
