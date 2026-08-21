const eventTypes = ["All", "Workshop", "Seminar", "Hackathon", "Conference", "Webinar", "Competition", "Other"];
const statuses = ["All", "Upcoming", "Ongoing", "Completed", "Cancelled"];

const SearchFilterBar = ({ filters, onChange }) => {
  const handleField = (field) => (e) => {
    onChange({ ...filters, [field]: e.target.value });
  };

  return (
    <div className="card-surface p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
      <div className="md:col-span-2 relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          type="text"
          placeholder="Search events, venue, resource person..."
          value={filters.search}
          onChange={handleField("search")}
          className="input-field pl-9"
        />
      </div>

      <select value={filters.eventType} onChange={handleField("eventType")} className="input-field">
        {eventTypes.map((type) => (
          <option key={type} value={type}>
            {type === "All" ? "All Types" : type}
          </option>
        ))}
      </select>

      <select value={filters.status} onChange={handleField("status")} className="input-field">
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status === "All" ? "All Statuses" : status}
          </option>
        ))}
      </select>

      <select
        value={`${filters.sortBy}-${filters.order}`}
        onChange={(e) => {
          const [sortBy, order] = e.target.value.split("-");
          onChange({ ...filters, sortBy, order });
        }}
        className="input-field"
      >
        <option value="eventDate-asc">Date: Earliest first</option>
        <option value="eventDate-desc">Date: Latest first</option>
        <option value="eventName-asc">Name: A to Z</option>
        <option value="eventName-desc">Name: Z to A</option>
        <option value="maxParticipants-desc">Capacity: High to Low</option>
      </select>
    </div>
  );
};

export default SearchFilterBar;
