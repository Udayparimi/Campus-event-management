import { useState } from "react";

const eventTypes = ["Workshop", "Seminar", "Hackathon", "Conference", "Webinar", "Competition", "Other"];

const emptyForm = {
  eventName: "",
  eventType: "",
  resourcePerson: "",
  eventDate: "",
  venue: "",
  maxParticipants: "",
  description: "",
  isPaid: false,
  price: "",
};

const validate = (values) => {
  const errors = {};

  if (!values.eventName.trim()) errors.eventName = "Event name is required";
  else if (values.eventName.trim().length < 3) errors.eventName = "Event name must be at least 3 characters";

  if (!values.eventType) errors.eventType = "Event type is required";

  if (!values.resourcePerson.trim()) errors.resourcePerson = "Resource person is required";

  if (!values.eventDate) errors.eventDate = "Event date is required";

  if (!values.venue.trim()) errors.venue = "Venue is required";

  if (!values.maxParticipants) errors.maxParticipants = "Maximum participants is required";
  else if (Number(values.maxParticipants) < 1) errors.maxParticipants = "Must be at least 1";

  if (!values.description.trim()) errors.description = "Description is required";
  else if (values.description.trim().length < 10) errors.description = "Description must be at least 10 characters";

  if (values.isPaid) {
    if (!values.price || Number(values.price) <= 0) errors.price = "Enter a ticket price greater than 0";
  }

  return errors;
};

const EventForm = ({ initialValues, onSubmit, submitLabel = "Create Event", submitting = false }) => {
  const [values, setValues] = useState({ ...emptyForm, ...initialValues });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validate(values));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    setTouched(
      Object.keys(emptyForm).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );

    if (Object.keys(validationErrors).length === 0) {
      onSubmit(values);
    }
  };

  const fieldClass = (name) =>
    `input-field ${touched[name] && errors[name] ? "border-red-400 focus:ring-red-400" : ""}`;

  return (
    <form onSubmit={handleSubmit} className="card-surface p-6 space-y-4 max-w-2xl">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
        <input
          type="text"
          name="eventName"
          value={values.eventName}
          onChange={handleChange}
          onBlur={handleBlur}
          className={fieldClass("eventName")}
          placeholder="e.g. Introduction to Machine Learning"
        />
        {touched.eventName && errors.eventName && <p className="text-xs text-red-500 mt-1">{errors.eventName}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
          <select name="eventType" value={values.eventType} onChange={handleChange} onBlur={handleBlur} className={fieldClass("eventType")}>
            <option value="">Select type</option>
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {touched.eventType && errors.eventType && <p className="text-xs text-red-500 mt-1">{errors.eventType}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Resource Person</label>
          <input
            type="text"
            name="resourcePerson"
            value={values.resourcePerson}
            onChange={handleChange}
            onBlur={handleBlur}
            className={fieldClass("resourcePerson")}
            placeholder="e.g. Dr. Ananya Sharma"
          />
          {touched.resourcePerson && errors.resourcePerson && (
            <p className="text-xs text-red-500 mt-1">{errors.resourcePerson}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
          <input
            type="date"
            name="eventDate"
            value={values.eventDate}
            onChange={handleChange}
            onBlur={handleBlur}
            className={fieldClass("eventDate")}
          />
          {touched.eventDate && errors.eventDate && <p className="text-xs text-red-500 mt-1">{errors.eventDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
          <input
            type="text"
            name="venue"
            value={values.venue}
            onChange={handleChange}
            onBlur={handleBlur}
            className={fieldClass("venue")}
            placeholder="e.g. Main Auditorium"
          />
          {touched.venue && errors.venue && <p className="text-xs text-red-500 mt-1">{errors.venue}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Participants</label>
        <input
          type="number"
          name="maxParticipants"
          min="1"
          value={values.maxParticipants}
          onChange={handleChange}
          onBlur={handleBlur}
          className={fieldClass("maxParticipants")}
          placeholder="e.g. 100"
        />
        {touched.maxParticipants && errors.maxParticipants && (
          <p className="text-xs text-red-500 mt-1">{errors.maxParticipants}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          rows="4"
          value={values.description}
          onChange={handleChange}
          onBlur={handleBlur}
          className={fieldClass("description")}
          placeholder="Describe the event, agenda, and prerequisites"
        />
        {touched.description && errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
      </div>

      <div className="rounded-xl border border-primary-100 bg-primary-50/60 p-4 space-y-3">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            name="isPaid"
            checked={values.isPaid}
            onChange={handleChange}
            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm font-semibold text-gray-800">💳 This is a paid event</span>
        </label>

        {values.isPaid && (
          <div className="animate-fade-in">
            <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Price (₹)</label>
            <input
              type="number"
              name="price"
              min="1"
              step="1"
              value={values.price}
              onChange={handleChange}
              onBlur={handleBlur}
              className={fieldClass("price")}
              placeholder="e.g. 299"
            />
            {touched.price && errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Students will need to complete checkout to reserve a seat at this event.
            </p>
          </div>
        )}
      </div>

      <button type="submit" disabled={submitting} className="btn-gradient rounded-lg px-5 py-2.5">
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
};

export default EventForm;
