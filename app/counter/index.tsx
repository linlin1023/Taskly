import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import { theme } from "../../theme";
import { registerForPushNotification } from "../../utils/registerForPushNotification";
import * as Notificatoins from "expo-notifications";
import { Duration, isBefore, intervalToDuration, set } from "date-fns";
import React, { useEffect } from "react";
import TimeSegment from "../../components/TimeSegment";
import { getFromStorage, setToStorage } from "../../utils/storage";
import ConfettiCannon from "react-native-confetti-cannon";
import Haptic from "expo-haptics";

export type CountdownStatus = {
  isOverdue: boolean;
  distance: Duration;
};
//TODO: add input field to set frequency
const frequency = 14 * 24 * 60 * 60 * 1000;
export const countdownStorageKey = "countdown";

export type PersistedCountdownState = {
  currentNotificationId: string | undefined;
  completedAtTimestamps: number[];
};

function Counter() {
  const confettiRef = React.useRef<ConfettiCannon>(null);

  const { width } = useWindowDimensions();
  const [isLoading, setIsLoading] = React.useState(true);
  const [status, setStatus] = React.useState<CountdownStatus>({
    isOverdue: false,
    distance: {},
  });
  const [countdownState, setCountdownState] =
    React.useState<PersistedCountdownState>();

  useEffect(() => {
    const init = async () => {
      const data = await getFromStorage(countdownStorageKey);
      setCountdownState(data);
    };

    init();
  }, []);

  let lastCompletedAtTimestamp = countdownState?.completedAtTimestamps[0];

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let timestamp = lastCompletedAtTimestamp
        ? lastCompletedAtTimestamp + frequency
        : now;

      setIsLoading(false);
      console.log(timestamp, now);
      const isOverdue = isBefore(timestamp, now);
      const distance = intervalToDuration(
        isOverdue
          ? { start: timestamp, end: now }
          : { start: now, end: timestamp }
      );

      setStatus({
        isOverdue,
        distance,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lastCompletedAtTimestamp]);

  const scheduleNotification = async () => {
    confettiRef?.current?.start();
    await Haptic.notificationAsync(Haptic.NotificationFeedbackType.Success);

    let notificationId;
    const result = await registerForPushNotification();
    if (result === undefined) {
      const prevNotificationId = countdownState?.currentNotificationId;
      const newCompletedAtTimestamps: number[] =
        countdownState?.completedAtTimestamps
          ? [Date.now(), ...countdownState?.completedAtTimestamps]
          : [Date.now()];

      notificationId = await Notificatoins.scheduleNotificationAsync({
        content: {
          title: "Scheduled Notification",
          body: "The thing is due",
        },
        trigger: {
          seconds: frequency / 1000,
        },
      });

      const newCountdownState: PersistedCountdownState = {
        currentNotificationId: notificationId,
        completedAtTimestamps: newCompletedAtTimestamps,
      };

      setCountdownState(newCountdownState);
      setToStorage(countdownStorageKey, newCountdownState);
      if (prevNotificationId) {
        Notificatoins.cancelScheduledNotificationAsync(prevNotificationId);
      }
    } else {
      console.log("result", result);
      Alert.alert(
        "Permission not granted",
        "Enable notification permission in settings"
      );
    }
  };

  const textStyle = status.isOverdue
    ? {
        color: theme.colorWhite,
      }
    : undefined;
  console.log(isLoading);
  if (isLoading) {
    return (
      <View style={styles.indicator}>
        <ActivityIndicator size="large"></ActivityIndicator>
      </View>
    );
  }
  return (
    <View
      style={[styles.container, status.isOverdue ? styles.late : undefined]}
    >
      <View style={styles.counterContainer}>
        {status.isOverdue ? (
          <Text style={[styles.counterTitle, { color: theme.colorWhite }]}>
            {/* TODO: Add input field to edit task name, so far hardcode to car wash task */}
            Car washing overdue by...
          </Text>
        ) : (
          <Text style={styles.counterTitle}>Car washing due in...</Text>
        )}
        <View style={styles.segmentsContainer}>
          <TimeSegment
            unit="days"
            number={status.distance["days"] ?? 0}
            textStyle={textStyle}
          />
          <TimeSegment
            unit="hours"
            number={status.distance["hours"] ?? 0}
            textStyle={textStyle}
          />
          <TimeSegment
            unit="minutes"
            number={status.distance["minutes"] ?? 0}
            textStyle={textStyle}
          />
          <TimeSegment
            unit="seconds"
            number={status.distance["seconds"] ?? 0}
            textStyle={textStyle}
          />
        </View>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={async () => await scheduleNotification()}
      >
        <Text style={styles.buttonText}>I've done the thing</Text>
      </TouchableOpacity>
      <ConfettiCannon
        ref={confettiRef}
        fadeOut={true}
        count={50}
        origin={{ x: width / 2, y: 0 }}
        autoStart={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colorWhite,
  },
  button: {
    backgroundColor: theme.colorBlack,
    borderRadius: 6,
    padding: 12,
  },
  buttonText: {
    color: theme.colorWhite,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  counterContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  segmentsContainer: {
    flexDirection: "row",
  },
  counterTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  late: {
    backgroundColor: theme.colorRed,
  },
  indicator: {
    backgroundColor: theme.colorWhite,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
});

export default Counter;
