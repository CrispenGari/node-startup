import { SignalData } from "simple-peer";
import React from "react";

export interface CallType {
  receiving: boolean;
  from: string;
  name?: string;
  signal: SignalData;
}
export interface ContextType {
  endCall?: () => void;
  callUser?: (id: string) => void;
  call?: CallType;
  userVideo?: React.MutableRefObject<any>;
  me?: string;
  setName?: React.Dispatch<React.SetStateAction<string>>;
  name?: string;
  stream?: any;
  myVideo?: React.MutableRefObject<any>;
  answerCall?: () => void;
  accepted?: boolean;
  ended?: boolean;
}
