import { CheckCircle2, MapPin, Loader2, Map as MapIcon, ShieldCheck, Camera, Users } from "lucide-react";
import heroBg from "../BackgroundMain1.png";
import work1 from "../main_component/Work_1.png";
import work2 from "../main_component/Work_2.png";
import work3 from "../main_component/Work_3.png";
import { useState, useRef, useEffect } from "react";
import DefaultNavbar from "../main_component/DefaultNavbar";
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';

function OpenLayersMap({ position, setPosition, onLocationSelected }) {
  const mapElement = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return;

    const initialLonLat = position ? [position[1], position[0]] : [78.9629, 20.5937];
    const initialCoords = fromLonLat(initialLonLat);

    const iconFeature = new Feature({
      geometry: new Point(initialCoords),
    });
    markerRef.current = iconFeature;

    const iconStyle = new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      }),
    });
    iconFeature.setStyle(iconStyle);

    const vectorLayer = new VectorLayer({
      source: new VectorSource({ features: [iconFeature] }),
      zIndex: 10,
    });

    const map = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        vectorLayer,
      ],
      view: new View({
        center: initialCoords,
        zoom: position ? 15 : 5,
      }),
    });

    map.on('click', (event) => {
      const coords = event.coordinate;
      iconFeature.setGeometry(new Point(coords));
      const lonLat = toLonLat(coords);
      setPosition([lonLat[1], lonLat[0]]);
      if (onLocationSelected) {
        onLocationSelected(lonLat[1], lonLat[0]);
      }
    });

    mapRef.current = map;

    return () => {
      map.setTarget(null);
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && position && markerRef.current) {
      const newLonLat = [position[1], position[0]];
      const newCoords = fromLonLat(newLonLat);
      markerRef.current.setGeometry(new Point(newCoords));
      mapRef.current.getView().animate({ center: newCoords, zoom: 15, duration: 500 });
    }
  }, [position]);

  return <div ref={mapElement} style={{ width: '100%', height: '100%' }} />;
}


const workSteps = [
  { id: 1, title: "Register & Login", text: "Create your account and verify your city profile.", image: work1 },
  { id: 2, title: "Submit Complaint", text: "Describe issue details and upload photo evidence.", image: work3 },
  { id: 3, title: "Track & Get Updates", text: "Follow status and department actions in real-time.", image: work2 },
];

const keyFeatures = [
  { title: "Role-Based Workflows", text: "Dedicated portals for Citizens, Municipal Employees, and Admins.", image: work1 },
  { title: "Evidence-Based Resolution", text: "Mandatory photographic proof securely hosted via Cloudinary.", image: work3 },
  { title: "Live Status Tracking", text: "Transparent timeline updates from assignment to resolution.", image: work2 },
];

function validate(values) {
  const errors = {};
  if (!values.fullName.trim()) errors.fullName = "Full Name is required.";
  if (!values.department) errors.department = "Department is required.";
  if (!values.mobile.trim()) errors.mobile = "Mobile Number is required.";
  else if (!/^\d{10}$/.test(values.mobile.trim())) errors.mobile = "Enter a valid 10-digit numeric mobile number.";
  if (!values.complaintDate) errors.complaintDate = "Date is required.";
  if (!values.location.trim()) errors.location = "Location is required.";
  if (!values.description.trim()) errors.description = "Description is required.";
  if (!values.photoDataUrl) errors.photo = "Upload Photo is required.";
  return errors;
}

