import {
  AlertCircle,
  CircleCheckBig,
  Clock3,
  Download,
  Filter,
  HardHat,
  Search,
  Timer,
  TrafficCone,
} from "lucide-react";
import heroBg from "../BackgroundMain1.png";
import DefaultNavbar from "../main_component/DefaultNavbar";

const stats = [
  { label: "Total Complaints", value: 8, icon: AlertCircle, tone: "from-blue-500 to-blue-600" },
  { label: "Pending", value: 4, icon: Clock3, tone: "from-amber-400 to-yellow-500" },
  { label: "In Progress", value: 3, icon: Timer, tone: "from-orange-400 to-orange-500" },
  { label: "Resolved", value: 1, icon: CircleCheckBig, tone: "from-lime-500 to-green-600" },
];

const complaints = [
  { id: 105, category: "Garbage", priority: "High", status: "In Progress", location: "Sector 17", icon: HardHat },
  { id: 104, category: "Road Damage", priority: "Medium", status: "Pending", location: "MG Road", icon: TrafficCone },
  { id: 103, category: "Street Light", priority: "Low", status: "Resolved", location: "Sector 5", icon: AlertCircle },
  { id: 102, category: "Water Supply", priority: "High", status: "In Progress", location: "Sector 12", icon: Timer },
  { id: 101, category: "Road Damage", priority: "High", status: "Pending", location: "Sector 9", icon: TrafficCone },
];

function priorityTone(priority) {
  if (priority === "High") return "bg-orange-100 text-orange-700";
  if (priority === "Medium") return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

function statusTone(status) {
  if (status === "In Progress") return "bg-orange-500 text-white";
  if (status === "Pending") return "bg-yellow-100 text-yellow-800";
  return "bg-green-100 text-green-800";
}

export default function CitizenComplaints() {
  const navbarItems = [
    { label: "Dashboard", onClick: () => {} },
    { label: "My Complaints", onClick: () => {}, variant: "primary" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100 pb-16">
      <img src={heroBg} alt="Smart City" className="absolute inset-0 h-full w-full object-cover object-bottom" />
      <div className="absolute inset-0 bg-linear-to-b from-sky-100/85 via-slate-100/92 to-slate-100/96" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-2 pt-8 text-white">
        <DefaultNavbar items={navbarItems} actionLabel="Logout" onAction={() => {}} className="mb-2" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-10">
        <h1 className="text-5xl font-black text-blue-900">Track Complaints</h1>
        <p className="mt-3 text-2xl text-slate-600">Monitor the status of your complaints in real-time.</p>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.label} className={`rounded-2xl bg-linear-to-br ${card.tone} p-5 text-white`}>
                  <div className="flex items-center gap-3 text-lg font-bold">
                    <Icon className="h-6 w-6" />
                    <span>{card.label}</span>
                  </div>
                  <p className="mt-3 text-5xl font-black">{card.value}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white/96 p-4 shadow">
          <div className="mb-4 flex flex-wrap gap-4">
            <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-700">
              <Filter className="h-4 w-4" />
              Filter by Status
            </button>
            <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-700">
              <Filter className="h-4 w-4" />
              Filter by Priority
            </button>
          </div>

          <div className="mb-4 flex flex-col gap-3 xl:flex-row">
            <select className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-lg text-slate-700 xl:w-44">
              <option>All</option>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>

            <label className="flex flex-1 items-center rounded-lg border border-slate-300 bg-white px-4">
              <Search className="mr-2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search complaints..."
                className="w-full bg-transparent py-3 text-lg outline-none"
              />
            </label>

            <button type="button" className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-lg font-bold text-white hover:bg-blue-700">
              <Download className="h-5 w-5" />
              Export CSV
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full bg-white">
              <thead className="bg-slate-100 text-left text-lg font-extrabold text-slate-700">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((item) => {
                  const Icon = item.icon;
                  return (
                    <tr key={item.id} className="border-t border-slate-200 text-xl">
                      <td className="px-6 py-4 font-bold text-blue-900">{item.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="rounded-full bg-blue-100 p-2 text-blue-600">
                            <Icon className="h-4 w-4" />
                          </span>
                          {item.category}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-4 py-1 text-base font-semibold ${priorityTone(item.priority)}`}>
                          {item.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-xl px-4 py-1 text-base font-semibold ${statusTone(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{item.location}</td>
                      <td className="px-6 py-4">
                        <button type="button" className="rounded-lg bg-blue-600 px-4 py-2 text-base font-semibold text-white hover:bg-blue-700">
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2 text-base">
            <button type="button" className="rounded border border-slate-300 px-3 py-1 text-slate-500">Prev</button>
            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                type="button"
                className={`rounded border px-3 py-1 ${page === 1 ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white text-slate-700"}`}
              >
                {page}
              </button>
            ))}
            <button type="button" className="rounded border border-slate-300 px-3 py-1 text-slate-600">Next</button>
          </div>
        </section>
      </main>
    </div>
  );
}
