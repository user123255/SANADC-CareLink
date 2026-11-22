import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import type { Referral, ReferralStatus } from "../types";

export type CreateReferralInput = {
  patientUid: string;
  assignedWorkerUid: string;
  createdByUid: string;
  destination: string;
  notes?: string;
};

/**
 * Create a referral for a patient.
 * Authorisation must be enforced by Firestore Security Rules.
 */
export async function createReferral(
  input: CreateReferralInput
): Promise<string> {
  if (
    !input.patientUid.trim() ||
    !input.assignedWorkerUid.trim() ||
    !input.createdByUid.trim() ||
    !input.destination.trim()
  ) {
    throw new Error("Please provide all required referral details.");
  }

  const referralRef = await addDoc(collection(db, "referrals"), {
    patientUid: input.patientUid,
    assignedWorkerUid: input.assignedWorkerUid,
    createdByUid: input.createdByUid,
    destination: input.destination.trim(),
    notes: input.notes?.trim() ?? "",
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return referralRef.id;
}

/**
 * Retrieve referrals belonging to a patient.
 */
export async function getPatientReferrals(
  patientUid: string
): Promise<Referral[]> {
  const referralsQuery = query(
    collection(db, "referrals"),
    where("patientUid", "==", patientUid)
  );

  const snapshot = await getDocs(referralsQuery);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as Referral[];
}

/**
 * Retrieve referrals assigned to a healthcare worker.
 */
export async function getWorkerReferrals(
  workerUid: string
): Promise<Referral[]> {
  const referralsQuery = query(
    collection(db, "referrals"),
    where("assignedWorkerUid", "==", workerUid)
  );

  const snapshot = await getDocs(referralsQuery);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as Referral[];
}

/**
 * Update a referral's status.
 */
export async function updateReferralStatus(
  referralId: string,
  status: ReferralStatus
): Promise<void> {
  const referralRef = doc(db, "referrals", referralId);

  await updateDoc(referralRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}
