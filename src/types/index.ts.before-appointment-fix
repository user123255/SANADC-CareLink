import type { Timestamp } from "firebase/firestore";

export type UserRole = "patient" | "healthWorker" | "admin";

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone: string;
  preferredLanguage: string;
  facility: string;
  assignedWorkerUid?: string | null;
  accountStatus: "active" | "suspended";
  createdAt: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export type PatientProfileInput = {
  fullName: string;
  email: string;
  preferredLanguage: string;
  facility: string;
  phone?: string;
};

export type PatientProfileUpdate = {
  fullName?: string;
  phone?: string;
  preferredLanguage?: string;
  facility?: string;
};

export type AppointmentStatus =
  | "scheduled"
  | "completed"
  | "cancelled";

export interface Appointment {
  id: string;
  patientUid: string;
  assignedWorkerUid: string | null;
  title: string;
  date: string;
  time: string;
  location: string;
  status: AppointmentStatus;
  createdAt: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export type MessageSender = "patient" | "healthWorker";

export interface Message {
  id: string;
  conversationId: string;
  senderUid: string;
  senderRole: MessageSender;
  text: string;
  createdAt: Timestamp | null;
  readAt?: Timestamp | null;
}

// Conversation types
export type ConversationStatus = "active" | "closed";

export interface Conversation {
  id: string;
  patientUid: string;
  assignedWorkerUid: string;
  participantUids: string[];
  status: ConversationStatus;
  lastMessageText: string;
  lastMessageAt: Timestamp | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export type ReferralStatus =
  | "pending"
  | "accepted"
  | "completed"
  | "cancelled";

export interface Referral {
  id: string;
  patientUid: string;
  assignedWorkerUid: string;
  createdByUid: string;
  destination: string;
  notes: string;
  status: ReferralStatus;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export type HealthContentCategory =
  | "pregnancy"
  | "antenatal-care"
  | "nutrition"
  | "newborn-care"
  | "maternal-wellbeing"
  | "general";

export type HealthContentStatus =
  | "draft"
  | "pendingReview"
  | "approved"
  | "archived";

export interface HealthContent {
  id: string;
  title: string;
  description: string;
  body: string;
  category: HealthContentCategory;
  status: HealthContentStatus;
  createdByUid: string;
  reviewedByUid: string | null;
  reviewedAt: Timestamp | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  publishedAt: Timestamp | null;
}

export type ReminderType =
  | "appointment"
  | "followUp"
  | "general";

export type ReminderStatus =
  | "pending"
  | "sent"
  | "read"
  | "cancelled";

export interface Reminder {
  id: string;
  patientUid: string;
  assignedWorkerUid: string | null;
  createdByUid: string;
  type: ReminderType;
  title: string;
  message: string;
  relatedAppointmentId: string | null;
  scheduledAt: Timestamp | null;
  status: ReminderStatus;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export type ConsentType =
  | "platform"
  | "healthcareCommunication"
  | "assistedAccess"
  | "dataProcessing";

export type ConsentStatus = "granted" | "withdrawn";

export interface ConsentRecord {
  id: string;
  userUid: string;
  consentType: ConsentType;
  status: ConsentStatus;
  policyVersion: string;
  method: "self" | "assisted";
  recordedAt: Timestamp | null;
  withdrawnAt: Timestamp | null;
}

export type AuditAction =
  | "account_created"
  | "account_updated"
  | "account_suspended"
  | "role_changed"
  | "appointment_created"
  | "appointment_updated"
  | "referral_created"
  | "referral_updated"
  | "consent_granted"
  | "consent_withdrawn"
  | "message_sent"
  | "content_published";

export interface AuditLog {
  id: string;
  actorUid: string;
  actorRole: UserRole;
  action: AuditAction;
  targetUid: string | null;
  resourceType: string;
  resourceId: string | null;
  details: string;
  createdAt: Timestamp | null;
}
