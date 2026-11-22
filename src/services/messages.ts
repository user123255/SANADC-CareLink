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
import type { Message } from "../types";

export type SendMessageInput = {
  conversationId: string;
  senderUid: string;
  senderRole: "patient" | "healthWorker";
  text: string;
};

/**
 * Send a message inside an existing conversation.
 */
export async function sendMessage(
  input: SendMessageInput
): Promise<string> {
  const messageRef = await addDoc(
    collection(
      db,
      "conversations",
      input.conversationId,
      "messages"
    ),
    {
      conversationId: input.conversationId,
      senderUid: input.senderUid,
      senderRole: input.senderRole,
      text: input.text.trim(),
      createdAt: serverTimestamp(),
      readAt: null,
    }
  );

  return messageRef.id;
}

/**
 * Retrieve messages from a conversation.
 */
export async function getConversationMessages(
  conversationId: string
): Promise<Message[]> {
  const messagesQuery = query(
    collection(
      db,
      "conversations",
      conversationId,
      "messages"
    ),
    orderBy("createdAt", "asc")
  );

  const snapshot = await getDocs(messagesQuery);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as Message[];
}

/**
 * Mark a message as read.
 */
export async function markMessageAsRead(
  conversationId: string,
  messageId: string
): Promise<void> {
  const messageRef = doc(
    db,
    "conversations",
    conversationId,
    "messages",
    messageId
  );

  await updateDoc(messageRef, {
    readAt: serverTimestamp(),
  });
}

/**
 * Retrieve conversations belonging to a patient.
 */
export async function getPatientConversations(
  patientUid: string
) {
  const conversationsQuery = query(
    collection(db, "conversations"),
    where("patientUid", "==", patientUid),
    orderBy("updatedAt", "desc")
  );

  const snapshot = await getDocs(conversationsQuery);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

/**
 * Retrieve conversations assigned to a healthcare worker.
 */
export async function getWorkerConversations(
  workerUid: string
) {
  const conversationsQuery = query(
    collection(db, "conversations"),
    where("assignedWorkerUid", "==", workerUid),
    orderBy("updatedAt", "desc")
  );

  const snapshot = await getDocs(conversationsQuery);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}
