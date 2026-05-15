import { useState } from "react";

const roleOptions = ["Citizen", "Employee", "Admin"];

function validate(values) {
  const errors = {};

  if (!values.role) {
    errors.role = "Role is required.";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  }

  return errors;
}

export default function LoginForm({ onLogin, onGoToRegister, onGoToForgotPassword, defaultValues, errorMessage, isLoading }) {
  const [values, setValues] = useState({
    role: defaultValues?.role || "",
    email: defaultValues?.email || "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formErrors = validate(values);

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    onLogin({
      role: values.role,
      email: values.email.trim(),
      password: values.password,
    });
  };

  return (
    <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
      <h1 className="text-3xl font-black text-slate-800">Login</h1>
      <p className="mt-2 text-slate-500">Access your role-based dashboard.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Role</label>
          <select
            value={values.role}
            onChange={(event) => handleChange("role", event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-blue-500 focus:ring"
          >
            <option value="">Select role</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          {errors.role ? <p className="mt-1 text-sm text-red-600">{errors.role}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
          <input
            type="email"
            value={values.email}
            onChange={(event) => handleChange("email", event.target.value)}
            placeholder="Enter your email"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-blue-500 focus:ring"
          />
          {errors.email ? <p className="mt-1 text-sm text-red-600">{errors.email}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Password</label>
          <input
            type="password"
            value={values.password}
            onChange={(event) => handleChange("password", event.target.value)}
            placeholder="Enter password"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-blue-500 focus:ring"
          />
          {errors.password ? <p className="mt-1 text-sm text-red-600">{errors.password}</p> : null}
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={onGoToForgotPassword}
            className="text-sm font-semibold text-blue-700 hover:text-blue-800"
          >
            Forgot Password?
          </button>
        </div>

        {errorMessage ? (
          <p className={`rounded-lg px-3 py-2 text-sm ${errorMessage.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {errorMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600">
        New user?{" "}
        <button
          type="button"
          onClick={onGoToRegister}
          className="font-semibold text-blue-700 hover:text-blue-800"
        >
          Register here
        </button>
      </p>
    </div>
  );
}
