import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import type {
  HealthContent,
  HealthContentCategory,
} from "../types";

export type CreateHealthContentInput = {
  title: string;
  description: string;
  body: string;
  category: HealthContentCategory;
  createdByUid: string;
};

/**
 * Create educational content as a draft.
 * Drafts are not available to patients.
 */
export async function createHealthContent(
  input: CreateHealthContentInput
): Promise<string> {
  if (
    !input.title.trim() ||
    !input.body.trim() ||
    !input.createdByUid.trim()
  ) {
    throw new Error("Title, content and author are required.");
  }

  const contentRef = await addDoc(collection(db, "healthContent"), {
    title: input.title.trim(),
    description: input.description.trim(),
    body: input.body.trim(),
    category: input.category,
    status: "draft",
    createdByUid: input.createdByUid,
    reviewedByUid: null,
    reviewedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    publishedAt: null,
  });

  return contentRef.id;
}

/**
 * Retrieve approved health information for patients.
 */
export async function getApprovedHealthContent(): Promise<HealthContent[]> {
  const contentQuery = query(
    collection(db, "healthContent"),
    where("status", "==", "approved"),
    orderBy("publishedAt", "desc")
  );

  const snapshot = await getDocs(contentQuery);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as HealthContent[];
}

/**
 * Retrieve content in a specific category.
 */
export async function getHealthContentByCategory(
  category: HealthContentCategory
): Promise<HealthContent[]> {
  const contentQuery = query(
    collection(db, "healthContent"),
    where("status", "==", "approved"),
    where("category", "==", category),
    orderBy("publishedAt", "desc")
  );

  const snapshot = await getDocs(contentQuery);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as HealthContent[];
}

/**
 * Retrieve content created by a particular administrator.
 * Access must be restricted through Firestore Security Rules.
 */
export async function getAdminHealthContent(
  adminUid: string
): Promise<HealthContent[]> {
  const contentQuery = query(
    collection(db, "healthContent"),
    where("createdByUid", "==", adminUid),
    orderBy("updatedAt", "desc")
  );

  const snapshot = await getDocs(contentQuery);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as HealthContent[];
}

/**
 * Update editable content fields.
 * Approval and publication must use a trusted review process.
 */
export async function updateHealthContent(
  contentId: string,
  updates: {
    title?: string;
    description?: string;
    body?: string;
    category?: HealthContentCategory;
  }
): Promise<void> {
  const contentRef = doc(db, "healthContent", contentId);

  const safeUpdates: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (updates.title !== undefined) {
    safeUpdates.title = updates.title.trim();
  }

  if (updates.description !== undefined) {
    safeUpdates.description = updates.description.trim();
  }

  if (updates.body !== undefined) {
    safeUpdates.body = updates.body.trim();
  }

  if (updates.category !== undefined) {
    safeUpdates.category = updates.category;
  }

  await updateDoc(contentRef, safeUpdates);
}


/**
 * Delete an educational content record.
 * Firestore rules restrict this action to administrators.
 */
export async function deleteHealthContent(contentId: string): Promise<void> {
  if (!contentId.trim()) {
    throw new Error("A content ID is required.");
  }

  await deleteDoc(doc(db, "healthContent", contentId));
}
