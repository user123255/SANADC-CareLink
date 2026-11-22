import {
  doc,
  getDoc,
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
 * Public registration can only create patient accounts.
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
  const profileRef = doc(db, "users", uid);
  const snapshot = await getDoc(profileRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as UserProfile;
}

/**
 * Update permitted patient profile fields.
 * Role, UID and account status cannot be changed here.
 */
export async function updatePatientProfile(
  uid: string,
  updates: PatientProfileUpdate
): Promise<void> {
  const profileRef = doc(db, "users", uid);

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

  await updateDoc(profileRef, safeUpdates);
}
