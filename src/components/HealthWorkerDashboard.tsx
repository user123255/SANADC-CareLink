
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  CalendarDays,
  ClipboardList,
  CheckCircle2,
  Clock,
  HeartPulse,
  LogOut,
  Menu,
  MessageCircle,
  Send,
  RefreshCw,
  Users,
  X,
} from "lucide-react";

import type {
  Appointment,
  AppointmentStatus,
  Conversation,
  Message,
  UserProfile,
  Referral,
  ReferralStatus,
} from "../types";

import {
  getWorkerAppointments,
  updateAppointmentStatus,
} from "../services/appointments";
import {
  createReferral,
  getWorkerReferrals,
  updateReferralStatus,
} from "../services/referrals";

import { getAssignedPatients } from "../services/staff";
import { getWorkerConversations, sendMessage, subscribeToConversationMessages } from "../services/messages";

interface HealthWorkerDashboardProps {
  profile: UserProfile;
  onSignOut: () => void;
}

type DashboardTab = "overview" | "patients" | "appointments" | "referrals" | "messages";

export default function HealthWorkerDashboard({
  profile,
  onSignOut,
}: HealthWorkerDashboardProps) {
  const [patients, setPatients] = useState<UserProfile[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [selectedReferralPatient, setSelectedReferralPatient] = useState("");
  const [referralDestination, setReferralDestination] = useState("");
  const [referralNotes, setReferralNotes] = useState("");
  const [referralSaving, setReferralSaving] = useState(false);
  const [referralSuccess, setReferralSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const loadDashboard = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const [patientRecords, appointmentRecords, referralRecords] = await Promise.all([
        getAssignedPatients(profile.uid),
        getWorkerAppointments(profile.uid),
        getWorkerReferrals(profile.uid),
      ]);

      setPatients(patientRecords);
      setAppointments(appointmentRecords);
      setReferrals(referralRecords);
    } catch (err) {
      console.error("Worker dashboard loading error:", err);
      setError(
        "We could not load your dashboard. Please check your connection and access permissions."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [profile.uid]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  async function handleAppointmentUpdate(
    appointmentId: string,
    status: AppointmentStatus
  ) {
    setUpdatingId(appointmentId);
    setError("");

    try {
      await updateAppointmentStatus(appointmentId, status);
      await loadDashboard(true);
    } catch (err) {
      console.error("Appointment update error:", err);
      setError(
        "The appointment could not be updated. Please check your permissions and try again."
      );
    } finally {
      setUpdatingId("");
    }
  }

  async function handleCreateReferral(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedReferralPatient || !referralDestination.trim()) {
      setError("Please select a patient and enter a referral destination.");
      return;
    }

    setReferralSaving(true);
    setError("");
    setReferralSuccess("");

    try {
      await createReferral({
        patientUid: selectedReferralPatient,
        assignedWorkerUid: profile.uid,
        createdByUid: profile.uid,
        destination: referralDestination,
        notes: referralNotes,
      });

      setReferralDestination("");
      setReferralNotes("");
      setSelectedReferralPatient("");
      setReferralSuccess("Referral created successfully.");
      await loadDashboard(true);
    } catch (err) {
      console.error("Referral creation error:", err);
      setError("The referral could not be created. Check that the patient is assigned to your account and try again.");
    } finally {
      setReferralSaving(false);
    }
  }

  async function handleReferralUpdate(referralId: string, status: ReferralStatus) {
    setUpdatingId(`referral-${referralId}`);
    setError("");
    setReferralSuccess("");

    try {
      await updateReferralStatus(referralId, status);
      await loadDashboard(true);
      setReferralSuccess("Referral status updated.");
    } catch (err) {
      console.error("Referral update error:", err);
      setError("The referral status could not be updated. Please try again.");
    } finally {
      setUpdatingId("");
    }
  }

  const pendingAppointments = appointments.filter(
    (appointment) => appointment.status === "pending"
  );

  const scheduledAppointments = appointments.filter(
    (appointment) => appointment.status === "scheduled"
  );

  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === "completed"
  );

  const navigation: { id: DashboardTab; label: string; icon: typeof Activity }[] = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "patients", label: "My patients", icon: Users },
    { id: "appointments", label: "Appointments", icon: CalendarDays },
    { id: "referrals", label: "Referrals", icon: ClipboardList },
    { id: "messages", label: "Messages", icon: MessageCircle },
  ];

  function changeTab(tab: DashboardTab) {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-700 text-white">
              <HeartPulse size={25} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-blue-950">
                SANAD CareLink
              </h1>
              <p className="text-xs text-slate-500">
                Healthcare worker workspace
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-4 sm:flex">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">
                {profile.fullName}
              </p>
              <p className="text-xs text-slate-500">{profile.facility}</p>
            </div>
            <button
              onClick={onSignOut}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 sm:hidden"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white p-4 sm:hidden">
            <p className="mb-3 font-semibold">{profile.fullName}</p>
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => changeTab(item.id)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium hover:bg-blue-50"
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
            <button
              onClick={onSignOut}
              className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              <LogOut size={18} />
              Sign out
            </button>
          </div>
        )}
      </header>

      <div className="mx-auto flex max-w-7xl">
        <aside className="hidden min-h-[calc(100vh-73px)] w-64 shrink-0 border-r border-slate-200 bg-white p-5 sm:block">
          <p className="mb-4 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            Workspace
          </p>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => changeTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-blue-700 text-white shadow-sm"
                      : "text-slate-600 hover:bg-blue-50 hover:text-blue-800"
                  }`}
                >
                  <Icon size={19} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-9">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-blue-700">
                SANAD CareLink / Healthcare worker
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
                {activeTab === "overview"
                  ? "Welcome back"
                  : activeTab === "patients"
                    ? "My patients"
                    : activeTab === "appointments"
                      ? "Appointments"
                      : activeTab === "referrals"
                        ? "Referrals"
                        : "Messages"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {profile.facility}
              </p>
            </div>

            <button
              onClick={() => void loadDashboard(true)}
              disabled={refreshing || loading}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {referralSuccess && (
            <div
              role="status"
              className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
            >
              {referralSuccess}
            </div>
          )}

          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="text-center">
                <RefreshCw className="mx-auto animate-spin text-blue-700" size={30} />
                <p className="mt-3 text-sm text-slate-500">
                  Loading your workspace...
                </p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      {
                        label: "Assigned patients",
                        value: patients.length,
                        icon: Users,
                        color: "text-blue-700",
                        background: "bg-blue-50",
                      },
                      {
                        label: "Pending appointments",
                        value: pendingAppointments.length,
                        icon: Clock,
                        color: "text-amber-700",
                        background: "bg-amber-50",
                      },
                      {
                        label: "Scheduled appointments",
                        value: scheduledAppointments.length,
                        icon: CalendarDays,
                        color: "text-indigo-700",
                        background: "bg-indigo-50",
                      },
                      {
                        label: "Completed appointments",
                        value: completedAppointments.length,
                        icon: CheckCircle2,
                        color: "text-emerald-700",
                        background: "bg-emerald-50",
                      },
                    ].map((stat) => {
                      const Icon = stat.icon;
                      return (
                        <div
                          key={stat.label}
                          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div className={`rounded-xl p-3 ${stat.background} ${stat.color}`}>
                              <Icon size={22} />
                            </div>
                          </div>
                          <p className="mt-4 text-sm text-slate-500">
                            {stat.label}
                          </p>
                          <p className="mt-1 text-3xl font-bold text-slate-950">
                            {stat.value}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Recent appointments
                        </h3>
                        <p className="text-sm text-slate-500">
                          Appointments assigned to your account
                        </p>
                      </div>
                      <button
                        onClick={() => changeTab("appointments")}
                        className="text-sm font-semibold text-blue-700 hover:underline"
                      >
                        View all
                      </button>
                    </div>
                    <AppointmentList
                      appointments={appointments.slice(0, 5)}
                      updatingId={updatingId}
                      onUpdate={handleAppointmentUpdate}
                    />
                  </section>

                  <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900">
                        Assigned patients
                      </h3>
                      <button
                        onClick={() => changeTab("patients")}
                        className="text-sm font-semibold text-blue-700 hover:underline"
                      >
                        View all
                      </button>
                    </div>

                    {patients.length === 0 ? (
                      <EmptyState message="No patients have been assigned to your account yet." />
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {patients.slice(0, 5).map((patient) => (
                          <PatientRow key={patient.uid} patient={patient} />
                        ))}
                      </div>
                    )}
                  </section>
                </>
              )}

              {activeTab === "patients" && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <h3 className="mb-5 text-lg font-bold">Assigned patients</h3>
                  {patients.length === 0 ? (
                    <EmptyState message="No patients have been assigned to your account yet. Contact your facility administrator." />
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {patients.map((patient) => (
                        <PatientRow key={patient.uid} patient={patient} />
                      ))}
                    </div>
                  )}
                </section>
              )}

              {activeTab === "appointments" && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <h3 className="mb-5 text-lg font-bold">
                    Your appointments
                  </h3>
                  <AppointmentList
                    appointments={appointments}
                    updatingId={updatingId}
                    onUpdate={handleAppointmentUpdate}
                  />
                </section>
              )}
              {activeTab === "referrals" && (
                <section className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <h3 className="mb-1 text-lg font-bold text-slate-900">
                      Create a patient referral
                    </h3>
                    <p className="mb-5 text-sm text-slate-500">
                      Refer one of your assigned patients for additional care or follow-up.
                    </p>

                    {patients.length === 0 ? (
                      <EmptyState message="No patients are assigned to your account yet. You need an assigned patient before creating a referral." />
                    ) : (
                      <form onSubmit={handleCreateReferral} className="space-y-4">
                        <div>
                          <label htmlFor="referral-patient" className="mb-1.5 block text-sm font-semibold text-slate-700">
                            Patient
                          </label>
                          <select
                            id="referral-patient"
                            value={selectedReferralPatient}
                            onChange={(event) => setSelectedReferralPatient(event.target.value)}
                            required
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          >
                            <option value="">Select an assigned patient</option>
                            {patients.map((patient) => (
                              <option key={patient.uid} value={patient.uid}>
                                {patient.fullName}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label htmlFor="referral-destination" className="mb-1.5 block text-sm font-semibold text-slate-700">
                            Referral destination
                          </label>
                          <input
                            id="referral-destination"
                            value={referralDestination}
                            onChange={(event) => setReferralDestination(event.target.value)}
                            placeholder="e.g. Kiryandongo Health Centre"
                            required
                            maxLength={160}
                            className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>

                        <div>
                          <label htmlFor="referral-notes" className="mb-1.5 block text-sm font-semibold text-slate-700">
                            Notes (optional)
                          </label>
                          <textarea
                            id="referral-notes"
                            value={referralNotes}
                            onChange={(event) => setReferralNotes(event.target.value)}
                            placeholder="Add relevant referral or follow-up information"
                            rows={3}
                            maxLength={1000}
                            className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={referralSaving}
                          className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {referralSaving ? "Creating referral..." : "Create referral"}
                        </button>
                      </form>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <h3 className="mb-5 text-lg font-bold text-slate-900">
                      Referrals you have created
                    </h3>

                    {referrals.length === 0 ? (
                      <EmptyState message="No referrals have been created by your account yet." />
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {referrals.map((referral) => {
                          const patient = patients.find(
                            (item) => item.uid === referral.patientUid
                          );
                          const busy = updatingId === `referral-${referral.id}`;

                          return (
                            <div key={referral.id} className="py-5 first:pt-0 last:pb-0">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                  <p className="font-semibold text-slate-900">
                                    {patient?.fullName ?? "Assigned patient"}
                                  </p>
                                  <p className="mt-1 text-sm text-slate-600">
                                    Destination: {referral.destination}
                                  </p>
                                  {referral.notes && (
                                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-500">
                                      {referral.notes}
                                    </p>
                                  )}
                                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Status: {referral.status}
                                  </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  {referral.status === "pending" && (
                                    <button
                                      type="button"
                                      disabled={busy}
                                      onClick={() => void handleReferralUpdate(referral.id, "accepted")}
                                      className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                                    >
                                      Accept
                                    </button>
                                  )}
                                  {referral.status !== "completed" && referral.status !== "cancelled" && (
                                    <button
                                      type="button"
                                      disabled={busy}
                                      onClick={() => void handleReferralUpdate(referral.id, "completed")}
                                      className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                                    >
                                      Mark completed
                                    </button>
                                  )}
                                  {referral.status !== "completed" && referral.status !== "cancelled" && (
                                    <button
                                      type="button"
                                      disabled={busy}
                                      onClick={() => void handleReferralUpdate(referral.id, "cancelled")}
                                      className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                                    >
                                      Cancel
                                    </button>
                                  )}
                                  {busy && (
                                    <span className="self-center text-xs text-slate-500">
                                      Updating...
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {activeTab === "messages" && (
                <WorkerMessages
                  workerUid={profile.uid}
                  patients={patients}
                />
              )}            </>
          )}
        </main>
      </div>
    </div>
  );
}


// ------------------------------------------------------
// HEALTHCARE WORKER MESSAGES
// ------------------------------------------------------

function WorkerMessages({
  workerUid,
  patients,
}: {
  workerUid: string;
  patients: UserProfile[];
}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadConversations() {
      setLoading(true);
      setError("");

      try {
        const records = await getWorkerConversations(workerUid);

        if (!active) return;

        const activeConversations = records.filter(
          (conversation) => conversation.status === "active"
        ) as Conversation[];

        setConversations(activeConversations);

        if (activeConversations.length > 0) {
          setSelectedId((current) =>
            current && activeConversations.some((item) => item.id === current)
              ? current
              : activeConversations[0].id
          );
        } else {
          setSelectedId("");
        }
      } catch (err) {
        console.error("Worker conversations error:", err);
        if (active) {
          setError(
            "Unable to load your conversations. Please check your access and connection."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadConversations();

    return () => {
      active = false;
    };
  }, [workerUid]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }

    setMessagesLoading(true);
    setError("");

    const unsubscribe = subscribeToConversationMessages(
      selectedId,
      (updatedMessages) => {
        setMessages(updatedMessages);
        setMessagesLoading(false);
      },
      (subscriptionError) => {
        console.error("Worker message subscription error:", subscriptionError);
        setError("Unable to load messages for this conversation.");
        setMessagesLoading(false);
      }
    );

    return unsubscribe;
  }, [selectedId]);

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedId
  );

  const selectedPatient = patients.find(
    (patient) => patient.uid === selectedConversation?.patientUid
  );

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();

    const messageText = text.trim();

    if (!messageText || !selectedId || sending) return;

    setSending(true);
    setError("");

    try {
      await sendMessage({
        conversationId: selectedId,
        senderUid: workerUid,
        senderRole: "healthWorker",
        text: messageText,
      });

      setText("");
    } catch (err) {
      console.error("Worker send message error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Your reply could not be sent. Please try again."
      );
    } finally {
      setSending(false);
    }
  }

  function formatTime(message: Message) {
    if (!message.createdAt) return "Sending...";

    return message.createdAt.toDate().toLocaleString([], {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <RefreshCw className="mx-auto animate-spin text-blue-700" size={28} />
        <p className="mt-3 text-sm text-slate-500">
          Loading patient conversations...
        </p>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <h3 className="text-lg font-bold text-slate-900">
          Patient messages
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Private conversations with patients assigned to you.
        </p>
      </div>

      {error && (
        <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {conversations.length === 0 ? (
        <div className="p-8">
          <EmptyState message="No active patient conversations yet. Conversations will appear here when your assigned patients send their first message." />
        </div>
      ) : (
        <div className="grid min-h-[520px] md:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="border-b border-slate-200 md:border-b-0 md:border-r">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Conversations ({conversations.length})
              </p>
            </div>

            <div className="max-h-[260px] overflow-y-auto md:max-h-[520px]">
              {conversations.map((conversation) => {
                const patient = patients.find(
                  (item) => item.uid === conversation.patientUid
                );

                const active = selectedId === conversation.id;

                return (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedId(conversation.id)}
                    className={`flex w-full items-center gap-3 border-b border-slate-100 p-4 text-left transition ${
                      active ? "bg-blue-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-800">
                      {patient?.fullName?.charAt(0)?.toUpperCase() || "P"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {patient?.fullName || "Assigned patient"}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {patient?.facility || "Patient conversation"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="flex min-h-[460px] min-w-0 flex-col">
            <div className="border-b border-slate-100 p-4">
              <p className="font-semibold text-slate-800">
                {selectedPatient?.fullName || "Patient conversation"}
              </p>
              <p className="text-xs text-slate-500">
                Confidential patient communication
              </p>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 p-4">
              {messagesLoading && (
                <p className="py-6 text-center text-sm text-slate-500">
                  Loading messages...
                </p>
              )}

              {!messagesLoading && messages.length === 0 && (
                <p className="py-10 text-center text-sm text-slate-500">
                  No messages in this conversation yet.
                </p>
              )}

              {messages.map((message) => {
                const isWorker = message.senderUid === workerUid;

                return (
                  <div
                    key={message.id}
                    className={`flex ${isWorker ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        isWorker
                          ? "rounded-br-sm bg-blue-700 text-white"
                          : "rounded-bl-sm border border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words text-sm leading-6">
                        {message.text}
                      </p>
                      <p
                        className={`mt-2 text-right text-[10px] ${
                          isWorker ? "text-blue-100" : "text-slate-400"
                        }`}
                      >
                        {formatTime(message)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <form
              onSubmit={handleSend}
              className="flex gap-2 border-t border-slate-100 p-3"
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a reply..."
                maxLength={4000}
                disabled={!selectedId || sending}
                className="h-12 min-w-0 flex-1 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                aria-label="Write a reply"
              />
              <button
                type="submit"
                disabled={!text.trim() || sending || !selectedId}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white transition hover:bg-blue-800 disabled:opacity-40"
                aria-label="Send reply"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

function PatientRow({ patient }: { patient: UserProfile }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-800">
          {patient.fullName?.charAt(0)?.toUpperCase() || "P"}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-800">
            {patient.fullName}
          </p>
          <p className="text-xs text-slate-500">
            {patient.facility || "Facility not specified"}
          </p>
        </div>
      </div>
      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        Active
      </span>
    </div>
  );
}

function AppointmentList({
  appointments,
  updatingId,
  onUpdate,
}: {
  appointments: Appointment[];
  updatingId: string;
  onUpdate: (id: string, status: AppointmentStatus) => Promise<void>;
}) {
  if (appointments.length === 0) {
    return <EmptyState message="No appointments are currently assigned to you." />;
  }

  return (
    <div className="divide-y divide-slate-100">
      {appointments.map((appointment) => (
        <div
          key={appointment.id}
          className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="font-semibold text-slate-800">
              {appointment.title}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {appointment.date} · {appointment.time}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {appointment.location}
            </p>
            <span className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
              {appointment.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {appointment.status === "pending" && (
              <button
                disabled={updatingId === appointment.id}
                onClick={() => void onUpdate(appointment.id, "scheduled")}
                className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
              >
                Schedule
              </button>
            )}

            {appointment.status === "scheduled" && (
              <button
                disabled={updatingId === appointment.id}
                onClick={() => void onUpdate(appointment.id, "completed")}
                className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                Mark completed
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-5 py-10 text-center">
      <HeartPulse className="mx-auto text-slate-300" size={30} />
      <p className="mt-3 text-sm text-slate-500">{message}</p>
    </div>
  );
}



