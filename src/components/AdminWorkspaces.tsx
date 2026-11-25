import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  BookOpen,
  CalendarDays,
  Clock,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from "lucide-react";

import type {
  Appointment,
  AppointmentStatus,
  HealthContent,
  HealthContentCategory,
  UserProfile,
} from "../types";

import {
  getAdminAppointments,
  updateAppointmentStatus,
} from "../services/appointments";

import {
  createHealthContent,
  deleteHealthContent,
  getAdminHealthContent,
  updateHealthContent,
} from "../services/healthContent";

const appointmentStatuses: AppointmentStatus[] = [
  "pending",
  "scheduled",
  "completed",
  "cancelled",
];

const contentCategories: {
  value: HealthContentCategory;
  label: string;
}[] = [
  { value: "pregnancy", label: "Pregnancy" },
  { value: "antenatal-care", label: "Antenatal care" },
  { value: "nutrition", label: "Nutrition" },
  { value: "newborn-care", label: "Newborn care" },
  { value: "maternal-wellbeing", label: "Maternal wellbeing" },
  { value: "general", label: "General health" },
];

function statusStyle(status: string) {
  switch (status) {
    case "completed":
    case "approved":
      return "bg-green-50 text-green-700";
    case "scheduled":
      return "bg-blue-50 text-blue-700";
    case "cancelled":
    case "archived":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-amber-50 text-amber-700";
  }
}

function formatStatus(status: string) {
  return status === "pendingReview"
    ? "Pending review"
    : status.charAt(0).toUpperCase() + status.slice(1);
}

