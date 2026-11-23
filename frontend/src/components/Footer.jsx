import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-primary-100 bg-white text-primary-800">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-wrap items-center justify-between gap-4 text-sm">
        <span className="font-semibold">Campus Events</span>
        <nav aria-label="Footer" className="flex gap-5">
          <Link to="/events">Browse events</Link>
          <Link to="/myregistration">My registrations</Link>
        </nav>
      </div>
    </footer>
  );
}