export default function CitizenDashboard({
  currentUser,
  view,
  latestComplaint,
  complaints,
  onViewChange,
  onLogout,
  onSubmitComplaint,
  onTrackComplaint,
  departments,
  formatDateTime,
  onUpdateUser,
}) {
  const [values, setValues] = useState({
    fullName: currentUser?.fullName || "",
    department: "",
    email: currentUser?.email || "",
    mobile: currentUser?.mobile || "",
    complaintDate: new Date().toISOString().slice(0, 10),
    location: "",
    latitude: null,
    longitude: null,
    description: "",
    photoDataUrl: "",
    photoName: "",
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [trackId, setTrackId] = useState("");
  const [trackError, setTrackError] = useState("");
  const [trackedComplaint, setTrackedComplaint] = useState(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [mapPosition, setMapPosition] = useState([20.5937, 78.9629]);
  const [markerPosition, setMarkerPosition] = useState(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileMobile, setProfileMobile] = useState(currentUser?.mobile || "");
  const [profilePhoto, setProfilePhoto] = useState(currentUser?.photoUrl || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userAvatarUrl = currentUser?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.fullName || "User")}&background=0D8ABC&color=fff`;
  const handleAboutUsClick = () => {
    if (view !== "home") {
      onViewChange("home");
      setTimeout(() => {
        const section = document.getElementById("about-us-section");
        if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } else {
      const section = document.getElementById("about-us-section");
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleContactUsClick = () => {
    const section = document.getElementById("site-footer");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const navbarItems = currentUser
    ? [
      { label: "All Complaints", onClick: () => onViewChange("all"), variant: "primary" },
      { label: "About Us", onClick: handleAboutUsClick, variant: "primary" },
      { label: "Contact Us", onClick: handleContactUsClick, variant: "primary" },
      { isProfileAvatar: true, onClick: () => onViewChange("profile"), avatarUrl: userAvatarUrl },
    ]
    : [
      { label: "About Us", onClick: handleAboutUsClick, variant: "primary" },
      { label: "Contact Us", onClick: handleContactUsClick, variant: "primary" },
    ];
  const actionLabel = currentUser ? null : "Login";

  const setField = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
  };

  const setCoordinates = (lat, lng) => {
    setValues((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  };

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

  const onPhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setErrors((prev) => ({ ...prev, photo: "Upload Photo is required." }));
      return;
    }
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setErrors((prev) => ({ ...prev, photo: "Only JPG/PNG photos are allowed." }));
      return;
    }

    try {
      const compressed = await compressImage(file);
      setValues((prev) => ({
        ...prev,
        photoDataUrl: compressed,
        photoName: file.name,
      }));
      setErrors((prev) => ({ ...prev, photo: "" }));
    } catch {
      setErrors((prev) => ({ ...prev, photo: "Failed to process selected image." }));
    }
  };

  const fetchAddressFromCoords = async (lat, lon) => {
    try {
      setIsFetchingLocation(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      if (!response.ok) throw new Error("Failed to fetch address");
      const data = await response.json();
      if (data && data.display_name) {
        setField("location", `${data.display_name} (Lat: ${lat.toFixed(5)}, Lng: ${lon.toFixed(5)})`);
      } else {
        setField("location", `Lat: ${lat.toFixed(5)}, Lng: ${lon.toFixed(5)}`);
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      setLocationError("Failed to fetch location address.");
      setField("location", `Lat: ${lat.toFixed(5)}, Lng: ${lon.toFixed(5)}`);
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const handleMapLocationSelected = (lat, lng) => {
    setCoordinates(lat, lng);
    fetchAddressFromCoords(lat, lng);
  };

  const fetchLocation = () => {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMapPosition([latitude, longitude]);
        setMarkerPosition([latitude, longitude]);
        setShowMap(true);
        setCoordinates(latitude, longitude);
        fetchAddressFromCoords(latitude, longitude);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationError("Permission denied or location unavailable.");
        setIsFetchingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const submit = async (event) => {
    event.preventDefault();
    const formErrors = validate(values);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError("");
    try {
      await onSubmitComplaint(values);
      setValues((prev) => ({
        ...prev,
        department: "",
        location: "",
        latitude: null,
        longitude: null,
        description: "",
        photoDataUrl: "",
        photoName: "",
        email: currentUser?.email || "",
      }));
    } catch {
      setSubmitError("Failed to submit complaint. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const track = async (event) => {
    event.preventDefault();
    setTrackError("");
    setTrackedComplaint(null);
    if (!trackId.trim()) {
      setTrackError("Complaint ID is required.");
      return;
    }
    const complaint = await onTrackComplaint(trackId.trim());
    if (!complaint) {
      setTrackError("Complaint not found for this user.");
      return;
    }
    setTrackedComplaint(complaint);
  };

  if (view === "register") {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <DefaultNavbar 
          items={[{ label: "Back", onClick: () => onViewChange("home"), variant: "primary" }]} 
          actionLabel={null} 
          onAction={null} 
          className="mb-8" 
        />
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
          <h2 className="text-2xl font-black text-slate-800">Register Complaint</h2>
          <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={submit} noValidate>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Full Name <span className="text-red-500">*</span></label>
              <input value={values.fullName} onChange={(e) => setField("fullName", e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              {errors.fullName ? <p className="mt-1 text-sm text-red-600">{errors.fullName}</p> : null}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Mobile Number <span className="text-red-500">*</span></label>
              <input
                value={values.mobile}
                onChange={(e) => setField("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
              {errors.mobile ? <p className="mt-1 text-sm text-red-600">{errors.mobile}</p> : null}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Department <span className="text-red-500">*</span></label>
              <select value={values.department} onChange={(e) => setField("department", e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                <option value="">Select Department</option>
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
              {errors.department ? <p className="mt-1 text-sm text-red-600">{errors.department}</p> : null}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Date <span className="text-red-500">*</span></label>
              <input type="date" value={values.complaintDate} onChange={(e) => setField("complaintDate", e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              {errors.complaintDate ? <p className="mt-1 text-sm text-red-600">{errors.complaintDate}</p> : null}
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-slate-700">Location <span className="text-red-500">*</span></label>
              <div className="flex flex-col gap-2 md:flex-row">
                <input value={values.location} onChange={(e) => setField("location", e.target.value)} placeholder="Enter your location or fetch automatically" className="flex-1 rounded-lg border border-slate-300 px-3 py-2" />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowMap(!showMap)}
                    className="flex shrink-0 items-center justify-center rounded-lg bg-indigo-100 px-4 py-2 font-semibold text-indigo-800 hover:bg-indigo-200 transition-colors"
                    title="Pick from Map"
                  >
                    <MapIcon className="mr-2 h-5 w-5" />
                    {showMap ? "Hide Map" : "Open Map"}
                  </button>
                  <button
                    type="button"
                    onClick={fetchLocation}
                    disabled={isFetchingLocation}
                    className="flex shrink-0 items-center justify-center rounded-lg bg-emerald-100 px-4 py-2 font-semibold text-emerald-800 hover:bg-emerald-200 transition-colors disabled:opacity-50"
                    title="Get current location"
                  >
                    {isFetchingLocation ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <MapPin className="mr-2 h-5 w-5" />
                    )}
                    {isFetchingLocation ? "Fetching..." : "Current Location"}
                  </button>
                </div>
              </div>

              {showMap && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600">Latitude</label>
                    <input type="text" readOnly value={markerPosition?.[0]?.toFixed(5) || ""} className="rounded border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm outline-hidden" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600">Longitude</label>
                    <input type="text" readOnly value={markerPosition?.[1]?.toFixed(5) || ""} className="rounded border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm outline-hidden" />
                  </div>
                </div>
              )}

              {showMap && (
                <div className="mt-3 overflow-hidden rounded-xl border border-slate-300 shadow-sm" style={{ height: "500px", position: "relative" }}>
                  <OpenLayersMap
                    position={markerPosition || mapPosition}
                    setPosition={(pos) => {
                      setMarkerPosition(pos);
                      setMapPosition(pos);
                    }}
                    onLocationSelected={handleMapLocationSelected}
                  />
                  <div className="bg-slate-50 px-3 py-2 text-xs text-slate-500 border-t border-slate-200 text-center pointer-events-none absolute bottom-0 w-full left-0 z-10 bg-opacity-90">
                    Click anywhere on the map to drop a pin.
                  </div>
                </div>
              )}

              {locationError ? <p className="mt-1 text-sm text-red-600">{locationError}</p> : null}
              {errors.location ? <p className="mt-1 text-sm text-red-600">{errors.location}</p> : null}
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-slate-700">Description</label>
              <textarea rows={4} value={values.description} onChange={(e) => setField("description", e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              {errors.description ? <p className="mt-1 text-sm text-red-600">{errors.description}</p> : null}
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-slate-700">Upload Photo (JPG/PNG) <span className="text-red-500">*</span></label>
              <input type="file" accept="image/png,image/jpeg" capture="environment" onChange={onPhoto} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              {values.photoName ? <p className="mt-1 text-sm text-slate-600">Selected: {values.photoName}</p> : null}
              {errors.photo ? <p className="mt-1 text-sm text-red-600">{errors.photo}</p> : null}
            </div>
            {submitError ? <p className="md:col-span-2 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p> : null}
            <div className="md:col-span-2 flex justify-end">
            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow hover:bg-blue-700 transition disabled:opacity-60">
              {isSubmitting ? "Submitting..." : "Submit Complaint"}
            </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (view === "success") {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <DefaultNavbar 
          items={[{ label: "Back", onClick: () => onViewChange("home"), variant: "primary" }]} 
          actionLabel={null} 
          onAction={null} 
          className="mb-8" 
        />
        <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow">
          <h2 className="text-2xl font-black text-emerald-700">Complaint Submitted Successfully</h2>
          {latestComplaint ? (
            <>
              <p className="mt-3 text-slate-700">Complaint ID: <span className="font-semibold">{latestComplaint.complaintId}</span></p>
              <p className="text-slate-700">Assigned Department: <span className="font-semibold">{latestComplaint.assignedDepartment}</span></p>
              <div className="mt-4 flex gap-3">
                <button type="button" onClick={() => onViewChange("all")} className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">Track Complaint</button>
                <button type="button" onClick={() => onViewChange("register")} className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700">Register Another</button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    );
  }

  if (view === "all") {
    const myComplaints = (complaints || []).filter(c =>
      (currentUser?.email && c.email === currentUser.email) ||
      (currentUser?.mobile && c.mobile === currentUser.mobile)
    );
    return (
      <div className="mx-auto max-w-5xl px-6 py-8">
        <DefaultNavbar
          items={[{ label: "Back", onClick: () => onViewChange("home"), variant: "primary" }]}
          actionLabel={null}
          onAction={null}
          className="mb-8"
        />
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-8 text-white">
            <h2 className="text-4xl font-black tracking-tight">Your Registered Complaints</h2>
            <p className="mt-2 text-lg font-medium text-blue-100">
              Track and monitor the status of all your civic requests.
            </p>
          </div>

          <div className="p-8 bg-slate-50">
            {myComplaints.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center shadow-sm">
                <div className="mb-4 rounded-full bg-slate-100 p-4 shadow-inner">
                  <CheckCircle2 className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800">No complaints yet</h3>
                <p className="mt-2 max-w-md text-slate-600">You haven't submitted any civic issues to the portal yet. When you do, they will appear here for easy tracking.</p>
                <button
                  type="button"
                  onClick={() => onViewChange("register")}
                  className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-bold text-white shadow-lg hover:bg-blue-700 transition"
                >
                  Submit New Complaint
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 place-items-start">
                {myComplaints.map(complaint => (
                  <article key={complaint.complaintId} className="w-full relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg">
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{complaint.complaintId}</p>
                          <h3 className="mt-1 text-xl font-black text-slate-800 leading-tight">{complaint.department}</h3>
                        </div>
                        <span className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide border ${complaint.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          complaint.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}>
                          {complaint.status}
                        </span>
                      </div>

                      <div className="mt-5 flex flex-col gap-3">
                        <div className="flex items-center gap-3 text-slate-600">
                          <MapPin className="h-5 w-5 shrink-0 text-slate-400" />
                          <p className="text-sm font-medium line-clamp-1">{complaint.location}</p>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-slate-400" />
                          <p className="text-sm font-medium">{formatDateTime(complaint.complaintDate)}</p>
                        </div>
                      </div>

                      <div className="mt-5 rounded-xl bg-slate-50 p-4 border border-slate-100">
                        <p className="text-sm text-slate-700 italic line-clamp-3">"{complaint.description}"</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={async () => {
                          setTrackId(complaint.complaintId);
                          setTrackedComplaint(null);
                          setTrackError("");
                          const c = await onTrackComplaint(complaint.complaintId);
                          if (c) setTrackedComplaint(c);
                          onViewChange("track");
                        }}
                        className="group flex items-center gap-2 rounded-lg bg-white border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-blue-800"
                      >
                        Track Progress
                        <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
            <div className="mt-8 border-t border-slate-200 pt-6">
              <button
                type="button"
                onClick={() => onViewChange("home")}
                className="rounded-lg bg-white border border-slate-300 shadow-sm px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === "track") {
    return (
      <div className="mx-auto max-w-5xl px-6 py-8">
        <DefaultNavbar
          items={[{ label: "Back", onClick: () => onViewChange("all"), variant: "primary" }]}
          actionLabel={actionLabel}
          onAction={onLogout}
          className="mb-8"
        />
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-8 text-white">
            <h2 className="text-4xl font-black tracking-tight">Track Complaint</h2>
            <p className="mt-2 text-lg font-medium text-blue-100">
              Review real-time updates and the timeline for your civic request.
            </p>
          </div>
          <div className="p-8 bg-slate-50">

            {trackedComplaint ? (
              <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
                <div className="border-b border-slate-100 bg-slate-50 p-6 sm:px-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold tracking-widest text-slate-400 uppercase">Complaint ID</p>
                      <h3 className="text-3xl font-black text-slate-800">{trackedComplaint.complaintId}</h3>
                    </div>
                    <span className={`inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-bold uppercase tracking-wide border ${trackedComplaint.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      trackedComplaint.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>
                      {trackedComplaint.status}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2">
                  <div className="border-r border-slate-100 p-6 sm:px-10">
                    <h4 className="mb-4 text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Complaint Details</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Department</p>
                        <p className="mt-1 font-semibold text-slate-800">{trackedComplaint.department}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Registered By</p>
                        <p className="mt-1 font-semibold text-slate-800">{trackedComplaint.fullName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Location</p>
                        <p className="mt-1 font-semibold text-slate-800">{trackedComplaint.location}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Date Reported</p>
                        <p className="mt-1 font-semibold text-slate-800">{formatDateTime(trackedComplaint.complaintDate)}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 text-sm italic text-slate-700">
                        "{trackedComplaint.description}"
                      </div>
                    </div>
                  </div>

                  <div className="p-6 sm:px-10 bg-slate-50/50">
                    <h4 className="mb-4 text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Attached Evidences</h4>
                    <div className="space-y-6">
                      {trackedComplaint.photoDataUrl ? (
                        <div>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Initial Submitted Photo</p>
                          <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                            <img src={trackedComplaint.photoDataUrl} alt="Initial Complaint Evidence" className="w-full h-48 object-cover" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
                          No initial photo attached.
                        </div>
                      )}

                      {trackedComplaint.status === 'Resolved' && trackedComplaint.resolvedImageDataUrl ? (
                        <div>
                          <p className="text-xs font-semibold text-emerald-500 uppercase tracking-widest mb-2">Resolution Proof</p>
                          <div className="overflow-hidden rounded-xl border-2 border-emerald-400 shadow-emerald-100/50 shadow-lg mt-2">
                            <img src={trackedComplaint.resolvedImageDataUrl} alt="Resolution Evidence" className="w-full h-48 object-cover" />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                {trackedComplaint.progressMessages && trackedComplaint.progressMessages.length > 0 ? (
                  <div className="border-t border-slate-100 p-6 sm:px-10 bg-slate-50">
                    <h4 className="mb-4 text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Timeline Updates</h4>
                    <div className="relative pl-4 border-l-2 border-slate-200 space-y-6 mt-6 ml-2">
                      {(trackedComplaint.progressMessages || []).map((entry, index) => (
                        <div key={`${entry.createdAt}-${index}`} className="relative">
                          <div className="absolute -left-[25px] top-1.5 h-3 w-3 rounded-full bg-blue-500 ring-4 ring-slate-50" />
                          <p className="text-sm font-bold text-slate-500">{formatDateTime(entry.createdAt)}</p>
                          <p className="mt-1 text-slate-800 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">{entry.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}


          </div>
        </div>
      </div>
    );
  }

  if (view === "profile") {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <DefaultNavbar
          items={[{ label: "Back", onClick: () => onViewChange("home"), variant: "primary" }]}
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
                        onViewChange("home");
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

  if (view === "about") {
    return (
      <div className="mx-auto max-w-5xl px-6 py-8">
        <DefaultNavbar items={navbarItems} actionLabel={actionLabel} onAction={onLogout} className="mb-8" />
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <div className="relative h-[400px] w-full bg-slate-900 flex flex-col items-center justify-center text-center px-4">
            <img src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80" alt="Civic Infrastructure" className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-b from-blue-950/80 via-blue-900/60 to-slate-900/90" />
            <div className="relative z-10 max-w-3xl">
              <span className="inline-block rounded-full bg-blue-500/20 px-4 py-1.5 text-sm font-bold tracking-widest text-blue-200 backdrop-blur-md border border-blue-400/30 mb-6 uppercase">The Civic Sense Portal</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6">Bridging the Gap Between Citizens and City Hall.</h2>
              <p className="text-lg md:text-xl font-medium text-slate-300">
                A transparent, photographic, and accountable civic complaint resolution platform.
              </p>
            </div>
          </div>
          <div className="p-8 md:p-14">
            
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-16 mb-16">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6 shadow-sm">
                  <ShieldCheck className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Accountable Reporting</h3>
                <p className="text-lg leading-relaxed text-slate-600">
                  Citizens can effortlessly report neighborhood issues like damaged roads, water leaks, or electrical outages. Every report is routed directly to the appropriate municipal department, bypassing bureaucratic delays and ensuring immediate visibility.
                </p>
              </div>
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6 shadow-sm">
                  <Camera className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Photographic Evidence</h3>
                <p className="text-lg leading-relaxed text-slate-600">
                  We believe in undeniable proof. Citizens upload initial photographs of the issue, and municipal employees are mandated to upload resolution-proof photographs upon completion. All images are securely processed and hosted via Cloudinary integrations.
                </p>
              </div>
              <div>
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-6 shadow-sm">
                  <MapPin className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Live Tracking</h3>
                <p className="text-lg leading-relaxed text-slate-600">
                  Total transparency from submission to resolution. Citizens receive live timeline updates, can view the specific employee assigned to their case, and track geographical coordinates of the problem site.
                </p>
              </div>
              <div>
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6 shadow-sm">
                  <Users className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Role-Based Workspaces</h3>
                <p className="text-lg leading-relaxed text-slate-600">
                  A custom-built ecosystem featuring a dedicated Citizen Dashboard for tracking, an Employee Portal for updating statuses on the ground, and an Admin control center for overseeing departmental efficiency.
                </p>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-50 border border-slate-100 p-10 md:p-14 text-center flex flex-col items-center shadow-inner">
               <h3 className="text-3xl font-black text-slate-800 mb-4">Built for the public good.</h3>
               <p className="text-xl text-slate-600 mb-10 max-w-3xl leading-relaxed">
                 Modern technology shouldn't just be for private enterprise. It should serve the public, streamlining interactions and drastically reducing resolution times for municipal works.
               </p>
               <button
                  type="button"
                  onClick={() => onViewChange("home")}
                  className="rounded-xl shadow-xl shadow-blue-600/20 bg-blue-600 px-10 py-4 text-lg font-bold text-white transition hover:bg-blue-700 hover:-translate-y-1 active:translate-y-0"
                >
                  Return to Dashboard
                </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  if (view === "contact") {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <DefaultNavbar items={navbarItems} actionLabel={actionLabel} onAction={onLogout} className="mb-8" />
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
          <h2 className="text-2xl font-black text-slate-800">Contact Us</h2>
          <div className="mt-4 space-y-2 text-slate-700">
            <p>
              <span className="font-semibold">Support Email:</span> support@smartcity.local
            </p>
            <p>
              <span className="font-semibold">Helpdesk Number:</span> +91 98765 43210
            </p>
            <p>
              <span className="font-semibold">Address:</span> Smart City Control Center, Civic Plaza
            </p>
          </div>
          <div className="mt-5">
            <button
              type="button"
              onClick={() => onViewChange("home")}
              className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#dfeaf8]">
      <img src={heroBg} alt="Smart City" className="absolute inset-0 h-full w-full object-cover object-top" />
      <div className="absolute inset-0 bg-linear-to-b from-sky-100/40 via-sky-50/65 to-slate-100/95" />

      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 pb-12 pt-8 text-white">
          <DefaultNavbar items={navbarItems} actionLabel={actionLabel} onAction={onLogout} className="mb-16" />

          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold leading-tight text-blue-900 md:text-6xl">
              Smart City Complaint Management System
            </h1>
            <p className="mt-5 text-lg font-semibold text-blue-950 md:text-2xl">Report. Track. Resolve urban issues efficiently.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button type="button" onClick={() => onViewChange("register")} className="rounded-xl bg-orange-500 px-7 py-3 text-lg font-bold text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600">
                Submit a Complaint
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-20">
        <section className="rounded-3xl border border-slate-200 bg-white/92 p-8 shadow-xl shadow-sky-100">
          <h2 className="mb-8 text-center text-4xl font-black text-blue-900">How It Works</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {workSteps.map((step) => (
              <article key={step.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow">
                <div className="px-5 pt-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-blue-600 text-lg font-bold text-white">{step.id}</div>
                    <h3 className="text-xl font-extrabold text-slate-800">{step.title}</h3>
                  </div>
                  <p className="mb-4 text-slate-600">{step.text}</p>
                </div>
                <img src={step.image} alt={step.title} className="h-40 w-full object-cover" />
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white/92 p-8 shadow-xl shadow-sky-100">
          <h2 className="mb-8 text-center text-4xl font-black text-blue-900">Key Features</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {keyFeatures.map((feature) => (
              <article key={feature.title} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow">
                <img src={feature.image} alt={feature.title} className="h-44 w-full object-cover" />
                <div className="p-6">
                  <h3 className="text-2xl font-extrabold text-slate-800">{feature.title}</h3>
                  <p className="mt-2 text-slate-600">{feature.text}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-8 flex items-center justify-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold">Smart workflows from submission to resolution</span>
          </div>
        </section>

        <section id="about-us-section" className="mt-16 rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl shadow-sky-100/50 overflow-hidden">
          <div className="grid md:grid-cols-5">
            <div className="relative flex flex-col justify-center p-12 text-white min-h-[400px] md:col-span-2">
              <img src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=80" alt="Cityscape infrastructure" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 via-blue-800/90 to-sky-800/90" />
              <div className="relative z-10">
                <span className="inline-block rounded-full border border-blue-400/30 bg-blue-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-200 mb-6 backdrop-blur-sm">Civic Sense</span>
                <h2 className="text-4xl lg:text-5xl font-black mb-6 leading-tight">Connecting Citizens & Officials</h2>
                <p className="text-lg text-blue-100 font-medium leading-relaxed">
                  A transparent complaint resolution platform built to maintain better neighborhoods.
                </p>
              </div>
            </div>
            <div className="p-10 md:p-14 flex flex-col justify-center bg-white md:col-span-3">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Reinventing Municipal Workflows</h3>
              <p className="text-lg leading-relaxed text-slate-600">
                The Civic Sense portal empowers residents to track, report, and resolve civic issues seamlessly. By integrating Cloudinary-backed photographic proof, transparent tracking, and direct employee assignments, we ensure that your voice is heard and every neighborhood concern is addressed with accountability.
              </p>
              <div className="mt-10 grid sm:grid-cols-2 gap-6">
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-6 transition hover:shadow-md hover:-translate-y-1">
                   <div className="flex items-center gap-3 mb-3">
                     <div className="p-2 bg-blue-100 rounded-lg"><ShieldCheck className="w-5 h-5 text-blue-700" /></div>
                     <h4 className="font-bold text-slate-800 text-lg">Direct Assignment</h4>
                   </div>
                   <p className="text-sm text-slate-600 leading-relaxed">Instantly routes your neighborhood issue to the exact municipal division required for swift action.</p>
                </div>
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-6 transition hover:shadow-md hover:-translate-y-1">
                   <div className="flex items-center gap-3 mb-3">
                     <div className="p-2 bg-emerald-100 rounded-lg"><Camera className="w-5 h-5 text-emerald-700" /></div>
                     <h4 className="font-bold text-slate-800 text-lg">Photo Proof</h4>
                   </div>
                   <p className="text-sm text-slate-600 leading-relaxed">No cutting corners. We mandate verified cloud-hosted resolution images before any job is marked complete.</p>
                </div>
              </div>
              <div className="mt-10 flex justify-end">
                 <button onClick={() => onViewChange("about")} className="flex items-center gap-2 group text-blue-600 font-bold hover:text-blue-800 transition-colors bg-blue-50 px-5 py-2.5 rounded-full">
                    Read the full Mission <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                 </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
