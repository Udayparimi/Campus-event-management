import { useState } from "react";
import api from "../api/axios.js";
import { useToast } from "../context/ToastContext.jsx";

const statusStyles = {
  Registered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
  Attended: "bg-blue-100 text-blue-700",
};

/**
 * Admin-only tool used at the venue door: type or scan a student's ticket
 * code, review who they are, then check them in for the event.
 */
const VerifyPassPage = () => {
  const [code, setCode] = useState("");
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const toast = useToast();

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setErrorMsg("");
    setRegistration(null);
    try {
      const { data } = await api.get(`/verify/${code.trim()}`);
      setRegistration(data.registration);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "No pass found for this ticket code");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const { data } = await api.patch(`/verify/${code.trim()}/checkin`);
      setRegistration(data.registration);
      toast?.success("Student checked in successfully");
    } catch (err) {
      toast?.error(err.response?.data?.message || "Check-in failed");
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Verify Pass</h1>
        <p className="text-sm text-gray-500 mt-1">Enter (or scan) a student's ticket code to check them in.</p>
      </div>

      <form onSubmit={handleLookup} className="card-surface p-5 flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. CE-3F9A2C1D"
          className="input-field font-mono tracking-wide"
        />
        <button type="submit" disabled={loading} className="btn-gradient rounded-lg px-5 whitespace-nowrap">
          {loading ? "..." : "Look up"}
        </button>
      </form>

      {errorMsg && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-center">
          {errorMsg}
        </p>
      )}

      {registration && (
        <div className="card-surface p-6 space-y-4 animate-scale-in">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">Event</p>
              <p className="font-semibold text-gray-900">{registration.event?.eventName}</p>
            </div>
            <span className={`badge-pill ${statusStyles[registration.status] || "bg-gray-100 text-gray-600"}`}>
              {registration.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm border-t border-gray-100 pt-4">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Name</p>
              <p className="font-medium text-gray-900">{registration.user?.name}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Student ID</p>
              <p className="font-medium text-gray-900">{registration.studentId}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Email</p>
              <p className="font-medium text-gray-900 truncate">{registration.user?.email}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Phone</p>
              <p className="font-medium text-gray-900">{registration.phone}</p>
            </div>
          </div>

          {registration.status === "Attended" ? (
            <p className="text-sm text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-center">
              ✓ Already checked in
              {registration.checkedInAt && ` at ${new Date(registration.checkedInAt).toLocaleTimeString()}`}
            </p>
          ) : registration.status === "Cancelled" ? (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-center">
              This registration was cancelled
            </p>
          ) : (
            <button onClick={handleCheckIn} disabled={checkingIn} className="btn-gradient w-full rounded-lg py-2.5">
              {checkingIn ? "Checking in..." : "✓ Confirm Check-In"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifyPassPage;
