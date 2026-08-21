import EventCard from "./EventCard.jsx";

const EventList = ({ events, user, onRegister, onDelete, myRegisteredIds = [], registeringId }) => {
  if (events.length === 0) {
    return (
      <div className="card-surface p-12 text-center text-gray-500">
        <div className="text-4xl mb-2">🔍</div>
        No events found. Try adjusting your search or filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {events.map((event, idx) => (
        <div key={event._id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(idx, 8) * 60}ms` }}>
          <EventCard
            event={event}
            user={user}
            onRegister={onRegister}
            onDelete={onDelete}
            isRegistered={myRegisteredIds.includes(event._id)}
            registering={registeringId === event._id}
          />
        </div>
      ))}
    </div>
  );
};

export default EventList;
