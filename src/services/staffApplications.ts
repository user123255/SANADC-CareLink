
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

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
  const currentUser = auth.currentUser;

  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const facility = input.facility.trim();

  if (!currentUser) {
    throw new Error("Please sign in before submitting your application.");
  }

  if (currentUser.uid !== input.uid) {
    throw new Error("Your account could not be verified.");
  }

  if (
    !currentUser.email ||
    currentUser.email.trim().toLowerCase() !== email
  ) {
    throw new Error("The application email must match your signed-in email.");
  }

  if (!fullName || !email || !facility) {
    throw new Error("Please complete all required application details.");
  }

  if (input.requestedRole !== "healthWorker") {
    throw new Error("Only healthcare worker applications are accepted.");
  }

  const applicationRef = doc(db, "staffApplications", currentUser.uid);

  await runTransaction(db, async (transaction) => {
    const existingApplication = await transaction.get(applicationRef);

    if (existingApplication.exists()) {
      throw new Error(
        "An application already exists for this account. Please contact the administrator if you need assistance."
      );
    }

    transaction.set(applicationRef, {
      uid: currentUser.uid,
      fullName,
      email,
      requestedRole: "healthWorker",
      facility,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}
