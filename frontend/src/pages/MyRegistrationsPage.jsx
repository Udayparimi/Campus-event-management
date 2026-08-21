import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import CountdownTimer from "../components/CountdownTimer.jsx";
import EventPassModal from "../components/EventPassModal.jsx";
import Spinner from "../components/Spinner.jsx";

const statusStyles = {
  Registered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
  Attended: "bg-blue-100 text-blue-700",
};

const MyRegistrationsPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [passRegistration, setPassRegistration] = useState(null);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/myregistrations");
      setRegistrations(data.registrations);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleCancel = async (eventId) => {
    if (!window.confirm("Cancel this registration?")) return;
    try {
      await api.delete(`/events/${eventId}/registrations`);
      toast?.success("Registration cancelled");
      fetchRegistrations();
    } catch (err) {
      toast?.error(err.response?.data?.message || "Cancellation failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">My Registrations</h1>
        <p className="text-sm text-gray-500 mt-1">Track your upcoming events and pull up your digital pass anytime.</p>
      </div>

      {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

      {loading ? (
        <Spinner label="Loading your registrations..." />
      ) : registrations.length === 0 ? (
        <div className="card-surface p-12 text-center text-gray-500">
          <div className="text-4xl mb-2">🎫</div>
          You haven't registered for any events yet.{" "}
          <Link to="/events" className="text-primary-600 font-semibold">
            Browse events
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {registrations.map((r, idx) => (
            <div
              key={r._id}
              className="card-surface p-4 flex flex-wrap items-center justify-between gap-3 animate-fade-in-up"
              style={{ animationDelay: `${Math.min(idx, 8) * 50}ms` }}
            >
              <div className="min-w-[12rem]">
                <Link to={`/events/${r.event?._id}`} className="font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                  {r.event?.eventName || "Event removed"}
                </Link>
                {r.event && (
                  <p className="text-sm text-gray-500">
                    {new Date(r.event.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} &middot;{" "}
                    {r.event.venue}
                  </p>
                )}
                {r.event && r.status !== "Cancelled" && (
                  <div className="mt-1">
                    <CountdownTimer targetDate={r.event.eventDate} status={r.event.status} compact />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className={`badge-pill ${statusStyles[r.status]}`}>{r.status}</span>
                {r.paymentStatus === "Paid" && (
                  <span className="badge-pill bg-amber-100 text-amber-700">₹{r.amountPaid} paid</span>
                )}

                {r.status !== "Cancelled" && r.event && (
                  <button
                    onClick={() => setPassRegistration(r)}
                    className="btn-outline text-sm rounded-lg px-3 py-1.5"
                  >
                    🎫 Pass
                  </button>
                )}

                {r.status === "Registered" && r.event && (
                  <button
                    onClick={() => handleCancel(r.event._id)}
                    className="text-sm text-red-600 border border-red-300 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {passRegistration && (
        <EventPassModal registration={passRegistration} user={user} onClose={() => setPassRegistration(null)} />
      )}
    </div>
  );
};

export default MyRegistrationsPage;
