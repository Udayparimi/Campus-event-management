import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authErrors } from "../../../shared/authValidation.mjs";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthPage({ signup = false }) {
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [values, setValues] = useState({ name: "", email: "", password: "", department: "", role: "student", adminCode: "" });
  const [touched, setTouched] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [message, setMessage] = useState("");
  const errors = authErrors(values, signup);

  function change(e) {
    const { name, value } = e.target;
    setValues(previous => ({ ...previous, [name]: value, ...(name === "role" ? { adminCode: "" } : {}) }));
    setServerErrors(previous => ({ ...previous, [name]: undefined, ...(name === "role" ? { adminCode: undefined } : {}) }));
    setMessage("");
  }

  async function submit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    if (loading) return;
    if (Object.keys(errors).length) {
      setTouched(Object.fromEntries(Object.keys(errors).map(key => [key, true])));
      form.elements.namedItem(Object.keys(errors)[0])?.focus();
      return;
    }
    setServerErrors({});
    setMessage("");
    const email = values.email.trim().toLowerCase();
    try {
      if (signup) await register({ ...values, email, name: values.name.trim(), department: values.department.trim() });
      else await login(email, values.password);
      navigate(state?.from || "/events", { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        setServerErrors(data.errors);
        form.elements.namedItem(Object.keys(data.errors)[0])?.focus();
      } else {
        setMessage(data?.message || "Could not reach Campus Events. Check your connection and try again.");
      }
    }
  }

  function field(name, label, type = "text", autoComplete) {
    const error = serverErrors[name] || (touched[name] && errors[name]);
    const props = {
      id: name, name, value: values[name], onChange: change,
      onBlur: () => setTouched(previous => ({ ...previous, [name]: true })),
      "aria-invalid": !!error, "aria-describedby": error ? name + "-note" : undefined,
      className: "input-field", readOnly: loading, required: name !== "department",
    };
    return (
      <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {name === "role" ? <select {...props} disabled={loading}><option value="student">Student</option><option value="admin">Admin (invite only)</option></select>
          : <input {...props} type={type} autoComplete={autoComplete} placeholder={name === "adminCode" ? "Enter the invite code" : undefined} />}
        {error && <p id={name + "-note"} className="auth-field-error">{error}</p>}
      </div>
    );
  }

  return (
    <div className="auth-stage">
      <div className="auth-ticket">
        <div className="ticket-art">
          <img src="/campus-poster.jpg" alt="" />
          <div aria-hidden="true" className="ticket-caption">Campus<br/><em>Events.</em></div>
        </div>
        <form noValidate onSubmit={submit} className="ticket-form space-y-4">
          <h1 className="text-xl font-bold text-gray-900">{signup ? "Join the campus." : "Welcome back."}</h1>
          <p className="form-intro">{signup ? "Create an account to book events and collect your passes." : "Sign in to reserve a seat or open your event pass."}</p>
          {message && <p role="alert" className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{message}</p>}
          {signup && field("name", "Full Name", "text", "name")}
          {field("email", "Email", "email", "email")}
          {field("password", "Password", "password", signup ? "new-password" : "current-password")}
          {signup && <>
            {field("department", "Department", "text", "organization")}
            {field("role", "Register as")}
            {values.role === "admin" && <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 space-y-2 animate-fade-in">
              <p className="text-xs text-amber-800 leading-relaxed flex items-start gap-1.5">
                <span aria-hidden="true">🔒</span>
                <span>Admin accounts are restricted to the events committee. You'll need the current invite code to continue — ask your coordinator if you don't have one.</span>
              </p>
              {field("adminCode", "Admin Invite Code", "password", "off")}
            </div>}
          </>}
          <button type="submit" disabled={loading} className="btn-gradient w-full rounded-lg py-2.5">
            {signup ? (loading ? "Creating account..." : "Sign Up") : (loading ? "Logging in..." : "Login")}
          </button>
          <p className="text-sm text-gray-600 text-center">
            {signup ? "Already have an account? " : "No account? "}
            <Link state={state} to={signup ? "/login" : "/register"} className="text-primary-600 font-semibold">{signup ? "Login" : "Sign up"}</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
