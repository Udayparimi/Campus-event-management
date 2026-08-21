import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `relative px-1 py-1 transition-colors hover:text-white ${
      isActive ? "text-white" : "text-white/75"
    } after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:bg-white after:rounded-full after:transition-all ${
      isActive ? "after:w-full" : "after:w-0"
    }`;

  return (
    <nav className="sticky top-0 z-40 bg-hero-gradient bg-[length:200%_200%] animate-gradient-x text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link to="/events" className="text-lg font-extrabold tracking-wide flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center">🎓</span>
          Campus Events
        </Link>

        <button
          className="sm:hidden text-2xl leading-none"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <div className="hidden sm:flex flex-wrap items-center gap-5 text-sm font-medium">
          <NavLink to="/events" className={linkClass}>
            Events
          </NavLink>

          {user && (
            <NavLink to="/myregistration" className={linkClass}>
              My Registrations
            </NavLink>
          )}

          {user?.role === "admin" && (
            <>
              <NavLink to="/create-event" className={linkClass}>
                Create Event
              </NavLink>
              <NavLink to="/verify-pass" className={linkClass}>
                Verify Pass
              </NavLink>
            </>
          )}

          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-white/20">
              <span className="bg-white/15 backdrop-blur px-2 py-1 rounded text-xs uppercase tracking-wide">
                {user.role}
              </span>
              <span className="max-w-[8rem] truncate">{user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-white text-primary-700 px-3 py-1.5 rounded-lg font-semibold hover:bg-primary-50 transition-colors shadow"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 pl-2 border-l border-white/20">
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
              <Link
                to="/register"
                className="bg-white text-primary-700 px-3 py-1.5 rounded-lg font-semibold hover:bg-primary-50 transition-colors shadow"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="sm:hidden border-t border-white/15 bg-primary-700/40 backdrop-blur px-4 py-4 flex flex-col gap-3 text-sm font-medium animate-fade-in-up">
          <NavLink to="/events" onClick={() => setMenuOpen(false)} className={linkClass}>
            Events
          </NavLink>
          {user && (
            <NavLink to="/myregistration" onClick={() => setMenuOpen(false)} className={linkClass}>
              My Registrations
            </NavLink>
          )}
          {user?.role === "admin" && (
            <>
              <NavLink to="/create-event" onClick={() => setMenuOpen(false)} className={linkClass}>
                Create Event
              </NavLink>
              <NavLink to="/verify-pass" onClick={() => setMenuOpen(false)} className={linkClass}>
                Verify Pass
              </NavLink>
            </>
          )}
          {user ? (
            <button onClick={handleLogout} className="bg-white text-primary-700 px-3 py-2 rounded-lg font-semibold text-left">
              Logout ({user.name})
            </button>
          ) : (
            <div className="flex gap-3">
              <NavLink to="/login" onClick={() => setMenuOpen(false)} className={linkClass}>
                Login
              </NavLink>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="bg-white text-primary-700 px-3 py-1.5 rounded-lg font-semibold"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
