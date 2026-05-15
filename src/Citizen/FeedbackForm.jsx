import { useState, useEffect } from "react";
import { Star, CheckCircle2, BadgeCheck, ImageOff, Loader2, Building2, MapPin, Calendar } from "lucide-react";

const ratingLabels = ["", "Poor", "Below Average", "Average", "Good", "Excellent"];
const ratingColors = ["", "text-red-500", "text-orange-500", "text-amber-500", "text-blue-500", "text-emerald-500"];

export default function FeedbackForm({ complaintId, onSubmitFeedback, onGoToHome }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const [resolvedComplaintId, setResolvedComplaintId] = useState(
    () => complaintId || new URLSearchParams(window.location.search).get("feedback") || ""
  );
  const [complaint, setComplaint] = useState(null);
  const [isFetchingComplaint, setIsFetchingComplaint] = useState(false);

  // Parse complaintId from URL if not provided via props
  useEffect(() => {
    if (!resolvedComplaintId) {
      const searchParams = new URLSearchParams(window.location.search);
      const urlComplaintId = searchParams.get("feedback");
      if (urlComplaintId) setResolvedComplaintId(urlComplaintId);
    }
  }, [resolvedComplaintId]);

  // Fetch complaint details to show the resolution proof photo + context
  useEffect(() => {
    if (!resolvedComplaintId) return;
    let active = true;
    setIsFetchingComplaint(true);
    fetch(`http://localhost:5000/api/complaints`)
      .then((r) => r.json())
      .then((all) => {
        if (!active) return;
        const found = all.find((c) => c.complaintId === resolvedComplaintId);
        setComplaint(found || null);
      })
      .catch(() => {})
      .finally(() => { if (active) setIsFetchingComplaint(false); });
    return () => { active = false; };
  }, [resolvedComplaintId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resolvedComplaintId.trim()) { setError("Complaint ID is missing."); return; }
    if (!fullName.trim() || !email.trim()) { setError("Please provide your name and email."); return; }
    if (rating === 0) { setError("Please select a star rating."); return; }
    setError("");
    setIsSubmitting(true);
    try {
      await onSubmitFeedback({ complaintId: resolvedComplaintId, fullName, email, rating, comments });
      setIsSuccess(true);
    } catch {
      setError("An error occurred while submitting feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-slate-50 to-sky-50 px-4 py-10">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 shadow-inner">
            <BadgeCheck className="h-12 w-12 text-emerald-600" />
          </div>
          <h2 className="text-4xl font-black text-slate-800">Thank You!</h2>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">
            Your feedback has been submitted. It helps us deliver better civic services.
          </p>
          <button
            onClick={onGoToHome}
            className="mt-8 w-full rounded-xl bg-emerald-600 px-6 py-4 font-bold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 transition-all"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  const displayRating = hoverRating || rating;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-sky-100 px-4 py-10">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <span className="inline-block rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-700">
            Civic Sense Portal
          </span>
          <h1 className="mt-4 text-4xl font-black text-slate-800">Resolution Feedback</h1>
          <p className="mt-2 text-slate-500">Help us improve by rating how your complaint was handled.</p>
        </div>

        {/* Complaint Context Card */}
        {isFetchingComplaint ? (
          <div className="mb-6 flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-sm font-medium text-slate-500">Loading complaint details...</span>
          </div>
        ) : complaint ? (
          <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
            {/* Resolution proof photo */}
            {complaint.resolvedImageDataUrl ? (
              <div className="relative">
                <img
                  src={complaint.resolvedImageDataUrl}
                  alt="Resolution Proof"
                  className="h-56 w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">Resolution Proof</p>
                    <p className="text-lg font-black text-white">{complaint.department}</p>
                  </div>
                  <span className="rounded-full border border-emerald-400 bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 backdrop-blur-sm">
                    Resolved ✓
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex h-28 items-center justify-center gap-3 border-b border-slate-100 bg-slate-50">
                <ImageOff className="h-6 w-6 text-slate-400" />
                <span className="text-sm font-medium text-slate-400">No resolution photo available</span>
              </div>
            )}

            {/* Complaint meta */}
            <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100">
              <div className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Complaint ID</p>
                <p className="mt-1 text-sm font-bold text-slate-700 break-all">{complaint.complaintId}</p>
              </div>
              <div className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Location
                </p>
                <p className="mt-1 text-sm font-bold text-slate-700 line-clamp-2">{complaint.location || "—"}</p>
              </div>
              <div className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Assigned To
                </p>
                <p className="mt-1 text-sm font-bold text-slate-700">{complaint.assignedEmployee || "—"}</p>
              </div>
            </div>
          </div>
        ) : resolvedComplaintId ? (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <span className="text-amber-500">⚠</span>
            <p className="text-sm font-medium text-amber-700">Could not load complaint details. You may still submit your feedback below.</p>
          </div>
        ) : null}

        {/* Form Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-sky-100">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Complaint ID (read-only) */}
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700">Complaint ID</label>
              <input
                value={resolvedComplaintId}
                readOnly
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500 cursor-not-allowed"
              />
            </div>

            {/* Name & Email */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="rahul@example.com"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                />
              </div>
            </div>

            {/* Star Rating */}
            <div>
              <label className="mb-3 block text-sm font-bold text-slate-700">
                Rate the Resolution <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 py-6 px-4">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transform transition-transform duration-150 hover:scale-125 active:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`h-12 w-12 transition-colors duration-150 ${
                          displayRating >= star
                            ? "fill-yellow-400 text-yellow-400 drop-shadow-sm"
                            : "fill-transparent text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {displayRating > 0 && (
                  <p className={`text-base font-black tracking-wide ${ratingColors[displayRating]}`}>
                    {ratingLabels[displayRating]}
                  </p>
                )}
                {displayRating === 0 && (
                  <p className="text-sm font-medium text-slate-400">Tap a star to rate</p>
                )}
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700">
                Comments <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Tell us what went well, or how we could improve..."
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <span className="text-red-500 text-lg">⚠</span>
                <p className="text-sm font-semibold text-red-700">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                ) : (
                  <><CheckCircle2 className="h-4 w-4" /> Submit Feedback</>
                )}
              </button>
              <button
                type="button"
                onClick={onGoToHome}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3.5 font-semibold text-slate-700 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
