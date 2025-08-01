export interface VideoCallData {
  customChannel: string;
  customRtcToken: string;  // Token untuk video call (RTC)
  customRtmToken: string;  // Token untuk messaging (RTM)
  isUsingCustom: boolean;
}

export interface VideoCallState {
  videoCallData: VideoCallData;
  setCustomChannel: (channel: string) => void;
  setCustomRtcToken: (token: string) => void;
  setCustomRtmToken: (token: string) => void;
  setVideoCallData: (data: Partial<VideoCallData>) => void;
  setIsUsingCustom: (isUsing: boolean) => void;
  resetVideoCallData: () => void;
}