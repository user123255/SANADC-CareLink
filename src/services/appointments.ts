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
} from "firebase/firestore";

import { db } from "../lib/firebase";
import type {
  Appointment,
  AppointmentStatus,
} from "../types";

export type CreateAppointmentInput = {
  patientUid: string;
  assignedWorkerUid?: string | null;
  title: string;
  date: string;
  time: string;
  location: string;
};

/**
 * Create a new patient appointment.
 */
export async function createAppointment(
  input: CreateAppointmentInput
): Promise<string> {
  const appointmentRef = await addDoc(
    collection(db, "appointments"),
    {
      patientUid: input.patientUid,
      assignedWorkerUid: input.assignedWorkerUid ?? null,
      title: input.title.trim(),
      date: input.date,
      time: input.time,
      location: input.location.trim(),
      status: "scheduled",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );

  return appointmentRef.id;
}

/**
 * Retrieve appointments belonging to one patient.
 */
export async function getPatientAppointments(
  patientUid: string
): Promise<Appointment[]> {
  const appointmentsQuery = query(
    collection(db, "appointments"),
    where("patientUid", "==", patientUid),
    orderBy("date", "asc")
  );

  const snapshot = await getDocs(appointmentsQuery);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as Appointment[];
}

/**
 * Retrieve appointments assigned to one healthcare worker.
 */
export async function getWorkerAppointments(
  workerUid: string
): Promise<Appointment[]> {
  const appointmentsQuery = query(
    collection(db, "appointments"),
    where("assignedWorkerUid", "==", workerUid),
    orderBy("date", "asc")
  );

  const snapshot = await getDocs(appointmentsQuery);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as Appointment[];
}

/**
 * Update an appointment's status.
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus
): Promise<void> {
  const appointmentRef = doc(db, "appointments", appointmentId);

  await updateDoc(appointmentRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}
