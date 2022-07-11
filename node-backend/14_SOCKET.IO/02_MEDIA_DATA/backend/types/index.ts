export interface AnswerCallDataType {
  signal: any;
  to: string;
}

export interface CallUserDataType {
  userToCall: string;
  from: string;
  name: string | undefined;
  signal: any;
}
