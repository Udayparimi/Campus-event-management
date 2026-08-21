import { Link } from "react-router-dom";
import CountdownTimer from "./CountdownTimer.jsx";

const statusStyles = {
  Upcoming: "bg-green-100 text-green-700",
  Ongoing: "bg-blue-100 text-blue-700",
  Completed: "bg-gray-200 text-gray-700",
  Cancelled: "bg-red-100 text-red-700",
};

const typeEmoji = {
  Workshop: "🛠️",
  Seminar: "🎤",
  Hackathon: "💻",
  Conference: "🏛️",
  Webinar: "🖥️",
  Competition: "🏆",
  Other: "✨",
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const EventCard = ({ event, user, onRegister, onDelete, isRegistered, registering }) => {
  const isAdmin = user?.role === "admin";
  const isFull = event.availableSeats <= 0;
  const isClosed = event.status === "Completed" || event.status === "Cancelled";
  const seatPct = Math.min(100, Math.round((event.registeredCount / event.maxParticipants) * 100) || 0);

  return (
    <div className="group card-surface bg-card-glow p-5 flex flex-col justify-between hover:shadow-glow hover:-translate-y-1">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-gray-900 group-hover:chip-gradient-text transition-colors">
            {event.eventName}
          </h3>
          <div className="flex flex-col items-end gap-1">
            <span className={`badge-pill ${statusStyles[event.status]}`}>{event.status}</span>
            {event.isPaid ? (
              <span className="badge-pill bg-amber-100 text-amber-700">₹{event.price}</span>
            ) : (
              <span className="badge-pill bg-emerald-100 text-emerald-700">Free</span>
            )}
          </div>
        </div>

        <p className="text-sm text-primary-600 font-semibold mt-1">
          {typeEmoji[event.eventType] || "✨"} {event.eventType}
        </p>

        <div className="mt-3 text-sm text-gray-600 space-y-1">
          <p>🎙️ {event.resourcePerson}</p>
          <p>📅 {formatDate(event.eventDate)}</p>
          <p>📍 {event.venue}</p>
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>
              {event.availableSeats} / {event.maxParticipants} seats left
            </span>
            <span>{seatPct}% full</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                seatPct >= 90 ? "bg-red-400" : seatPct >= 60 ? "bg-amber-400" : "bg-brand-gradient"
              }`}
              style={{ width: `${seatPct}%` }}
            />
          </div>
        </div>

        <div className="mt-3">
          <CountdownTimer targetDate={event.eventDate} status={event.status} compact />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to={`/events/${event._id}`}
          className="btn-outline px-3 py-1.5 text-sm rounded-lg"
        >
          View Details
        </Link>

        {!isAdmin && (
          <button
            disabled={isFull || isClosed || isRegistered || registering}
            onClick={() => onRegister(event)}
            className="btn-gradient px-3 py-1.5 text-sm rounded-lg"
          >
            {isRegistered
              ? "✓ Registered"
              : registering
              ? "Registering..."
              : isFull
              ? "Full"
              : event.isPaid
              ? `Pay ₹${event.price} & Register`
              : "Register"}
          </button>
        )}

        {isAdmin && (
          <>
            <Link
              to={`/edit-event/${event._id}`}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Edit
            </Link>
            <button
              onClick={() => onDelete(event._id)}
              className="px-3 py-1.5 text-sm rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EventCard;
