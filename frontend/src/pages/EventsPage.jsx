import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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
        .filter((r) => r.status !== "Cancelled" && r.event)
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
      navigate("/login", { state: { from: "/events/" + event._id } });
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
      navigate("/myregistration");
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
      { label: "Events shown", value: events.length },
      { label: "Upcoming", value: upcoming },
      { label: "Happening Now", value: ongoing },
      { label: "Open Seats", value: seats },
    ];
  }, [events]);

  return (
    <div className="space-y-8">
      <header className="catalog-poster">
        <div className="catalog-title">
          <h1>Find your next <em>campus event</em></h1>
          <p>Workshops, talks and meetups. Reserve your seat and bring your digital pass.</p>
        </div>
        <img src="/campus-poster.jpg" alt="" />
      </header>
      <dl className="catalog-totals">
        {stats.map(s => <div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>)}
      </dl>

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
