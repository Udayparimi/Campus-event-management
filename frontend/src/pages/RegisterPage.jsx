import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    department: "",
    adminCode: "",
  });
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(form);
    if (success) navigate("/events");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up">
        <div className="hidden md:flex flex-col justify-center bg-hero-gradient bg-[length:200%_200%] animate-gradient-x text-white p-10 relative overflow-hidden">
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/10 animate-float-slow" />
          <div className="absolute top-6 left-6 w-16 h-16 rounded-full bg-white/10 animate-float" />
          <span className="text-4xl mb-4">🚀</span>
          <h2 className="text-2xl font-extrabold leading-snug">Join Campus Events</h2>
          <p className="text-white/85 mt-3 text-sm leading-relaxed">
            Create an account to register for events with one click and get an instant, scannable digital pass.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 sm:p-10 space-y-4 max-h-[85vh] overflow-y-auto">
          <h1 className="text-xl font-bold text-gray-900">Create an account</h1>

          {error && <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              value={form.password}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input
              type="text"
              name="department"
              value={form.department}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Register as</label>
            <select name="role" value={form.role} onChange={handleChange} className="input-field">
              <option value="student">Student</option>
              <option value="admin">Admin (invite only)</option>
            </select>
          </div>

          {form.role === "admin" && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 space-y-2 animate-fade-in">
              <p className="text-xs text-amber-800 leading-relaxed flex items-start gap-1.5">
                <span>🔒</span>
                <span>
                  Admin accounts are restricted to the events committee. You'll need the current invite code to
                  continue — ask your coordinator if you don't have one.
                </span>
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Invite Code</label>
                <input
                  type="password"
                  name="adminCode"
                  required
                  value={form.adminCode}
                  onChange={handleChange}
                  placeholder="Enter the invite code"
                  className="input-field"
                  autoComplete="off"
                />
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-gradient w-full rounded-lg py-2.5">
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          <p className="text-sm text-gray-600 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-600 font-semibold">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
