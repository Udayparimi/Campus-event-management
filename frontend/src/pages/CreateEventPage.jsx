import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import EventForm from "../components/EventForm.jsx";
import { useToast } from "../context/ToastContext.jsx";

const CreateEventPage = () => {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setErrorMsg("");
    try {
      const { data } = await api.post("/events", values);
      toast?.success("Event created successfully");
      navigate(`/events/${data.event._id}`);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      <h1 className="text-2xl font-extrabold text-gray-900">Create Event</h1>
      {errorMsg && <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{errorMsg}</p>}
      <EventForm onSubmit={handleSubmit} submitLabel="Create Event" submitting={submitting} />
    </div>
  );
};

export default CreateEventPage;
