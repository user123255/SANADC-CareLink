import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import type { Appointment, Reminder } from "../types";

export interface PatientDashboardData {
  appointments: Appointment[];
  reminders: Reminder[];
}

/**
 * Loads only the appointments and reminders belonging
 * to the currently authenticated patient.
 */
export async function getPatientDashboardData(
  patientUid: string
): Promise<PatientDashboardData> {
  if (!patientUid.trim()) {
    throw new Error("A valid patient account is required.");
  }

  const appointmentsQuery = query(
    collection(db, "appointments"),
    where("patientUid", "==", patientUid)
  );

  const remindersQuery = query(
    collection(db, "reminders"),
    where("patientUid", "==", patientUid)
  );

  const [appointmentSnapshot, reminderSnapshot] =
    await Promise.all([
      getDocs(appointmentsQuery),
      getDocs(remindersQuery),
    ]);

  const appointments = appointmentSnapshot.docs.map((item) => ({
    ...item.data(),
    id: item.id,
  })) as Appointment[];

  const reminders = reminderSnapshot.docs.map((item) => ({
    ...item.data(),
    id: item.id,
  })) as Reminder[];

  appointments.sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  reminders.sort((a, b) => {
    const aTime = a.scheduledAt?.toMillis() ?? 0;
    const bTime = b.scheduledAt?.toMillis() ?? 0;
    return aTime - bTime;
  });

  return {
    appointments,
    reminders,
  };
}

/**
 * Keeps a patient's appointments and reminders synchronized
 * with Firestore in real time.
 */
export function subscribeToPatientDashboard(
  patientUid: string,
  onUpdate: (data: PatientDashboardData) => void,
  onError: (error: Error) => void
): () => void {
  if (!patientUid.trim()) {
    throw new Error("A valid patient account is required.");
  }

  let appointments: Appointment[] = [];
  let reminders: Reminder[] = [];

  const publish = () => {
    onUpdate({ appointments, reminders });
  };

  const appointmentsQuery = query(
    collection(db, "appointments"),
    where("patientUid", "==", patientUid)
  );

  const remindersQuery = query(
    collection(db, "reminders"),
    where("patientUid", "==", patientUid)
  );

  const unsubscribeAppointments = onSnapshot(
    appointmentsQuery,
    (snapshot) => {
      appointments = snapshot.docs.map((item) => ({
        ...item.data(),
        id: item.id,
      })) as Appointment[];

      appointments.sort((a, b) => a.date.localeCompare(b.date));
      publish();
    },
    (error) => onError(error)
  );

  const unsubscribeReminders = onSnapshot(
    remindersQuery,
    (snapshot) => {
      reminders = snapshot.docs.map((item) => ({
        ...item.data(),
        id: item.id,
      })) as Reminder[];

      reminders.sort(
        (a, b) =>
          (a.scheduledAt?.toMillis() ?? 0) -
          (b.scheduledAt?.toMillis() ?? 0)
      );

      publish();
    },
    (error) => onError(error)
  );

  return () => {
    unsubscribeAppointments();
    unsubscribeReminders();
  };
}
