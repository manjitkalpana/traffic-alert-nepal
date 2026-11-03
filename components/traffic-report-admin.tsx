"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { Check, Clock3, LogOut, RefreshCw, ShieldCheck, X } from "lucide-react";

type Report = {
  id: string;
  district: string;
  area: string;
  observed_at: string;
  details: string;
  photo_paths: string[];
  status: "pending" | "approved" | "rejected";
  created_at: string;
  expires_at: string;
  approx_lat: number | null;
  approx_lng: number | null;
  photoUrls?: string[];
};

export default function TrafficReportAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");

  const loadReports = useCallback(async () => {
    const client = supabase;
    if (!client) return;
    setLoading(true);
    setMessage("");
    const { data, error } = await client
      .from("traffic_presence_reports")
      .select("id,district,area,observed_at,details,photo_paths,status,created_at,expires_at,approx_lat,approx_lng")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (error) {
      setMessage(error.message);
      setReports([]);
      setLoading(false);
      return;
    }
    const rows = (data ?? []) as Report[];
    const withPhotos = await Promise.all(rows.map(async (report) => {
      const urls = await Promise.all(report.photo_paths.map(async (path) => {
        const { data: signed, error: signError } = await client.storage
          .from("traffic-report-photos")
          .createSignedUrl(path, 60 * 5);
        return signError ? "" : signed.signedUrl;
      }));
      return { ...report, photoUrls: urls };
    }));
    setReports(withPhotos);
    setLoading(false);
  }, []);

  const checkAdmin = useCallback(async () => {
    if (!supabase) {
      setMessage("Supabase is not configured.");
      setChecking(false);
      return;
    }
    setChecking(true);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setAuthorized(false);
      setUserEmail("");
      setChecking(false);
      return;
    }
    setUserEmail(user.email ?? "");
    const { data: adminRecord, error } = await supabase
      .from("traffic_report_admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error || !adminRecord) {
      setAuthorized(false);
      setMessage("This account is not authorized to review reports. Ask the project owner to grant admin access.");
      setChecking(false);
      return;
    }
    setAuthorized(true);
    setChecking(false);
    await loadReports();
  }, [loadReports]);

  useEffect(() => {
    void checkAdmin();
  }, [checkAdmin]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }
    setPassword("");
    await checkAdmin();
    setLoading(false);
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setAuthorized(false);
    setUserEmail("");
    setReports([]);
    setMessage("Signed out.");
  }

  async function review(report: Report, status: "approved" | "rejected") {
    if (!supabase) return;
    setBusyId(report.id);
    setMessage("");
    const { error } = await supabase
      .from("traffic_presence_reports")
      .update({ status })
      .eq("id", report.id)
      .eq("status", "pending");
    if (error) {
      setMessage(error.message);
    } else {
      setReports((current) => current.filter((item) => item.id !== report.id));
      setMessage(status === "approved" ? "Report approved." : "Report rejected.");
    }
    setBusyId("");
  }

  if (checking) {
    return <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-slate-600">Checking administrator access…</main>;
  }

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12 text-slate-900">
        <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <a href="/" className="text-sm font-semibold text-blue-700 hover:underline">← Back to Traffic Alert Nepal</a>
          <div className="mt-7 flex items-center gap-3">
            <span className="rounded-xl bg-blue-50 p-3 text-blue-700"><ShieldCheck size={24} /></span>
            <div><p className="text-xs font-bold tracking-widest text-blue-700">RESTRICTED AREA</p><h1 className="text-2xl font-black">Admin sign in</h1></div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">Sign in with the administrator account approved for Traffic Alert Nepal. Public accounts cannot access reports.</p>
          <form onSubmit={signIn} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold">Email
              <input required type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal" />
            </label>
            <label className="block text-sm font-semibold">Password
              <input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal" />
            </label>
            {message && <p role="status" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}
            <button disabled={loading} className="w-full rounded-xl bg-blue-700 px-4 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-50">{loading ? "Signing in…" : "Sign in securely"}</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-3"><span className="rounded-xl bg-blue-700 p-2 text-white"><ShieldCheck size={22} /></span><div><p className="text-xs font-bold tracking-widest text-blue-700">TRAFFIC ALERT NEPAL</p><h1 className="text-xl font-black">Report approval</h1></div></div>
          <div className="flex items-center gap-3"><span className="hidden text-sm text-slate-500 sm:inline">{userEmail}</span><button onClick={signOut} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"><LogOut size={16} />Sign out</button></div>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-sm font-semibold text-blue-700">MODERATION QUEUE</p><h2 className="mt-1 text-3xl font-black">Pending reports <span className="text-slate-400">({reports.length})</span></h2><p className="mt-2 text-sm text-slate-600">Review submissions privately. Do not publish exact or live checkpoint locations.</p></div>
          <button onClick={() => void loadReports()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50"><RefreshCw size={16} className={loading ? "animate-spin" : ""} />Refresh</button>
        </div>
        {message && <p role="status" className="mt-5 rounded-xl bg-blue-50 p-3 text-sm text-blue-900">{message}</p>}
        {loading && reports.length === 0 ? <p className="py-12 text-center text-slate-500">Loading reports…</p> : null}
        {!loading && reports.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><Clock3 className="mx-auto text-slate-400" size={32} /><h3 className="mt-3 font-bold">No pending reports</h3><p className="mt-1 text-sm text-slate-500">New submissions will appear here.</p></div> : null}
        <div className="mt-6 space-y-5">
          {reports.map((report) => (
            <article key={report.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">{report.district}</span><span className="text-sm font-semibold">{report.area}</span></div><span className="text-xs text-slate-500">Submitted {new Date(report.created_at).toLocaleString()}</span></div>
              <p className="mt-4 text-sm text-slate-700"><strong>Observed:</strong> {new Date(report.observed_at).toLocaleString()}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{report.details}</p>
              {report.approx_lat !== null && report.approx_lng !== null ? <p className="mt-2 text-xs text-slate-500">Approximate location attached (coarse only; not an exact checkpoint coordinate).</p> : null}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {(report.photoUrls ?? []).map((url, index) => url ? <a key={report.photo_paths[index]} href={url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-slate-200"><img src={url} alt={`Private submission photo ${index + 1}`} className="h-48 w-full object-cover" /></a> : <div key={report.photo_paths[index]} className="grid h-48 place-items-center rounded-xl bg-slate-100 text-xs text-slate-500">Photo unavailable</div>)}
              </div>
              <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
                <button onClick={() => void review(report, "rejected")} disabled={busyId === report.id} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"><X size={16} />Reject</button>
                <button onClick={() => void review(report, "approved")} disabled={busyId === report.id} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50"><Check size={16} />Approve</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
