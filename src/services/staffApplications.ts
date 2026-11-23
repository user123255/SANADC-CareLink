
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export type StaffApplicationRole = "healthWorker" | "admin";

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
  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const facility = input.facility.trim();

  if (!input.uid || !fullName || !email || !facility) {
    throw new Error("Please complete all required application details.");
  }

  if (
    input.requestedRole !== "healthWorker" &&
    input.requestedRole !== "admin"
  ) {
    throw new Error("Invalid staff application role.");
  }

  await setDoc(doc(db, "staffApplications", input.uid), {
    uid: input.uid,
    fullName,
    email,
    requestedRole: input.requestedRole,
    facility,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
