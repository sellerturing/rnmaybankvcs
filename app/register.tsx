import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const handleRegister = () => {
    router.push('/VerificationIdentityCardScreen');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.title}>Nasabah Baru</ThemedText>
        <ThemedText style={styles.subheading}>
          Siapkan terlebih dulu e-KTP dan NPWP untuk memudahkan pengisian data
        </ThemedText>
        
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
      
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <LinearGradient
          colors={['#FFD700', '#FFA500', '#FF8C00']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <ThemedText style={styles.buttonText}>Daftar</ThemedText>
        </LinearGradient>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Space for the fixed button
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#2c3e50',
  },
  subheading: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#7f8c8d',
    lineHeight: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
    color: '#34495e',
  },
  input: {
    height: 50,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    fontSize: 16,
  },
  button: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
