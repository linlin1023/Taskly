import {
  StyleSheet,
  Text,
  Pressable,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import { theme } from "../theme";
import { AntDesign, Feather } from "@expo/vector-icons";

type ShoppingListItemProps = {
  name: string;
  isCompleted?: boolean;
  onDelete: () => void;
  toggleCompele: () => void;
};

function ShoppingListItem({
  name,
  isCompleted = false,
  onDelete,
  toggleCompele,
}: ShoppingListItemProps) {
  return (
    <Pressable
      style={[
        styles.itemContainer,
        isCompleted ? styles.itemCompletedContainer : undefined,
      ]}
      onPress={toggleCompele}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          flex: 1,
        }}
      >
        <Feather
          name={isCompleted ? "check" : "circle"}
          size={24}
          color={isCompleted ? theme.colorGrey : theme.colorCerulean}
        />
        <Text
          style={[
            styles.itemText,
            isCompleted ? styles.completedItemText : undefined,
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {name}
        </Text>
      </View>
      <TouchableOpacity onPress={onDelete}>
        {/* <Text style={styles.buttonText}>Delete</Text> */}
        <AntDesign
          name="closecircle"
          size={24}
          color={isCompleted ? theme.colorGrey : theme.colorRed}
        />
      </TouchableOpacity>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  itemContainer: {
    borderBottomColor: theme.colorCerulean,
    borderBottomWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemCompletedContainer: {
    backgroundColor: theme.colorLightGrey,
    borderBottomColor: theme.colorLightGrey,
  },
  itemText: {
    fontSize: 18,
    fontWeight: "200",
  },
  buttonText: {
    color: theme.colorWhite,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  completedItemText: {
    textDecorationLine: "line-through",
    textDecorationColor: theme.colorGrey,
    color: theme.colorGrey,
  },
});

export default ShoppingListItem;
