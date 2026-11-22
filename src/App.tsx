
import { useEffect, useState } from "react";
import {
  Activity, CalendarDays, Bell, MessageCircle, HeartPulse, Home,
  UserRound, Menu, X, Plus, Clock, ChevronRight, ShieldCheck,
  Stethoscope, Send, Trash2, CheckCircle2, BookOpen, CalendarCheck,
  Leaf, FileText, Inbox, LockKeyhole, CircleHelp, MoreHorizontal,
  Phone, Mail, MapPin, ArrowRight, Info, Heart, Shield,
} from "lucide-react";
import type { UserProfile } from "./types";

// ------------------------------------------------------
// TYPES
// ------------------------------------------------------

type Page =
  | "Dashboard"
  | "Appointments"
  | "Reminders"
  | "Messages"
  | "Health Information"
  | "My Profile"
  | "Referrals"
  | "Notifications"
  | "Privacy & Consent"
  | "Help & Support";

type Appointment = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  status: "Upcoming" | "Completed";
};

type Message = {
  id: string;
  text: string;
  sender: "patient" | "worker";
  time: string;
};

type ProfileState = {
  name: string;
  phone: string;
  preferredLanguage: string;
  facility: string;
};

// ------------------------------------------------------
// NAVIGATION
// ------------------------------------------------------

const navigation: { name: Page; icon: typeof Home }[] = [
  { name: "Dashboard", icon: Home },
  { name: "Appointments", icon: CalendarDays },
  { name: "Reminders", icon: Bell },
  { name: "Messages", icon: MessageCircle },
  { name: "Health Information", icon: HeartPulse },
  { name: "My Profile", icon: UserRound },
  { name: "Referrals", icon: FileText },
  { name: "Notifications", icon: Inbox },
  { name: "Privacy & Consent", icon: LockKeyhole },
  { name: "Help & Support", icon: CircleHelp },
];

// ------------------------------------------------------
// INITIAL DATA
// ------------------------------------------------------

const initialAppointments: Appointment[] = [
  {
    id: "1",
    title: "Antenatal Care Visit",
    date: "2026-11-25",
    time: "09:00",
    location: "Kiryandongo Health Centre",
    status: "Upcoming",
  },
  {
    id: "2",
    title: "Follow-up Visit",
    date: "2026-12-02",
    time: "10:30",
    location: "Kiryandongo Health Centre",
    status: "Upcoming",
  },
];

const initialMessages: Message[] = [
  {
    id: "welcome",
    text: "Welcome to SANAD CareLink. You can use this space to send a message to your healthcare worker in this demonstration.",
    sender: "worker",
    time: "Today",
  },
];

const healthTopics = [
  {
    title: "Antenatal Care",
    description:
      "Regular antenatal visits help monitor your pregnancy and give you an opportunity to ask questions and receive support.",
    icon: CalendarCheck,
  },
  {
    title: "Nutrition During Pregnancy",
    description:
      "Eat a variety of nutritious foods, drink clean water, and follow advice from your healthcare worker.",
    icon: Leaf,
  },
  {
    title: "Maternal Wellbeing",
    description:
      "Rest when you can, talk to someone you trust, and seek support when you feel overwhelmed.",
    icon: HeartPulse,
  },
  {
    title: "Birth Preparation",
    description:
      "Discuss your birth plan, transport arrangements, and where to seek care with your healthcare worker.",
    icon: Stethoscope,
  },
];

// ------------------------------------------------------
// STORAGE AND HELPERS
// ------------------------------------------------------

const readStorage = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
};

