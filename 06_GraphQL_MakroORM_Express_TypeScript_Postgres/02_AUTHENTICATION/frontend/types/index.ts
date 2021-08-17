type Error = {
  name: string;
  message: string;
  __typename?: string;
} | null;

type User = {
  createdAt: string;
  email: string;
  id: number;
  username: string;
  __typename?: string;
} | null;
export interface LoginType {
  error?: Error;
  user?: User;
}
