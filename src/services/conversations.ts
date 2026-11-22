import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import type { Conversation } from "../types";

/**
 * Create a conversation ID consistently for a patient-worker pair.
 * This prevents duplicate conversations for the same pair.
 */
function createConversationId(
  patientUid: string,
  workerUid: string
): string {
  return `${patientUid}_${workerUid}`;
}

/**
 * Get an existing conversation or create one.
 * The caller must already be authorised to access this patient-worker pair.
 */
export async function getOrCreateConversation(
  patientUid: string,
  workerUid: string
): Promise<Conversation> {
  if (!patientUid.trim() || !workerUid.trim()) {
    throw new Error("Patient and healthcare worker are required.");
  }

  if (patientUid === workerUid) {
    throw new Error("A patient cannot be their own healthcare worker.");
  }

  const conversationId = createConversationId(patientUid, workerUid);
  const conversationRef = doc(db, "conversations", conversationId);

  const existingConversation = await getDoc(conversationRef);

  if (existingConversation.exists()) {
    return {
      id: existingConversation.id,
      ...existingConversation.data(),
    } as Conversation;
  }

  const conversationData = {
    patientUid,
    assignedWorkerUid: workerUid,
    participantUids: [patientUid, workerUid],
    status: "active" as const,
    lastMessageText: "",
    lastMessageAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(conversationRef, conversationData);

  const createdConversation = await getDoc(conversationRef);

  if (!createdConversation.exists()) {
    throw new Error("Unable to create the conversation.");
  }

  return {
    id: createdConversation.id,
    ...createdConversation.data(),
  } as Conversation;
}

/**
 * Retrieve one conversation by its ID.
 */
export async function getConversation(
  conversationId: string
): Promise<Conversation | null> {
  const conversationRef = doc(db, "conversations", conversationId);
  const snapshot = await getDoc(conversationRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as Conversation;
}
