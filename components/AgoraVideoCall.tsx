import React, { useEffect, useState } from 'react';
import {
  Alert,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {
  ChannelProfile,
  ClientRole,
  RtcEngine,
  RtcLocalView,
  RtcRemoteView,
  VideoRenderMode
} from 'react-native-agora';

/** @deprecated use AgoraVideoCall2 instead */
const AgoraVideoCall = () => {
  const [engine, setEngine] = useState<RtcEngine | null>(null);
  const [joined, setJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState<number | null>(null);
  const [localVideoEnabled, setLocalVideoEnabled] = useState(true);
  const [localAudioEnabled, setLocalAudioEnabled] = useState(true);

  // Replace with your Agora App ID
  const APP_ID = 'e3e412e550a74610a69a888627d3ad65';
  const CHANNEL_NAME = 'test-channel';
  const TOKEN = null; // Use null for testing, implement token server for production

  useEffect(() => {
    if (Platform.OS === 'android') {
      requestPermissionsAndInit();
    }
    return () => {
      if (engine) {
        engine.destroy();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestPermissionsAndInit = async () => {
    try {
      console.log('Requesting Android permissions...');
      
      // First check current permission status
      const cameraStatus = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
      const audioStatus = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      
      console.log('Current permissions status:', { 
        camera: cameraStatus, 
        audio: audioStatus 
      });

      if (cameraStatus && audioStatus) {
        console.log('Permissions already granted, initializing Agora...');
        await initAgora();
        return;
      }

      // Request permissions one by one for better debugging
      console.log('Requesting camera permission...');
      const cameraPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs access to camera for video calling',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      console.log('Camera permission result:', cameraPermission);

      console.log('Requesting microphone permission...');
      const audioPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'This app needs access to microphone for audio calling',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      console.log('Audio permission result:', audioPermission);

      const cameraGranted = cameraPermission === PermissionsAndroid.RESULTS.GRANTED;
      const audioGranted = audioPermission === PermissionsAndroid.RESULTS.GRANTED;

      console.log('Final permission status:', { 
        camera: cameraGranted, 
        audio: audioGranted 
      });

      if (cameraGranted && audioGranted) {
        console.log('All permissions granted, initializing Agora...');
        await initAgora();
      } else {
        console.log('Permissions denied:', { camera: cameraGranted, audio: audioGranted });
        Alert.alert(
          'Permissions Required',
          `Permissions status:\nCamera: ${cameraGranted ? 'Granted' : 'Denied'}\nMicrophone: ${audioGranted ? 'Granted' : 'Denied'}\n\nBoth permissions are required for video calling.`,
          [
            {
              text: 'Open Settings',
              onPress: () => {
                // You can add Linking.openSettings() here if needed
                console.log('User should manually enable permissions in settings');
              },
            },
            {
              text: 'Retry',
              onPress: () => requestPermissionsAndInit(),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('Permission Error', `Failed to request permissions: ${errorMessage}`);
    }
  };

  const initAgora = async () => {
    try {
      console.log('Initializing Agora with APP_ID:', APP_ID);
      console.log('APP_ID length:', APP_ID.length);
      console.log('APP_ID format check:', /^[a-f0-9]{32}$/.test(APP_ID));
      
      // Validate APP_ID format (should be 32 character hex string)
      if (!APP_ID || APP_ID.length !== 32) {
        throw new Error(`Invalid APP_ID format. Expected 32 characters, got ${APP_ID.length}`);
      }

      if (!/^[a-f0-9]{32}$/.test(APP_ID)) {
        throw new Error('APP_ID should contain only lowercase hex characters (a-f, 0-9)');
      }

      console.log('APP_ID validation passed, creating RtcEngine...');
      const rtcEngine = await RtcEngine.create(APP_ID);
      console.log('RtcEngine created successfully');
      
      // Add event listeners first
      rtcEngine.addListener('UserJoined', (uid: number) => {
        console.log('UserJoined', uid);
        setRemoteUid(uid);
      });

      rtcEngine.addListener('UserOffline', (uid: number) => {
        console.log('UserOffline', uid);
        setRemoteUid(null);
      });

      rtcEngine.addListener(
        'JoinChannelSuccess',
        (channel: string, uid: number, elapsed?: number) => {
          console.log('JoinChannelSuccess', channel, uid);
          setJoined(true);
        }
      );

      rtcEngine.addListener('LeaveChannel', () => {
        console.log('LeaveChannel');
        setJoined(false);
        setRemoteUid(null);
      });

      rtcEngine.addListener('Error', (error: { code: number; message: string }) => {
        console.log('Agora Error:', error);
      });

      rtcEngine.addListener('Warning', (warning: number) => {
        console.log('Agora Warning:', warning);
      });

      // Enable video
      await rtcEngine.enableVideo();
      console.log('Video enabled');
      
      // Set channel profile to communication
      await rtcEngine.setChannelProfile(ChannelProfile.Communication);
      console.log('Channel profile set');
      
      // Set client role to broadcaster
      await rtcEngine.setClientRole(ClientRole.Broadcaster);
      console.log('Client role set');

      setEngine(rtcEngine);
      console.log('Agora initialization completed successfully');
    } catch (error) {
      console.error('Error initializing Agora:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        // @ts-ignore
        console.error('Error code:', (error as any).code);
        Alert.alert(
          'Agora Initialization Error', 
          `${error.message}\n\nPlease verify:\n1. APP_ID is correct and active\n2. Project has Agora services enabled\n3. Network connectivity is working\n\nCurrent APP_ID: ${APP_ID.substring(0, 8)}...`
        );
      } else {
        console.error('Error details:', error);
        Alert.alert(
          'Agora Initialization Error', 
          `Unknown error occurred. Please check the logs for more details.\n\nCurrent APP_ID: ${APP_ID.substring(0, 8)}...`
        );
      }
    }
  };

  const joinChannel = async () => {
    console.log('Join channel button pressed');
    console.log('Engine state:', engine ? 'Available' : 'Not available');
    console.log('Current joined state:', joined);
    
    if (!engine) {
      console.log('Engine not initialized, cannot join channel');
      Alert.alert('Error', 'Agora engine not initialized. Please restart the app.');
      return;
    }

    try {
      console.log('Attempting to join channel:', CHANNEL_NAME);
      console.log('Using TOKEN:', TOKEN);
      console.log('APP_ID:', APP_ID);
      
      // Add a small delay to ensure engine is fully ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = await engine.joinChannel(TOKEN, CHANNEL_NAME, null, 0);
      console.log('Join channel result:', result);
      
      // Set a timeout to check if we actually joined
      setTimeout(() => {
        if (!joined) {
          console.log('Join timeout - still not joined after 10 seconds');
          Alert.alert('Warning', 'Taking longer than expected to join channel. Check your network connection.');
        }
      }, 10000);
      
    } catch (error) {
      console.error('Error joining channel:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        Alert.alert('Join Channel Error', `Failed to join channel: ${error.message}`);
      } else {
        Alert.alert('Join Channel Error', 'Failed to join channel due to an unknown error.');
      }
    }
  };

  const leaveChannel = async () => {
    console.log('Leave channel button pressed');
    
    if (!engine) {
      console.log('Engine not available for leaving channel');
      return;
    }

    try {
      console.log('Attempting to leave channel');
      await engine.leaveChannel();
      console.log('Leave channel completed');
    } catch (error) {
      console.error('Error leaving channel:', error);
      if (error instanceof Error) {
        Alert.alert('Error', `Failed to leave channel: ${error.message}`);
      } else {
        Alert.alert('Error', 'Failed to leave channel due to an unknown error.');
      }
    }
  };

  const toggleLocalVideo = async () => {
    if (engine) {
      const enabled = !localVideoEnabled;
      await engine.enableLocalVideo(enabled);
      setLocalVideoEnabled(enabled);
    }
  };

  const toggleLocalAudio = async () => {
    if (engine) {
      const enabled = !localAudioEnabled;
      await engine.enableLocalAudio(enabled);
      setLocalAudioEnabled(enabled);
    }
  };

  const switchCamera = async () => {
    if (engine) {
      await engine.switchCamera();
    }
  };

  if (Platform.OS !== 'android') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          This component is designed for Android only
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        {joined && (
          <RtcLocalView.SurfaceView
            style={styles.localVideo}
            channelId={CHANNEL_NAME}
            renderMode={VideoRenderMode.Hidden}
          />
        )}
        
        {remoteUid && (
          <RtcRemoteView.SurfaceView
            style={styles.remoteVideo}
            uid={remoteUid}
            channelId={CHANNEL_NAME}
            renderMode={VideoRenderMode.Hidden}
          />
        )}
        
        {!joined && !remoteUid && (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              Tap Join Call to start video chat
            </Text>
          </View>
        )}
      </View>

      <View style={styles.controlsContainer}>
        {!engine && (
          <TouchableOpacity
            style={[styles.button, styles.permissionButton]}
            onPress={requestPermissionsAndInit}
          >
            <Text style={styles.buttonText}>Request Permissions & Initialize</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[
            styles.button, 
            joined ? styles.leaveButton : styles.joinButton,
            !engine && styles.disabledButton
          ]}
          onPress={joined ? leaveChannel : joinChannel}
          disabled={!engine}
        >
          <Text style={styles.buttonText}>
            {!engine ? 'Initializing...' : joined ? 'Leave Call' : 'Join Call'}
          </Text>
        </TouchableOpacity>

        {joined && (
          <View style={styles.mediaControls}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                !localVideoEnabled && styles.disabledButton
              ]}
              onPress={toggleLocalVideo}
            >
              <Text style={styles.controlButtonText}>
                {localVideoEnabled ? '📹' : '🚫📹'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlButton,
                !localAudioEnabled && styles.disabledButton
              ]}
              onPress={toggleLocalAudio}
            >
              <Text style={styles.controlButtonText}>
                {localAudioEnabled ? '🎤' : '🚫🎤'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={switchCamera}
            >
              <Text style={styles.controlButtonText}>🔄</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Channel: {CHANNEL_NAME}</Text>
        <Text style={styles.infoText}>
          Status: {joined ? 'Connected' : 'Disconnected'}
        </Text>
        <Text style={styles.infoText}>
          Engine: {engine ? 'Ready' : 'Not Ready'}
        </Text>
        {remoteUid && (
          <Text style={styles.infoText}>Remote User: {remoteUid}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  localVideo: {
    width: 120,
    height: 160,
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: '#333',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
  controlsContainer: {
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  joinButton: {
    backgroundColor: '#4CAF50',
  },
  leaveButton: {
    backgroundColor: '#f44336',
  },
  permissionButton: {
    backgroundColor: '#ff9800',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mediaControls: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#333',
  },
  controlButtonText: {
    fontSize: 20,
  },
  infoContainer: {
    padding: 15,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  infoText: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 2,
  },
});

export default AgoraVideoCall;