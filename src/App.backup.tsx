
import { useEffect, useState } from "react";
import {
  Activity, CalendarDays, Bell, MessageCircle, HeartPulse, Home,
  UserRound, Menu, X, Plus, Clock, ChevronRight, ShieldCheck,
    Stethoscope, Send, Trash2, CheckCircle2, BookOpen,
  CalendarCheck, Leaf
} from "lucide-react";
import type { UserProfile } from "./types";

type Page = "Dashboard" | "Appointments" | "Reminders" | "Messages" | "Health Information" | "My Profile";

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

const navigation: { name: Page; icon: typeof Home }[] = [
  { name: "Dashboard", icon: Home },
  { name: "Appointments", icon: CalendarDays },
  { name: "Reminders", icon: Bell },
  { name: "Messages", icon: MessageCircle },
  { name: "Health Information", icon: HeartPulse },
  { name: "My Profile", icon: UserRound },
];

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

const healthTopics = [
  {
    title: "Antenatal Care",
    description: "Regular antenatal visits help monitor your pregnancy and give you an opportunity to ask questions and receive support.",
    icon: CalendarCheck,
  },
  {
    title: "Nutrition During Pregnancy",
    description: "Eat a variety of nutritious foods, drink clean water, and follow advice from your healthcare worker.",
    icon: Leaf,
  },
  {
    title: "Maternal Wellbeing",
    description: "Rest when you can, talk to someone you trust, and seek support when you feel overwhelmed.",
    icon: HeartPulse,
  },
  {
    title: "Birth Preparation",
    description: "Discuss your birth plan, transport arrangements, and where to seek care with your healthcare worker.",
    icon: Stethoscope,
  },
];

const readStorage = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) as T : fallback;
  } catch {
    return fallback;
  }
};

