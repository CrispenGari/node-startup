import React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TextInput, Button } from "react-native";
import { HelloRequest } from "./src/proto/hello_pb";
import { client } from "./src/grpc";

const App = () => {
  const [message, setMessage] = React.useState("");
  const [data, setData] = React.useState<any>();

  const onSubmit = async () => {
    const helloReq = new HelloRequest();
    helloReq.setMessage(message);
    const res = await client.hello(helloReq, {});
    setData(res.toObject());
  };
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <TextInput
        onChangeText={(t) => setMessage(t)}
        value={message}
        placeholder="What do you want to say"
        onSubmitEditing={onSubmit}
        style={{
          backgroundColor: "#f5f5f5",
          padding: 5,
          width: 300,
          marginBottom: 10,
        }}
      />
      <Button title="SEND" onPress={onSubmit} />
      <Text>{JSON.stringify(data, null, 2)}</Text>
    </View>
  );
};

export default App;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
