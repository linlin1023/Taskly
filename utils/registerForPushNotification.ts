import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

export async function registerForPushNotification() {
  if (Platform.OS === "android") {
    // Register for Android
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      showBadge: false,
    });
  }

  // check if the device is a real device
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    // unhandled promise rejection, projectId not found,
    // if the project id can not be inferred from manifest,
    // you have to pass it by yourself.
    //  const token = (await Notifications.getExpoPushTokenAsync()).data;
    //console.log(token);
    console.log("status", finalStatus);
    return finalStatus;
  }
}
