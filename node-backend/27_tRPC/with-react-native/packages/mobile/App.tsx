import { LogBox, View } from "react-native";
import TRPCProvider from "./src/providers/TRPCProvider";
import Routes from "./src/routes/Routes";

LogBox.ignoreLogs;
LogBox.ignoreAllLogs();
const App = () => {
  return (
    <TRPCProvider>
      <View style={{ flex: 1 }}>
        <Routes />
      </View>
    </TRPCProvider>
  );
};

export default App;
