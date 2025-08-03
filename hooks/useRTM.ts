import RtmEngine from 'agora-react-native-rtm';
import { useEffect, useRef, useState } from 'react';
import Snackbar from 'react-native-snackbar';

/**
 * Generate unique user ID for customer
 */
const generateUserId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `customer_${timestamp}_${random}`;
};

/**
 * Get RTM token from your backend or generate dynamically
 * You should implement this to get fresh token from your server
 */
const getRTMToken = async (userId: string): Promise<string> => {
  // TODO: Replace this with actual token generation from your backend
  // For now, you can use Agora Console to generate token or implement server-side token generation

  // Example of how to get token from your backend:
  const response = await fetch('http://167.99.76.87:3009/generate-rtm-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      appId: '91e678602eb04e7fa9ec37f6575fa9c2',
      appCertificate: '841fb49a8d464597a511440e3a557268',
    }),
  });
  const { token } = await response.json();
  return token;

  // Temporary: Use your generated token from Agora Console
  // Make sure this token is generated for the correct App ID and user ID
  return '00691e678602eb04e7fa9ec37f6575fa9c2IABvOaBDjgE3dFt5DWE+64gHKQMLmzPUUC2BIpFIWR3zeCIkyxAAAAAAEAAJ4PZRzg2PaAEA6ANeyo1o';
};

/**
 * useRTM hook
 * @returns void
 */
export const useRTM = () => {
  const rtmEngine = useRef<RtmEngine | null>(null);
  const [isRtmLoggedIn, setIsRtmLoggedIn] = useState(false);
  const [isRtmInitialized, setIsRtmInitialized] = useState(false);
  const [rtmError, setRtmError] = useState<string | null>(null);
  const [appId, setAppId] = useState<string>('');
  const [channel, setChannel] = useState<string>('');
  const [rtmToken, setRtmToken] = useState<string>('');
  /**
   * Initialize RTM with token
   * @returns void
   */
  const initializeRTMWithToken = async () => {
    setRtmError(null);
    console.log('🔄 Starting RTM initialization');
    rtmEngine.current = new RtmEngine();

    if (!rtmEngine.current) {
      return Snackbar.show({
        text: 'Failed to create RTM engine instance',
        duration: Snackbar.LENGTH_SHORT,
        backgroundColor: '#FF0000',
        textColor: '#FFFFFF',
      });
    }

    try {
      const APP_ID = '91e678602eb04e7fa9ec37f6575fa9c2';
      setAppId(APP_ID);
      await rtmEngine.current.createInstance(APP_ID);
      console.log('✅ RTM Engine created successfully');
      setIsRtmInitialized(true);
    } catch (error) {
      const isError = error instanceof Error;
      const errorMessage = isError ? error.message : 'Unknown error';
      const message = `Error creating RTM engine instance: ${errorMessage}`;
      console.error(message);
      setRtmError(message);
      return Snackbar.show({
        text: message,
        duration: Snackbar.LENGTH_LONG,
        backgroundColor: '#FF0000',
        textColor: '#FFFFFF',
      });
    }

    try {
      setRtmError(null);
      const USER_ID = generateUserId();
      const USER_TOKEN = await getRTMToken(USER_ID);
      setRtmToken(USER_TOKEN);
      console.log('🔄 Starting RTM login...', USER_ID, USER_TOKEN);
      if (!rtmEngine.current) return;
      await rtmEngine.current.loginV2(USER_ID, USER_TOKEN);
      console.log('✅ RTM Login successful');
      setIsRtmLoggedIn(true);

      // Setelah nasbah baru berhasil login, kita bisa join channel
      const CHANNEL_ID = 'verification-queue';
      console.log('🔄 Starting RTM join channel...', CHANNEL_ID);
      setChannel(CHANNEL_ID);
      await rtmEngine.current.joinChannel(CHANNEL_ID);
      console.log('✅ RTM Channel joined successfully');

      // Send message to channel that customer is waiting
      await rtmEngine.current.sendMessage(
        CHANNEL_ID,
        {
          messageType: 100, // CUSTOMER_WAITING message type
          text: JSON.stringify({
            type: 'customer_waiting',
            data: { userId: USER_ID },
          }),
        },
        {
          enableHistoricalMessaging: true,
        }
      );

      // Listen for incoming calls
      rtmEngine.current.addListener('MessageReceived', handleIncomingCall);

      // Listen for peer messages (direct dari agen)
      rtmEngine.current.addListener(
        'PeersOnlineStatusChanged',
        handleDirectMessage
      );
    } catch (error) {
      const isError = error instanceof Error;
      const errorMessage = isError ? error.message : 'Unknown error';
      const message = `Error logging in to RTM: ${errorMessage}`;
      setRtmError(message);
      return Snackbar.show({
        text: message,
        duration: Snackbar.LENGTH_LONG,
        backgroundColor: '#FF0000',
        textColor: '#FFFFFF',
      });
    }
  };

  const handleIncomingCall = (message: any) => {
    console.log('🔄 Received incoming call:', message);
  };

  const handleDirectMessage = (message: any) => {
    console.log('🔄 Received direct message:', message);
  };

  /**
   * Cleanup RTM
   * @returns void
   */
  const cleanupRTM = async () => {
    setRtmError(null);
    try {
      if (!rtmEngine.current) return;
      await rtmEngine.current.logout();
      rtmEngine.current = null;
      console.log('✅ RTM Logout successful');
      setIsRtmLoggedIn(false);
    } catch (error) {
      const isError = error instanceof Error;
      const errorMessage = isError ? error.message : 'Unknown error';
      const message = `Error logging out of RTM: ${errorMessage}`;
      setRtmError(message);
      return Snackbar.show({
        text: message,
        duration: Snackbar.LENGTH_LONG,
        backgroundColor: '#FF0000',
        textColor: '#FFFFFF',
      });
    }
  };

  /**
   * Initialize RTM with token
   * @returns void
   */
  useEffect(() => {
    initializeRTMWithToken();
    return () => {
      cleanupRTM();
    };
  }, []);

  return {
    rtmEngine,
    isRtmLoggedIn,
    isRtmInitialized,
    rtmError,
    appId,
    channel,
    rtmToken,
  };
};
