import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/lactogrid/logo";
import heroImg from "@/assets/login-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LactoGrid — Sign In" },
      {
        name: "description",
        content:
          "Sign in to LactoGrid — AI-optimized solar energy and smart milk cooling for dairy cooperatives.",
      },
      { property: "og:title", content: "LactoGrid — Sign In" },
      {
        property: "og:description",
        content:
          "Powering dairy cooperatives with AI-optimized solar energy and smart cooling for quality milk, higher incomes and thriving communities.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const remembered = typeof window !== "undefined" ? localStorage.getItem("lactogrid_remember_email") ?? "" : "";
  const [email, setEmail] = useState(remembered);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(Boolean(remembered));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/overview" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (remember) localStorage.setItem("lactogrid_remember_email", email.trim());
    else localStorage.removeItem("lactogrid_remember_email");
    navigate({ to: "/overview" });
  };

  const forgot = async () => {
    setError("");
    setNotice("");
    if (!email.trim()) {
      setError("Enter your email first, then tap Forgot password.");
      return;
    }
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });
    setNotice(err ? err.message : "Password reset email sent — check your inbox.");
  };

  return (
    <div className="flex min-h-screen bg-card">
      {/* Left visual panel */}
      <div className="relative hidden w-1/2 max-w-2xl lg:block">
        <img src={heroImg} alt="Kenyan dairy farm with solar panels" className="h-full w-full object-cover" />
        <div className="absolute bottom-6 left-6 flex items-center gap-3 text-xs font-semibold text-white/90">
          <span>Clean Energy</span>
          <span className="h-1 w-1 rounded-full bg-white/60" />
          <span>Quality Milk</span>
          <span className="h-1 w-1 rounded-full bg-white/60" />
          <span>Prosperous Farmers</span>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-10 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </div>
          <div className="rounded-3xl border border-border bg-card p-8 shadow-[0_20px_60px_-20px_rgba(1,73,56,0.25)]">
            <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to your LactoGrid account</p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="email">
                  Email or Phone Number
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email or phone number"
                  className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-11 w-full rounded-xl border border-input bg-background px-3.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-input accent-[#02754c]"
                  />
                  Remember me
                </label>
                <button type="button" onClick={forgot} className="font-medium text-primary hover:underline">
                  Forgot password?
                </button>
              </div>

              {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}
              {notice && <p className="rounded-lg bg-accent px-3 py-2 text-xs text-accent-foreground">{notice}</p>}

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-deep text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Sign In
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <a href="mailto:info@kibwezidairy.co.ke" className="font-medium text-primary hover:underline">
                Contact your cooperative
              </a>
            </p>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3 text-xs font-semibold text-muted-foreground">
            <span>Clean Energy</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
            <span>Quality Milk</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
            <span>Prosperous Farmers</span>
          </div>
        </div>
      </div>
    </div>
  );
}
