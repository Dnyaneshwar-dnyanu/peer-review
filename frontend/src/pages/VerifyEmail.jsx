import { useEffect, useState } from "react";
import { FaCheckCircle, FaEnvelope, FaExclamationTriangle, FaSpinner } from "react-icons/fa";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-toastify";

function VerifyEmail() {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [detail, setDetail] = useState("");
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const email = location.state?.email;

  const isTokenMode = !!token;

  const [cooldown, setCooldown] = useState(0);

  // 🔗 TOKEN MODE (auto verify)
  useEffect(() => {
    // 🔗 TOKEN MODE → verify immediately
    if (isTokenMode && token) {
      const verify = async () => {
        try {
          setStatus("loading");

          const res = await api.post("/api/auth/verify/token", { token });

          if (res.data.success) {
            setStatus("success");
            setDetail(res.data.message || "Email verified successfully");
            toast.success("Email verified");

            setTimeout(() => {
              navigate("/login");
            }, 2000);
          } else {
            setStatus("error");
            setDetail(res.data.message || "Verification failed");
          }
        } catch (err) {
          const message =
            err.response?.data?.message ||
            "Invalid or expired verification link";

          setStatus("error");
          setDetail(message);
          toast.error(message);
        }
      };

      verify();
      return; // ⛔ stop here (no polling)
    }

    // 📩 NO TOKEN MODE → polling
    if (!email) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/api/auth/verify/status?email=${email}`);

        if (res.data.isVerified) {
          setStatus("success");
          setDetail("Email verified successfully");
          toast.success("Email verified");

          clearInterval(interval);

          setTimeout(() => {
            navigate("/login");
          }, 2000);
        }
      } catch (err) {
        console.log("Polling error", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [token, email, isTokenMode, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  // 📩 RESEND EMAIL
  const resendEmail = async () => {
    if (!email) {
      toast.error("No email found. Please register again.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/api/auth/verify", { email });

      if (res.data.success) {
        toast.success("Verification email sent");
        setCooldown(60);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to resend verification email";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // 🎯 UI content
  const statusContent = {
    idle: {
      title: "Verify Your Email",
      message: "We’ve sent a verification link to your email. Please check your inbox.",
      icon: FaEnvelope,
      iconClassName: "text-cyan-300",
    },
    loading: {
      title: "Verifying...",
      message: "Verifying your email address. Please wait...",
      icon: FaSpinner,
      iconClassName: "text-cyan-300 animate-spin",
    },
    success: {
      title: "Email Verified",
      message: "Your email is confirmed. Redirecting to login...",
      icon: FaCheckCircle,
      iconClassName: "text-green-400",
    },
    error: {
      title: "Verification Failed",
      message: "This link is invalid or expired.",
      icon: FaExclamationTriangle,
      iconClassName: "text-yellow-300",
    },
  };

  const current = statusContent[status];
  const StatusIcon = current.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-zinc-900 to-black px-4">
      <div className="w-full max-w-lg p-10 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-xl bg-white/10">

        <div className="flex items-center justify-center mb-6">
          <div className="h-16 w-16 rounded-full border border-white/20 bg-white/10 flex items-center justify-center">
            <StatusIcon className={`text-3xl ${current.iconClassName}`} />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-white text-center mb-3">
          {current.title}
        </h2>

        <p className="text-center text-white/80 mb-6">
          {detail || current.message}
        </p>

        {/* 📩 INFO MODE (no token) */}
        {!isTokenMode && (
          <button
            onClick={resendEmail}
            disabled={loading}
            className={`w-full py-3 bg-white text-indigo-900 rounded-lg font-semibold hover:bg-gray-200 transition 
              ${loading || cooldown > 0
                ? "opacity-70 cursor-disabled"
                : "hover:bg-gray-200"
              }`}
          >
            {loading
              ? "Sending Email..."
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend Verification Email"}
          </button>
        )}

        {/* ❌ ERROR MODE → allow retry */}
        {status === "error" && isTokenMode && (
          <button
            onClick={() => navigate("/register")}
            className="w-full mt-3 py-3 bg-white text-indigo-900 rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Register Again
          </button>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;