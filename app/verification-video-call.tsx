import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import GradientButton from '@/components/ui/GradientButton';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { useNasabahStore } from '@/stores/nasabahStore';
import { useVideoCallStore } from '@/stores/videoCallStore';
import RtmEngine from 'agora-react-native-rtm';
import AgoraUIKit, { ConnectionData } from 'agora-rn-uikit';
import { useRouter } from 'expo-router';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import Snackbar from 'react-native-snackbar';

// Helper function untuk validasi App ID format
const validateAppId = (appId: string) => {
  console.log('🔍 Validating App ID format...');
  console.log('📝 App ID:', appId);
  console.log('📝 App ID length:', appId.length);
  console.log('📝 App ID type:', typeof appId);

  // App ID Agora biasanya 32 karakter hexadecimal
  const isValidFormat = /^[a-f0-9]{32}$/i.test(appId);
  console.log('📝 Is valid format (32 hex chars):', isValidFormat);

  if (!isValidFormat) {
    console.warn('⚠️ App ID format mungkin tidak standard');
    console.warn('⚠️ Expected: 32 karakter hexadecimal');
  }

  return {
    isValid: appId && appId.length > 0,
    isStandardFormat: isValidFormat,
    length: appId.length,
  };
};

// Configuration - Replace with your actual Agora credentials
const agoraConfig = {
  appId: '91e678602eb04e7fa9ec37f6575fa9c2', // Replace with your App ID
  channelName: 'test-channel', // Default channel name
  token:
    '007eJxTYJi3ZeqbrjMdZ3Rb4mYmCWaVTF39Z3VH0vmffHePpE2MlO9QYLA0TDUztzAzMEpNMjBJNU9LtExNNjZPMzM1NwWyk40ON/dkNAQyMvxLbGRhZIBAEJ+HoSS1uEQ3OSMxLy81h4EBADy1JWU=', // Use null for testing, add your token for production
  uid: 0, // Use 0 to auto-generate UID
};

const appId = agoraConfig.appId;
const token = agoraConfig.token;

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

// Error boundary untuk menangkap error dari Agora
export class AgoraErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.log('Agora Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ThemedText>Something went wrong with video call.</ThemedText>
        </View>
      );
    }

    return this.props.children;
  }
}

// Mock data untuk channel/agen yang tersedia
const availableChannels = [
  {
    id: 'test-channel',
    name: 'Customer Service 1',
    status: 'available',
    agent: 'Sarah',
  },
  {
    id: 'test-channel-2',
    name: 'Customer Service 2',
    status: 'busy',
    agent: 'John',
  },
  {
    id: 'test-channel-3',
    name: 'Customer Service 3',
    status: 'available',
    agent: 'Maria',
  },
  {
    id: 'test-channel-4',
    name: 'Customer Service 4',
    status: 'offline',
    agent: 'David',
  },
];

// Mock data untuk customer service berdasarkan channel yang dipilih
const customerServiceData = {
  'maybank-support-1': { name: 'Sarah', type: 'Customer Service' },
  'maybank-support-2': { name: 'John', type: 'Customer Service' },
  'maybank-support-3': { name: 'Maria', type: 'Customer Service' },
  'maybank-support-4': { name: 'David', type: 'Customer Service' },
};

