import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import type { AuditLog } from "../types";

/**
 * Retrieve recent audit logs.
 * Firestore Security Rules must restrict this operation to authorised admins.
 */
export async function getRecentAuditLogs(
  maxResults = 50
): Promise<AuditLog[]> {
  const safeLimit = Math.min(Math.max(maxResults, 1), 100);

  const logsQuery = query(
    collection(db, "auditLogs"),
    orderBy("createdAt", "desc"),
    limit(safeLimit)
  );

  const snapshot = await getDocs(logsQuery);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as AuditLog[];
}

/**
 * Retrieve audit logs relating to a particular user.
 * Access must be restricted to authorised administrators.
 */
export async function getUserAuditLogs(
  userUid: string,
  maxResults = 50
): Promise<AuditLog[]> {
  const safeLimit = Math.min(Math.max(maxResults, 1), 100);

  const logsQuery = query(
    collection(db, "auditLogs"),
    where("targetUid", "==", userUid),
    orderBy("createdAt", "desc"),
    limit(safeLimit)
  );

  const snapshot = await getDocs(logsQuery);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as AuditLog[];
}
