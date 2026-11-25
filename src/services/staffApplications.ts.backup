
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../lib/firebase";

export type StaffApplicationRole = "healthWorker";

export interface StaffApplicationInput {
  uid: string;
  fullName: string;
  email: string;
  requestedRole: StaffApplicationRole;
  facility: string;
}

export async function createStaffApplication(
  input: StaffApplicationInput
): Promise<void> {
  const uid = input.uid.trim();
  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const facility = input.facility.trim();

  if (!uid || !fullName || !email || !facility) {
    throw new Error(
      "Please complete your name, email address, and health facility."
    );
  }

  if (fullName.length < 2 || fullName.length > 120) {
    throw new Error("Your full name must be between 2 and 120 characters.");
  }

  if (facility.length < 2) {
    throw new Error("Please enter a valid health facility.");
  }

  if (input.requestedRole !== "healthWorker") {
    throw new Error(
      "Only healthcare-worker applications can be submitted here."
    );
  }

  const applicationRef = doc(db, "staffApplications", uid);
  const existingApplication = await getDoc(applicationRef);

  if (existingApplication.exists()) {
    const existingStatus = existingApplication.data().status;

    if (existingStatus === "pending") {
      throw new Error(
        "Your healthcare-worker application has already been submitted and is awaiting administrator review."
      );
    }

    throw new Error(
      "An application already exists for this account. Please contact the administrator for assistance."
    );
  }

  await setDoc(applicationRef, {
    uid,
    fullName,
    email,
    requestedRole: "healthWorker",
    facility,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
