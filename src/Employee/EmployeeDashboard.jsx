import { CheckCheck, ClipboardList, HardHat, ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";
import heroBg from "../BackgroundMain1.png";
import work1 from "../main_component/Work_1.png";
import work2 from "../main_component/Work_2.png";
import work3 from "../main_component/Work_3.png";
import { STATUS_OPTIONS } from "../complaints/complaintStorage";
import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DefaultNavbar from "../main_component/DefaultNavbar";



const responsibilities = [
  { title: "Resolve Assigned Complaints", text: "Work on AI-assigned city issues within your department.", icon: ShieldCheck, image: work1 },
  { title: "Update Resolution Proof", text: "Upload images and videos after work completion.", icon: ClipboardList, image: work3 },
  { title: "Maintain Resolution Time", text: "Close complaints within the defined SLA timeline.", icon: CheckCheck, image: work2 },
];

export default function EmployeeDashboard({
  currentUser,
  complaints,
  onUpdateStatus,
  onAddMessage,
  formatDateTime,
  onLogout,
  onUpdateUser,
}) {
  const [statusDraft, setStatusDraft] = useState({});
  const [messageDraft, setMessageDraft] = useState({});
  const [resolvedPhotoDraft, setResolvedPhotoDraft] = useState({});
  const [error, setError] = useState("");
  const [activeComplaintId, setActiveComplaintId] = useState("");
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  let activeTab = "dashboard";
  if (path === "/employee/assigned") activeTab = "assigned";
  else if (path === "/employee/workStatus") activeTab = "workStatus";
  else if (path === "/employee/history") activeTab = "history";
  else if (path === "/employee/profile") activeTab = "profile";

  const setActiveTab = (tab) => {
    if (tab === "dashboard") navigate("/employee");
    else navigate(`/employee/${tab}`);
  };

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileMobile, setProfileMobile] = useState(currentUser?.mobile || "");
  const [profilePhoto, setProfilePhoto] = useState(currentUser?.photoUrl || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const userAvatarUrl = currentUser?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.fullName || "User")}&background=0D8ABC&color=fff`;

  const assignedComplaints = useMemo(
    () =>
      complaints.filter((item) => {
        if (!item.assignedEmployee) return false;
        return item.assignedEmployee === currentUser?.fullName || item.assignedEmployee === currentUser?.mobile;
      }),
    [complaints, currentUser?.fullName, currentUser?.mobile]
  );
  const activeAssignments = useMemo(
    () => assignedComplaints.filter((item) => item.status !== "Resolved"),
    [assignedComplaints]
  );
  const resolvedHistory = useMemo(
    () => assignedComplaints.filter((item) => item.status === "Resolved"),
    [assignedComplaints]
  );
  const activeComplaint = activeComplaintId
    ? activeAssignments.find((item) => item.complaintId === activeComplaintId)
    : null;

  const summaryCards = useMemo(() => {
    const inProgressCount = assignedComplaints.filter((item) => item.status === "In Progress").length;
    const newlyAssignedCount = assignedComplaints.filter((item) => item.status !== "In Progress" && item.status !== "Resolved").length;
    return [
      { label: "New Complaints", value: newlyAssignedCount, icon: ClipboardList, tone: "from-sky-400 to-blue-600" },
      { label: "In Progress", value: inProgressCount, icon: HardHat, tone: "from-amber-300 to-orange-500" },
      { label: "Resolved", value: resolvedHistory.length, icon: CheckCheck, tone: "from-lime-300 to-green-500" },
    ];
  }, [assignedComplaints, resolvedHistory.length]);

  const navbarItems = [
    { label: "Home", onClick: () => setActiveTab("dashboard"), variant: "primary" },
    {
      label: "History",
      onClick: () => setActiveTab("history"),
      variant: "primary",
    },
    {
      isProfileAvatar: true,
      onClick: () => setActiveTab("profile"),
      avatarUrl: currentUser?.photoUrl,
    },
  ];

  const compressImage = (file, maxWidthPx = 1280, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, maxWidthPx / img.width);
          const canvas = document.createElement("canvas");
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (complaintId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match("image/(jpeg|jpg|png)")) {
      setError("Only JPG/PNG images are allowed.");
      e.target.value = "";
      return;
    }

    try {
      const compressed = await compressImage(file);
      setResolvedPhotoDraft((prev) => ({ ...prev, [complaintId]: compressed }));
      setError("");
    } catch {
      setError("Failed to process the selected image.");
    }
  };

  const applyStatus = async (complaintId) => {
    const nextStatus = statusDraft[complaintId];
    setError("");
    if (!nextStatus) {
      setError("Select status before updating.");
      return;
    }

    let resolvedImageDataUrl = undefined;
    if (nextStatus === "Resolved") {
      resolvedImageDataUrl = resolvedPhotoDraft[complaintId];
      if (!resolvedImageDataUrl) {
        setError("A photo is mandatory when resolving a complaint.");
        return;
      }
    }

    setIsSubmittingStatus(true);
    try {
      await onUpdateStatus(complaintId, nextStatus, currentUser?.fullName || "Employee", resolvedImageDataUrl);
      // Remove the drafted photo once applied
      setResolvedPhotoDraft((prev) => {
        const next = { ...prev };
        delete next[complaintId];
        return next;
      });
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  const addMessage = (complaintId) => {
    const message = (messageDraft[complaintId] || "").trim();
    setError("");
    if (!message) {
      setError("Message cannot be empty.");
      return;
    }
    onAddMessage(complaintId, message, currentUser?.fullName || "Employee");
    setMessageDraft((prev) => ({ ...prev, [complaintId]: "" }));
  };

  if (activeTab === "profile") {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <DefaultNavbar
          items={[{ label: "Back", onClick: () => setActiveTab("dashboard"), variant: "primary" }]}
          actionLabel={null}
          onAction={null}
          className="mb-8"
        />
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-slate-100 shadow-sm bg-slate-200">
                {isEditingProfile ? (
                  <>
                    <input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setProfilePhoto(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }} className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer" />
                    <img src={profilePhoto || userAvatarUrl} alt="Avatar" className="h-full w-full object-cover opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-800 pointer-events-none">Change</div>
                  </>
                ) : (
                  <img src={currentUser?.photoUrl || userAvatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                )}
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-800">My Profile</h2>
                <span className="mt-1 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">{currentUser?.role}</span>
              </div>
            </div>
            {!isEditingProfile ? (
              <button onClick={() => setIsEditingProfile(true)} className="rounded-lg bg-slate-100 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-200">
                Edit Profile
              </button>
            ) : null}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Full Name</p>
              <p className="mt-1 text-xl font-bold text-slate-800">{currentUser?.fullName}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Email Address</p>
              <p className="mt-1 text-xl font-bold text-slate-800">{currentUser?.email}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 flex flex-col justify-center">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Mobile Number</p>
              {isEditingProfile ? (
                <input
                  value={profileMobile}
                  onChange={e => setProfileMobile(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-xl font-bold text-slate-800 focus:border-blue-500 focus:outline-none bg-white"
                  placeholder="Enter mobile"
                />
              ) : (
                <p className="mt-1 text-xl font-bold text-slate-800">{currentUser?.mobile || "Not specified"}</p>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Account Status</p>
              <div className="mt-1 flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                <span className="text-xl font-bold text-emerald-700">Active</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 flex-wrap">
            {isEditingProfile ? (
              <>
                <button onClick={() => { setIsEditingProfile(false); setProfileMobile(currentUser?.mobile || ""); setProfilePhoto(currentUser?.photoUrl || ""); }} className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button
                  onClick={async () => {
                    const trimmedMobile = profileMobile.trim();
                    if (!trimmedMobile) {
                      alert("Mobile Number is required.");
                      return;
                    }
                    if (!/^\d{10}$/.test(trimmedMobile)) {
                      alert("Enter a valid 10-digit numeric mobile number.");
                      return;
                    }

                    setIsSavingProfile(true);
                    try {
                      const res = await fetch(`http://localhost:5000/api/users/${currentUser._id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          mobile: profileMobile,
                          photoDataUrl: profilePhoto !== currentUser?.photoUrl ? profilePhoto : undefined
                        }),
                      });
                      if (res.ok) {
                        const updatedUser = await res.json();
                        if (onUpdateUser) onUpdateUser(updatedUser);
                        setIsEditingProfile(false);
                        setActiveTab("dashboard");
                      } else {
                        alert("Failed to update profile");
                      }
                    } catch (e) {
                      alert("Error saving profile");
                    }
                    setIsSavingProfile(false);
                  }}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? <Loader2 className="h-5 w-5 animate-spin" /> : null} Save Changes
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onLogout}
                className="rounded-lg bg-red-500 px-6 py-3 font-semibold text-white shadow-sm hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100 pb-20">
      <img src={heroBg} alt="Smart City" className="absolute inset-0 h-full w-full object-cover object-top" />
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200/35 via-sky-100/78 to-slate-100/94" />

      <section className="relative z-10 text-white">
        <div className="mx-auto max-w-7xl px-6 pb-14 pt-8">
          <DefaultNavbar items={navbarItems} actionLabel={null} onAction={onLogout} className="mb-16" />

          <div className="max-w-3xl">
            <h2 className="text-5xl font-black leading-tight text-blue-900">Employee Resolution Portal</h2>
            <p className="mt-4 text-2xl font-semibold text-blue-950">View. Resolve. Update city issues efficiently.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => setActiveTab("assigned")}
                className="rounded-xl bg-orange-500 px-6 py-3 text-lg font-bold text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600"
              >
                See Assigned Complaints
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("workStatus")}
                className="rounded-xl bg-blue-700 px-6 py-3 text-lg font-bold text-white shadow-lg shadow-blue-700/30 hover:bg-blue-800"
              >
                Update Work Status
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto max-w-7xl px-6">
        {activeTab === "dashboard" && (
          <>
            <section className="rounded-3xl border border-slate-200 bg-white/93 p-8 shadow-xl shadow-sky-100">
              <h3 className="mb-7 text-center text-5xl font-black text-blue-900">Work Summary</h3>
              <div className="grid gap-6 md:grid-cols-3">
                {summaryCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <article key={card.label} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow">
                      <div className={`bg-gradient-to-r ${card.tone} p-4 text-white`}>
                        <div className="flex items-center gap-3 text-2xl font-extrabold">
                          <Icon className="h-8 w-8" />
                          {card.label}
                        </div>
                      </div>
                      <div className="p-6 text-center text-6xl font-black text-slate-800">{card.value}</div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="mt-8 rounded-3xl border border-slate-200 bg-white/93 p-8 shadow-xl shadow-sky-100">
              <h3 className="mb-7 text-center text-5xl font-black text-blue-900">Your Responsibilities</h3>
              <div className="grid gap-6 md:grid-cols-3">
                {responsibilities.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article key={item.title} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow">
                      <img src={item.image} alt={item.title} className="h-40 w-full object-cover" />
                      <div className="p-6">
                        <div className="mb-4 inline-flex rounded-xl bg-blue-100 p-3 text-blue-700">
                          <Icon className="h-8 w-8" />
                        </div>
                        <h4 className="text-3xl font-extrabold text-slate-800">{item.title}</h4>
                        <p className="mt-2 text-lg text-slate-600">{item.text}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {activeTab === "assigned" && (
          <>
            <section className="mt-8 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-xl shadow-sky-100">
              <h3 className="text-3xl font-black text-blue-900">Assigned Complaints</h3>
              {error ? <p className="mt-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeAssignments.length === 0 ? (
                  <p className="col-span-full text-center text-lg text-slate-500 py-10 font-medium">No assigned complaints yet.</p>
                ) : (
                  activeAssignments.map((item) => (
                    <article key={item.complaintId} className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-blue-200">
                      {item.photoDataUrl && (
                        <div className="h-48 w-full shrink-0 overflow-hidden bg-slate-100">
                          <img src={item.photoDataUrl} alt="Complaint proof" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        </div>
                      )}
                      <div className="flex flex-1 flex-col p-6">
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <span className="inline-flex rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold tracking-wide text-blue-700 border border-blue-100">
                            #{item.complaintId}
                          </span>
                          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
                            item.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                            item.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                            'bg-sky-100 text-sky-700'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        
                        <h4 className="mb-4 text-xl font-extrabold leading-snug text-slate-800 line-clamp-2" title={item.description}>
                          {item.description || "No description provided"}
                        </h4>

                        <div className="mb-5 flex-1 space-y-3 text-sm text-slate-600">
                          <p className="flex items-start gap-3"><span className="font-bold text-slate-400 uppercase tracking-wider text-xs mt-0.5 w-16">Citizen:</span> <span className="flex-1 font-medium text-slate-700">{item.fullName} <span className="text-slate-400">({item.mobile})</span></span></p>
                          <p className="flex items-start gap-3"><span className="font-bold text-slate-400 uppercase tracking-wider text-xs mt-0.5 w-16">Dept:</span> <span className="flex-1 font-medium text-slate-700">{item.department}</span></p>
                          <p className="flex items-start gap-3"><span className="font-bold text-slate-400 uppercase tracking-wider text-xs mt-0.5 w-16">Loc:</span> <span className="flex-1 font-medium text-slate-700 line-clamp-2" title={item.location}>{item.location}</span></p>
                          <p className="flex items-start gap-3"><span className="font-bold text-slate-400 uppercase tracking-wider text-xs w-16">Date:</span> <span className="flex-1 font-medium text-slate-700">{item.complaintDate || formatDateTime(item.submittedAt)}</span></p>
                        </div>

                        {item.progressMessages && item.progressMessages.length > 0 && (
                          <div className="mt-auto rounded-xl bg-slate-50 p-4 border border-slate-100">
                            <p className="mb-1.5 text-[10px] font-bold tracking-widest text-slate-400 uppercase">Latest Update</p>
                            <p className="text-sm font-semibold text-slate-700 line-clamp-2">{item.progressMessages[item.progressMessages.length - 1].message}</p>
                            <p className="mt-1 text-xs font-medium text-slate-500">{formatDateTime(item.progressMessages[item.progressMessages.length - 1].createdAt)}</p>
                          </div>
                        )}
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </>
        )}

        {activeTab === "workStatus" && (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white/95 p-6 md:p-8 shadow-xl shadow-sky-100">
            <h3 className="text-3xl font-black text-blue-900">Work Status Update</h3>
            <p className="mt-2 text-lg text-slate-600">Select an assigned complaint to update its progress and resolution status.</p>

            <div className="mt-8 flex flex-col lg:flex-row gap-8">
              {/* Left Column: Complaint Details/List */}
              <div className="w-full lg:w-1/3 flex flex-col gap-3">
                <h4 className="font-bold text-slate-800 mb-2">Assigned Duties ({activeAssignments.length})</h4>
                <div className="pr-2 flex flex-col gap-3 max-h-[600px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                  {activeAssignments.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center bg-slate-50">
                      <p className="text-slate-500 font-medium">No complaints assigned to you yet.</p>
                    </div>
                  ) : (
                    activeAssignments.map((item) => (
                      <button
                        key={item.complaintId}
                        type="button"
                        onClick={() => setActiveComplaintId(item.complaintId)}
                        className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all ${
                          activeComplaintId === item.complaintId 
                            ? "border-blue-400 bg-blue-50 shadow-md ring-1 ring-blue-400" 
                            : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-slate-800">#{item.complaintId}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            item.status === 'In Progress' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'
                          }`}>{item.status}</span>
                        </div>
                        <p className="mb-3 text-sm font-medium text-slate-600 line-clamp-2" title={item.description}>{item.description}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                          <span className="flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2 py-1 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-slate-300 transform transition group-hover:bg-blue-400"></span> {item.fullName.split(' ')[0]}
                          </span>
                          <span className="rounded-md bg-white border border-slate-200 px-2 py-1 shadow-sm">{item.department}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Update Panel */}
              <div className="w-full lg:w-2/3">
                {activeComplaint ? (
                  <div className="flex flex-col rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    {/* Header showing the selected complaint info briefly */}
                    <div className="bg-slate-50 border-b border-slate-200 p-6">
                       <div className="flex items-start justify-between">
                         <div>
                           <h4 className="text-2xl font-black text-slate-800 tracking-tight">Update Issue #{activeComplaint.complaintId}</h4>
                           <p className="mt-2 text-sm font-medium text-slate-500 flex flex-wrap gap-x-4 gap-y-2">
                            <span><strong className="text-slate-700">Citizen:</strong> {activeComplaint.fullName}</span>
                            <span><strong className="text-slate-700">Phone:</strong> {activeComplaint.mobile}</span>
                            <span><strong className="text-slate-700">Date:</strong> {formatDateTime(activeComplaint.submittedAt)}</span>
                           </p>
                         </div>
                         <div className="hidden sm:block">
                           <span className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-700 border border-slate-200 shadow-sm">
                             {activeComplaint.department}
                           </span>
                         </div>
                       </div>
                    </div>

                    <div className="p-6 md:p-8">
                       <div className="grid gap-6 md:grid-cols-2">
                         {/* Status Update section */}
                         <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-start">
                            <h5 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">Change Status</h5>
                            <div className="flex flex-col gap-4">
                              <select
                                value={statusDraft[activeComplaint.complaintId] || activeComplaint.status}
                                onChange={(e) =>
                                  setStatusDraft((prev) => ({ ...prev, [activeComplaint.complaintId]: e.target.value }))
                                }
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-inner"
                              >
                                {STATUS_OPTIONS.map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>

                                <button
                                 type="button"
                                 onClick={() => applyStatus(activeComplaint.complaintId)}
                                 disabled={isSubmittingStatus}
                                 className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/30 hover:-translate-y-0.5 hover:bg-blue-700 transition-all active:translate-y-0 disabled:opacity-60"
                               >
                                 {isSubmittingStatus ? "Saving..." : "Save Status"}
                               </button>
                            </div>

                            {(statusDraft[activeComplaint.complaintId] || activeComplaint.status) === "Resolved" && (
                              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-inner transition-all animate-fade-in">
                                <p className="mb-3 text-sm font-bold text-amber-800 flex items-center gap-2">
                                  <span className="text-xl">📸</span> Resolution Proof Required
                                </p>
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-amber-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-amber-100/30 transition-colors">
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-amber-700">
                                    <svg className="w-8 h-8 mb-2 opacity-70" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                    </svg>
                                    <p className="mb-1 text-sm font-semibold">Click to upload JPG</p>
                                    <p className="text-xs opacity-75">Maximum size: 5MB</p>
                                  </div>
                                  <input
                                    type="file"
                                    accept="image/jpeg, image/jpg"
                                    onChange={(e) => handlePhotoUpload(activeComplaint.complaintId, e)}
                                    className="hidden"
                                  />
                                </label>
                                {resolvedPhotoDraft[activeComplaint.complaintId] && (
                                  <div className="mt-4 relative rounded-xl overflow-hidden border border-amber-200 shadow-sm ring-2 ring-amber-100 ring-offset-1">
                                    <img
                                      src={resolvedPhotoDraft[activeComplaint.complaintId]}
                                      alt="Resolution Preview"
                                      className="h-36 w-full object-cover transition-transform hover:scale-105"
                                    />
                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur text-white text-[10px] uppercase tracking-wider px-2 py-1 rounded font-bold shadow">Preview</div>
                                  </div>
                                )}
                              </div>
                            )}
                         </div>

                         {/* Add Progress Message section */}
                         <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-start">
                            <h5 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">Add Log Entry</h5>
                            <div className="flex flex-col flex-1 gap-4">
                              <textarea
                                value={messageDraft[activeComplaint.complaintId] || ""}
                                onChange={(e) =>
                                  setMessageDraft((prev) => ({ ...prev, [activeComplaint.complaintId]: e.target.value }))
                                }
                                placeholder="Describe the work done or current status..."
                                className="w-full flex-1 min-h-[140px] rounded-xl border border-slate-300 bg-slate-50 p-4 text-sm font-medium text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none shadow-inner"
                              />
                              <button
                                type="button"
                                onClick={() => addMessage(activeComplaint.complaintId)}
                                className="w-full rounded-xl bg-slate-800 px-4 py-3 text-sm font-bold text-white shadow-md shadow-slate-800/20 hover:-translate-y-0.5 hover:bg-slate-900 transition-all active:translate-y-0"
                              >
                                Post Update Log
                              </button>
                            </div>
                         </div>
                       </div>

                       {/* Progress Messages History Outline */}
                       <div className="mt-10">
                          <h5 className="mb-6 text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-3 flex items-center gap-2">
                             <span className="text-xl">📋</span> Activity Timeline
                          </h5>
                          
                          {!(activeComplaint.progressMessages && activeComplaint.progressMessages.length > 0) ? (
                            <p className="text-center text-slate-500 text-sm py-8 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">No progress updates logged yet.</p>
                          ) : (
                            <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-8 ml-3 sm:ml-4 pb-4">
                              {(activeComplaint.progressMessages || []).map((entry, idx) => (
                                <div key={`${entry.createdAt}-${idx}`} className="relative group">
                                  <div className="absolute -left-[35px] sm:-left-[43px] top-1 h-5 w-5 rounded-full border-4 border-white bg-blue-500 shadow-sm transition-transform group-hover:scale-125 group-hover:bg-blue-600"></div>
                                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow hover:border-slate-300">
                                    <p className="text-sm font-semibold text-slate-700 leading-relaxed">{entry.message}</p>
                                    <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                      {formatDateTime(entry.createdAt)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full min-h-[500px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-10 text-center">
                    <div className="mb-6 rounded-3xl bg-blue-100 p-5 text-blue-500 shadow-inner">
                      <svg className="h-14 w-14" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                    </div>
                    <h4 className="text-3xl font-black text-slate-800">No Task Selected</h4>
                    <p className="mt-3 text-lg text-slate-500 max-w-sm">Please select a complaint from your assignments list on the left to start adding updates.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === "history" && (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white/95 p-6 md:p-8 shadow-xl shadow-sky-100">
            <h3 className="text-3xl font-black text-blue-900">Resolution History</h3>
            <p className="mt-2 text-lg text-slate-600">A complete log of all complaints you have successfully resolved.</p>
            
            <div className="mt-8">
              {resolvedHistory.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-slate-400">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  </div>
                  <p className="text-xl font-bold text-slate-700">No History Yet</p>
                  <p className="mt-2 text-slate-500">You haven't resolved any complaints yet.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {/* Table Header (Desktop Only) */}
                  <div className="hidden lg:grid grid-cols-12 gap-4 bg-slate-50 p-5 border-b border-slate-200 text-xs font-extrabold uppercase tracking-widest text-slate-500">
                    <div className="col-span-3 lg:col-span-2">Task ID</div>
                    <div className="col-span-3">Citizen</div>
                    <div className="col-span-4 lg:col-span-3">Issue Overview</div>
                    <div className="col-span-2 lg:col-span-2">Department</div>
                    <div className="col-span-12 lg:col-span-3 lg:text-right">Resolved On</div>
                  </div>
                  
                  {/* Table Body */}
                  <div className="divide-y divide-slate-100">
                    {resolvedHistory.map((item) => (
                      <div key={item.complaintId} className="flex flex-col lg:grid lg:grid-cols-12 lg:items-center gap-4 lg:gap-4 p-5 md:p-6 hover:bg-slate-50/80 transition-colors group">
                        
                        {/* Task ID & Mobile Badge */}
                        <div className="col-span-12 lg:col-span-2 flex items-center justify-between lg:justify-start gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-inner group-hover:bg-green-500 group-hover:text-white transition-colors">
                               <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <div>
                              <span className="block text-sm font-black text-slate-800 tracking-wide">#{item.complaintId}</span>
                              <span className="lg:hidden mt-0.5 inline-block text-xs font-bold text-slate-400 capitalize">{item.department}</span>
                            </div>
                          </div>
                          <div className="lg:hidden text-right">
                             <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-green-700 shadow-sm border border-green-200">Resolved</span>
                          </div>
                        </div>

                        {/* Citizen Info */}
                        <div className="col-span-12 lg:col-span-3">
                          <span className="lg:hidden mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Citizen Profile</span>
                          <span className="block text-sm font-bold text-slate-700">{item.fullName}</span>
                          <span className="text-xs font-medium text-slate-500">{item.mobile}</span>
                        </div>

                        {/* Issue Overview */}
                        <div className="col-span-12 lg:col-span-3">
                          <span className="lg:hidden mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Issue Details</span>
                          <p className="text-sm font-bold text-slate-700 line-clamp-2" title={item.description}>{item.description}</p>
                          <p className="mt-1 text-xs font-medium text-slate-500 truncate" title={item.location}>{item.location}</p>
                        </div>

                        {/* Department Banner (Desktop) */}
                        <div className="hidden lg:block lg:col-span-2">
                          <span className="inline-flex rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 shadow-sm">
                            {item.department}
                          </span>
                        </div>

                        {/* Timestamp */}
                        <div className="col-span-12 lg:col-span-3 flex flex-row lg:flex-col justify-between lg:justify-center items-center lg:items-end text-sm pt-4 lg:pt-0 border-t border-slate-100 lg:border-none">
                           <span className="lg:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                             Completed Date
                           </span>
                           <div className="text-right flex flex-col items-end">
                             <span className="font-bold text-slate-700 text-sm">{formatDateTime(item.updatedAt || item.submittedAt).split(' at ')[0] || formatDateTime(item.updatedAt || item.submittedAt)}</span>
                             <span className="mt-0.5 text-[11px] font-bold text-slate-400 tracking-wider uppercase">{formatDateTime(item.updatedAt || item.submittedAt).split(' at ')[1] ? `at ${formatDateTime(item.updatedAt || item.submittedAt).split(' at ')[1]}` : ""}</span>
                           </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}


      </main>
    </div>
  );
}
