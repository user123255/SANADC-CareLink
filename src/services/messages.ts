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
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import type { Conversation, Message } from "../types";

export type SendMessageInput = {
  conversationId: string;
  senderUid: string;
  senderRole: "patient" | "healthWorker";
  text: string;
};

/**
 * Find an active patient-worker conversation or create one.
 * Firestore rules verify the patient's assigned worker.
 */
export async function getOrCreatePatientConversation(
  patientUid: string,
  assignedWorkerUid: string
): Promise<string> {
  if (!patientUid.trim() || !assignedWorkerUid.trim()) {
    throw new Error("A patient and assigned healthcare worker are required.");
  }

  if (patientUid === assignedWorkerUid) {
    throw new Error("The assigned healthcare worker is invalid.");
  }

  const conversationsQuery = query(
    collection(db, "conversations"),
    where("patientUid", "==", patientUid),
    where("assignedWorkerUid", "==", assignedWorkerUid),
    where("status", "==", "active")
  );

  const snapshot = await getDocs(conversationsQuery);

  if (!snapshot.empty) {
    return snapshot.docs[0].id;
  }

  const conversationRef = await addDoc(collection(db, "conversations"), {
    patientUid,
    assignedWorkerUid,
    participantUids: [patientUid, assignedWorkerUid],
    status: "active",
    lastMessageText: "",
    lastMessageAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return conversationRef.id;
}

/**
 * Send a message inside an existing conversation.
 */
export async function sendMessage(
  input: SendMessageInput
): Promise<string> {
  const text = input.text.trim();

  if (!text) {
    throw new Error("Please enter a message.");
  }

  if (text.length > 4000) {
    throw new Error("Messages cannot exceed 4,000 characters.");
  }

  const messageRef = await addDoc(
    collection(db, "conversations", input.conversationId, "messages"),
    {
      conversationId: input.conversationId,
      senderUid: input.senderUid,
      senderRole: input.senderRole,
      text,
      createdAt: serverTimestamp(),
      readAt: null,
    }
  );

  return messageRef.id;
}

/**
 * Subscribe to messages and receive updates in real time.
 */
export function subscribeToConversationMessages(
  conversationId: string,
  onMessages: (messages: Message[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const messagesQuery = query(
    collection(db, "conversations", conversationId, "messages"),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      const messages = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as Message[];

      onMessages(messages);
    },
    (error) => onError(error)
  );
}

/**
 * Retrieve messages from a conversation once.
 */
export async function getConversationMessages(
  conversationId: string
): Promise<Message[]> {
  const messagesQuery = query(
    collection(db, "conversations", conversationId, "messages"),
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
): Promise<Conversation[]> {
  const conversationsQuery = query(
    collection(db, "conversations"),
    where("patientUid", "==", patientUid),
    orderBy("updatedAt", "desc")
  );

  const snapshot = await getDocs(conversationsQuery);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  } as Conversation));
}

/**
 * Retrieve conversations assigned to a healthcare worker.
 */
export async function getWorkerConversations(
  workerUid: string
): Promise<Conversation[]> {
  const conversationsQuery = query(
    collection(db, "conversations"),
    where("assignedWorkerUid", "==", workerUid),
    orderBy("updatedAt", "desc")
  );

  const snapshot = await getDocs(conversationsQuery);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  } as Conversation));
}
