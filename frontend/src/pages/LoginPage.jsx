import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) navigate("/events");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up">
        <div className="hidden md:flex flex-col justify-center bg-hero-gradient bg-[length:200%_200%] animate-gradient-x text-white p-10 relative overflow-hidden">
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/10 animate-float-slow" />
          <div className="absolute top-6 left-6 w-16 h-16 rounded-full bg-white/10 animate-float" />
          <span className="text-4xl mb-4">🎓</span>
          <h2 className="text-2xl font-extrabold leading-snug">Welcome back to Campus Events</h2>
          <p className="text-white/85 mt-3 text-sm leading-relaxed">
            Log in to register for workshops and hackathons, track your seats, and pull up your QR pass in seconds.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 sm:p-10 space-y-4">
          <h1 className="text-xl font-bold text-gray-900">Login to your account</h1>

          {error && <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-gradient w-full rounded-lg py-2.5">
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-sm text-gray-600 text-center">
            No account?{" "}
            <Link to="/register" className="text-primary-600 font-semibold">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
