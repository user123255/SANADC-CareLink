
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../lib/firebase";

import type {
  PatientProfileInput,
  PatientProfileUpdate,
  UserProfile,
} from "../types";

/**
 * Create a patient profile after Firebase Authentication registration.
 */
export async function createPatientProfile(
  uid: string,
  input: PatientProfileInput
): Promise<void> {
  const profileRef = doc(db, "users", uid);

  await setDoc(profileRef, {
    uid,
    fullName: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    role: "patient",
    phone: input.phone?.trim() ?? "",
    preferredLanguage: input.preferredLanguage,
    facility: input.facility.trim(),
    assignedWorkerUid: null,
    accountStatus: "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Retrieve a user's Firestore profile.
 */
export async function getUserProfile(
  uid: string
): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(db, "users", uid));

  if (!snapshot.exists()) return null;

  return snapshot.data() as UserProfile;
}

/**
 * Update permitted patient profile fields.
 */
export async function updatePatientProfile(
  uid: string,
  updates: PatientProfileUpdate
): Promise<void> {
  const safeUpdates: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (updates.fullName !== undefined) {
    safeUpdates.fullName = updates.fullName.trim();
  }

  if (updates.phone !== undefined) {
    safeUpdates.phone = updates.phone.trim();
  }

  if (updates.preferredLanguage !== undefined) {
    safeUpdates.preferredLanguage = updates.preferredLanguage;
  }

  if (updates.facility !== undefined) {
    safeUpdates.facility = updates.facility.trim();
  }

  await updateDoc(doc(db, "users", uid), safeUpdates);
}

/**
 * Get all patient profiles for the administrator.
 */
export async function getAdminPatients(): Promise<UserProfile[]> {
  const snapshot = await getDocs(collection(db, "users"));

  return snapshot.docs
    .map((item) => ({
      ...item.data(),
      uid: item.id,
    }) as UserProfile)
    .filter((profile) => profile.role === "patient");
}

/**
 * Get active healthcare workers for the administrator.
 */
export async function getActiveHealthWorkers(): Promise<UserProfile[]> {
  const snapshot = await getDocs(collection(db, "users"));

  return snapshot.docs
    .map((item) => ({
      ...item.data(),
      uid: item.id,
    }) as UserProfile)
    .filter(
      (profile) =>
        profile.role === "healthWorker" &&
        profile.accountStatus === "active"
    );
}

/**
 * Assign or unassign a patient to a healthcare worker.
 * Pass null to remove an assignment.
 */
export async function assignPatientToWorker(
  patientUid: string,
  workerUid: string | null
): Promise<void> {
  if (!patientUid) {
    throw new Error("A patient must be selected.");
  }

  if (workerUid) {
    const worker = await getUserProfile(workerUid);

    if (
      !worker ||
      worker.role !== "healthWorker" ||
      worker.accountStatus !== "active"
    ) {
      throw new Error("The selected healthcare worker is not active.");
    }
  }

  await updateDoc(doc(db, "users", patientUid), {
    assignedWorkerUid: workerUid,
    updatedAt: serverTimestamp(),
  });
}
