import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import type { UserProfile } from "../types";

/**
 * Retrieve one staff profile.
 */
export async function getStaffProfile(
  staffUid: string
): Promise<UserProfile | null> {
  const profileRef = doc(db, "users", staffUid);
  const snapshot = await getDoc(profileRef);

  if (!snapshot.exists()) {
    return null;
  }

  const profile = snapshot.data() as UserProfile;

  if (
    profile.role !== "healthWorker" &&
    profile.role !== "admin"
  ) {
    return null;
  }

  return profile;
}

/**
 * Find active healthcare workers at a facility.
 */
export async function getFacilityHealthWorkers(
  facility: string
): Promise<UserProfile[]> {
  const workersQuery = query(
    collection(db, "users"),
    where("role", "==", "healthWorker"),
    where("facility", "==", facility),
    where("accountStatus", "==", "active")
  );

  const snapshot = await getDocs(workersQuery);

  return snapshot.docs.map((item) => ({
    ...item.data(),
  })) as UserProfile[];
}

/**
 * Retrieve patients assigned to a healthcare worker.
 */
export async function getAssignedPatients(
  workerUid: string
): Promise<UserProfile[]> {
  const patientsQuery = query(
    collection(db, "users"),
    where("role", "==", "patient"),
    where("assignedWorkerUid", "==", workerUid),
    where("accountStatus", "==", "active")
  );

  const snapshot = await getDocs(patientsQuery);

  return snapshot.docs.map((item) => ({
    ...item.data(),
  })) as UserProfile[];
}
