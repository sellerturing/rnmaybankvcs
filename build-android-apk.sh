#!/bin/bash

# Script untuk build production Android (APK atau AAB)
# Usage: ./build-android-apk.sh [apk|aab]
# Default: apk

set -e  # Exit jika ada error

# Parse arguments
BUILD_TYPE="${1:-apk}"

if [[ "$BUILD_TYPE" != "apk" && "$BUILD_TYPE" != "aab" ]]; then
    echo "❌ Build type tidak valid. Gunakan 'apk' atau 'aab'"
    echo "Usage: ./build-android-apk.sh [apk|aab]"
    exit 1
fi

if [[ "$BUILD_TYPE" == "apk" ]]; then
    PROFILE="production-apk"
    echo "🚀 Memulai build production APK Android..."
else
    PROFILE="production"
    echo "🚀 Memulai build production AAB Android..."
fi

# Cek apakah EAS CLI terinstall
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI tidak ditemukan. Install terlebih dahulu dengan:"
    echo "npm install -g @expo/eas-cli"
    exit 1
fi

# Cek apakah sudah login ke EAS
if ! eas whoami &> /dev/null; then
    echo "❌ Belum login ke EAS. Login terlebih dahulu dengan:"
    echo "eas login"
    exit 1
fi

echo "✅ EAS CLI ditemukan dan sudah login"

# Clear cache (opsional)
echo "🧹 Membersihkan cache..."
npx expo install --fix
npm run lint --fix || true

# Update dependencies (opsional)
echo "📦 Memperbarui dependencies..."
npm install

# Build APK production
echo "🔨 Memulai build production APK..."
echo "⏳ Proses ini akan memakan waktu beberapa menit..."

eas build --platform android --profile production --clear-cache

echo "✅ Build selesai!"
echo "📱 APK akan tersedia di dashboard EAS: https://expo.dev/"
echo "💡 Atau gunakan 'eas build:list' untuk melihat status build"
