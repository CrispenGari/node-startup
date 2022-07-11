import { SignalData } from "simple-peer";
import React from "react";
import { Socket } from "socket.io-client";

import { Instance } from "simple-peer";
export interface CallType {
  receiving: boolean;
  from: string;
  name?: string;
  signal: SignalData;
}
export interface ContextType {
  peer?: Instance;
  socket?: Socket<any, any>;
}
