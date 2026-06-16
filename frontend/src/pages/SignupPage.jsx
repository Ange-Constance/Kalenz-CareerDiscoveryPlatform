import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Logo from "../components/common/Logo";
import PasswordInput from "../components/common/PasswordInput";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading, register } = useAuth();
  const navigate = useNavigate();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-klenz-black flex items-center justify-center page-enter">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user) return <Navigate to="/upload" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldError("");

    if (password.length < 8) {
      setFieldError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await register({
        name,
        email,
        password,
        firstName: name.split(" ")[0],
        lastName: name.split(" ").slice(1).join(" "),
      });
      navigate("/upload");
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.errors?.[0]?.msg ||
        (err.response?.status === 404
          ? "Cannot reach the API. Make sure the backend is running on port 3000."
          : null) ||
        (err.code === "ERR_NETWORK"
          ? "Network error — is the backend running? Start it with: cd backend && npm run dev"
          : null) ||
        err.message ||
        "Registration failed";
      setFieldError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-klenz-black flex flex-col font-sans page-enter">
      <div className="p-6">
        <Logo />
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="card w-full max-w-md p-8">
          <h1 className="page-title text-center mb-1">Create Account</h1>
          <p className="text-klenz-muted text-center text-sm mb-8">
            Start your AI-powered career discovery
          </p>

          {fieldError && (
            <p className="text-red-400 text-sm mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
              {fieldError}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-klenz-muted mb-2">
                Full Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-dark"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-klenz-muted mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-dark"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-klenz-muted mb-2">
                Password (min 8 characters)
              </label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center items-center gap-2"
            >
              {loading && <LoadingSpinner size="sm" />}
              {loading ? "Creating account..." : "Get Started Free"}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-klenz-muted">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-klenz-orange font-semibold hover:underline"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