export function AdminAppointmentsSection() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadAppointments() {
    setLoading(true);
    setError("");

    try {
      const records = await getAdminAppointments();
      records.sort((a, b) =>
        `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
      );
      setAppointments(records);
    } catch (err) {
      console.error("Admin appointments loading error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not load appointment records. Check administrator permissions."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAppointments();
  }, []);

  async function changeStatus(
    appointmentId: string,
    status: AppointmentStatus
  ) {
    setSavingId(appointmentId);
    setError("");
    setSuccess("");

    try {
      await updateAppointmentStatus(appointmentId, status);
      setAppointments((current) =>
        current.map((item) =>
          item.id === appointmentId ? { ...item, status } : item
        )
      );
      setSuccess("Appointment status updated successfully.");
    } catch (err) {
      console.error("Admin appointment update error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not update the appointment."
      );
    } finally {
      setSavingId("");
    }
  }

  const visibleAppointments = useMemo(
    () =>
      filter === "all"
        ? appointments
        : appointments.filter((item) => item.status === filter),
    [appointments, filter]
  );

  const counts = {
    pending: appointments.filter((item) => item.status === "pending").length,
    scheduled: appointments.filter((item) => item.status === "scheduled").length,
    completed: appointments.filter((item) => item.status === "completed").length,
    cancelled: appointments.filter((item) => item.status === "cancelled").length,
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Appointment management
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Monitor appointment requests, scheduled visits and completed appointments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadAppointments()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Pending", value: counts.pending, color: "text-amber-700" },
          { label: "Scheduled", value: counts.scheduled, color: "text-blue-700" },
          { label: "Completed", value: counts.completed, color: "text-green-700" },
          { label: "Cancelled", value: counts.cancelled, color: "text-slate-600" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className={`mt-2 text-3xl font-extrabold ${item.color}`}>
              {loading ? "—" : item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
          <div>
            <h3 className="font-bold text-slate-900">Appointment records</h3>
            <p className="mt-1 text-xs text-slate-500">
              {appointments.length} total records
            </p>
          </div>

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">All appointments</option>
            {appointmentStatuses.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="p-8 text-center text-sm text-slate-500">
            Loading appointment records...
          </p>
        ) : visibleAppointments.length === 0 ? (
          <div className="p-10 text-center">
            <CalendarDays className="mx-auto mb-3 text-slate-300" size={36} />
            <h3 className="font-bold text-slate-800">No appointments found</h3>
            <p className="mt-1 text-sm text-slate-500">
              Appointment records matching this filter will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {visibleAppointments.map((appointment) => (
              <article key={appointment.id} className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900">
                      {appointment.title || "Maternal health appointment"}
                    </h4>
                    <p className="mt-1 text-sm text-slate-500">
                      {appointment.date} at {appointment.time}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Location: {appointment.location || "Not specified"}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyle(appointment.status)}`}>
                    {formatStatus(appointment.status)}
                  </span>
                </div>

                <div className="grid gap-3 rounded-xl bg-slate-50 p-4 text-xs sm:grid-cols-2">
                  <div>
                    <p className="font-semibold text-slate-500">Patient account ID</p>
                    <p className="mt-1 break-all text-slate-800">{appointment.patientUid}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-500">Assigned worker ID</p>
                    <p className="mt-1 break-all text-slate-800">
                      {appointment.assignedWorkerUid || "Not assigned"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-slate-400">
                    Record ID: {appointment.id}
                  </p>
                  <div className="flex items-center gap-2">
                    <label htmlFor={`appointment-status-${appointment.id}`} className="text-xs font-semibold text-slate-600">
                      Update status
                    </label>
                    <select
                      id={`appointment-status-${appointment.id}`}
                      value={appointment.status}
                      disabled={savingId === appointment.id}
                      onChange={(event) =>
                        void changeStatus(
                          appointment.id,
                          event.target.value as AppointmentStatus
                        )
                      }
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:opacity-50"
                    >
                      {appointmentStatuses.map((status) => (
                        <option key={status} value={status}>
                          {formatStatus(status)}
                        </option>
                      ))}
                    </select>
                    {savingId === appointment.id && (
                      <span className="text-xs text-blue-600">Saving...</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <p className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-5 text-blue-800">
        Patient and worker identifiers are shown here to help administrators
        track assignments. Appointment records are protected by administrator
        access rules.
      </p>
    </section>
  );
}

export function AdminHealthContentSection({
  profile,
}: {
  profile: UserProfile;
}) {
  const [content, setContent] = useState<HealthContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<HealthContentCategory>("general");

  async function loadContent() {
    setLoading(true);
    setError("");

    try {
      const records = await getAdminHealthContent(profile.uid);
      setContent(records);
    } catch (err) {
      console.error("Admin health content loading error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not load health content. Check administrator permissions."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadContent();
  }, [profile.uid]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setBody("");
    setCategory("general");
    setEditingId("");
    setShowForm(false);
  }

  function startEditing(item: HealthContent) {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description || "");
    setBody(item.body);
    setCategory(item.category);
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  async function saveContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (editingId) {
        await updateHealthContent(editingId, {
          title,
          description,
          body,
          category,
        });
        setSuccess("Health content updated successfully.");
      } else {
        await createHealthContent({
          title,
          description,
          body,
          category,
          createdByUid: profile.uid,
        });
        setSuccess("Health content draft created successfully.");
      }

      resetForm();
      await loadContent();
    } catch (err) {
      console.error("Health content save error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not save the health content."
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeContent(item: HealthContent) {
    const confirmed = window.confirm(
      `Delete "${item.title}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await deleteHealthContent(item.id);
      setContent((current) => current.filter((record) => record.id !== item.id));
      if (editingId === item.id) resetForm();
      setSuccess("Health content deleted.");
    } catch (err) {
      console.error("Health content deletion error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not delete this content."
      );
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Health content</h2>
          <p className="mt-1 text-sm text-slate-500">
            Create and manage maternal health education resources.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadContent()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setEditingId("");
                setTitle("");
                setDescription("");
                setBody("");
                setCategory("general");
                setShowForm(true);
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? "Close form" : "Create content"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {showForm && (
        <form onSubmit={saveContent} className="space-y-5 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h3 className="font-bold text-slate-900">
              {editingId ? "Edit health content" : "Create educational content"}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              New content is saved as a draft and is not visible to patients.
            </p>
          </div>

          <div>
            <label htmlFor="health-content-title" className="mb-2 block text-sm font-semibold text-slate-700">
              Title
            </label>
            <input
              id="health-content-title"
              required
              maxLength={150}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Preparing for your antenatal visit"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label htmlFor="health-content-description" className="mb-2 block text-sm font-semibold text-slate-700">
              Short description
            </label>
            <textarea
              id="health-content-description"
              rows={2}
              maxLength={300}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Briefly describe what this resource covers."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label htmlFor="health-content-category" className="mb-2 block text-sm font-semibold text-slate-700">
              Category
            </label>
            <select
              id="health-content-category"
              value={category}
              onChange={(event) => setCategory(event.target.value as HealthContentCategory)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              {contentCategories.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="health-content-body" className="mb-2 block text-sm font-semibold text-slate-700">
              Educational content
            </label>
            <textarea
              id="health-content-body"
              required
              rows={8}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Write the maternal health information here..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              <Save size={17} />
              {saving ? "Saving..." : editingId ? "Save changes" : "Save draft"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Your content records</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">
            {loading ? "—" : content.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Drafts</p>
          <p className="mt-2 text-3xl font-extrabold text-amber-700">
            {loading ? "—" : content.filter((item) => item.status === "draft").length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Approved content</p>
          <p className="mt-2 text-3xl font-extrabold text-green-700">
            {loading ? "—" : content.filter((item) => item.status === "approved").length}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-5">
          <h3 className="font-bold text-slate-900">Content library</h3>
          <p className="mt-1 text-xs text-slate-500">
            Content created by your administrator account.
          </p>
        </div>

        {loading ? (
          <p className="p-8 text-center text-sm text-slate-500">
            Loading health content...
          </p>
        ) : content.length === 0 ? (
          <div className="p-10 text-center">
            <BookOpen className="mx-auto mb-3 text-slate-300" size={36} />
            <h3 className="font-bold text-slate-800">No health content yet</h3>
            <p className="mt-1 text-sm text-slate-500">
              Create your first maternal health education resource.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {content.map((item) => (
              <article key={item.id} className="space-y-3 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900">{item.title}</h4>
                    <p className="mt-1 text-xs text-slate-500">
                      {contentCategories.find((categoryItem) => categoryItem.value === item.category)?.label || item.category}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyle(item.status)}`}>
                    {formatStatus(item.status)}
                  </span>
                </div>

                {item.description && (
                  <p className="text-sm text-slate-600">{item.description}</p>
                )}

                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {item.body}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                  <p className="text-xs text-slate-400">
                    {item.createdAt
                      ? `Created ${item.createdAt.toDate().toLocaleDateString()}`
                      : "Creation date unavailable"}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEditing(item)}
                      disabled={item.status === "approved"}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void removeContent(item)}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
        <div className="flex items-center gap-2 font-bold">
          <Clock size={15} />
          Content review and publication
        </div>
        <p className="mt-1">
          Drafts are not published to patients. Approval and publication are
          intentionally not available in this workspace until a secure review
          process is implemented.
        </p>
      </div>
    </section>
  );
}


