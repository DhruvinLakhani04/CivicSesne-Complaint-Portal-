import { useState } from "react";
import { registerUser, sendOtp } from "./authStorage";

const roleOptions = ["Citizen", "Employee"];

export default function RegisterForm({ onGoToLogin, onRegistrationSuccess }) {
  const [values, setValues] = useState({
    role: "",
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
    otp: "",
    empId: "",
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const validate = (isSubmittingOTP = false) => {
    const errs = {};

    if (!values.role) errs.role = "Role is required.";
    else if (values.role === "Employee" && !values.empId.trim()) {
      errs.empId = "Employee ID is required for employees.";
    }

    if (!values.email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      errs.email = "Enter a valid email address.";
    }

    if (!values.fullName.trim()) errs.fullName = "Full name is required.";

    if (!values.password) {
      errs.password = "Password is required.";
    } else if (values.password.length < 6) {
      errs.password = "Password must be at least 6 characters.";
    }

    if (!values.confirmPassword) {
      errs.confirmPassword = "Confirm password is required.";
    } else if (values.password !== values.confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }

    if (isSubmittingOTP && !values.otp.trim()) {
      errs.otp = "OTP is required.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSendOtp = async () => {
    setGeneralError("");
    if (!validate(false)) return;

    try {
      setIsLoading(true);
      await sendOtp(values.email.trim());
      setOtpSent(true);
    } catch (err) {
      setGeneralError(err.message || "Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setGeneralError("");
    if (!validate(true)) return;

    try {
      setIsLoading(true);
      await registerUser({
        role: values.role,
        email: values.email.trim(),
        fullName: values.fullName.trim(),
        password: values.password,
        otp: values.otp.trim(),
        empId: values.role === "Employee" ? values.empId.trim() : undefined,
      });
      onRegistrationSuccess({ role: values.role, email: values.email.trim() });
    } catch (err) {
      setGeneralError(err.message || "An error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
      <h1 className="text-3xl font-black text-slate-800">Register</h1>
      <p className="mt-2 text-slate-500">Citizen and Employee registration only.</p>

      <form onSubmit={handleRegister} className="mt-6 space-y-5" noValidate>
        {/* Role */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Role</label>
          <select
            value={values.role}
            onChange={(e) => handleChange("role", e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-blue-500 focus:ring"
          >
            <option value="">Select role</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
        </div>

        {/* Employee ID (Only shows if role is Employee) */}
        {values.role === "Employee" && (
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Employee ID</label>
            <input
              type="text"
              value={values.empId}
              onChange={(e) => handleChange("empId", e.target.value)}
              placeholder="Enter your system-generated Employee ID"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-blue-500 focus:ring"
            />
            {errors.empId && <p className="mt-1 text-sm text-red-600">{errors.empId}</p>}
          </div>
        )}

        {/* Email */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
          <input
            type="email"
            value={values.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="Enter your email"
            disabled={otpSent}
            className={`w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-blue-500 focus:ring ${otpSent ? "bg-slate-100 text-slate-500" : ""}`}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        {/* Full Name */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Full Name</label>
          <input
            type="text"
            value={values.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            placeholder="Enter your full name"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-blue-500 focus:ring"
          />
          {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Password</label>
          <input
            type="password"
            value={values.password}
            onChange={(e) => handleChange("password", e.target.value)}
            placeholder="At least 6 characters"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-blue-500 focus:ring"
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Confirm Password</label>
          <input
            type="password"
            value={values.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            placeholder="Re-enter password"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-blue-500 focus:ring"
          />
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
        </div>

        {/* OTP Input (Only shows after OTP is sent) */}
        {otpSent && (
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">OTP</label>
            <input
              type="text"
              value={values.otp}
              onChange={(e) => handleChange("otp", e.target.value)}
              placeholder="Enter 6-digit OTP"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-blue-500 focus:ring"
            />
            {errors.otp && <p className="mt-1 text-sm text-red-600">{errors.otp}</p>}
          </div>
        )}

        {generalError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{generalError}</p>
        )}

        {!otpSent ? (
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={isLoading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {isLoading ? "Sending OTP..." : "Send Verify OTP"}
          </button>
        ) : (
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-green-600 px-4 py-3 font-bold text-white hover:bg-green-700 disabled:opacity-60 transition-colors"
          >
            {isLoading ? "Registering..." : "Complete Registration"}
          </button>
        )}
      </form>

      <p className="mt-5 text-center text-sm text-slate-600">
        Already registered?{" "}
        <button type="button" onClick={onGoToLogin} className="font-semibold text-blue-700 hover:text-blue-800">
          Go to Login
        </button>
      </p>
    </div>
  );
}
