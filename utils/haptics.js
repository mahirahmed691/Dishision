import * as Haptics from "expo-haptics";

export const triggerSelectionHaptic = async () => {
  try {
    await Haptics.selectionAsync();
  } catch (_error) {}
};

export const triggerSuccessHaptic = async () => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (_error) {}
};

export const triggerErrorHaptic = async () => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (_error) {}
};
