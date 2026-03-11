export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    return false;
  }
  if (Notification.permission === "granted") {
    return true;
  }
  if (Notification.permission !== "denied") {
    const p = await Notification.requestPermission();
    return p === "granted";
  }
  return false;
};
export const sendNotification = (title, options) => {
  if (!("Notification" in window)) {
    return;
  }
  if (Notification.permission === "granted") {
    new Notification(title, options);
  }
};
export const checkAndSendReminder = async (
  hasLoggedToday,
  lastNotificationTime,
) => {
  const now = new Date();
  const currentHour = now.getHours();
  if (currentHour < 14) {
    return false;
  }
  if (lastNotificationTime) {
    const lastNotif = new Date(lastNotificationTime);
    if (lastNotif.toDateString() === now.toDateString()) {
      return false;
    }
  }
  if (!hasLoggedToday) {
    sendNotification("Time to log your meals! ", {
      body: "You have not logged any food today. Do not forget to track your nutrition!",
      icon: "/vite.svg",
      badge: "/vite.svg",
      tag: "meal-reminder",
    });
    return true;
  }
  return false;
};
export const hasUserLoggedToday = async (token) => {
  try {
    const r = await fetch("http://localhost:1001/api/food/allFood", {
      headers: { Authorization: "Bearer " + token },
    });
    const d = await r.json();
    if (!d.foods || d.foods.length === 0) return false;
    const today = new Date();
    const todaysFoods = d.foods.filter((f) => {
      const fd = new Date(f.createdAt);
      return fd.toDateString() === today.toDateString();
    });
    return todaysFoods.length > 0;
  } catch (e) {
    return false;
  }
};
