import RtmEngine from 'agora-react-native-rtm';
import AgoraUIKit, { ConnectionData } from 'agora-rn-uikit';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Configuration - Replace with your actual Agora credentials
const agoraConfig = {
  appId: '91e678602eb04e7fa9ec37f6575fa9c2', // Replace with your App ID
  channelName: 'test-channel', // Default channel name
  token:
    '007eJxTYEiLtLn0+hyT56bD9q/8L21u27yOhY/1/SUmkWUR3BGcM80UGCwNU83MLcwMjFKTDExSzdMSLVOTjc3TzEzNTYHsZCP+j10ZDYGMDAIflRgZGSAQxOdhKEktLtFNzkjMy0vNYWAAAPWVIPk=', // Use null for testing, add your token for production
  uid: 0, // Use 0 to auto-generate UID
};

const appId = agoraConfig.appId;
const token = agoraConfig.token;

const AgoraVideoCall2 = () => {
  const [videoCall, setVideoCall] = useState(true);
  const [isHost, setIsHost] = useState(true);
  const [channelInput, setChannelInput] = useState(agoraConfig.channelName);
  const [isInCall, setIsInCall] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const rtmEngine = useRef<RtmEngine | null>(null);
  const rtmChannel = useRef<any>(null);

  useEffect(() => {
    // Skip RTM initialization to avoid token errors
    // initRTM();

    return () => {
      // Cleanup RTM
      cleanupRTM();
    };
  }, []);

  const cleanupRTM = async () => {
    try {
      if (rtmEngine.current && rtmChannel.current) {
        await rtmEngine.current.leaveChannel(rtmChannel.current);
      }
      if (rtmEngine.current) {
        await rtmEngine.current.logout();
        // No destroy method on RtmEngine; nothing to call here
      }
    } catch (error) {
      console.log('RTM cleanup error (non-critical):', error);
    }
  };

  // Send message handler (local only since RTM is disabled)
  const sendMessage = async () => {
    if (messageInput.trim()) {
      setMessages(prev => [...prev, `You: ${messageInput}`]);
      setMessageInput('');
      // Note: RTM messaging is disabled to avoid token errors
    }
  };

  const connectionData: ConnectionData & { token: string } = {
    appId: appId,
    channel: channelInput,
    token,
    // uid: agoraConfig.uid,
  };

  const callbacks = {
    EndCall: () => {
      setVideoCall(false);
      setIsInCall(false);
    },

    StartCall: () => {
      setIsInCall(true);
    },
  };

  if (!videoCall) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.setupContainer}>
          <Text style={styles.title}>Agora Video Call Setup</Text>

          <TextInput
            style={styles.input}
            placeholder='Enter Channel Name'
            value={channelInput}
            onChangeText={setChannelInput}
          />

          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleButton, isHost && styles.activeRole]}
              onPress={() => setIsHost(true)}
            >
              <Text style={[styles.roleText, isHost && styles.activeRoleText]}>
                Host
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleButton, !isHost && styles.activeRole]}
              onPress={() => setIsHost(false)}
            >
              <Text style={[styles.roleText, !isHost && styles.activeRoleText]}>
                Audience
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => {
              if (
                !agoraConfig.appId ||
                agoraConfig.appId === 'YOUR_AGORA_APP_ID'
              ) {
                Alert.alert(
                  'Configuration Required',
                  'Please replace YOUR_AGORA_APP_ID with your actual Agora App ID'
                );
                return;
              }
              setVideoCall(true);
            }}
          >
            <Text style={styles.joinButtonText}>Join Video Call</Text>
          </TouchableOpacity>

          <View style={styles.messageContainer}>
            <Text style={styles.messageTitle}>Chat Messages:</Text>
            <View style={styles.messagesBox}>
              {messages.map((msg, index) => (
                <Text key={index} style={styles.message}>
                  {msg}
                </Text>
              ))}
            </View>

            <View style={styles.messageInputContainer}>
              <TextInput
                style={styles.messageInput}
                placeholder='Type a message...'
                value={messageInput}
                onChangeText={setMessageInput}
                onSubmitEditing={sendMessage}
              />
              <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.fullScreen}>
      <AgoraUIKit connectionData={connectionData} rtcCallbacks={callbacks} />

      {/* Channel Info Overlay */}
      <View style={styles.overlay}>
        <Text style={styles.channelInfo}>Channel: {channelInput}</Text>
        <Text style={styles.statusInfo}>
          {isInCall ? 'In Call' : 'Connecting...'}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  fullScreen: {
    flex: 1,
    backgroundColor: '#000',
  },
  setupContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  roleButton: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  activeRole: {
    backgroundColor: '#007bff',
  },
  roleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeRoleText: {
    color: '#fff',
  },
  joinButton: {
    width: '100%',
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  messageContainer: {
    flex: 1,
    width: '100%',
    maxHeight: 300,
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  messagesBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 200,
  },
  message: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    paddingVertical: 2,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageInput: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  sendButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
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
  channelInfo: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusInfo: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
});

export default AgoraVideoCall2;