export default function VerificationVideoCall() {
  const router = useRouter();
  const actionSheetRef = useRef<any>(null);
  const customChannelActionSheetRef = useRef<any>(null);

  // Video Call Store
  const {
    videoCallData,
    setCustomChannel,
    setCustomRtcToken,
    setCustomRtmToken,
    setIsUsingCustom,
    setVideoCallData,
  } = useVideoCallStore();

  // Nasabah Store
  const { dataNasabah } = useNasabahStore();
  const [currentStep, setCurrentStep] = useState<
    'connecting' | 'channel-select' | 'pre-call' | 'video-call'
  >('connecting');
  const [selectedChannel, setSelectedChannel] = useState('');
  const [customerName, setCustomerName] = useState('John Doe');
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState(
    'Menghubungkan ke server...'
  );
  const [videoCall, setVideoCall] = useState(false);
  const [isHost, setIsHost] = useState(false); // Customer biasanya bukan host
  const [channelInput, setChannelInput] = useState(agoraConfig.channelName);
  const [isInCall, setIsInCall] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const rtmEngine = useRef<RtmEngine | null>(null);
  const rtmChannel = useRef<any>(null);
  const [isRtmLoggedIn, setIsRtmLoggedIn] = useState(false);

  // Custom Channel Form States
  const [tempChannel, setTempChannel] = useState('');
  const [tempRtcToken, setTempRtcToken] = useState('');
  const [tempRtmToken, setTempRtmToken] = useState('');

  // Ref untuk tracking state dan mencegah multiple setState calls
  const isInCallRef = useRef(false);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    // Simulasi proses koneksi
    const connectionTimer = setTimeout(() => {
      setIsConnecting(false);
      setConnectionStatus('Koneksi berhasil!');
      setCurrentStep('channel-select');
    }, 3000);

    // RTM akan di-initialize hanya saat diperlukan (custom channel dengan RTM token)
    console.log(
      'ℹ️ RTM akan diaktifkan saat menggunakan custom channel dengan RTM token'
    );

    return () => {
      clearTimeout(connectionTimer);
      cleanupRTM();
    };
  }, []);

  // Monitor isInCall state changes
  useEffect(() => {
    console.log('isInCall state changed to:', isInCall);
    isInCallRef.current = isInCall;
  }, [isInCall]);

  // RTM Channel management simplified
  useEffect(() => {
    if (channelInput && rtmEngine.current) {
      console.log(`RTM ready for channel: ${channelInput}`);
    }
  }, [channelInput]);

  // Initialize RTM with valid token (hanya ketika diperlukan)
  const initializeRTMWithToken = async (rtmToken: string) => {
    try {
      console.log('🔄 Starting RTM initialization for custom channel...');
      console.log('📝 RTM Token length:', rtmToken.length);

      // Create RTM engine instance
      rtmEngine.current = new RtmEngine();
      await rtmEngine.current.createInstance(agoraConfig.appId);
      console.log('✅ RTM Engine created successfully');

      // Login dengan RTM token dan user ID
      const userId = `customer_${Date.now()}`;
      console.log('📝 User ID:', userId);

      if (rtmEngine.current) {
        await rtmEngine.current.loginV2(userId, rtmToken);
        console.log('✅ RTM Login successful');
      }

      setIsRtmLoggedIn(true);

      // Show success notification for RTM login
      Snackbar.show({
        text: '✅ RTM Connected - Berhasil terhubung ke RTM untuk messaging dengan agent',
        duration: Snackbar.LENGTH_SHORT,
        backgroundColor: '#4CAF50',
        textColor: '#FFFFFF',
      });
    } catch (error: any) {
      console.error('❌ RTM initialization error:', error);
      setIsRtmLoggedIn(false);

      // Hanya tampilkan error jika user benar-benar menggunakan RTM token
      // Tidak menampilkan error jika RTM belum diaktifkan di console
      if (error.message?.includes('INVALID_TOKEN')) {
        Snackbar.show({
          text: '❌ RTM Token Error - RTM Token tidak valid. Pastikan token di-generate untuk RTM dan belum expired.',
          duration: Snackbar.LENGTH_SHORT,
          backgroundColor: '#FF9800',
          textColor: '#FFFFFF',
        });
      } else if (error.message?.includes('INVALID_APP_ID')) {
        // Hanya log ke console, tidak tampilkan snackbar untuk App ID error
        console.warn(
          '⚠️ RTM not activated in Agora Console - this is optional for video calls'
        );
      } else {
        console.error('❌ RTM Error:', error.message);
      }
    }
  };

  const cleanupRTM = async () => {
    try {
      if (rtmChannel.current) {
        await rtmChannel.current?.leave();
      }
      if (rtmEngine.current) {
        await rtmEngine.current?.logout();
      }
    } catch (error) {
      console.log('RTM cleanup error (non-critical):', error);
    }
  };

  // Fungsi untuk mengirim data nasabah ke agent via RTM
  const sendCustomerDataToAgent = async () => {
    try {
      // Format data nasabah untuk dikirim ke agent
      const customerData = {
        type: 'CUSTOMER_INFO',
        timestamp: new Date().toISOString(),
        data: {
          namaLengkap: dataNasabah.namaLengkap || 'Tidak tersedia',
          alamat: dataNasabah.alamat || 'Tidak tersedia',
          nomorTelpon: dataNasabah.nomorTelpon || 'Tidak tersedia',
          channel: channelInput,
          sessionId: Date.now().toString(),
        },
      };

      // Log data nasabah yang akan dikirim (untuk development/debugging)
      const message = JSON.stringify(customerData);
      console.log('📤 Customer data prepared for agent:', customerData);

      // Kirim data jika RTM tersedia, jika tidak cukup log saja
      if (rtmEngine.current && isRtmLoggedIn) {
        console.log('✅ RTM available - data ready to be sent via RTM');
        // TODO: Implement actual RTM message sending when needed
      } else {
        console.log(
          'ℹ️ RTM not available - data logged untuk debugging purposes'
        );
      }

      // Hanya tampilkan notifikasi jika RTM benar-benar aktif
      if (isRtmLoggedIn) {
        Snackbar.show({
          text: '📤 Data Nasabah Siap - Data nasabah telah disiapkan untuk dikirim ke agent',
          duration: Snackbar.LENGTH_SHORT,
          backgroundColor: '#2196F3',
          textColor: '#FFFFFF',
        });
      }
    } catch (error: any) {
      console.log('⚠️ Error preparing customer data:', error);
      // Tidak tampilkan snackbar error untuk ini karena bukan critical error
    }
  };

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannel(channelId);
    setChannelInput(channelId);
    // Set customer service name berdasarkan channel yang dipilih
    const customerService =
      customerServiceData[channelId as keyof typeof customerServiceData];
    if (customerService) {
      setCustomerName(customerService.name);
    }
    setCurrentStep('pre-call');
  };

  // Fungsi untuk mendapatkan informasi channel yang dipilih
  const getSelectedChannelInfo = () => {
    return availableChannels.find(channel => channel.id === selectedChannel);
  };

  const handleStartVideoCall = useCallback(() => {
    setCurrentStep('video-call');
    setVideoCall(true);
    // Reset refs ketika video call dimulai
    isInCallRef.current = false;
    isUpdatingRef.current = false;

    // Kirim data nasabah setelah delay singkat untuk memastikan channel sudah ready
    setTimeout(() => {
      sendCustomerDataToAgent();
    }, 2000);
  }, [sendCustomerDataToAgent]);

  const showCancelActionSheet = () => {
    actionSheetRef.current?.show();
  };

  const handleCancel = () => {
    // Reset semua state
    setCurrentStep('connecting');
    setSelectedChannel('');
    setIsConnecting(true);
    setConnectionStatus('Menghubungkan ke server...');
    setVideoCall(false);
    setIsInCall(false);
    isInCallRef.current = false;
    isUpdatingRef.current = false;
    // Kembali ke screen awal
    router.push('/verification-info');
  };

  const handleBack = () => {
    // Kembali ke pemilihan channel
    setCurrentStep('channel-select');
    setSelectedChannel('');
    setChannelInput(agoraConfig.channelName);
  };

  const handleActionSheetPress = (action: string) => {
    actionSheetRef.current?.hide();
    if (action === 'confirm-cancel') {
      handleCancel();
    }
  };

  // Custom Channel Handlers
  const showCustomChannelActionSheet = () => {
    // Initialize dengan data dari store jika ada
    setTempChannel(videoCallData.customChannel || '');
    setTempRtcToken(videoCallData.customRtcToken || '');
    setTempRtmToken(videoCallData.customRtmToken || '');
    customChannelActionSheetRef.current?.show();
  };

  const handleCustomChannelSubmit = async () => {
    // Validasi input
    if (!tempChannel.trim()) {
      Snackbar.show({
        text: 'Input Error - Nama channel harus diisi',
        duration: Snackbar.LENGTH_SHORT,
        backgroundColor: '#FF9800',
        textColor: '#FFFFFF',
      });
      return;
    }

    if (!tempRtcToken.trim()) {
      Snackbar.show({
        text: 'Input Error - Temp Token harus diisi',
        duration: Snackbar.LENGTH_SHORT,
        backgroundColor: '#FF9800',
        textColor: '#FFFFFF',
      });
      return;
    }

    // if (!tempRtmToken.trim()) {
    //   Snackbar.show({
    //     text: 'Input Error - RTM Token untuk messaging harus diisi',
    //     duration: Snackbar.LENGTH_SHORT,
    //     backgroundColor: '#FF9800',
    //     textColor: '#FFFFFF',
    //   });
    //   return;
    // }

    // Simpan ke store
    setVideoCallData({
      customChannel: tempChannel.trim(),
      customRtcToken: tempRtcToken.trim(),
      customRtmToken: tempRtmToken.trim(),
      isUsingCustom: true,
    });

    // Update channelInput untuk digunakan oleh connectionData
    setChannelInput(tempChannel.trim());

    // Show success notification for custom channel setup
    Snackbar.show({
      text: `✅ Custom Channel Set - Berhasil setup custom channel: ${tempChannel.trim()}`,
      duration: Snackbar.LENGTH_SHORT,
      backgroundColor: '#4CAF50',
      textColor: '#FFFFFF',
    });

    // Initialize RTM dengan token yang valid
    console.log('🔄 Initializing RTM dengan custom token...');
    await initializeRTMWithToken(tempRtmToken.trim());

    // Tutup action sheet
    customChannelActionSheetRef.current?.hide();

    // Langsung mulai video call dengan custom channel
    setCurrentStep('video-call');
    setVideoCall(true);
    setIsInCall(false);

    // Kirim data nasabah setelah delay singkat untuk memastikan RTM ready
    setTimeout(() => {
      sendCustomerDataToAgent();
    }, 3000); // Tambah delay untuk RTM initialization
  };

  const handleCustomChannelCancel = () => {
    // Reset temp values
    setTempChannel('');
    setTempRtcToken('');
    setTempRtmToken('');
    customChannelActionSheetRef.current?.hide();
  };

  // Updated connectionData to use custom RTC token if available
  const connectionData: ConnectionData & { token: string } = {
    appId: appId,
    channel: channelInput,
    token:
      videoCallData.isUsingCustom && videoCallData.customRtcToken
        ? videoCallData.customRtcToken
        : token,
  };

  // Callbacks dengan safe state updates dan error handling
  const callbacks = useMemo(
    () => ({
      EndCall: () => {
        console.log('EndCall triggered');
        setTimeout(() => {
          setVideoCall(false);
          setIsInCall(false);
          router.back();
        }, 0);
      },

      StartCall: () => {
        console.log('StartCall triggered');
        setTimeout(() => setIsInCall(true), 0);
      },

      UserJoined: () => {
        console.log('UserJoined triggered');
        setTimeout(() => {
          setIsInCall(true);
          // Kirim data nasabah ketika ada agent yang join
          sendCustomerDataToAgent();
        }, 1000); // Delay sedikit untuk memastikan RTM channel ready
      },

      JoinChannelSuccess: () => {
        console.log('JoinChannelSuccess triggered');
        setTimeout(() => {
          setIsInCall(true);
          // Kirim data nasabah ketika berhasil join channel
          sendCustomerDataToAgent();
        }, 1000); // Delay sedikit untuk memastikan RTM channel ready
      },

      // Tambahkan error handler
      Error: (error: any) => {
        console.log('Agora Error:', error);
      },
    }),
    [router, sendCustomerDataToAgent]
  );

  // Loading/Connecting Screen
  if (currentStep === 'connecting') {
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
              {connectionStatus}
            </ThemedText>
            <ThemedText style={styles.loadingSubtext}>
              Memverifikasi koneksi internet Anda...
            </ThemedText>
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
              Jika Anda memilih "Ya", proses verifikasi akan direset dan Anda
              akan kembali ke awal. Semua data yang telah diisi akan hilang.
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

  // Channel Selection Screen
  if (currentStep === 'channel-select') {
    return (
      <ThemedView style={styles.container}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
        >
          <ScreenHeader
            title='Customer Service'
            subheading='Silakan pilih customer service yang tersedia untuk melanjutkan verifikasi'
          />

          <View style={styles.channelList}>
            {availableChannels.map(channel => (
              <TouchableOpacity
                key={channel.id}
                style={[
                  styles.channelItem,
                  (channel.status === 'busy' || channel.status === 'offline') &&
                    styles.channelItemBusy,
                ]}
                onPress={() => handleChannelSelect(channel.id)}
                disabled={
                  channel.status === 'busy' || channel.status === 'offline'
                }
              >
                <View style={styles.channelInfo}>
                  <View style={styles.agentRow}>
                    <ThemedText style={styles.channelName}>
                      {channel.name}
                    </ThemedText>
                    <View style={styles.statusRow}>
                      <View
                        style={[
                          styles.statusDot,
                          channel.status === 'available'
                            ? styles.statusOnline
                            : channel.status === 'busy'
                              ? styles.statusBusy
                              : styles.statusOffline,
                        ]}
                      />
                      <ThemedText style={styles.channelAgent}>
                        {channel.agent}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {/* Custom Channel Input Button */}
            <TouchableOpacity
              style={[styles.channelItem, styles.customChannelItem]}
              onPress={showCustomChannelActionSheet}
            >
              <View style={styles.channelInfo}>
                <View style={styles.agentRow}>
                  <ThemedText style={styles.channelName}>
                    📺 Input Custom Channel
                  </ThemedText>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusDot, styles.statusCustom]} />
                    <ThemedText style={styles.channelAgent}>Custom</ThemedText>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
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
              Jika Anda memilih "Ya", proses verifikasi akan direset dan Anda
              akan kembali ke awal. Semua data yang telah diisi akan hilang.
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

        {/* Custom Channel Input ActionSheet */}
        <ActionSheet
          ref={customChannelActionSheetRef}
          containerStyle={styles.actionSheetContainer}
          indicatorStyle={styles.actionSheetIndicator}
          gestureEnabled={true}
          defaultOverlayOpacity={0.3}
        >
          <ThemedView style={styles.actionSheetContent}>
            <ThemedText style={styles.actionSheetTitle}>
              Custom Channel
            </ThemedText>

            <ThemedText style={styles.actionSheetMessage}>
              Masukkan nama channel, dan temporary token dari agora console
            </ThemedText>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Channel Name:</ThemedText>
              <TextInput
                style={styles.actionSheetInput}
                placeholder='Masukkan nama channel'
                value={tempChannel}
                onChangeText={setTempChannel}
                autoCapitalize='none'
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Temp Token:</ThemedText>
              <TextInput
                style={[styles.actionSheetInput, styles.tokenInput]}
                placeholder='007eJxT... (dari Agora Console → Project→ Temp Token'
                value={tempRtcToken}
                onChangeText={setTempRtcToken}
                multiline={true}
                numberOfLines={2}
                autoCapitalize='none'
              />
            </View>

            <TouchableOpacity
              style={[styles.actionSheetButton, styles.confirmButton]}
              onPress={handleCustomChannelSubmit}
            >
              <ThemedText style={styles.confirmButtonText}>
                Join Channel
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionSheetButton}
              onPress={handleCustomChannelCancel}
            >
              <ThemedText style={styles.actionSheetButtonText}>
                Batal
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ActionSheet>
      </ThemedView>
    );
  }

  // Pre-call Information Screen
  if (currentStep === 'pre-call') {
    return (
      <ThemedView style={styles.container}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
        >
          <ScreenHeader
            title={`${getSelectedChannelInfo()?.name || 'Customer Service'}`}
            subheading='Sebelum memulai video call, pastikan Anda siap untuk verifikasi'
          />

          <View style={styles.preCallContainer}>
            <View style={styles.customerInfoContainer}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <ThemedText style={styles.avatarText}>👩‍💼</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.customerName}>
                {customerName}
              </ThemedText>
              <ThemedText style={styles.customerSubtext}>
                {customerServiceData[
                  selectedChannel as keyof typeof customerServiceData
                ]?.type || 'Customer Service'}
              </ThemedText>
            </View>

            <View style={styles.infoCard}>
              <ThemedText style={styles.infoText}>
                • Pastikan koneksi internet Anda stabil{'\n'}• Pastikan kamera
                dan mikrofon berfungsi{'\n'}• Siapkan dokumen yang diperlukan
                {'\n'}• Tunggu agen customer service bergabung
              </ThemedText>
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <GradientButton
            title='Mulai Video Call'
            onPress={handleStartVideoCall}
            style={styles.startCallButton}
          />
          <TouchableOpacity
            style={styles.backButtonPreCall}
            onPress={handleBack}
          >
            <ThemedText style={styles.backButtonText}>Kembali</ThemedText>
          </TouchableOpacity>
        </View>

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
              Jika Anda memilih "Ya", proses verifikasi akan direset dan Anda
              akan kembali ke awal. Semua data yang telah diisi akan hilang.
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

  // Video Call Screen
  if (videoCall) {
    return (
      <SafeAreaView style={styles.fullScreen}>
        {/* Wrapper untuk mencegah setState selama rendering */}
        <View style={styles.agoraWrapper}>
          <AgoraErrorBoundary>
            <MemoizedAgoraUIKit
              connectionData={connectionData}
              rtcCallbacks={callbacks}
              settings={{
                // Disable automatic state updates yang bisa menyebabkan error
                disableRtm: true,
              }}
            />
          </AgoraErrorBoundary>
        </View>

        {/* Channel Info Overlay - Only show when not in call */}
        {!isInCall && videoCall && (
          <View style={styles.overlay}>
            <ThemedText style={styles.overlayChannelInfo}>
              {getSelectedChannelInfo()?.name || channelInput}
            </ThemedText>
            <ThemedText style={styles.overlayStatusInfo}>
              {isInCall ? 'Dalam Panggilan' : 'Menunggu agen...'}
            </ThemedText>
          </View>
        )}

        {/* Cancel Button at Bottom - Only show when not in call */}
        {!isInCall && videoCall && (
          <View style={styles.overlayBottomContainer}>
            <TouchableOpacity
              style={styles.overlayCancelButton}
              onPress={handleBack}
            >
              <ThemedText style={styles.overlayCancelButtonText}>
                Batalkan
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }

  return null;
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
