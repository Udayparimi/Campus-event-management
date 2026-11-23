import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import CountdownTimer from "../components/CountdownTimer.jsx";
import RegistrationModal from "../components/RegistrationModal.jsx";
import EventPassModal from "../components/EventPassModal.jsx";
import Spinner from "../components/Spinner.jsx";

const statusOptions = ["Upcoming", "Ongoing", "Completed", "Cancelled"];

const statusStyles = {
  Upcoming: "bg-green-100 text-green-700",
  Ongoing: "bg-blue-100 text-blue-700",
  Completed: "bg-gray-200 text-gray-700",
  Cancelled: "bg-red-100 text-red-700",
};

const regStatusStyles = {
  Registered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
  Attended: "bg-blue-100 text-blue-700",
};

const EventDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [myRegistration, setMyRegistration] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);

  const isAdmin = user?.role === "admin";

  const fetchEvent = async () => {
    try {
      const { data } = await api.get(`/events/${id}`);
      setEvent(data.event);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to load event");
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    if (!isAdmin) return;
    try {
      const { data } = await api.get(`/events/${id}/registrations`);
      setRegistrations(data.registrations);
    } catch (err) {
      // admin-only view, ignore silently for non-admins
    }
  };

  const fetchMyRegistration = async () => {
    if (!user || isAdmin) return;
    try {
      const { data } = await api.get("/myregistrations");
      const mine = data.registrations.find((r) => r.event?._id === id && r.status !== "Cancelled");
      setMyRegistration(mine || null);
    } catch (err) {
      // non-critical
    }
  };

  useEffect(() => {
    fetchEvent();
    fetchRegistrations();
    fetchMyRegistration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAdmin, user]);

  const handleConfirmRegister = async (formValues) => {
    setBusy(true);
    try {
      const { data } = await api.post(`/events/${id}/registrations`, formValues);
      toast?.success("You're registered! Your digital pass is ready.");
      setShowRegisterModal(false);
      fetchEvent();
      setMyRegistration({ ...data.registration, event });
      setShowPassModal(true);
    } catch (err) {
      toast?.error(err.response?.data?.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  const handleStatusChange = async (status) => {
    setBusy(true);
    try {
      await api.patch(`/events/${id}/status`, { status });
      toast?.success(`Event marked as ${status}`);
      fetchEvent();
    } catch (err) {
      toast?.error(err.response?.data?.message || "Status update failed");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this event? This cannot be undone.")) return;
    try {
      await api.delete(`/events/${id}`);
      toast?.success("Event deleted");
      navigate("/events");
    } catch (err) {
      toast?.error(err.response?.data?.message || "Delete failed");
    }
  };

  if (loading) return <Spinner label="Loading event..." />;
  if (errorMsg)
    return <p className="max-w-3xl mx-auto px-4 py-8 text-red-500 text-sm text-center">{errorMsg}</p>;
  if (!event) return null;

  const isRegistered = !!myRegistration && myRegistration.status !== "Cancelled";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link to="/events" className="text-sm text-primary-600 font-medium inline-flex items-center gap-1">
        &larr; Back to events
      </Link>

      <div className="card-surface bg-card-glow p-6 space-y-5 animate-fade-in-up">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{event.eventName}</h1>
            <p className="text-primary-600 font-semibold mt-1">{event.eventType}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className={`badge-pill ${statusStyles[event.status]}`}>{event.status}</span>
            {event.isPaid ? (
              <span className="badge-pill bg-amber-100 text-amber-700">💳 ₹{event.price}</span>
            ) : (
              <span className="badge-pill bg-emerald-100 text-emerald-700">🆓 Free</span>
            )}
          </div>
        </div>

        <p className="text-gray-700 leading-relaxed">{event.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 pt-3 border-t border-gray-100">
          <p>🎙️ Resource Person: {event.resourcePerson}</p>
          <p>📍 Venue: {event.venue}</p>
          <p>
            📅 Date:{" "}
            {new Date(event.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <p>
            🎟️ Seats: {event.availableSeats} / {event.maxParticipants} available
          </p>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Countdown</p>
          <CountdownTimer targetDate={event.eventDate} status={event.status} />
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {!isAdmin && !isRegistered && (
            <button
              disabled={event.availableSeats <= 0 || busy || event.status === "Completed" || event.status === "Cancelled"}
              onClick={() => (user ? setShowRegisterModal(true) : navigate("/login", { state: { from: "/events/" + id } }))}
              className="btn-gradient rounded-lg px-5 py-2.5 text-sm"
            >
              {event.availableSeats <= 0
                ? "Full"
                : event.isPaid
                ? `Pay ₹${event.price} & Register`
                : "Register for this event"}
            </button>
          )}

          {!isAdmin && isRegistered && (
            <>
              <span className={`badge-pill self-center ${regStatusStyles[myRegistration.status]}`}>
                {myRegistration.status === "Attended" ? "✓ Checked in" : "✓ Registered"}
              </span>
              <button onClick={() => setShowPassModal(true)} className="btn-outline rounded-lg px-5 py-2.5 text-sm">
                🎫 View My Pass
              </button>
            </>
          )}

          {isAdmin && (
            <>
              <Link to={`/edit-event/${event._id}`} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                Edit Event
              </Link>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
              >
                Delete Event
              </button>
              <select
                value={event.status}
                disabled={busy}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="input-field !w-auto text-sm"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    Set status: {status}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="card-surface p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Registrations ({registrations.length})</h2>
          {registrations.length === 0 ? (
            <p className="text-sm text-gray-500">No one has registered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Student ID</th>
                    <th className="py-2 pr-4">Phone</th>
                    <th className="py-2 pr-4">Status</th>
                    {event.isPaid && <th className="py-2 pr-4">Payment</th>}
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((r) => (
                    <tr key={r._id} className="border-b border-gray-100">
                      <td className="py-2 pr-4">
                        <p className="font-medium text-gray-900">{r.user?.name}</p>
                        <p className="text-xs text-gray-400">{r.user?.email}</p>
                      </td>
                      <td className="py-2 pr-4">{r.studentId || "-"}</td>
                      <td className="py-2 pr-4">{r.phone || "-"}</td>
                      <td className="py-2 pr-4">
                        <span className={`badge-pill ${regStatusStyles[r.status] || "bg-gray-100 text-gray-600"}`}>
                          {r.status}
                        </span>
                      </td>
                      {event.isPaid && (
                        <td className="py-2 pr-4">
                          {r.paymentStatus === "Paid" ? (
                            <span className="badge-pill bg-amber-100 text-amber-700">₹{r.amountPaid} paid</span>
                          ) : (
                            <span className="badge-pill bg-gray-100 text-gray-500">{r.paymentStatus}</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showRegisterModal && (
        <RegistrationModal
          event={event}
          onClose={() => setShowRegisterModal(false)}
          onSubmit={handleConfirmRegister}
          submitting={busy}
        />
      )}

      {showPassModal && myRegistration && (
        <EventPassModal registration={myRegistration} user={user} onClose={() => setShowPassModal(false)} />
      )}
    </div>
  );
};

export default EventDetailsPage;
