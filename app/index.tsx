import {
  StyleSheet,
  FlatList,
  View,
  TextInput,
  Text,
  LayoutAnimation,
} from "react-native";
import React, { useEffect, useState } from "react";
import ShoppingListItem from "../components/ShoppingListItem";
import { theme } from "../theme";
import { getFromStorage, setToStorage } from "../utils/storage";
import * as Haptics from "expo-haptics";

type ShoppingListItem = {
  id: string;
  name: string;
  completedAtTimestamp?: number;
  lastUpdatedAtTimestamp: number;
};

export default function App() {
  const [name, setName] = useState();
  const [list, setList] = useState<ShoppingListItem[]>([]);

  useEffect(() => {
    const fetchList = async () => {
      const data = await getFromStorage("shoppingList");
      if (data) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setList(data);
      }
    };

    fetchList();
  }, []);

  const emptyContent = (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 18,
      }}
    >
      <Text>No item found in your interested shopping list</Text>
    </View>
  );

  const orderShoppingList = (list: ShoppingListItem[]) => {
    return list.sort((a, b) => {
      /*
      intuitive design, 
      1. completed item should be at the bottom and order 
          by the last updated time, latest first
      2. incompleted item should be at the top and order 
          by the last updated time, latest first
      */
      if (a.completedAtTimestamp && b.completedAtTimestamp) {
        return b.lastUpdatedAtTimestamp - a.lastUpdatedAtTimestamp;
      }
      if (a.completedAtTimestamp) {
        return 1;
      }

      if (b.completedAtTimestamp) {
        return -1;
      }

      return b.lastUpdatedAtTimestamp - a.lastUpdatedAtTimestamp;
    });
  };

  const handleToggleComplete = async (id: string) => {
    const newList = list.map((item) =>
      item.id === id
        ? {
            ...item,
            completedAtTimestamp: item.completedAtTimestamp
              ? undefined
              : Date.now(),
            lastUpdatedAtTimestamp: Date.now(),
          }
        : item
    );

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setList(orderShoppingList(newList));
    await setToStorage("shoppingList", newList);
  };

  const renderItem = ({ item }: { item: ShoppingListItem }) => {
    return (
      <ShoppingListItem
        name={item.name}
        isCompleted={item.completedAtTimestamp !== undefined}
        onDelete={() => handleDelete(item.id)}
        toggleCompele={() => handleToggleComplete(item.id)}
      />
    );
  };

  const handleSubmit = async () => {
    if (name) {
      const newList = [
        ...list,
        { id: Date.now().toString(), name, lastUpdatedAtTimestamp: Date.now() },
      ];
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      setList(orderShoppingList(newList));
      setName("");
      await setToStorage("shoppingList", newList);
    }
  };

  const headerContent = (
    <TextInput
      style={styles.textInput}
      placeholder="E.g. Coffee"
      value={name}
      onChangeText={setName}
      returnKeyType="done"
      onSubmitEditing={handleSubmit}
    />
  );

  const handleDelete = async (id: string) => {
    const newList = list.filter((item) => item.id !== id);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setList(newList);
    await setToStorage("shoppingList", newList);
  };

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      data={list}
      stickyHeaderIndices={[0]}
      ListEmptyComponent={emptyContent}
      ListHeaderComponent={headerContent}
      renderItem={renderItem}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colorWhite,
    paddingTop: 12,
  },
  textInput: {
    borderColor: theme.colorLightGrey,
    borderWidth: 1,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 16,
    fontSize: 18,
    borderRadius: 8,
    backgroundColor: theme.colorWhite,
  },
  contentContainer: {
    paddingBottom: 24,
  },
});