const inputStyle =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[#63365F] focus:ring-4 focus:ring-[#63365F]/10";

const cardStyle =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6";

const primaryButtonStyle =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#63365F] px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4D294A] hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40";

const todayString = () => new Date().toISOString().split("T")[0];

// ------------------------------------------------------
// MAIN APPLICATION
// ------------------------------------------------------

function App({ authenticatedProfile }: { authenticatedProfile: UserProfile }) {
  const [page, setPage] = useState<Page>("Dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);

  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    readStorage("sanad-appointments-v2", initialAppointments)
  );

  const [messages, setMessages] = useState<Message[]>(() =>
    readStorage("sanad-messages-v2", initialMessages)
  );

  const [profile, setProfile] = useState<ProfileState>(() => ({
    name: authenticatedProfile.fullName || "",
    phone: authenticatedProfile.phone || "",
    preferredLanguage: authenticatedProfile.preferredLanguage || "English",
    facility: authenticatedProfile.facility || "Kiryandongo Health Centre",
  }));

  useEffect(() => {
    try {
      localStorage.setItem(
        "sanad-appointments-v2",
        JSON.stringify(appointments)
      );
    } catch {
      console.warn("Unable to save appointments locally.");
    }
  }, [appointments]);

  useEffect(() => {
    try {
      localStorage.setItem("sanad-messages-v2", JSON.stringify(messages));
    } catch {
      console.warn("Unable to save messages locally.");
    }
  }, [messages]);

  const openPage = (nextPage: Page) => {
    setPage(nextPage);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const upcoming = appointments.filter(
    (appointment) =>
      appointment.status === "Upcoming" &&
      appointment.date >= todayString()
  );

  const today = todayString();

  return (
    <div className="min-h-screen bg-[#F8F5F8] text-slate-800">
      {/* MOBILE HEADER */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 shadow-sm lg:hidden">
        <Brand />
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="rounded-xl p-2 text-slate-700 transition hover:bg-slate-100"
          aria-label="Toggle navigation"
          aria-expanded={mobileMenu}
        >
          {mobileMenu ? <X size={23} /> : <Menu size={23} />}
        </button>
      </header>

      {/* MOBILE MENU */}
      {mobileMenu && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white p-5 lg:hidden">
          <div className="mb-8 flex items-center justify-between">
            <Brand />
            <button
              onClick={() => setMobileMenu(false)}
              className="rounded-xl p-2 hover:bg-slate-100"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Navigation
          </p>
          <NavItems page={page} onNavigate={openPage} />
        </div>
      )}

      <div className="flex min-h-screen">
        {/* DESKTOP SIDEBAR */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-6 lg:flex">
          <Brand />

          <p className="mb-3 mt-10 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Main menu
          </p>

          <NavItems page={page} onNavigate={openPage} />

          <div className="mt-auto rounded-2xl bg-[#F5EFF5] p-4">
            <ShieldCheck className="mb-2 text-[#63365F]" size={22} />
            <p className="text-sm font-semibold text-[#4D294A]">
              Your wellbeing matters
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Your health, privacy, and dignity are important.
            </p>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 lg:px-10 lg:py-9 lg:pb-9">

            {/* ONE PAGE TITLE FOR ALL SCREENS */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-2xl font-bold text-slate-800">
                {page}
              </h1>

              <div className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2 sm:flex">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EADDEC] text-[#63365F]">
                  <UserRound size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {profile.name || "My Profile"}
                  </p>
                  <p className="text-xs text-slate-500">Patient account</p>
                </div>
              </div>
            </div>

            {/* PAGE CONTENT */}
            <div key={page} className="animate-[fadeIn_.3s_ease-out]">
              {page === "Dashboard" && (
                <Dashboard
                  appointments={appointments}
                  upcoming={upcoming}
                  today={today}
                  onNavigate={openPage}
                  name={profile.name}
                />
              )}

              {page === "Appointments" && (
                <AppointmentsPage
                  appointments={appointments}
                  setAppointments={setAppointments}
                />
              )}

              {page === "Reminders" && (
                <RemindersPage appointments={upcoming} />
              )}

              {page === "Messages" && (
                <MessagesPage messages={messages} setMessages={setMessages} />
              )}

              {page === "Health Information" && <HealthPage />}

              {page === "My Profile" && (
                <ProfilePage profile={profile} setProfile={setProfile} />
              )}

              {page === "Referrals" && <ReferralsPage />}
              {page === "Notifications" && <NotificationsPage />}
              {page === "Privacy & Consent" && <PrivacyPage />}
              {page === "Help & Support" && <HelpPage />}
            </div>

            {/* FOOTER */}
            <footer className="mt-12 border-t border-slate-200 pt-5 text-center text-xs leading-5 text-slate-400">
              <p>SANAD CareLink · Maternal healthcare support</p>
              <p className="mt-1">
                Supporting safer and more connected maternal care.
              </p>
            </footer>
          </div>
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-around">
          {navigation.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => openPage(name)}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium transition ${
                page === name
                  ? "text-[#63365F]"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              aria-current={page === name ? "page" : undefined}
            >
              <span
                className={`flex h-8 w-9 items-center justify-center rounded-xl transition ${
                  page === name ? "bg-[#F0E5F0]" : ""
                }`}
              >
                <Icon size={19} />
              </span>
              <span className="truncate">{name}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

// ------------------------------------------------------
// BRAND
// ------------------------------------------------------

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#63365F] text-white shadow-sm">
        <Activity size={23} />
      </div>
      <div>
        <p className="text-lg font-bold tracking-tight text-[#4D294A]">
          SANAD
        </p>
        <p className="text-xs text-slate-500">CareLink</p>
      </div>
    </div>
  );
}

// ------------------------------------------------------
// NAVIGATION ITEMS
// ------------------------------------------------------

function NavItems({
  page,
  onNavigate,
}: {
  page: Page;
  onNavigate: (page: Page) => void;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {navigation.map(({ name, icon: Icon }) => (
        <button
          key={name}
          onClick={() => onNavigate(name)}
          aria-current={page === name ? "page" : undefined}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${
            page === name
              ? "bg-[#EADDEC] text-[#63365F] shadow-sm"
              : "text-slate-600 hover:bg-slate-50 hover:text-[#63365F]"
          }`}
        >
          <Icon size={19} />
          <span>{name}</span>
          {page === name && (
            <span className="ml-auto h-2 w-2 rounded-full bg-[#63365F]" />
          )}
        </button>
      ))}
    </nav>
  );
}

// ------------------------------------------------------
// DASHBOARD
// ------------------------------------------------------

function Dashboard({
  appointments,
  upcoming,
  today,
  onNavigate,
  name,
}: {
  appointments: Appointment[];
  upcoming: Appointment[];
  today: string;
  onNavigate: (page: Page) => void;
  name: string;
}) {
  const next = upcoming
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#63365F] to-[#4D294A] p-6 text-white shadow-lg sm:p-9">
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border-[25px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-20 right-20 h-48 w-48 rounded-full bg-white/5" />

        <div className="relative z-10">
          <p className="text-sm font-medium text-white/80">
            Your maternal care companion
          </p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
            Welcome, {name || "Mama"} 👋
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/90">
            Your care journey matters. Keep track of appointments,
            follow-ups, and connect with your healthcare team.
          </p>
          <button
            onClick={() => onNavigate("Appointments")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#63365F] transition hover:-translate-y-0.5 hover:bg-[#F5EFF5]"
          >
            <Plus size={18} />
            Manage appointments
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon={CalendarDays}
          label="Upcoming appointments"
          value={upcoming.length}
          detail="Visits scheduled"
        />
        <StatCard
          icon={Bell}
          label="Reminders"
          value={upcoming.length}
          detail="Appointments to remember"
        />
        <StatCard
          icon={MessageCircle}
          label="Messages"
          value="Available"
          detail="Demonstration messaging"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className={`${cardStyle} xl:col-span-2`}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">
                Upcoming appointments
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Stay connected with your care schedule.
              </p>
            </div>
            <button
              onClick={() => onNavigate("Appointments")}
              className="text-sm font-semibold text-[#63365F] hover:underline"
            >
              View all
            </button>
          </div>

          {next ? (
            <div className="rounded-2xl bg-[#F5EFF5] p-4 transition hover:bg-[#F0E5F0]">
              <div className="flex gap-4">
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-white text-[#63365F] shadow-sm">
                  <span className="text-xs font-medium">
                    {new Date(next.date + "T12:00:00").toLocaleString(
                      "en",
                      { month: "short" }
                    )}
                  </span>
                  <span className="text-xl font-bold">
                    {new Date(next.date + "T12:00:00").getDate()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{next.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {next.location}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                    <Clock size={14} />
                    {next.time}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState text="You don't have any upcoming appointments." />
          )}
        </div>

        <div className={cardStyle}>
          <h3 className="font-bold">Quick access</h3>
          <div className="mt-4 space-y-2">
            <QuickLink
              icon={MessageCircle}
              label="Message healthcare worker"
              onClick={() => onNavigate("Messages")}
            />
            <QuickLink
              icon={Bell}
              label="View reminders"
              onClick={() => onNavigate("Reminders")}
            />
            <QuickLink
              icon={BookOpen}
              label="Health information"
              onClick={() => onNavigate("Health Information")}
            />
            <QuickLink
              icon={UserRound}
              label="My profile"
              onClick={() => onNavigate("My Profile")}
            />
          </div>
        </div>
      </section>

      <section className={cardStyle}>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5EFF5] text-[#63365F]">
            <HeartPulse size={22} />
          </div>
          <div>
            <h3 className="font-bold">Your care overview</h3>
            <p className="text-sm text-slate-500">
              A summary of your appointments.
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <OverviewItem label="Total visits" value={appointments.length} />
          <OverviewItem
            label="Today"
            value={appointments.filter((a) => a.date === today).length}
          />
          <OverviewItem label="Upcoming" value={upcoming.length} />
        </div>
      </section>

      <section className="rounded-2xl border border-[#EADDEC] bg-[#F5EFF5] p-5">
        <div className="flex gap-3">
          <Heart className="mt-1 shrink-0 text-[#63365F]" size={22} />
          <div>
            <h3 className="font-semibold text-[#4D294A]">
              You are not alone in your care journey.
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              SANAD CareLink is designed to help you stay connected
              with maternal healthcare support.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// ------------------------------------------------------
// REUSABLE COMPONENTS
// ------------------------------------------------------

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Activity;
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <div className={`${cardStyle} hover:-translate-y-1`}>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F5EFF5] text-[#63365F]">
          <Icon size={21} />
        </div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
      <p className="mt-4 text-2xl font-bold text-slate-800">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function OverviewItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-28 rounded-xl bg-slate-50 px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-[#63365F]">{value}</p>
    </div>
  );
}

function QuickLink({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Activity;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left text-sm transition hover:border-[#EADDEC] hover:bg-[#F5EFF5]"
    >
      <Icon size={18} className="text-[#63365F]" />
      <span className="flex-1">{label}</span>
      <ChevronRight size={17} className="text-slate-400" />
    </button>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

// ------------------------------------------------------
// APPOINTMENTS
// ------------------------------------------------------

function AppointmentsPage({
  appointments,
  setAppointments,
}: {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("Antenatal Care Visit");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [location, setLocation] = useState("Kiryandongo Health Centre");

  const addAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !time || !location.trim()) return;

    const newAppointment: Appointment = {
      id: crypto.randomUUID(),
      title: title.trim(),
      date,
      time,
      location: location.trim(),
      status: "Upcoming",
    };

    setAppointments((previous) =>
      [...previous, newAppointment].sort((a, b) =>
        a.date.localeCompare(b.date)
      )
    );

    setTitle("Antenatal Care Visit");
    setDate("");
    setTime("09:00");
    setLocation("Kiryandongo Health Centre");
    setShowForm(false);
  };

  const removeAppointment = (id: string) => {
    if (window.confirm("Cancel this appointment from the prototype?")) {
      setAppointments((previous) =>
        previous.filter((appointment) => appointment.id !== id)
      );
    }
  };

  const sortedAppointments = appointments
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Keep track of your maternal care visits.
        </p>
        <button
          onClick={() => setShowForm(!showForm)}
          className={primaryButtonStyle}
        >
          <Plus size={18} />
          New appointment
        </button>
      </div>

      {showForm && (
        <form onSubmit={addAppointment} className={`${cardStyle} space-y-4`}>
          <h3 className="font-bold">Schedule an appointment</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Appointment type">
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputStyle}
                placeholder="e.g. Antenatal visit"
              />
            </FormField>
            <FormField label="Facility">
              <input
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={inputStyle}
              />
            </FormField>
            <FormField label="Date">
              <input
                required
                type="date"
                min={todayString()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputStyle}
              />
            </FormField>
            <FormField label="Time">
              <input
                required
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={inputStyle}
              />
            </FormField>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className={primaryButtonStyle}>
              <CheckCircle2 size={17} />
              Save appointment
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {sortedAppointments.length === 0 ? (
          <EmptyState text="No appointments yet. Add your first appointment above." />
        ) : (
          sortedAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className={`${cardStyle} flex flex-wrap items-center gap-4`}
            >
              <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-[#F5EFF5] text-[#63365F]">
                <span className="text-xs">
                  {new Date(appointment.date + "T12:00:00").toLocaleString(
                    "en",
                    { month: "short" }
                  )}
                </span>
                <span className="text-xl font-bold">
                  {new Date(appointment.date + "T12:00:00").getDate()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{appointment.title}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {appointment.location}
                </p>
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                  <Clock size={14} />
                  {appointment.time} · {appointment.status}
                </p>
              </div>
              <button
                onClick={() => removeAppointment(appointment.id)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                title="Cancel appointment"
                aria-label={`Cancel ${appointment.title}`}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="rounded-2xl bg-[#F5EFF5] p-5 text-sm leading-6 text-[#4D294A]">
        <Info size={20} className="mb-2" />
        <p className="font-semibold">Appointment information</p>
        <p className="mt-1">
          This prototype helps you keep track of planned visits. Please
          confirm appointment dates and times directly with your healthcare
          facility.
        </p>
      </div>
    </div>
  );
}

// ------------------------------------------------------
// REMINDERS
// ------------------------------------------------------

function RemindersPage({ appointments }: { appointments: Appointment[] }) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        Keep track of upcoming care and follow-ups.
      </p>
      <div className={cardStyle}>
        {appointments.length === 0 ? (
          <EmptyState text="You currently have no upcoming appointment reminders." />
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex gap-3 rounded-xl bg-[#F5EFF5] p-4"
              >
                <Bell className="mt-1 shrink-0 text-[#63365F]" size={20} />
                <div>
                  <p className="font-semibold">{appointment.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {appointment.date} at {appointment.time}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {appointment.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="rounded-2xl bg-[#EADDEC] p-5 text-sm leading-6 text-[#4D294A]">
        <Bell size={20} className="mb-2" />
        <p className="font-semibold">Reminder feature preview</p>
        <p className="mt-1">
          This prototype displays reminders inside the app.
        </p>
      </div>
    </div>
  );
}

// ------------------------------------------------------
// MESSAGES
// ------------------------------------------------------

function MessagesPage({
  messages,
  setMessages,
}: {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}) {
  const [text, setText] = useState("");

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      text: text.trim(),
      sender: "patient",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((previous) => [...previous, newMessage]);
    setText("");
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500">
        A demonstration of communication with your healthcare worker.
      </p>

      <div className="flex min-h-[440px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5EFF5] text-[#63365F]">
            <Stethoscope size={20} />
          </div>
          <div>
            <p className="font-semibold">Healthcare Support</p>
            <p className="text-xs text-slate-500">Demo conversation</p>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "patient" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.sender === "patient"
                    ? "rounded-br-sm bg-[#63365F] text-white"
                    : "rounded-bl-sm bg-slate-100 text-slate-700"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-6">
                  {message.text}
                </p>
                <p
                  className={`mt-2 text-right text-[10px] ${
                    message.sender === "patient"
                      ? "text-white/80"
                      : "text-slate-400"
                  }`}
                >
                  {message.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={sendMessage}
          className="flex gap-2 border-t border-slate-100 p-3"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className={`${inputStyle} min-w-0 flex-1`}
            aria-label="Message"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#63365F] text-white transition hover:bg-[#4D294A] disabled:opacity-40"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

// ------------------------------------------------------
// HEALTH INFORMATION
// ------------------------------------------------------

function HealthPage() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        Simple information to support your maternal wellbeing.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {healthTopics.map(({ title, description, icon: Icon }) => (
          <div
            key={title}
            className={`${cardStyle} hover:-translate-y-1`}
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5EFF5] text-[#63365F]">
              <Icon size={22} />
            </div>
            <h3 className="font-bold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {description}
            </p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-[#63365F] p-5 text-sm leading-6 text-white">
        <ShieldCheck size={22} className="mb-2" />
        <p className="font-semibold">When you need medical care</p>
        <p className="mt-1 text-white/90">
          For urgent symptoms or emergencies, seek help from a healthcare
          facility or local emergency provider immediately.
        </p>
      </div>
    </div>
  );
}

// ------------------------------------------------------
// PROFILE
// ------------------------------------------------------

function ProfilePage({
  profile,
  setProfile,
}: {
  profile: ProfileState;
  setProfile: React.Dispatch<React.SetStateAction<ProfileState>>;
}) {
  const [saved, setSaved] = useState(false);

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        Manage your demonstration profile.
      </p>

      <div className={`${cardStyle} flex items-center gap-4`}>
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EADDEC] text-[#63365F]">
          <UserRound size={30} />
        </div>
        <div>
          <h3 className="font-bold">{profile.name || "Your profile"}</h3>
          <p className="text-sm text-slate-500">Patient account</p>
        </div>
      </div>

      <form
        onSubmit={saveProfile}
        className="max-w-2xl space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
      >
        <h3 className="font-bold">Personal information</h3>

        <FormField label="Full name">
          <input
            className={inputStyle}
            value={profile.name}
            onChange={(e) =>
              setProfile((previous) => ({
                ...previous,
                name: e.target.value,
              }))
            }
          />
        </FormField>

        <FormField label="Phone number">
          <input
            className={inputStyle}
            value={profile.phone}
            onChange={(e) =>
              setProfile((previous) => ({
                ...previous,
                phone: e.target.value,
              }))
            }
            placeholder="Your phone number"
          />
        </FormField>

        <FormField label="Preferred language">
          <select
            className={inputStyle}
            value={profile.preferredLanguage}
            onChange={(e) =>
              setProfile((previous) => ({
                ...previous,
                preferredLanguage: e.target.value,
              }))
            }
          >
            <option>English</option>
            <option>Arabic</option>
            <option>Acholi</option>
            <option>Swahili</option>
            <option>Other</option>
          </select>
        </FormField>

        <FormField label="Health facility">
          <input
            className={inputStyle}
            value={profile.facility}
            onChange={(e) =>
              setProfile((previous) => ({
                ...previous,
                facility: e.target.value,
              }))
            }
          />
        </FormField>

        <button type="submit" className={primaryButtonStyle}>
          <CheckCircle2 size={17} />
          Save profile
        </button>

        {saved && (
          <p className="flex items-center gap-2 text-sm text-[#63365F]">
            <CheckCircle2 size={17} />
            Profile updated in this session.
          </p>
        )}
      </form>
    </div>
  );
}

// ------------------------------------------------------
// REFERRALS
// ------------------------------------------------------

function ReferralsPage() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        View referrals and follow-up care from your healthcare team.
      </p>
      <div className={cardStyle}>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5EFF5] text-[#63365F]">
          <FileText size={23} />
        </div>
        <h3 className="font-bold">Your referrals</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Referrals and follow-up information assigned by your healthcare
          team will appear here.
        </p>
        <div className="mt-5">
          <EmptyState text="You do not have any referrals yet." />
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------
// NOTIFICATIONS
// ------------------------------------------------------

function NotificationsPage() {
  const notifications = [
    {
      title: "Appointment reminders",
      text: "You will see reminders for your upcoming appointments here.",
      icon: Bell,
    },
    {
      title: "Care updates",
      text: "Updates from your healthcare team will appear here.",
      icon: MoreHorizontal,
    },
    {
      title: "Health information",
      text: "Important maternal health information will be displayed here.",
      icon: HeartPulse,
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        Stay up to date with your care journey.
      </p>
      <div className="space-y-3">
        {notifications.map(({ title, text, icon: Icon }) => (
          <div key={title} className={`${cardStyle} flex gap-3`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F5EFF5] text-[#63365F]">
              <Icon size={20} />
            </div>
            <div>
              <p className="font-semibold">{title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------
// PRIVACY AND CONSENT
// ------------------------------------------------------

function PrivacyPage() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        Learn how your privacy and information should be protected.
      </p>

      <div className={`${cardStyle} space-y-5`}>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5EFF5] text-[#63365F]">
            <Shield size={24} />
          </div>
          <div>
            <h3 className="font-bold">Your privacy matters</h3>
            <p className="text-sm text-slate-500">
              Respect, dignity, and confidentiality are important.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-sm leading-6 text-slate-600">
          <div>
            <h4 className="font-semibold text-slate-800">
              Personal information
            </h4>
            <p className="mt-1">
              Healthcare information should only be accessed by authorized
              people who need it to provide care.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800">
              Confidential communication
            </h4>
            <p className="mt-1">
              Messages about your care should be handled respectfully and
              shared only with authorized healthcare personnel. You can
              discuss safe ways to contact you with your healthcare worker.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800">Your consent</h4>
            <p className="mt-1">
              You should understand how your information is used and be able
              to ask questions before agreeing to information-sharing
              arrangements.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800">Shared devices</h4>
            <p className="mt-1">
              If you share a phone, protect your account and avoid displaying
              sensitive information where other people can see it.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
        <Info size={21} className="mb-2" />
        <p className="mt-1">
          This screen explains intended privacy principles. It is not a
          complete legal privacy policy or proof that this prototype has
          been independently security-certified.
        </p>
      </div>
    </div>
  );
}

// ------------------------------------------------------
// HELP AND SUPPORT
// ------------------------------------------------------

function HelpPage() {
  const helpItems = [
    {
      title: "Appointments",
      description:
        "Use the Appointments page to view and manage your demonstration appointments.",
      icon: CalendarDays,
    },
    {
      title: "Messages",
      description:
        "Use Messages to compose a demonstration message for your healthcare team.",
      icon: MessageCircle,
    },
    {
      title: "Reminders",
      description:
        "Check Reminders to review your upcoming care visits.",
      icon: Bell,
    },
    {
      title: "Profile",
      description:
        "Visit My Profile to review your contact and facility information.",
      icon: UserRound,
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        Find guidance on using SANAD CareLink.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {helpItems.map(({ title, description, icon: Icon }) => (
          <div key={title} className={cardStyle}>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5EFF5] text-[#63365F]">
              <Icon size={22} />
            </div>
            <h3 className="font-bold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {description}
            </p>
          </div>
        ))}
      </div>

      <div className={`${cardStyle} space-y-4`}>
        <h3 className="font-bold">Need assistance?</h3>
        <p className="text-sm leading-6 text-slate-500">
          For medical questions, appointment confirmation, or urgent
          healthcare needs, contact your healthcare facility.
        </p>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <MapPin size={18} className="text-[#63365F]" />
          Kiryandongo Health Centre
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Phone size={18} className="text-[#63365F]" />
          Contact your facility directly for its current phone number.
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Mail size={18} className="text-[#63365F]" />
          Healthcare support through your facility
        </div>
      </div>

      <div className="rounded-2xl bg-[#F5EFF5] p-5 text-sm leading-6 text-[#4D294A]">
        <div className="flex items-center gap-2">
          <CircleHelp size={20} />
          <p className="font-semibold">Important</p>
        </div>
        <p className="mt-2">
          SANAD CareLink supports communication and care coordination.
        </p>
      </div>
    </div>
  );
}

export default App;
