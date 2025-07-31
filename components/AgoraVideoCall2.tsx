
import RtmEngine from 'agora-react-native-rtm';
import AgoraUIKit, { ConnectionData } from 'agora-rn-uikit';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Configuration - Replace with your actual Agora credentials
const agoraConfig = {
  appId: '91e678602eb04e7fa9ec37f6575fa9c2', // Replace with your App ID
  channelName: 'test-channel', // Default channel name
  token: "007eJxTYEiLtLn0+hyT56bD9q/8L21u27yOhY/1/SUmkWUR3BGcM80UGCwNU83MLcwMjFKTDExSzdMSLVOTjc3TzEzNTYHsZCP+j10ZDYGMDAIflRgZGSAQxOdhKEktLtFNzkjMy0vNYWAAAPWVIPk=", // Use null for testing, add your token for production
  uid: 0, // Use 0 to auto-generate UID
};

interface AgoraVideoCall2Props {
  channelName?: string;
  appId?: string;
  token?: string | null;
}

const AgoraVideoCall2: React.FC<AgoraVideoCall2Props> = ({
  channelName = agoraConfig.channelName,
  appId = agoraConfig.appId,
  token = agoraConfig.token,
}) => {
  const [videoCall, setVideoCall] = useState(true);
  const [isHost, setIsHost] = useState(true);
  const [channelInput, setChannelInput] = useState(channelName);
  const [isInCall, setIsInCall] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const rtmEngine = useRef<RtmEngine | null>(null);
  const rtmChannel = useRef<any>(null);

  useEffect(() => {
    // Initialize RTM for messaging
    initRTM();
    
    return () => {
      // Cleanup RTM
      if (rtmChannel.current) {
        rtmChannel.current.leave();
      }
      if (rtmEngine.current) {
        rtmEngine.current.logout();
        rtmEngine.current.destroy();
      }
    };
  }, []);

  const initRTM = async () => {
    try {
      if (appId === 'YOUR_AGORA_APP_ID') {
        Alert.alert('Configuration Required', 'Please replace YOUR_AGORA_APP_ID with your actual Agora App ID');
        return;
      }

      rtmEngine.current = new RtmEngine();
      await rtmEngine.current.createInstance(appId);
      
      // Login to RTM
      await rtmEngine.current.login({ uid: `user_${Date.now()}` });
      
      // Join RTM channel
      rtmChannel.current = await rtmEngine.current.createChannel(channelInput);
      await rtmChannel.current.join();
      
      // Listen for channel messages
      rtmChannel.current.on('MemberJoined', (memberId: string) => {
        setMessages(prev => [...prev, `${memberId} joined the chat`]);
      });
      
      rtmChannel.current.on('MemberLeft', (memberId: string) => {
        setMessages(prev => [...prev, `${memberId} left the chat`]);
      });
      
      rtmChannel.current.on('ChannelMessage', (message: any, memberId: string) => {
        setMessages(prev => [...prev, `${memberId}: ${message.text}`]);
      });
      
    } catch (error) {
      console.error('RTM initialization failed:', error);
    }
  };

  const sendMessage = async () => {
    if (messageInput.trim() && rtmChannel.current) {
      try {
        await rtmChannel.current.sendMessage({ text: messageInput });
        setMessages(prev => [...prev, `You: ${messageInput}`]);
        setMessageInput('');
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  const connectionData: ConnectionData = {
    appId: appId,
    channel: channelInput,
    token: token,
    uid: agoraConfig.uid,
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
            placeholder="Enter Channel Name"
            value={channelInput}
            onChangeText={setChannelInput}
          />
          
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleButton, isHost && styles.activeRole]}
              onPress={() => setIsHost(true)}
            >
              <Text style={[styles.roleText, isHost && styles.activeRoleText]}>Host</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.roleButton, !isHost && styles.activeRole]}
              onPress={() => setIsHost(false)}
            >
              <Text style={[styles.roleText, !isHost && styles.activeRoleText]}>Audience</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => {
              if (appId === 'YOUR_AGORA_APP_ID') {
                Alert.alert('Configuration Required', 'Please replace YOUR_AGORA_APP_ID with your actual Agora App ID');
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
                <Text key={index} style={styles.message}>{msg}</Text>
              ))}
            </View>
            
            <View style={styles.messageInputContainer}>
              <TextInput
                style={styles.messageInput}
                placeholder="Type a message..."
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
      <AgoraUIKit
        connectionData={connectionData}
        rtcCallbacks={callbacks}
        styleProps={{
          theme: '#007bff',
          videoMode: {
            max: 4,
            min: 1,
          },
          maxViewStyles: {
            height: height * 0.7,
            width: width,
          },
          minViewStyles: {
            height: 150,
            width: 120,
          },
          localBtnContainer: {
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: 25,
            paddingHorizontal: 20,
            paddingVertical: 10,
            position: 'absolute',
            bottom: 50,
            alignSelf: 'center',
          },
          localBtnStyles: {
            muteLocalAudio: {
              backgroundColor: '#ff4444',
              borderRadius: 25,
              width: 50,
              height: 50,
            },
            muteLocalVideo: {
              backgroundColor: '#ff4444',
              borderRadius: 25,
              width: 50,
              height: 50,
            },
            switchCamera: {
              backgroundColor: '#007bff',
              borderRadius: 25,
              width: 50,
              height: 50,
            },
            endCall: {
              backgroundColor: '#ff0000',
              borderRadius: 25,
              width: 60,
              height: 60,
            },
          },
        }}
      />
      
      {/* Channel Info Overlay */}
      <View style={styles.overlay}>
        <Text style={styles.channelInfo}>Channel: {channelInput}</Text>
        <Text style={styles.statusInfo}>{isInCall ? 'In Call' : 'Connecting...'}</Text>
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