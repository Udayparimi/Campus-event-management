import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import EventForm from "../components/EventForm.jsx";
import Spinner from "../components/Spinner.jsx";
import { useToast } from "../context/ToastContext.jsx";

const toDateInputValue = (dateStr) => {
  const date = new Date(dateStr);
  return date.toISOString().split("T")[0];
};

const EditEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [initialValues, setInitialValues] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        setInitialValues({
          eventName: data.event.eventName,
          eventType: data.event.eventType,
          resourcePerson: data.event.resourcePerson,
          eventDate: toDateInputValue(data.event.eventDate),
          venue: data.event.venue,
          maxParticipants: data.event.maxParticipants,
          description: data.event.description,
          isPaid: !!data.event.isPaid,
          price: data.event.price || "",
        });
      } catch (err) {
        setErrorMsg(err.response?.data?.message || "Failed to load event");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setErrorMsg("");
    try {
      await api.put(`/events/${id}`, values);
      toast?.success("Event updated successfully");
      navigate(`/events/${id}`);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to update event");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner label="Loading event..." />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      <h1 className="text-2xl font-extrabold text-gray-900">Edit Event</h1>
      {errorMsg && <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{errorMsg}</p>}
      {initialValues && (
        <EventForm initialValues={initialValues} onSubmit={handleSubmit} submitLabel="Save Changes" submitting={submitting} />
      )}
    </div>
  );
};

export default EditEventPage;
