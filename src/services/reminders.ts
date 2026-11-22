import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import type {
  Reminder,
  ReminderType,
} from "../types";

export type CreateReminderInput = {
  patientUid: string;
  assignedWorkerUid?: string | null;
  createdByUid: string;
  type: ReminderType;
  title: string;
  message: string;
  relatedAppointmentId?: string | null;
  scheduledAt: Date;
};

/**
 * Create a reminder record.
 * This stores the reminder; it does not send a push notification.
 */
export async function createReminder(
  input: CreateReminderInput
): Promise<string> {
  if (
    !input.patientUid.trim() ||
    !input.createdByUid.trim() ||
    !input.title.trim() ||
    !input.message.trim()
  ) {
    throw new Error("Please provide all required reminder details.");
  }

  const reminderRef = await addDoc(collection(db, "reminders"), {
    patientUid: input.patientUid,
    assignedWorkerUid: input.assignedWorkerUid ?? null,
    createdByUid: input.createdByUid,
    type: input.type,
    title: input.title.trim(),
    message: input.message.trim(),
    relatedAppointmentId: input.relatedAppointmentId ?? null,
    scheduledAt: Timestamp.fromDate(input.scheduledAt),
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return reminderRef.id;
}

/**
 * Retrieve reminders belonging to a patient.
 */
export async function getPatientReminders(
  patientUid: string
): Promise<Reminder[]> {
  const remindersQuery = query(
    collection(db, "reminders"),
    where("patientUid", "==", patientUid),
    orderBy("scheduledAt", "asc")
  );

  const snapshot = await getDocs(remindersQuery);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as Reminder[];
}

/**
 * Retrieve reminders assigned to a healthcare worker.
 */
export async function getWorkerReminders(
  workerUid: string
): Promise<Reminder[]> {
  const remindersQuery = query(
    collection(db, "reminders"),
    where("assignedWorkerUid", "==", workerUid),
    orderBy("scheduledAt", "asc")
  );

  const snapshot = await getDocs(remindersQuery);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as Reminder[];
}

/**
 * Mark a reminder as read.
 */
export async function markReminderAsRead(
  reminderId: string
): Promise<void> {
  await updateDoc(doc(db, "reminders", reminderId), {
    status: "read",
    updatedAt: serverTimestamp(),
  });
}

/**
 * Cancel a pending reminder.
 */
export async function cancelReminder(
  reminderId: string
): Promise<void> {
  await updateDoc(doc(db, "reminders", reminderId), {
    status: "cancelled",
    updatedAt: serverTimestamp(),
  });
}
