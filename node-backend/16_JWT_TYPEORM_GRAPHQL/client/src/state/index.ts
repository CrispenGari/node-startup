let accessToken: string = "";
export const setAccessToken = (token: string): void => {
  accessToken = token;
};
export const getAccessToken = (): string => {
  return accessToken;
};
