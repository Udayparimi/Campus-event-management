import { Link } from "react-router-dom";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <p className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center text-sm">🎓</span>
            Campus Events
          </p>
          <p className="text-sm text-gray-400 mt-3 leading-relaxed">
            Discover workshops, seminars, and hackathons happening on campus — register in seconds and get an
            instant digital pass.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-white uppercase tracking-wide">Quick Links</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/events" className="hover:text-white transition-colors">
                Browse Events
              </Link>
            </li>
            <li>
              <Link to="/myregistration" className="hover:text-white transition-colors">
                My Registrations
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-white transition-colors">
                Create an Account
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-white uppercase tracking-wide">Stay in the loop</p>
          <p className="text-sm text-gray-400 mt-3">
            New events are posted year-round. Check back often, or ask your department coordinator to be added
            to the events mailing list.
          </p>
        </div>
      </div>

      <div className="border-t border-gray-800 py-3">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-gray-500">
          <span className="flex items-center gap-1">🔒 Secure checkout</span>
          <span className="flex items-center gap-1">🎟️ Instant QR passes</span>
          <span className="flex items-center gap-1">✅ Verified events only</span>
          <span className="flex items-center gap-1">🛡️ Invite-only admin access</span>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {year} Campus Events & Workshop Management System. Built for students, by students.
      </div>
    </footer>
  );
};

export default Footer;