function App({ authenticatedProfile }: { authenticatedProfile: UserProfile }) {
  const [page, setPage] = useState<Page>("Dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);

  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    readStorage("sanad-appointments-v2", initialAppointments)
  );

  const [messages, setMessages] = useState<Message[]>(() =>
    readStorage("sanad-messages-v2", [
      {
        id: "welcome",
        text: "Welcome to SANAD CareLink. You can use this space to send a message to your healthcare worker in this demonstration.",
        sender: "worker",
        time: "Today",
      },
    ])
  );

  const [profile, setProfile] = useState(() => ({
  name: authenticatedProfile.fullName,
  phone: authenticatedProfile.phone || "",
  preferredLanguage: authenticatedProfile.preferredLanguage || "English",
  facility: authenticatedProfile.facility || "Kiryandongo Health Centre",
}));

  useEffect(() => {
    localStorage.setItem("sanad-appointments-v2", JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem("sanad-messages-v2", JSON.stringify(messages));
  }, [messages]);


  const openPage = (nextPage: Page) => {
    setPage(nextPage);
    setMobileMenu(false);
  };

  const upcoming = appointments.filter((a) => a.status === "Upcoming");
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-[#F8F5F8] text-slate-800">
      {/* Mobile header */}
      <header className="sticky top-0 z-40 flex items-center justify-between bg-white px-5 py-4 shadow-sm lg:hidden">
        <Brand />
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="rounded-xl p-2 text-slate-700 hover:bg-slate-100"
          aria-label="Toggle menu"
        >
          {mobileMenu ? <X size={23} /> : <Menu size={23} />}
        </button>
      </header>

      {/* Mobile navigation */}
      {mobileMenu && (
        <div className="fixed inset-0 z-50 bg-white p-5 lg:hidden">
          <div className="mb-8 flex items-center justify-between">
            <Brand />
            <button onClick={() => setMobileMenu(false)}><X size={24} /></button>
          </div>
          <NavItems page={page} onNavigate={openPage} />
        </div>
      )}

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-6 lg:flex">
          <Brand />
          <p className="mb-3 mt-10 text-xs font-semibold uppercase tracking-widest text-slate-400">Menu</p>
          <NavItems page={page} onNavigate={openPage} />
          <div className="mt-auto rounded-2xl bg-[#F5EFF5] p-4">
            <ShieldCheck className="mb-2 text-[#63365F]" size={22} />
            <p className="text-sm font-semibold text-[#4D294A]">Your wellbeing matters</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Your health and dignity are important.</p>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
            <div className="mb-8 hidden items-center justify-between lg:flex">
              <div>
                <p className="text-sm text-slate-500">SANAD CareLink / {page}</p>
                <h1 className="mt-1 text-2xl font-bold text-slate-800">{page}</h1>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EADDEC] text-[#63365F]">
                  <UserRound size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold">{profile.name || "My Profile"}</p>
                  <p className="text-xs text-slate-500">Patient account · Demo</p>
                </div>
              </div>
            </div>

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

            <footer className="mt-12 border-t border-slate-200 pt-5 text-center text-xs leading-5 text-slate-400">
              SANAD CareLink · Maternal healthcare support
              <p className="mt-1">Prototype only. Not a replacement for professional medical care.</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#63365F] text-white">
        <Activity size={23} />
      </div>
      <div>
        <p className="text-lg font-bold tracking-tight text-[#4D294A]">SANAD</p>
        <p className="text-xs text-slate-500">CareLink</p>
      </div>
    </div>
  );
}

function NavItems({ page, onNavigate }: { page: Page; onNavigate: (p: Page) => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {navigation.map(({ name, icon: Icon }) => (
        <button
          key={name}
          onClick={() => onNavigate(name)}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
            page === name
              ? "bg-[#EADDEC] text-[#63365F]"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Icon size={19} />
          {name}
        </button>
      ))}
    </nav>
  );
}

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
  onNavigate: (p: Page) => void;
  name: string;
}) {
  const next = upcoming.slice().sort((a, b) => a.date.localeCompare(b.date))[0];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-[#63365F] p-6 text-white sm:p-9">
        <p className="text-sm text-white/80">Your maternal care companion</p>
        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Welcome, {name || "Mama"} 👋</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/90">
          Your care journey matters. Keep track of appointments, follow-ups, and connect with your healthcare team.
        </p>
        <button
          onClick={() => onNavigate("Appointments")}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#63365F] hover:bg-[#F5EFF5]"
        >
          <Plus size={18} /> Manage appointments
        </button>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={CalendarDays} label="Upcoming appointments" value={upcoming.length} detail="Visits scheduled" />
        <StatCard icon={Bell} label="Reminders" value={upcoming.length} detail="Appointments to remember" />
        <StatCard icon={MessageCircle} label="Messages" value="Available" detail="Local demo messaging" />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">Upcoming appointments</h3>
              <p className="mt-1 text-sm text-slate-500">Stay connected with your care schedule.</p>
            </div>
            <button onClick={() => onNavigate("Appointments")} className="text-sm font-semibold text-[#63365F]">View all</button>
          </div>
          {next ? (
            <div className="rounded-2xl bg-[#F5EFF5] p-4">
              <div className="flex gap-4">
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-white text-[#63365F]">
                  <span className="text-xs font-medium">{new Date(next.date + "T12:00:00").toLocaleString("en", { month: "short" })}</span>
                  <span className="text-xl font-bold">{new Date(next.date + "T12:00:00").getDate()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{next.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{next.location}</p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><Clock size={14} /> {next.time}</p>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState text="You don't have any upcoming appointments." />
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h3 className="font-bold">Quick access</h3>
          <div className="mt-4 space-y-2">
            <QuickLink icon={MessageCircle} label="Message healthcare worker" onClick={() => onNavigate("Messages")} />
            <QuickLink icon={Bell} label="View reminders" onClick={() => onNavigate("Reminders")} />
            <QuickLink icon={BookOpen} label="Health information" onClick={() => onNavigate("Health Information")} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h3 className="font-bold">Your care overview</h3>
        <p className="mt-1 text-sm text-slate-500">A simple summary of your appointments.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
            <span className="text-slate-500">Total visits: </span><strong>{appointments.length}</strong>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
            <span className="text-slate-500">Today: </span><strong>{appointments.filter(a => a.date === today).length}</strong>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, detail }: { icon: typeof Activity; label: string; value: string | number; detail: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5EFF5] text-[#63365F]"><Icon size={21} /></div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
      <p className="mt-4 text-2xl font-bold text-slate-800">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
    );
}

function QuickLink({ icon: Icon, label, onClick }: { icon: typeof Activity; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left text-sm hover:bg-slate-50">
      <Icon size={18} className="text-[#63365F]" />
      <span className="flex-1">{label}</span>
      <ChevronRight size={17} className="text-slate-400" />
    </button>
    );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">{text}</div>;
}

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
      title,
      date,
      time,
      location,
      status: "Upcoming",
    };

    setAppointments(prev => [...prev, newAppointment].sort((a, b) => a.date.localeCompare(b.date)));
    setTitle("Antenatal Care Visit");
    setDate("");
    setTime("09:00");
    setLocation("Kiryandongo Health Centre");
    setShowForm(false);
  };

  const removeAppointment = (id: string) => {
    if (confirm("Cancel this appointment from the prototype?")) {
      setAppointments(prev => prev.filter(a => a.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">My appointments</h2>
          <p className="mt-1 text-sm text-slate-500">Keep track of your maternal care visits.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-xl bg-[#63365F] px-4 py-3 text-sm font-semibold text-white hover:bg-[#4D294A]">
          <Plus size={18} /> New appointment
        </button>
      </div>

      {showForm && (
        <form onSubmit={addAppointment} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h3 className="font-bold">Schedule an appointment</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Appointment type">
              <input required value={title} onChange={e => setTitle(e.target.value)} className={inputStyle} placeholder="e.g. Antenatal visit" />
            </FormField>
            <FormField label="Facility">
              <input required value={location} onChange={e => setLocation(e.target.value)} className={inputStyle} />
            </FormField>
            <FormField label="Date">
              <input required type="date" min={new Date().toISOString().split("T")[0]} value={date} onChange={e => setDate(e.target.value)} className={inputStyle} />
            </FormField>
            <FormField label="Time">
              <input required type="time" value={time} onChange={e => setTime(e.target.value)} className={inputStyle} />
            </FormField>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="rounded-xl bg-[#63365F] px-5 py-3 text-sm font-semibold text-white">Save appointment</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {appointments.length === 0 ? <EmptyState text="No appointments yet. Add your first appointment above." /> :
          appointments.slice().sort((a, b) => a.date.localeCompare(b.date)).map(appointment => (
            <div key={appointment.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-[#F5EFF5] text-[#63365F]">
                <span className="text-xs">{new Date(appointment.date + "T12:00:00").toLocaleString("en", { month: "short" })}</span>
        <span className="text-xl font-bold">{new Date(appointment.date + "T12:00:00").getDate()}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{appointment.title}</p>
                <p className="mt-1 text-sm text-slate-500">{appointment.location}</p>
                <p className="mt-1 text-sm text-slate-500">{appointment.time} · {appointment.status}</p>
              </div>
              <button onClick={() => removeAppointment(appointment.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Cancel appointment"><Trash2 size={18} /></button>
            </div>
        ))}
      </div>
    </div>
  );
}

const inputStyle = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#63365F] focus:ring-2 focus:ring-[#63365F]/10";

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-2"><span className="text-sm font-medium text-slate-700">{label}</span>{children}</label>;
}

function RemindersPage({ appointments }: { appointments: Appointment[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Reminders</h2>
        <p className="mt-1 text-sm text-slate-500">Keep track of upcoming care and follow-ups.</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        {appointments.length === 0 ? <EmptyState text="You currently have no upcoming appointment reminders." /> :
          <div className="space-y-3">
            {appointments.map(a => (
              <div key={a.id} className="flex gap-3 rounded-xl bg-[#F5EFF5] p-4">
                <Bell className="mt-1 text-[#63365F]" size={20} />
                <div>
                  <p className="font-semibold">{a.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{a.date} at {a.time}</p>
                  <p className="mt-1 text-xs text-slate-500">{a.location}</p>
                </div>
              </div>
            ))}
          </div>
        }
      </div>
      <div className="rounded-2xl bg-[#EADDEC] p-5 text-sm leading-6 text-[#4D294A]">
        <Bell size={20} className="mb-2" />
        <p className="font-semibold">Reminder feature preview</p>
        <p className="mt-1">This prototype displays reminders inside the app. Automatic SMS or push notifications are not connected yet.</p>
      </div>
    </div>
  );
}

function MessagesPage({ messages, setMessages }: { messages: Message[]; setMessages: React.Dispatch<React.SetStateAction<Message[]>> }) {
  const [text, setText] = useState("");

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const newMessage: Message = {
      id: crypto.randomUUID(),
      text: text.trim(),
      sender: "patient",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages(prev => [...prev, newMessage]);
    setText("");
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Messages</h2>
        <p className="mt-1 text-sm text-slate-500">A demonstration of communication with your healthcare worker.</p>
      </div>
      <div className="flex min-h-[440px] flex-col rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-100 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5EFF5] text-[#63365F]"><Stethoscope size={20} /></div>
          <div>
            <p className="font-semibold">Healthcare Support</p>
            <p className="text-xs text-slate-500">Demo conversation</p>
          </div>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map(message => (
            <div key={message.id} className={`flex ${message.sender === "patient" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.sender === "patient" ? "rounded-br-sm bg-[#63365F] text-white" : "rounded-bl-sm bg-slate-100 text-slate-700"}`}>
                <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>
                <p className={`mt-2 text-right text-[10px] ${message.sender === "patient" ? "text-white/80" : "text-slate-400"}`}>{message.time}</p>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="flex gap-2 border-t border-slate-100 p-3">
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message..." className={`${inputStyle} flex-1`} />
          <button disabled={!text.trim()} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#63365F] text-white disabled:opacity-40" aria-label="Send message"><Send size={18} /></button>
        </form>
      </div>
      <div className="rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-800">
        Demo only: messages stay on this device. No healthcare worker receives these messages yet.
      </div>
    </div>
  );
}

function HealthPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Health Information</h2>
        <p className="mt-1 text-sm text-slate-500">Simple information to support your maternal wellbeing.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {healthTopics.map(({ title, description, icon: Icon }) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5EFF5] text-[#63365F]"><Icon size={22} /></div>
            <h3 className="font-bold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-[#63365F] p-5 text-sm leading-6 text-white">
        <ShieldCheck size={22} className="mb-2" />
        <p className="font-semibold">When you need medical care</p>
        <p className="mt-1 text-white/90">For urgent symptoms or emergencies, seek help from a healthcare facility or local emergency provider immediately. Do not wait for a reply through this app.</p>
      </div>
    </div>
  );
}

function ProfilePage({ profile, setProfile }: { profile: { name: string; phone: string; preferredLanguage: string; facility: string }; setProfile: React.Dispatch<React.SetStateAction<typeof profile>> }) {
  const [saved, setSaved] = useState(false);

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">My Profile</h2>
        <p className="mt-1 text-sm text-slate-500">Manage your demonstration profile.</p>
      </div>
      <form onSubmit={saveProfile} className="max-w-2xl space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        <FormField label="Full name">
          <input className={inputStyle} value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
        </FormField>
        <FormField label="Phone number">
          <input className={inputStyle} value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="Your phone number" />
        </FormField>
        <FormField label="Preferred language">
          <select className={inputStyle} value={profile.preferredLanguage} onChange={e => setProfile(p => ({ ...p, preferredLanguage: e.target.value }))}>
            <option>English</option>
            <option>Arabic</option>
            <option>Acholi</option>
            <option>Swahili</option>
            <option>Other</option>
          </select>
        </FormField>
        <FormField label="Health facility">
          <input className={inputStyle} value={profile.facility} onChange={e => setProfile(p => ({ ...p, facility: e.target.value }))} />
        </FormField>
        <button type="submit" className="rounded-xl bg-[#63365F] px-5 py-3 text-sm font-semibold text-white">Save profile</button>
        {saved && <p className="flex items-center gap-2 text-sm text-[#63365F]"><CheckCircle2 size={17} /> Profile saved on this device.</p>}
      </form>
      <div className="rounded-xl bg-slate-100 p-4 text-xs leading-5 text-slate-500">
        This prototype does not use secure accounts. Do not enter real medical or sensitive personal information.
      </div>
    </div>
  );
}
export default App
