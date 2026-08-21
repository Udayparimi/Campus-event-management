import { useEffect, useState, useCallback, useMemo } from "react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import SearchFilterBar from "../components/SearchFilterBar.jsx";
import EventList from "../components/EventList.jsx";
import RegistrationModal from "../components/RegistrationModal.jsx";
import Spinner from "../components/Spinner.jsx";

const EventsPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [registeringId, setRegisteringId] = useState(null);
  const [myRegisteredIds, setMyRegisteredIds] = useState([]);
  const [modalEvent, setModalEvent] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    eventType: "All",
    status: "All",
    sortBy: "eventDate",
    order: "asc",
  });

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const params = {
        search: filters.search || undefined,
        eventType: filters.eventType,
        status: filters.status,
        sortBy: filters.sortBy,
        order: filters.order,
        limit: 50,
      };
      const { data } = await api.get("/events", { params });
      setEvents(data.events);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchMyRegistrations = useCallback(async () => {
    if (!user || user.role === "admin") return;
    try {
      const { data } = await api.get("/myregistrations");
      const activeIds = data.registrations
        .filter((r) => r.status === "Registered" && r.event)
        .map((r) => r.event._id);
      setMyRegisteredIds(activeIds);
    } catch (err) {
      // silently ignore, registration state is non-critical to page load
    }
  }, [user]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchEvents();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchEvents]);

  useEffect(() => {
    fetchMyRegistrations();
  }, [fetchMyRegistrations]);

  const openRegisterModal = (event) => {
    if (!user) {
      toast?.info("Please log in to register for events");
      return;
    }
    setModalEvent(event);
  };

  const handleConfirmRegister = async (formValues) => {
    if (!modalEvent) return;
    setRegisteringId(modalEvent._id);
    try {
      await api.post(`/events/${modalEvent._id}/registrations`, formValues);
      setMyRegisteredIds((prev) => [...prev, modalEvent._id]);
      toast?.success(`You're registered for ${modalEvent.eventName}! Find your pass under "My Registrations".`);
      setModalEvent(null);
      fetchEvents();
    } catch (err) {
      toast?.error(err.response?.data?.message || "Registration failed");
    } finally {
      setRegisteringId(null);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Delete this event? This cannot be undone.")) return;
    try {
      await api.delete(`/events/${eventId}`);
      toast?.success("Event deleted");
      fetchEvents();
    } catch (err) {
      toast?.error(err.response?.data?.message || "Delete failed");
    }
  };

  const stats = useMemo(() => {
    const upcoming = events.filter((e) => e.status === "Upcoming").length;
    const ongoing = events.filter((e) => e.status === "Ongoing").length;
    const seats = events.reduce((sum, e) => sum + (e.availableSeats || 0), 0);
    return [
      { label: "Live Events", value: events.length, icon: "📋" },
      { label: "Upcoming", value: upcoming, icon: "🗓️" },
      { label: "Happening Now", value: ongoing, icon: "🔴" },
      { label: "Open Seats", value: seats, icon: "🎟️" },
    ];
  }, [events]);

  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <div className="relative overflow-hidden bg-hero-gradient bg-[length:200%_200%] animate-gradient-x text-white">
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/10 animate-float-slow" />
        <div className="absolute top-10 right-10 w-24 h-24 rounded-full bg-white/10 animate-float" />
        <div className="max-w-6xl mx-auto px-4 py-14 relative">
          <p className="text-sm uppercase tracking-[0.2em] text-white/80 font-semibold">Campus Events</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold mt-2 max-w-xl">
            Discover, register, and get your instant digital pass
          </h1>
          <p className="text-white/85 mt-3 max-w-lg">
            Browse workshops, hackathons, seminars, and more — reserve your seat in a couple of clicks and carry
            your QR pass straight to the door.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 max-w-2xl">
            {stats.map((s) => (
              <div key={s.label} className="glass-panel !bg-white/10 !border-white/20 rounded-xl px-4 py-3">
                <div className="text-xl">{s.icon}</div>
                <div className="text-2xl font-bold mt-1">{s.value}</div>
                <div className="text-xs text-white/80">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-10 space-y-5">
        <SearchFilterBar filters={filters} onChange={setFilters} />

        {errorMsg && <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{errorMsg}</p>}

        {loading ? (
          <Spinner label="Loading events..." />
        ) : (
          <EventList
            events={events}
            user={user}
            onRegister={openRegisterModal}
            onDelete={handleDelete}
            myRegisteredIds={myRegisteredIds}
            registeringId={registeringId}
          />
        )}
      </div>

      {modalEvent && (
        <RegistrationModal
          event={modalEvent}
          onClose={() => setModalEvent(null)}
          onSubmit={handleConfirmRegister}
          submitting={registeringId === modalEvent._id}
        />
      )}
    </div>
  );
};

export default EventsPage;
