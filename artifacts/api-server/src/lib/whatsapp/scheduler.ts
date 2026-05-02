import { logger } from "../logger.js";
import { getAllEnabledReminderSettings, sendAppointmentReminders } from "./service.js";

async function runReminderPass() {
  try {
    const settingsList = await getAllEnabledReminderSettings();
    await Promise.allSettled(settingsList.map(sendAppointmentReminders));
  } catch (err) {
    logger.error({ err }, "WhatsApp reminder pass failed");
  }
}

export function startReminderScheduler() {
  const INTERVAL_MS = 15 * 60 * 1000;
  logger.info("WhatsApp reminder scheduler started (every 15 min)");
  setTimeout(runReminderPass, 10_000);
  setInterval(runReminderPass, INTERVAL_MS);
}
