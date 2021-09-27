let accessToken: string =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxYjI3NmZhYS0yNmVjLTRkOGYtYTVkMS0zOTdmN2IwZjY0NDAiLCJ0b2tlblZlcnNpb24iOjAsImlhdCI6MTYzMjc2ODA3OSwiZXhwIjoxNjMzMzcyODc5fQ.igF-pzxHPdg2BIjLIkTbxjlZzBtaFeTSaqOzTKCZAEM";

export const setAccessToken = (token: string): void => {
  accessToken = token;
};
export const getAccessToken = (): string => {
  return accessToken;
};
