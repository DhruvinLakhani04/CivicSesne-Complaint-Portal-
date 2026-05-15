const API_URL = "http://localhost:5000/api";

export const DEFAULT_ADMIN = {
  role: "Admin",
  email: "admin@gmail.com",
  password: "111111",
  fullName: "System Admin",
};

export async function getAllUsers() {
  try {
    const res = await fetch(`${API_URL}/users`);
    if (!res.ok) throw new Error("Failed to fetch users");
    return await res.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function findUserByRoleAndEmail(role, email, password) {
  try {
    const res = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, email, password }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error logging in:", error);
    return null;
  }
}

export async function sendOtp(email) {
  try {
    const res = await fetch(`${API_URL}/users/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to send OTP");
    }

    return await res.json();
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
}

export async function registerUser(newUser) {
  try {
    const res = await fetch(`${API_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Registration failed");
    }

    return await res.json();
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
}

export async function findUserByEmail(email) {
  try {
    const res = await fetch(`${API_URL}/users/check/${encodeURIComponent(email)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error checking email:", error);
    return null;
  }
}

export async function sendForgotPasswordOtp(email) {
  try {
    const res = await fetch(`${API_URL}/users/forgot-password-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to send OTP");
    }

    return await res.json();
  } catch (error) {
    console.error("Error sending forgot password OTP:", error);
    throw error;
  }
}

export async function resetPasswordByEmail(email, otp, newPassword) {
  try {
    const res = await fetch(`${API_URL}/users/reset-password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword }),
    });
    
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reset password");
    }
    return true;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
}
