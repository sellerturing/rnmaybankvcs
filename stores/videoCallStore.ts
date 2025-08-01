import { create } from 'zustand';
import { VideoCallData, VideoCallState } from '../types/videoCall';

const initialVideoCallData: VideoCallData = {
  customChannel: '',
  customRtcToken: '',
  customRtmToken: '',
  isUsingCustom: false,
};

export const useVideoCallStore = create<VideoCallState>((set) => ({
  videoCallData: initialVideoCallData,
  
  setCustomChannel: (channel: string) =>
    set((state) => ({
      videoCallData: { ...state.videoCallData, customChannel: channel },
    })),
  
  setCustomRtcToken: (token: string) =>
    set((state) => ({
      videoCallData: { ...state.videoCallData, customRtcToken: token },
    })),
  
  setCustomRtmToken: (token: string) =>
    set((state) => ({
      videoCallData: { ...state.videoCallData, customRtmToken: token },
    })),
  
  setVideoCallData: (data: Partial<VideoCallData>) =>
    set((state) => ({
      videoCallData: { ...state.videoCallData, ...data },
    })),
  
  setIsUsingCustom: (isUsing: boolean) =>
    set((state) => ({
      videoCallData: { ...state.videoCallData, isUsingCustom: isUsing },
    })),
  
  resetVideoCallData: () =>
    set({ videoCallData: initialVideoCallData }),
}));