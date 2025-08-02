import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import GradientButton from '@/components/ui/GradientButton';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { useNasabahStore } from '@/stores/nasabahStore';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, TextInput } from 'react-native';

export default function VerificationInfo() {
  const router = useRouter();
  const {
    dataNasabah,
    setNamaLengkap,
    setAlamat,
    setNomorTelpon,
    setDataNasabah,
  } = useNasabahStore();

  const handleRegister = () => {
    // Validasi data sebelum lanjut
    if (!dataNasabah.namaLengkap.trim()) {
      Alert.alert('Error', 'Nama lengkap harus diisi');
      return;
    }

    if (!dataNasabah.alamat.trim()) {
      Alert.alert('Error', 'Alamat harus diisi');
      return;
    }

    if (!dataNasabah.nomorTelpon.trim()) {
      Alert.alert('Error', 'Nomor telepon harus diisi');
      return;
    }

    // Validasi format nomor telepon sederhana
    const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
    if (!phoneRegex.test(dataNasabah.nomorTelpon)) {
      Alert.alert('Error', 'Format nomor telepon tidak valid');
      return;
    }

    // Data sudah tersimpan di store melalui onChangeText,
    // langsung navigasi ke halaman berikutnya
    router.push('/verification-identity');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        <ScreenHeader
          title='Nasabah Baru'
          subheading='Siapkan terlebih dulu e-KTP dan NPWP untuk memudahkan pengisian data'
        />

        <ThemedText style={styles.label}>Nama Lengkap</ThemedText>
        <TextInput
          style={styles.input}
          placeholder='Masukkan Nama Lengkap'
          value={dataNasabah.namaLengkap}
          onChangeText={setNamaLengkap}
        />

        <ThemedText style={styles.label}>Alamat</ThemedText>
        <TextInput
          style={styles.input}
          placeholder='Masukkan alamat lengkap'
          value={dataNasabah.alamat}
          onChangeText={setAlamat}
          multiline
        />

        <ThemedText style={styles.label}>Nomor Telepon</ThemedText>
        <TextInput
          style={styles.input}
          placeholder='Masukkan nomor telepon'
          value={dataNasabah.nomorTelpon}
          onChangeText={setNomorTelpon}
          keyboardType='phone-pad'
        />
      </ScrollView>

      <GradientButton
        title='Daftar'
        onPress={handleRegister}
        style={styles.button}
      />
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
  },
});
