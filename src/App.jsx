import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CitizenDashboard from "./Citizen/CitizenDashboard";
import EmployeeDashboard from "./Employee/EmployeeDashboard";
import AdminDashboard from "./Admin/AdminDashboard";
import LoginForm from "./auth/LoginForm";
import RegisterForm from "./auth/RegisterForm";
import ForgotPasswordForm from "./auth/ForgotPasswordForm";
import UserFooter from "./main_component/UserFooter";
import FeedbackForm from "./Citizen/FeedbackForm";
import { findUserByRoleAndEmail, getAllUsers } from "./auth/authStorage";
import {
  DEPARTMENT_OPTIONS,
  addComplaintMessage,
  assignComplaintEmployee,
  createComplaint,
  findCitizenComplaint,
  formatDateTime,
  getAllComplaints,
  updateComplaintStatus,
  submitFeedback,
  getAllFeedback,
  deleteComplaint,
} from "./complaints/complaintStorage";

function AuthShell({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-100 to-sky-100 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-black text-blue-900">Smart City Portal</h1>
          <p className="mt-2 text-slate-600">Role-based authentication system</p>
        </div>
        <div className="flex justify-center">{children}</div>
      </div>
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const [currentUser, setCurrentUser] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [loginDefaults, setLoginDefaults] = useState({ role: "", email: "" });

  let authView = "home";
  let citizenView = "home";

  if (!currentUser || currentUser?.role === "Citizen") {
    if (path === "/login") authView = "login";
    else if (path === "/register") authView = "register";
    else if (path === "/forgot-password") authView = "forgot";
    else if (path === "/feedback") authView = "feedback";
    
    if (path === "/about") citizenView = "about";
    else if (path === "/contact") citizenView = "contact";
    else if (path === "/track") citizenView = "track";
    else if (path === "/submit-complaint") citizenView = "register";
    else if (path === "/all") citizenView = "all";
    else if (path === "/success") citizenView = "success";
    else if (path === "/profile") citizenView = "profile";
  }

  const setAuthView = (v, opts) => {
    if (v === "home") navigate("/");
    else if (v === "login") navigate("/login");
    else if (v === "register") navigate("/register");
    else if (v === "forgot") navigate("/forgot-password");
    else if (v === "feedback") navigate("/feedback" + (opts?.search || ""));
  };

  const setCitizenView = (v) => {
    if (v === "home") navigate("/");
    else if (v === "about") navigate("/about");
    else if (v === "contact") navigate("/contact");
    else if (v === "track") navigate("/track");
    else if (v === "register") navigate("/submit-complaint");
    else if (v === "all") navigate("/all");
    else if (v === "success") navigate("/success");
    else if (v === "profile") navigate("/profile");
  };
  const [guestMobile, setGuestMobile] = useState("");
  const [latestComplaint, setLatestComplaint] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackComplaintId, setFeedbackComplaintId] = useState("");

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [complaintsData, usersData, feedbackData] = await Promise.all([
          getAllComplaints(),
          getAllUsers(),
          getAllFeedback()
        ]);
        setComplaints(complaintsData);
        setEmployees(usersData.filter(u => u.role === "Employee"));
        setFeedbacks(feedbackData);
        
        // Check for feedback route
        const searchParams = new URLSearchParams(window.location.search);
        const feedbackId = searchParams.get('feedback');
        if (feedbackId) {
          setFeedbackComplaintId(feedbackId);
          setAuthView("feedback", { search: `?feedback=${feedbackId}` });
        }
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      }
    };
    fetchData();
  }, [currentUser]); // Refresh data when login state changes

  const handleLogin = async ({ role, email, password }) => {
    setLoginError("");
    setIsLoading(true);
    
    try {
      const user = await findUserByRoleAndEmail(role, email, password);
      if (!user) {
        setLoginError("Invalid credentials or role.");
        return;
      }
      setCurrentUser(user);
      navigate("/");
    } catch (err) {
      setLoginError("An error occurred while logging in.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrationSuccess = ({ role, email }) => {
    setAuthView("login");
    setLoginDefaults({ role, email });
    setLoginError("Registration successful. Please login.");
  };

  const handlePasswordResetSuccess = ({ email }) => {
    setAuthView("login");
    setLoginDefaults({ role: "", email });
    setLoginError("Password changed successfully. Please login.");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    navigate("/");
    setLoginDefaults({ role: "", email: "" });
    setLoginError("");
    setGuestMobile("");
    setLatestComplaint(null);
  };

  const handleComplaintSubmit = async (values) => {
    try {
      const complaint = await createComplaint(values);
      setLatestComplaint(complaint);
      setGuestMobile(values.mobile.trim());
      // Optimistically prepend the new complaint to local state — avoids a full re-fetch
      setComplaints((prev) => [complaint, ...prev]);
      setCitizenView("success");
    } catch (err) {
      console.error("Failed to submit complaint:", err);
      throw err; // Re-throw so the form can show an error message
    }
  };

  const handleTrack = async (complaintId) => {
    const identifier = currentUser?.email || currentUser?.mobile || guestMobile;
    return await findCitizenComplaint(complaintId, identifier);
  };

  const handleStatusUpdate = async (complaintId, status, employeeName, resolvedImageDataUrl) => {
    try {
      await updateComplaintStatus(complaintId, status, employeeName, resolvedImageDataUrl);
      const updatedComplaints = await getAllComplaints();
      setComplaints(updatedComplaints);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMessage = async (complaintId, message, employeeName) => {
    try {
      await addComplaintMessage(complaintId, message, employeeName);
      const updatedComplaints = await getAllComplaints();
      setComplaints(updatedComplaints);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignEmployee = async (complaintId, employeeName) => {
    try {
      await assignComplaintEmployee(complaintId, employeeName);
      const updatedComplaints = await getAllComplaints();
      setComplaints(updatedComplaints);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComplaint = async (complaintId) => {
    if (!window.confirm("Are you sure you want to delete this complaint? This cannot be undone.")) return;
    try {
      await deleteComplaint(complaintId);
      const updatedComplaints = await getAllComplaints();
      setComplaints(updatedComplaints);
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToAboutSection = () => {
    setTimeout(() => {
      const section = document.getElementById("about-us-section");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 0);
  };

  const handleGuestFooterQuickLink = (target) => {
    if (target === "about") {
      setCitizenView("home");
      scrollToAboutSection();
      return;
    }
    if (target === "home" || target === "about" || target === "contact") {
      setCitizenView(target);
      scrollToTop();
      return;
    }
    setAuthView("login");
    setLoginError("");
    scrollToTop();
  };

  const handleCitizenFooterQuickLink = (target) => {
    if (target === "about") {
      setCitizenView("home");
      scrollToAboutSection();
      return;
    }
    if (target === "home" || target === "contact" || target === "register" || target === "track" || target === "all") {
      setCitizenView(target);
      scrollToTop();
    }
  };

  if (!currentUser) {
    if (authView === "home") {
      return (
        <>
          <CitizenDashboard
            currentUser={null}
            view={citizenView}
            latestComplaint={latestComplaint}
            onViewChange={(nextView) => {
              if (nextView === "home" || nextView === "about" || nextView === "contact") {
                setCitizenView(nextView);
                return;
              }
              setAuthView("login");
              setLoginError("");
            }}
            onLogout={() => {
              setAuthView("login");
              setLoginError("");
            }}
            onSubmitComplaint={handleComplaintSubmit}
            onTrackComplaint={handleTrack}
            departments={DEPARTMENT_OPTIONS}
            formatDateTime={formatDateTime}
          />
          <UserFooter onQuickLink={handleGuestFooterQuickLink} />
        </>
      );
    }

    if (authView === "feedback") {
      return (
        <FeedbackForm
          complaintId={feedbackComplaintId}
          onSubmitFeedback={async (values) => {
            await submitFeedback(values);
            window.history.replaceState({}, document.title, window.location.pathname);
          }}
          onGoToHome={() => {
            window.history.replaceState({}, document.title, window.location.pathname);
            setAuthView("home");
          }}
        />
      );
    }

    return (
      <AuthShell>
        {authView === "login" ? (
          <LoginForm
            onLogin={handleLogin}
            onGoToRegister={() => {
              setAuthView("register");
              setLoginError("");
            }}
            onGoToForgotPassword={() => {
              setAuthView("forgot");
              setLoginError("");
            }}
            defaultValues={loginDefaults}
            errorMessage={loginError}
            isLoading={isLoading}
          />
        ) : null}

        {authView === "register" ? (
          <RegisterForm
            onGoToLogin={() => {
              setAuthView("login");
              setLoginError("");
            }}
            onRegistrationSuccess={handleRegistrationSuccess}
          />
        ) : null}

        {authView === "forgot" ? (
          <ForgotPasswordForm
            onGoToLogin={() => {
              setAuthView("login");
              setLoginError("");
            }}
            onPasswordResetSuccess={handlePasswordResetSuccess}
          />
        ) : null}
      </AuthShell>
    );
  }

  const showFooterForCurrentView = currentUser.role === "Citizen";

  return (
    <div className="min-h-screen bg-slate-100">
      {currentUser.role !== "Admin" && currentUser.role !== "Citizen" && currentUser.role !== "Employee" ? (
        <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl px-4 py-3">
            <button
               type="button"
              onClick={handleLogout}
              className="ml-auto rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      ) : null}

      {currentUser.role === "Citizen" ? (
        <CitizenDashboard
          currentUser={currentUser}
          view={citizenView}
          latestComplaint={latestComplaint}
          complaints={complaints}
          onViewChange={setCitizenView}
          onLogout={handleLogout}
          onSubmitComplaint={handleComplaintSubmit}
          onTrackComplaint={handleTrack}
          departments={DEPARTMENT_OPTIONS}
          formatDateTime={formatDateTime}
          onUpdateUser={setCurrentUser}
        />
      ) : null}

      {currentUser.role === "Employee" ? (
        <EmployeeDashboard
          currentUser={currentUser}
          complaints={complaints}
          onUpdateStatus={handleStatusUpdate}
          onAddMessage={handleAddMessage}
          formatDateTime={formatDateTime}
          onLogout={handleLogout}
          onUpdateUser={setCurrentUser}
        />
      ) : null}

      {currentUser.role === "Admin" ? (
        <AdminDashboard
          complaints={complaints}
          employees={employees}
          feedbacks={feedbacks}
          onAssignEmployee={handleAssignEmployee}
          onDeleteComplaint={handleDeleteComplaint}
          onLogout={handleLogout}
          formatDateTime={formatDateTime}
        />
      ) : null}
      {showFooterForCurrentView ? <UserFooter onQuickLink={handleCitizenFooterQuickLink} /> : null}
    </div>
  );
}
