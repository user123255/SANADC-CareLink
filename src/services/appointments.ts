
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
 * Submit a patient appointment request.
 * All patient-created requests begin as pending.
 */
export async function createAppointment(
  input: CreateAppointmentInput
): Promise<string> {
  const patientUid = input.patientUid.trim();
  const title = input.title.trim();
  const location = input.location.trim();

  if (!patientUid || !title || !location || !input.date || !input.time) {
    throw new Error("Please complete all appointment details.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    throw new Error("Please provide a valid appointment date.");
  }

  if (!/^\d{2}:\d{2}$/.test(input.time)) {
    throw new Error("Please provide a valid appointment time.");
  }

  const appointmentRef = await addDoc(
    collection(db, "appointments"),
    {
      patientUid,
      assignedWorkerUid: input.assignedWorkerUid ?? null,
      title,
      date: input.date,
      time: input.time,
      location,
      status: "pending",
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
  if (!patientUid.trim()) {
    throw new Error("A patient account is required.");
  }

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
  if (!workerUid.trim()) {
    throw new Error("A healthcare worker account is required.");
  }

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
 * Firestore rules determine which roles may perform each transition.
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus
): Promise<void> {
  if (!appointmentId.trim()) {
    throw new Error("An appointment ID is required.");
  }

  const appointmentRef = doc(db, "appointments", appointmentId);

  await updateDoc(appointmentRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Retrieve all appointments for the administrator workspace.
 * Firestore rules must confirm the caller has the admin role.
 */
export async function getAdminAppointments(): Promise<Appointment[]> {
  const snapshot = await getDocs(collection(db, "appointments"));

  return snapshot.docs
    .map((item) => ({
      id: item.id,
      ...item.data(),
    })) as Appointment[];
}
