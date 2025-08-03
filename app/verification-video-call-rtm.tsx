import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedView } from '../components/ThemedView';
import { ScreenHeader } from '../components/ui';
import { ThemedText } from '../components/ThemedText';
import ActionSheet from 'react-native-actions-sheet';
import { memo, useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import { useRTM } from '../hooks/useRTM';
import { AgoraErrorBoundary } from './verification-video-call';
import AgoraUIKit, { ConnectionData } from 'agora-rn-uikit';
import { useVideoCallStore } from '../stores/videoCallStore';

export default function VerificationVideoCallRTM() {
  const { rtmError, isRtmLoggedIn, rtmToken, appId, channel } = useRTM();
  const actionSheetRef = useRef<any>(null);
  const { videoCallData } = useVideoCallStore();

  const showCancelActionSheet = () => {
    actionSheetRef.current?.show();
  };

  const handleCancel = () => {
    router.push('/verification-info');
  };

  const handleActionSheetPress = (action: string) => {
    actionSheetRef.current?.hide();
    if (action === 'confirm-cancel') {
      handleCancel();
    }
  };

  // Updated connectionData to use custom RTC token if available
  const connectionData: ConnectionData & { token: string } = {
    appId: appId,
    channel: channel,
    token:
      videoCallData.isUsingCustom && videoCallData.customRtcToken
        ? videoCallData.customRtcToken
        : rtmToken,
  };

  // Memoized AgoraUIKit wrapper untuk mencegah re-render yang tidak perlu
  const MemoizedAgoraUIKit = memo(
    ({ connectionData, rtcCallbacks, settings }: any) => {
      return (
        <AgoraUIKit
          connectionData={connectionData}
          rtcCallbacks={rtcCallbacks}
          settings={settings}
        />
      );
    }
  );

  if (isRtmLoggedIn) {
    return (
      <View style={styles.agoraWrapper}>
        <AgoraErrorBoundary>
          <MemoizedAgoraUIKit
            connectionData={connectionData}
            // rtcCallbacks={}
            settings={{
              // Disable automatic state updates yang bisa menyebabkan error
              disableRtm: true,
            }}
          />
        </AgoraErrorBoundary>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        <ScreenHeader
          title='Menghubungkan'
          subheading='Mohon tunggu sebentar, kami sedang menghubungkan Anda dengan sistem video call'
        />

        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#007bff' />
          <ThemedText style={styles.loadingText}>
            {isRtmLoggedIn ? 'Menunggu Agen' : 'Memverifikasi koneksi'}
          </ThemedText>
          <ThemedText style={styles.loadingSubtext}>
            {!isRtmLoggedIn
              ? 'Memverifikasi koneksi internet Anda...'
              : 'Menunggu Agen menghubungi Anda'}
          </ThemedText>
          {rtmError && (
            <ThemedText style={styles.errorText}>{rtmError}</ThemedText>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={showCancelActionSheet}
      >
        <ThemedText style={styles.cancelButtonText}>Batalkan</ThemedText>
      </TouchableOpacity>

      <ActionSheet
        ref={actionSheetRef}
        containerStyle={styles.actionSheetContainer}
        indicatorStyle={styles.actionSheetIndicator}
        gestureEnabled={true}
        defaultOverlayOpacity={0.3}
      >
        <ThemedView style={styles.actionSheetContent}>
          <ThemedText style={styles.actionSheetTitle}>
            Batalkan Verifikasi Video Call?
          </ThemedText>

          <ThemedText style={styles.actionSheetMessage}>
            Jika Anda memilih "Ya", proses verifikasi akan direset dan Anda akan
            kembali ke awal. Semua data yang telah diisi akan hilang.
          </ThemedText>

          <TouchableOpacity
            style={[styles.actionSheetButton, styles.confirmCancelButton]}
            onPress={() => handleActionSheetPress('confirm-cancel')}
          >
            <ThemedText style={styles.confirmCancelButtonText}>
              Ya, Batalkan
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionSheetButton}
            onPress={() => actionSheetRef.current?.hide()}
          >
            <ThemedText style={styles.actionSheetButtonText}>
              Tidak, Lanjutkan
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
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 100,
    paddingBottom: 100,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: '#000',
  },
  agoraWrapper: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#FF0000',
    textAlign: 'center',
  },
  channelList: {
    marginTop: 20,
  },
  channelItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  channelItemBusy: {
    opacity: 0.6,
    backgroundColor: '#f8f9fa',
  },
  channelInfo: {
    flex: 1,
  },
  agentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  channelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusOnline: {
    backgroundColor: '#28a745',
  },
  statusBusy: {
    backgroundColor: '#dc3545',
  },
  statusOffline: {
    backgroundColor: '#6c757d',
  },
  statusCustom: {
    backgroundColor: '#007bff',
  },
  customChannelItem: {
    borderColor: '#007bff',
    borderWidth: 2,
    backgroundColor: '#f8f9ff',
  },
  channelAgent: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  preCallContainer: {
    marginTop: 20,
  },
  customerInfoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  avatarText: {
    fontSize: 24,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  customerSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  selectedChannelInfo: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  selectedChannelTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 5,
  },
  selectedChannelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
  },
  selectedChannelAgent: {
    fontSize: 14,
    color: '#1976d2',
    marginTop: 5,
  },
  startCallButton: {
    width: '100%',
  },
  cancelButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#dc3545',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  cancelButtonPreCall: {
    backgroundColor: '#dc3545',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  backButtonPreCall: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  backButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    padding: 10,
  },
  overlayChannelInfo: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  overlayStatusInfo: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  overlayBottomContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  overlayCancelButton: {
    backgroundColor: 'rgba(220, 53, 69, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'center',
  },
  overlayCancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Action Sheet Styles
  actionSheetContainer: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backgroundColor: '#ffffff',
  },
  actionSheetIndicator: {
    backgroundColor: '#e0e0e0',
    width: 40,
    height: 4,
  },
  actionSheetContent: {
    padding: 20,
    paddingTop: 10,
  },
  actionSheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
    color: '#2c3e50',
  },
  actionSheetMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  actionSheetButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  actionSheetButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    textAlign: 'center',
  },
  confirmCancelButton: {
    backgroundColor: '#dc3545',
    borderColor: '#dc3545',
  },
  confirmCancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
  },

  // Custom Channel Form Styles
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#2c3e50',
  },
  actionSheetInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f8f9fa',
    color: '#2c3e50',
  },
  tokenInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  confirmButton: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
});
