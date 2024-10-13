import { View, FlatList, Text } from "react-native";
import { useEffect, useState } from "react";
import { getFromStorage } from "../../utils/storage";
import { countdownStorageKey, PersistedCountdownState } from ".";
import { set } from "date-fns";
import { theme } from "../../theme";
import { format } from "date-fns";

function HistoryScreen() {
  const [history, setHistory] = useState();
  useEffect(() => {
    const init = async () => {
      const countdownState = await getFromStorage(countdownStorageKey);
      setHistory(countdownState?.completedAtTimestamps);
    };
    init();
  }, []);

  return (
    <FlatList
      style={{ flex: 1 }}
      data={history}
      ListEmptyComponent={<Text>No send resume history found</Text>}
      renderItem={({ item }) => (
        <View
          style={{
            flex: 1,
            padding: 12,
            alignContent: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ margin: "auto" }}>
            {format(item, "hh:mm:ss dd/MM/yyyy")}
          </Text>
        </View>
      )}
      keyExtractor={(item) => item.toString()}
    />
  );
}

export default HistoryScreen;
