# Zustand Store Setup - Data Nasabah

## Overview

Setup Zustand untuk menyimpan data nasabah dalam aplikasi MVP. Store ini menyimpan data dasar nasabah seperti nama lengkap, alamat, dan nomor telepon.

## Struktur Files

```
stores/
├── nasabahStore.ts     # Store utama untuk data nasabah
├── index.ts           # Export semua stores dan types
└── README.md          # Documentation ini

types/
└── nasabah.ts         # Type definitions untuk data nasabah
```

## Penggunaan

### 1. Import Store

```typescript
import { useNasabahStore } from '@/stores/nasabahStore';
import { useVideoCallStore } from '@/stores/videoCallStore';
// atau
import { useNasabahStore, useVideoCallStore } from '@/stores';
```

### 2. Menggunakan dalam Component

```typescript
export default function MyComponent() {
  const { 
    dataNasabah, 
    setNamaLengkap, 
    setAlamat, 
    setNomorTelpon,
    setDataNasabah,
    resetDataNasabah 
  } = useNasabahStore();

  return (
    <View>
      <TextInput
        value={dataNasabah.namaLengkap}
        onChangeText={setNamaLengkap}
        placeholder="Nama Lengkap"
      />
      {/* ... field lainnya */}
    </View>
  );
}
```

### 3. Methods yang Tersedia

#### Nasabah Store Methods
- `setNamaLengkap(nama: string)` - Set nama lengkap
- `setAlamat(alamat: string)` - Set alamat
- `setNomorTelpon(nomor: string)` - Set nomor telepon
- `setDataNasabah(data: Partial<DataNasabah>)` - Update multiple fields sekaligus
- `resetDataNasabah()` - Reset semua data ke nilai awal

#### Video Call Store Methods
- `setCustomChannel(channel: string)` - Set custom channel name
- `setCustomToken(token: string)` - Set custom token
- `setIsUsingCustom(isUsing: boolean)` - Set apakah menggunakan custom channel
- `setVideoCallData(data: Partial<VideoCallData>)` - Update multiple fields sekaligus
- `resetVideoCallData()` - Reset semua data ke nilai awal

### 4. Video Call Store Usage

```typescript
export default function VideoComponent() {
  const { 
    videoCallData, 
    setCustomChannel, 
    setCustomToken, 
    setIsUsingCustom,
    setVideoCallData 
  } = useVideoCallStore();

  const handleJoinCustomChannel = () => {
    setVideoCallData({
      customChannel: 'my-channel',
      customToken: 'my-token',
      isUsingCustom: true,
    });
  };

  return (
    // Component JSX
  );
}
```

### 5. Contoh Implementasi Lengkap

**Nasabah Store** sudah diimplementasikan di:
- `app/verification-info.tsx` - Form input data nasabah
- `app/verification-identity.tsx` - Preview data yang sudah tersimpan

**Video Call Store** sudah diimplementasikan di:
- `app/verification-video-call.tsx` - Custom channel input dan join video call

## Data Structures

### Nasabah Data
```typescript
interface DataNasabah {
  namaLengkap: string;
  alamat: string;
  nomorTelpon: string;
}
```

### Video Call Data
```typescript
interface VideoCallData {
  customChannel: string;
  customRtcToken: string;  // Token untuk video call (RTC)
  customRtmToken: string;  // Token untuk messaging (RTM)
  isUsingCustom: boolean;
}
```

### Token Types Explanation

#### **RTC Token (Video Call)**
- Digunakan untuk video call & audio call
- Generate dari Agora Console → Project → Token → RTC Token
- Format: `007eJxT...` (panjang)

#### **RTM Token (Real-time Messaging)**  
- Digunakan untuk text messaging & signaling
- Generate dari Agora Console → Project → Token → RTM Token
- Format: `007eJxT...` (panjang, berbeda dari RTC)

⚠️ **Important**: RTC Token ≠ RTM Token - keduanya berbeda dan tidak bisa ditukar!

## Notes

- Store ini hanya menyimpan data dasar untuk MVP
- Data identitas (foto KTP, dll) tidak disimpan di store ini
- Data akan hilang saat aplikasi di-restart (tidak persisten)
- Untuk persistence, bisa ditambahkan middleware seperti `persist` dari zustand

## Future Enhancement

Untuk pengembangan selanjutnya, bisa ditambahkan:
- Data persistence dengan AsyncStorage
- Data validasi yang lebih kompleks
- Store terpisah untuk data identitas
- Store untuk data verifikasi wajah
- Integration dengan API backend