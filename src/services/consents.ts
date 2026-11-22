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
  ConsentRecord,
  ConsentType,
} from "../types";

export type RecordConsentInput = {
  userUid: string;
  consentType: ConsentType;
  policyVersion: string;
  method: "self" | "assisted";
};

/**
 * Record a patient's consent.
 * The authenticated user and Firestore rules must verify ownership.
 */
export async function recordConsent(
  input: RecordConsentInput
): Promise<string> {
  if (
    !input.userUid.trim() ||
    !input.policyVersion.trim()
  ) {
    throw new Error("User and policy version are required.");
  }

  const consentRef = await addDoc(collection(db, "consents"), {
    userUid: input.userUid,
    consentType: input.consentType,
    status: "granted",
    policyVersion: input.policyVersion,
    method: input.method,
    recordedAt: serverTimestamp(),
    withdrawnAt: null,
  });

  return consentRef.id;
}

/**
 * Retrieve consent records belonging to one user.
 */
export async function getUserConsents(
  userUid: string
): Promise<ConsentRecord[]> {
  const consentQuery = query(
    collection(db, "consents"),
    where("userUid", "==", userUid),
    orderBy("recordedAt", "desc")
  );

  const snapshot = await getDocs(consentQuery);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as ConsentRecord[];
}

/**
 * Withdraw a consent record.
 * This updates the record instead of deleting its history.
 */
export async function withdrawConsent(
  consentId: string
): Promise<void> {
  const consentRef = doc(db, "consents", consentId);

  await updateDoc(consentRef, {
    status: "withdrawn",
    withdrawnAt: serverTimestamp(),
  });
}
