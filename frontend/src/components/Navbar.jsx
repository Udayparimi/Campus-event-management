import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const links = [["/events", "Explore events"]];
  if (user) links.push(["/myregistration", "My registrations"]);
  if (user?.role === "admin") links.push(["/create-event", "Create event"], ["/verify-pass", "Verify pass"]);

  function signOut() {
    logout();
    close();
    navigate("/login");
  }

  return (
    <nav aria-label="Campus navigation" className="masthead" data-guest={!user} onKeyDown={e => {
      if (e.key === "Escape" && open) { close(); document.getElementById("menu-toggle")?.focus(); }
    }}>
      <div className="mast-inner">
        <Link className="mast-brand" to="/events" onClick={close}>
          <img className="mast-symbol" src="/event-ticket.svg" alt="" width="44" height="44" /><span className="mast-wordmark">Campus <em>Events</em></span>
        </Link>
        {user && <button id="menu-toggle" className="mast-toggle" aria-expanded={open} aria-controls="campus-account" onClick={() => setOpen(!open)}>
          {open ? "Close" : "Menu"} <span className="mast-switch" aria-hidden="true" />
        </button>}
        <div className="mast-menu">
          <div className="mast-links">
            {links.map(([path, label]) => <NavLink key={path} to={path} onClick={close}>{label}</NavLink>)}
          </div>
          <div id="campus-account" className={"mast-account" + (open ? " is-open" : "")}>
            {user ? <>
              <span className="mast-avatar" aria-hidden="true">{user.name?.trim().slice(0,1).toUpperCase()}</span>
              <span className="mast-profile"><strong>{user.name}</strong><small>{user.role}</small></span>
              <button className="mast-action" onClick={signOut}>Logout</button>
            </> : <>
              <NavLink to="/login" onClick={close}>Login</NavLink>
              <Link className="mast-action" to="/register" onClick={close}>Sign up <span aria-hidden="true">↗</span></Link>
            </>}
          </div>
        </div>
      </div>
    </nav>
  );
}
