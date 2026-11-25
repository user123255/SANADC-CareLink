import {
  collection,
  doc,
  getDocs,
  query,
  where,
  runTransaction,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";

import { auth, db } from "../lib/firebase";

export interface StaffApplication {
  uid: string;
  fullName: string;
  email: string;
  requestedRole: "healthWorker";
  facility: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Timestamp | null;
}

export type StaffApplicationDecision = "approve" | "reject";

export async function getPendingStaffApplications(): Promise<
  StaffApplication[]
> {
  const applicationsQuery = query(
    collection(db, "staffApplications"),
    where("status", "==", "pending")
  );

  const snapshot = await getDocs(applicationsQuery);

  return snapshot.docs.map((applicationDoc) => {
    const data = applicationDoc.data();

    return {
      uid: applicationDoc.id,
      fullName: String(data.fullName ?? ""),
      email: String(data.email ?? ""),
      requestedRole: "healthWorker",
      facility: String(data.facility ?? ""),
      status: "pending",
      createdAt: (data.createdAt as Timestamp | undefined) ?? null,
    };
  });
}

export async function reviewStaffApplication(
  applicationUid: string,
  decision: StaffApplicationDecision
): Promise<void> {
  const admin = auth.currentUser;

  if (!admin) {
    throw new Error("Please sign in before reviewing applications.");
  }

  if (!applicationUid.trim()) {
    throw new Error("A valid application ID is required.");
  }

  if (decision !== "approve" && decision !== "reject") {
    throw new Error("Invalid application decision.");
  }

  const applicationRef = doc(db, "staffApplications", applicationUid);
  const workerRef = doc(db, "users", applicationUid);
  const adminRef = doc(db, "users", admin.uid);

  await runTransaction(db, async (transaction) => {
    const [adminSnapshot, applicationSnapshot] = await Promise.all([
      transaction.get(adminRef),
      transaction.get(applicationRef),
    ]);

    if (
      !adminSnapshot.exists() ||
      adminSnapshot.data().role !== "admin" ||
      adminSnapshot.data().accountStatus !== "active"
    ) {
      throw new Error("Only active administrators can review applications.");
    }

    if (!applicationSnapshot.exists()) {
      throw new Error("This staff application could not be found.");
    }

    const application = applicationSnapshot.data();

    if (
      application.uid !== applicationUid ||
      application.requestedRole !== "healthWorker" ||
      application.status !== "pending"
    ) {
      throw new Error("This application is invalid or has already been reviewed.");
    }

    if (decision === "approve") {
      const workerSnapshot = await transaction.get(workerRef);

      if (workerSnapshot.exists()) {
        throw new Error(
          "A profile already exists for this account. Please investigate before approving."
        );
      }

      transaction.set(workerRef, {
        uid: applicationUid,
        fullName: application.fullName,
        email: application.email,
        role: "healthWorker",
        phone: "",
        preferredLanguage: "",
        facility: application.facility,
        assignedWorkerUid: null,
        accountStatus: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    transaction.update(applicationRef, {
      status: decision === "approve" ? "approved" : "rejected",
      reviewedByUid: admin.uid,
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}
