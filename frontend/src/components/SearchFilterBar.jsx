import { useState } from "react";

const types = ["All", "Workshop", "Seminar", "Hackathon", "Conference", "Webinar", "Competition", "Other"];
const statuses = ["All", "Upcoming", "Ongoing", "Completed", "Cancelled"];
const sorts = [["eventDate-asc", "Earliest first"], ["eventDate-desc", "Latest first"], ["eventName-asc", "Name A–Z"], ["eventName-desc", "Name Z–A"], ["maxParticipants-desc", "Largest capacity"]];

export default function SearchFilterBar({ filters, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const sort = filters.sortBy + "-" + filters.order;
  const count = Number(filters.eventType !== "All") + Number(filters.status !== "All") + Number(sort !== "eventDate-asc");
  function change(field, value) { onChange({ ...filters, [field]: value }); }
  function changeSort(value) {
    const [sortBy, order] = value.split("-");
    onChange({ ...filters, sortBy, order });
  }
  return (
    <section className="finder" aria-label="Find events">
      <div className="finder-search">
        <span className="search-glyph" aria-hidden="true" />
        <input aria-label="Search events" type="search" placeholder="Search events, venues or speakers" value={filters.search} onChange={e => change("search", e.target.value)} />
        <button className="filter-toggle" aria-controls="finder-options" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>Filters{count > 0 && " · " + count}</button>
      </div>
      <div id="finder-options" className={"finder-options" + (expanded ? " expanded" : "")}>
        <label>Event type<select aria-label="Event type" value={filters.eventType} onChange={e => change("eventType", e.target.value)}>{types.map(t => <option key={t} value={t}>{t === "All" ? "All types" : t}</option>)}</select></label>
        <label>Status<select aria-label="Status" value={filters.status} onChange={e => change("status", e.target.value)}>{statuses.map(s => <option key={s} value={s}>{s === "All" ? "All statuses" : s}</option>)}</select></label>
        <label>Sort by<select aria-label="Sort by" value={sort} onChange={e => changeSort(e.target.value)}>{sorts.map(([v, label]) => <option key={v} value={v}>{label}</option>)}</select></label>
      </div>
    </section>
  );
}
