const API_URL = "http://localhost:5000/api";

export const DEPARTMENT_OPTIONS = [
  "Road Maintenance",
  "Water Supply",
  "Electricity",
  "Waste Management",
  "Sanitation",
];

export const STATUS_OPTIONS = ["Pending", "In Progress", "Resolved"];

export function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function getAllComplaints() {
  try {
    const res = await fetch(`${API_URL}/complaints`);
    if (!res.ok) throw new Error("Failed to fetch complaints");
    return await res.json();
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return [];
  }
}

export async function createComplaint(values) {
  try {
    const res = await fetch(`${API_URL}/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) throw new Error("Failed to create complaint");
    return await res.json();
  } catch (error) {
    console.error("Error creating complaint:", error);
    throw error;
  }
}

export async function assignComplaintEmployee(complaintId, employeeName) {
  try {
    const res = await fetch(`${API_URL}/complaints/${complaintId}/assign`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeName }),
    });
    if (!res.ok) throw new Error("Failed to assign employee");
    return await res.json();
  } catch (error) {
    console.error("Error assigning employee:", error);
    throw error;
  }
}

export async function findCitizenComplaint(complaintId, identifier) {
  try {
    const complaints = await getAllComplaints();
    return complaints.find(
      (item) => 
        item.complaintId.toLowerCase() === complaintId.toLowerCase() && 
        (item.email === identifier || item.mobile === identifier)
    ) || null;
  } catch (error) {
    console.error("Error finding complaint:", error);
    return null;
  }
}

export async function updateComplaintStatus(complaintId, status, employeeName, resolvedImageDataUrl) {
  try {
    const res = await fetch(`${API_URL}/complaints/${complaintId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, employeeName, resolvedImageDataUrl }),
    });
    if (!res.ok) throw new Error("Failed to update status");
    return await res.json();
  } catch (error) {
    console.error("Error updating status:", error);
    throw error;
  }
}

export async function addComplaintMessage(complaintId, message, employeeName) {
  try {
    const res = await fetch(`${API_URL}/complaints/${complaintId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, employeeName }),
    });
    if (!res.ok) throw new Error("Failed to add message");
    return await res.json();
  } catch (error) {
    console.error("Error adding message:", error);
    throw error;
  }
}

export async function submitFeedback(values) {
  try {
    const res = await fetch(`${API_URL}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) throw new Error("Failed to submit feedback");
    return await res.json();
  } catch (error) {
    console.error("Error submitting feedback:", error);
    throw error;
  }
}

export async function getAllFeedback() {
  try {
    const res = await fetch(`${API_URL}/feedback`);
    if (!res.ok) throw new Error("Failed to fetch feedback");
    return await res.json();
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return [];
  }
}

export async function deleteComplaint(complaintId) {
  try {
    const res = await fetch(`${API_URL}/complaints/${complaintId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete complaint");
    return await res.json();
  } catch (error) {
    console.error("Error deleting complaint:", error);
    throw error;
  }
}
