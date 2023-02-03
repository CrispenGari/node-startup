import { View, Text } from "react-native";
import React from "react";
import { trpc } from "../utils/trpc";

// Your screen navigation will go here
const Routes = () => {
  const { data, isFetched, isLoading } = trpc.hello.useQuery({
    name: " This is TRPC and React Native",
  });

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>{JSON.stringify({ data, isFetched, isLoading }, null, 2)}</Text>
    </View>
  );
};

export default Routes;
