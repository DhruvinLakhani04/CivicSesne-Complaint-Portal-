import { CheckCircle2, Clock3, FileStack } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import heroBg from "../BackgroundMain1.png";
import DefaultNavbar from "../main_component/DefaultNavbar";
import AdminMap from "./AdminMap";

export default function AdminDashboard({ complaints, employees, feedbacks, onAssignEmployee, onDeleteComplaint, onLogout, formatDateTime }) {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  let activeTab = "dashboard";
  if (path === "/admin/all-complaints") activeTab = "all-complaints";
  else if (path === "/admin/assign-complaints") activeTab = "assign-complaints";
  else if (path === "/admin/employees") activeTab = "employees";
  else if (path === "/admin/feedback") activeTab = "feedback";

  const setActiveTab = (tab) => {
    if (tab === "dashboard") navigate("/admin");
    else navigate(`/admin/${tab}`);
  };

  const [assignmentDraft, setAssignmentDraft] = useState({});
  const [filterDepartment, setFilterDepartment] = useState("All");

  const uniqueDepartments = useMemo(() => {
    const deps = new Set(complaints.map(c => c.department).filter(Boolean));
    return ["All", ...Array.from(deps)];
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    let result = complaints;
    if (filterDepartment !== "All") {
      result = complaints.filter(c => c.department === filterDepartment);
    }
    return [...result].sort((a, b) => {
      // Unassigned first
      if (!a.assignedEmployee && b.assignedEmployee) return -1;
      if (a.assignedEmployee && !b.assignedEmployee) return 1;
      return 0; // maintain relative order for others 
    });
  }, [complaints, filterDepartment]);

  const navbarItems = [
    { label: "Dashboard", onClick: () => setActiveTab("dashboard"), variant: "primary" },
    { label: "Employees", onClick: () => setActiveTab("employees"), variant: "primary" },
    { label: "Feedback", onClick: () => setActiveTab("feedback"), variant: "primary" },
  ];

  const overviewCards = useMemo(() => {
    const unassigned = complaints.filter((item) => !item.assignedEmployee).length;
    const inProgress = complaints.filter((item) => item.status === "In Progress").length;
    const resolved = complaints.filter((item) => item.status === "Resolved").length;
    return [
      { title: "New Complaints", value: unassigned, icon: FileStack, tone: "from-sky-400 to-blue-600" },
      { title: "In Progress", value: inProgress, icon: Clock3, tone: "from-amber-400 to-orange-500" },
      { title: "Resolved", value: resolved, icon: CheckCircle2, tone: "from-lime-400 to-green-600" },
    ];
  }, [complaints]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100 pb-16">
      <img src={heroBg} alt="Smart City" className="absolute inset-0 h-full w-full object-cover object-top" />
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200/38 via-sky-100/80 to-slate-100/96" />

      <section className="relative z-10 text-white">
        <div className="mx-auto max-w-7xl px-6 pb-12 pt-8">
          <DefaultNavbar items={navbarItems} actionLabel="Logout" onAction={onLogout} className="mb-14" />

          <div className="max-w-3xl">
            <h2 className="text-5xl font-black leading-tight text-blue-900">Admin Control Portal</h2>
            <p className="mt-4 text-2xl font-semibold text-blue-950">Monitor. Assign. Analyze city complaints efficiently.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => setActiveTab("all-complaints")}
                className="rounded-xl bg-blue-600 px-6 py-3 text-lg font-bold"
              >
                View All Complaints
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("assign-complaints")}
                className="rounded-xl bg-orange-500 px-6 py-3 text-lg font-bold"
              >
                Assign Complaints
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto max-w-7xl px-6">
        {activeTab === "dashboard" ? (
          <>
            <section className="rounded-3xl border border-slate-200 bg-white/93 p-8 shadow-xl shadow-sky-100">
              <h3 className="mb-7 text-center text-5xl font-black text-blue-900">System Overview</h3>
              <div className="grid gap-6 md:grid-cols-3">
                {overviewCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <article key={card.title} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow">
                      <div className={`bg-gradient-to-r ${card.tone} p-4 text-white`}>
                        <div className="flex items-center gap-2 text-2xl font-extrabold">
                          <Icon className="h-8 w-8" />
                          {card.title}
                        </div>
                      </div>
                      <div className="p-6 text-center text-6xl font-black text-slate-800">{card.value}</div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="mt-8 rounded-3xl border border-slate-200 bg-white/93 p-4 shadow-xl shadow-sky-100">
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                <AdminMap complaints={complaints} />
              </div>
            </section>
          </>
        ) : null}

        {activeTab === "all-complaints" ? (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white/95 p-6 md:p-8 shadow-xl shadow-sky-100">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
              <div>
                <h3 className="text-3xl font-black text-blue-900">All User Complaints</h3>
                <p className="mt-2 text-lg text-slate-600">A comprehensive overview of all complaints submitted by citizens.</p>
              </div>
              <div className="shrink-0 flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                <label htmlFor="dept-filter-all" className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3">Dept:</label>
                <select
                  id="dept-filter-all"
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="rounded-lg border-none bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  {uniqueDepartments.map(dept => (
                    <option key={dept} value={dept}>{dept === "All" ? "All Departments" : dept}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredComplaints.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-slate-50">
                  <p className="text-lg font-medium text-slate-500">No complaints match this filter.</p>
                </div>
              ) : (
                filteredComplaints.map((item) => (
                  <article key={item.complaintId} className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-blue-200">
                    <div className="flex flex-1 flex-col p-6">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold tracking-wide text-slate-700 border border-slate-200 shadow-sm">
                          #{item.complaintId}
                        </span>
                        <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${item.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                            item.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                              'bg-sky-100 text-sky-700'
                          }`}>
                          {item.status || 'New'}
                        </span>
                      </div>

                      <h4 className="mb-4 text-xl font-extrabold leading-snug text-slate-800 line-clamp-2" title={item.description}>
                        {item.description || "No description provided"}
                      </h4>

                      <div className="mb-5 flex-1 space-y-3 text-sm text-slate-600">
                        <p className="flex items-start gap-3"><span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mt-0.5 w-16">Citizen:</span> <span className="flex-1 font-semibold text-slate-700">{item.fullName}</span></p>
                        <p className="flex items-start gap-3"><span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mt-0.5 w-16">Dept:</span> <span className="flex-1 font-semibold text-slate-700">{item.department}</span></p>
                        <p className="flex items-start gap-3"><span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mt-0.5 w-16">Reported:</span> <span className="flex-1 font-medium text-slate-700">{formatDateTime(item.submittedAt)}</span></p>
                      </div>

                      <div className="mt-auto pt-4 border-t border-slate-100">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Assignment Status</p>
                        {item.assignedEmployee ? (
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase text-[10px]">
                              {item.assignedEmployee.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-700 text-sm truncate">{item.assignedEmployee}</span>
                          </div>
                        ) : (
                          <span className="inline-flex rounded-md bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-600 border border-orange-200">
                            Pending Assignment
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        ) : null}

        {activeTab === "assign-complaints" ? (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white/95 p-6 md:p-8 shadow-xl shadow-sky-100">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
              <div>
                <h3 className="text-3xl font-black text-blue-900">Assign Complaints</h3>
                <p className="mt-2 text-lg text-slate-600">Review open citizen complaints and assign them to municipal employees.</p>
              </div>
              <div className="shrink-0 flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                <label htmlFor="dept-filter-assign" className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3">Dept:</label>
                <select
                  id="dept-filter-assign"
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="rounded-lg border-none bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
                >
                  {uniqueDepartments.map(dept => (
                    <option key={dept} value={dept}>{dept === "All" ? "All Departments" : dept}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredComplaints.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-slate-50">
                  <p className="text-lg font-medium text-slate-500">No complaints match this filter.</p>
                </div>
              ) : (
                filteredComplaints.map((item) => (
                  <article key={item.complaintId} className={`group flex flex-col overflow-hidden rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-xl ${item.assignedEmployee ? "border-slate-200 bg-white shadow-sm" : "border-orange-200 bg-orange-50/30 shadow ring-1 ring-orange-100"
                    }`}>
                    <div className={`p-5 border-b ${item.assignedEmployee ? "border-slate-100 bg-slate-50/50" : "border-orange-100 bg-orange-50/80"}`}>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <span className="inline-flex rounded-lg bg-white px-3 py-1 text-xs font-bold tracking-wide text-slate-700 border border-slate-200 shadow-sm">
                          #{item.complaintId}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          {!item.assignedEmployee && (
                            <button
                              type="button"
                              onClick={() => onDeleteComplaint(item.complaintId)}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors border border-red-100 shadow-sm"
                              title="Delete Complaint"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                          )}
                          <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${item.assignedEmployee ? "bg-green-100 text-green-700 border border-green-200" : "bg-orange-100 text-orange-700 animate-pulse border border-orange-200 shadow-sm"
                            }`}>
                            {item.assignedEmployee ? "Assigned" : "Unassigned"}
                          </span>
                        </div>
                      </div>
                      <h4 className="text-lg font-extrabold leading-snug text-slate-800 line-clamp-2" title={item.description}>
                        {item.description || "No description provided"}
                      </h4>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex-1 space-y-3 text-sm text-slate-600 mb-6">
                        <p className="flex items-start gap-3"><span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mt-0.5 w-16">Citizen:</span> <span className="flex-1 font-semibold text-slate-700">{item.fullName} <span className="text-slate-400 font-medium whitespace-nowrap">({item.mobile})</span></span></p>
                        <p className="flex items-start gap-3"><span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mt-0.5 w-16">Dept:</span> <span className="flex-1 font-semibold text-slate-700">{item.department}</span></p>
                        <p className="flex items-start gap-3"><span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mt-0.5 w-16">Loc:</span> <span className="flex-1 font-medium text-slate-600 line-clamp-2" title={item.location}>{item.location}</span></p>
                      </div>

                      <div className="mt-auto pt-4 border-t border-slate-100">
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Employee Assignment</p>

                        {item.assignedEmployee ? (
                          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase text-xs shadow-inner">
                              {item.assignedEmployee.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-700 text-sm truncate">{item.assignedEmployee}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            <select
                              value={assignmentDraft[item.complaintId] || ""}
                              onChange={(event) =>
                                setAssignmentDraft((prev) => ({ ...prev, [item.complaintId]: event.target.value }))
                              }
                              className="w-full rounded-xl border border-orange-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 shadow-inner appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23cbd5e1%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_12px_center] bg-no-repeat pr-10 cursor-pointer"
                            >
                              <option value="">Select Employee...</option>
                              {employees.map((employee) => (
                                <option key={employee.mobile} value={employee.fullName || employee.mobile}>
                                  {employee.fullName || employee.mobile} ({employee.role})
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => onAssignEmployee(item.complaintId, assignmentDraft[item.complaintId] || "")}
                              disabled={!assignmentDraft[item.complaintId]}
                              className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white shadow-md shadow-orange-500/30 hover:-translate-y-0.5 hover:bg-orange-600 transition-all active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
                            >
                              Confirm Assignment
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        ) : null}

        {activeTab === "employees" ? (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white/95 p-6 md:p-8 shadow-xl shadow-sky-100">
            <h3 className="text-3xl font-black text-blue-900">All Employee Details</h3>
            <p className="mt-2 text-lg text-slate-600 mb-8">Manage and view all registered municipal employees in the system.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {employees.length === 0 ? (
                <div className="col-span-full rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center bg-slate-50">
                  <p className="text-lg font-medium text-slate-500">No employees registered yet.</p>
                </div>
              ) : (
                employees.map((employee) => (
                  <article key={employee.mobile} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-blue-200 flex flex-col p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="h-20 w-20 mb-4 rounded-full bg-gradient-to-tr from-blue-500 to-sky-400 p-[3px] shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                        <div className="flex h-full w-full items-center justify-center rounded-full border-[3px] border-white bg-slate-50 text-3xl font-black text-blue-600 uppercase shadow-inner">
                          {(employee.fullName || employee.mobile).charAt(0)}
                        </div>
                      </div>
                      <h4 className="text-xl font-extrabold text-slate-800 line-clamp-1 w-full" title={employee.fullName}>{employee.fullName || "Unnamed"}</h4>
                      <p className="mt-2 text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">{employee.role}</p>
                    </div>

                    <div className="mt-6 w-full space-y-3 text-sm text-slate-600 bg-slate-50/80 p-5 rounded-xl border border-slate-100 flex-1 flex flex-col justify-center">
                      <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm border border-slate-200 text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                        </div>
                        <span className="font-bold text-slate-700 truncate">{employee.mobile}</span>
                      </div>
                      <div className="flex items-center gap-3 pt-1">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm border border-slate-200 text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        </div>
                        <span className="font-semibold text-slate-600 truncate">{employee.email || "No email"}</span>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        ) : null}

        {activeTab === "feedback" ? (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white/95 p-6 md:p-8 shadow-xl shadow-sky-100">
            <h3 className="text-3xl font-black text-blue-900">Citizen Feedback</h3>
            <p className="mt-2 text-lg text-slate-600 mb-8">Review ratings and comments submitted by citizens for resolved complaints.</p>

            {(!feedbacks || feedbacks.length === 0) ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center bg-slate-50">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-yellow-500">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                </div>
                <p className="text-xl font-bold text-slate-700">No Feedback Received</p>
                <p className="mt-2 text-slate-500">Citizens haven't submitted any feedback yet.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {feedbacks.map((fb) => (
                  <article key={fb._id} className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-yellow-200">
                    <div className="flex justify-between items-start mb-5">
                      <div className="flex flex-col">
                        <p className="font-extrabold text-slate-800 text-lg line-clamp-1" title={fb.fullName}>{fb.fullName}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">{formatDateTime(fb.submittedAt)}</p>
                      </div>
                      <div className="flex bg-yellow-50 px-2.5 py-1.5 rounded-lg text-yellow-600 font-black text-sm border border-yellow-200 shadow-sm shrink-0 items-center gap-1.5">
                        {fb.rating} <span className="text-yellow-400 text-base leading-none">★</span>
                      </div>
                    </div>

                    <div className="text-sm font-medium text-slate-600 mb-6 pb-6 border-b border-slate-100 flex-1">
                      <p className="italic bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 leading-relaxed min-h-[80px]">
                        "{fb.comments || "No comments provided."}"
                      </p>
                    </div>

                    <div className="text-xs space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-100 mt-auto">
                      <p className="flex items-center justify-between gap-2"><span className="shrink-0 font-bold uppercase tracking-widest text-slate-400 text-[10px]">Reference</span> <span className="truncate font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded shadow-inner">#{fb.complaintId}</span></p>
                      {fb.email && <p className="flex items-center justify-between gap-2"><span className="shrink-0 font-bold uppercase tracking-widest text-slate-400 text-[10px]">Email</span> <span className="truncate font-medium text-slate-600">{fb.email}</span></p>}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}
      </main>
    </div>
  );
}
