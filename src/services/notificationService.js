// ============ NOTIFICATION SERVICE ============
// Handles push notifications for background video completion

/**
 * Request notification permission from the user.
 * Should be called early in the app lifecycle (e.g., on first generate).
 * Returns true if permission is granted.
 */
export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.warn("⚠️ Notifications not supported in this browser.");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    return false;
  }

  // Ask permission
  const result = await Notification.requestPermission();
  return result === "granted";
}

/**
 * Send a local notification that the video is ready.
 * Only fires if the tab is NOT focused (i.e. user is doing something else).
 */
export function notifyVideoReady(title = "¡Tu video está listo! 🎬") {
  // Only notify when user is NOT on the tab
  if (document.visibilityState === "visible") {
    return; // User is already looking at the app
  }

  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  try {
    const notification = new Notification(title, {
      body: "Tu video de FacelessTube se ha generado exitosamente. Toca para verlo.",
      icon: "/facelesstube-icon-192.png",
      badge: "/facelesstube-icon-192.png",
      tag: "facelesstube-video-ready",  // Prevents duplicate notifications
      requireInteraction: true,         // Stays visible until dismissed
      vibrate: [200, 100, 200],         // Vibration pattern for mobile
    });

    // When user clicks the notification, focus the app tab
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto-close after 15 seconds
    setTimeout(() => notification.close(), 15000);
  } catch (e) {
    console.warn("⚠️ Notification failed:", e);
  }
}

/**
 * Keep the page alive in the background using a Web Lock.
 * Prevents the browser from throttling timers when the tab is hidden.
 * Falls back gracefully if the API is not available.
 */
let wakeLockHandle = null;

export async function acquireWakeLock() {
  // Strategy 1: Web Lock API — prevents tab from being discarded
  if ("locks" in navigator) {
    try {
      navigator.locks.request("facelesstube-rendering", { mode: "exclusive" }, () => {
        // Hold this lock for as long as rendering takes
        return new Promise((resolve) => {
          wakeLockHandle = resolve;
        });
      });
      console.log("🔒 Web Lock acquired — tab won't be discarded during rendering");
    } catch (e) {
      console.warn("⚠️ Web Lock not available:", e);
    }
  }

  // Strategy 2: Screen Wake Lock API — prevents screen from sleeping (mobile)
  if ("wakeLock" in navigator) {
    try {
      const screenLock = await navigator.wakeLock.request("screen");
      console.log("📱 Screen Wake Lock acquired");
      // Store for release later
      wakeLockHandle = wakeLockHandle || (() => screenLock.release());
    } catch (e) {
      // Screen wake lock often fails when tab is not visible, that's OK
      console.warn("⚠️ Screen Wake Lock not available:", e);
    }
  }
}

export function releaseWakeLock() {
  if (wakeLockHandle) {
    if (typeof wakeLockHandle === "function") {
      wakeLockHandle();
    }
    wakeLockHandle = null;
    console.log("🔓 Wake lock released");
  }
}
