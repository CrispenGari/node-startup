import "../styles/globals.css";
import { ContextProvider } from "../providers/Context";
const MyApp = ({ Component, pageProps }) => {
  return (
    <ContextProvider>
      <Component {...pageProps} />
    </ContextProvider>
  );
};

export default MyApp;
