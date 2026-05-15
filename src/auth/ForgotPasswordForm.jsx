import { useState } from "react";
import { sendForgotPasswordOtp, resetPasswordByEmail } from "./authStorage";

function validateNewPassword(values) {
  const errors = {};

  if (!values.newPassword) {
    errors.newPassword = "New password is required.";
  } else if (values.newPassword.length < 6) {
    errors.newPassword = "Password must be at least 6 characters.";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirm password is required.";
  } else if (values.newPassword !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

export default function ForgotPasswordForm({ onGoToLogin, onPasswordResetSuccess }) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");

  const [newPasswordValues, setNewPasswordValues] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [newPasswordErrors, setNewPasswordErrors] = useState({});

  const handleSendOtp = async () => {
    setEmailError("");
    setGeneralError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError("Enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      await sendForgotPasswordOtp(trimmedEmail);
      setOtpSent(true);
    } catch (err) {
      if (err.message) {
        setGeneralError(err.message);
      } else {
        setGeneralError("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setGeneralError("");
    setOtpError("");

    if (!otp.trim()) {
      setOtpError("OTP is required.");
      return;
    }

    const errors = validateNewPassword(newPasswordValues);
    if (Object.keys(errors).length > 0) {
      setNewPasswordErrors(errors);
      return;
    }

    try {
      setIsLoading(true);
      await resetPasswordByEmail(email.trim(), otp.trim(), newPasswordValues.newPassword);
      onPasswordResetSuccess({ email: email.trim() });
    } catch (err) {
      if (err.message) {
        setGeneralError(err.message);
      } else {
        setGeneralError("An error occurred while changing password.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
      <h1 className="text-3xl font-black text-slate-800">Forgot Password</h1>
      <p className="mt-2 text-slate-500">Reset your password using your email address.</p>

      <div className="mt-6 space-y-5">
        {/* Email lookup */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
              setGeneralError("");
              setOtpSent(false);
            }}
            placeholder="Enter your registered email"
            disabled={otpSent || isLoading}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-blue-500 focus:ring disabled:bg-slate-100"
          />
          {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
        </div>

        {!otpSent && (
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={isLoading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isLoading ? "Sending OTP..." : "Send OTP"}
          </button>
        )}

        {/* New password section — unlocked after email verified */}
        {otpSent && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-sm font-bold text-emerald-700">✓ OTP sent to your email. Enter it below.</p>
            <form onSubmit={handleChangePassword} className="space-y-3" noValidate>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    setOtpError("");
                  }}
                  placeholder="Enter 6-digit OTP"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-blue-500 focus:ring"
                  maxLength={6}
                />
                {otpError && (
                  <p className="mt-1 text-sm text-red-600">{otpError}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">New Password</label>
                <input
                  type="password"
                  value={newPasswordValues.newPassword}
                  onChange={(e) => {
                    setNewPasswordValues((prev) => ({ ...prev, newPassword: e.target.value }));
                    setNewPasswordErrors((prev) => ({ ...prev, newPassword: "" }));
                  }}
                  placeholder="Enter new password"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-blue-500 focus:ring"
                />
                {newPasswordErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{newPasswordErrors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Confirm New Password</label>
                <input
                  type="password"
                  value={newPasswordValues.confirmPassword}
                  onChange={(e) => {
                    setNewPasswordValues((prev) => ({ ...prev, confirmPassword: e.target.value }));
                    setNewPasswordErrors((prev) => ({ ...prev, confirmPassword: "" }));
                  }}
                  placeholder="Confirm new password"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-blue-500 focus:ring"
                />
                {newPasswordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{newPasswordErrors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {isLoading ? "Updating..." : "Change Password"}
              </button>
            </form>
          </div>
        )}

        {generalError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{generalError}</p>}
      </div>

      <p className="mt-5 text-center text-sm text-slate-600">
        Back to login?{" "}
        <button type="button" onClick={onGoToLogin} className="font-semibold text-blue-700 hover:text-blue-800">
          Go to Login
        </button>
      </p>
    </div>
  );
}
