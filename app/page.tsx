"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, MapPin, Menu, Plus, ShieldCheck, TrafficCone, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

const TrafficMap = dynamic(() => import("@/components/traffic-map"), { ssr: false });

type Report = { id: string; title: string; category: string; lat: number; lng: number; area: string; district: string; details: string; created_at: string; status: string };
const demoReports: Report[] = [
  { id: "d1", title: "Slow traffic near market area", category: "congestion", lat: 28.963, lng: 80.178, area: "Mahendranagar Bazaar", district: "Kanchanpur", details: "Demo example only. Replace with a verified community update.", created_at: new Date().toISOString(), status: "approved" },
  { id: "d2", title: "Waterlogging reported", category: "hazard", lat: 28.91, lng: 80.12, area: "Belauri road", district: "Kanchanpur", details: "Demo example only. Not a live report.", created_at: new Date().toISOString(), status: "approved" },
  { id: "d3", title: "Road maintenance advisory", category: "closure", lat: 29.05, lng: 80.32, area: "Attariya–Kanchanpur route", district: "Kailali", details: "Demo example only. Check official sources before travelling.", created_at: new Date().toISOString(), status: "approved" }
];
const categories = [
  { value: "congestion", label: "Traffic congestion" }, { value: "accident", label: "Accident" },
  { value: "closure", label: "Road closure / diversion" }, { value: "hazard", label: "Flooding or road hazard" },
  { value: "other", label: "Other road-safety issue" }
];

export default function Home() {
  const [lang, setLang] = useState<"en" | "ne">("en");
  const [reports, setReports] = useState<Report[]>(demoReports);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState("");
  const [locationStatus, setLocationStatus] = useState("");
  const [locating, setLocating] = useState(false);
  const [form, setForm] = useState({ title: "", category: "congestion", district: "Kanchanpur", area: "", details: "", lat: "28.963", lng: "80.178" });
  function useCurrentLocation() {
    if (!navigator.geolocation) { setLocationStatus("Location is not supported by this browser."); return; }
    setLocating(true); setLocationStatus("Finding your location…");
    navigator.geolocation.getCurrentPosition(position => {
      const lat = position.coords.latitude.toFixed(6);
      const lng = position.coords.longitude.toFixed(6);
      setForm(current => ({ ...current, lat, lng }));
      setLocationStatus("Location added. You can edit the coordinates if needed.");
      setLocating(false);
    }, error => {
      setLocationStatus(error.code === 1 ? "Location permission was denied. Allow location access in your browser and try again." : "Could not get your location. Check GPS/location settings and try again.");
      setLocating(false);
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
  }
  const ne = lang === "ne";
  const copy = {
    eyebrow: ne ? "समुदायबाट सञ्चालित सडक सुरक्षा" : "COMMUNITY-POWERED ROAD SAFETY",
    heading: ne ? "यात्रा अघि सडकको अवस्था जान्नुहोस्।" : "Know the road before you go.",
    intro: ne ? "कञ्चनपुर र कैलालीबाट सडक अवस्था, अवरोध र जोखिमबारे जानकारी साझा गरौँ।" : "Share and discover road conditions, disruptions and hazards across Kanchanpur and Kailali.",
    report: ne ? "रिपोर्ट पठाउनुहोस्" : "Submit a report",
    map: ne ? "लाइभ सडक नक्सा" : "Road conditions map",
    feed: ne ? "हालका अपडेटहरू" : "Recent community updates"
  };
  useEffect(() => {
    if (!supabase) return;
    supabase.from("road_reports").select("id,title,category,lat,lng,area,district,details,created_at,status").eq("status", "approved").order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => { if (data?.length) setReports(data as Report[]); });
  }, []);
  const visible = useMemo(() => reports.filter(r => filter === "all" || r.category === filter), [reports, filter]);
  async function submitReport(e: FormEvent) {
    e.preventDefault(); setNotice("");
    const payload = { ...form, lat: Number(form.lat), lng: Number(form.lng), status: "pending" };
    if (!form.title.trim() || !form.area.trim() || !form.details.trim() || !Number.isFinite(payload.lat) || !Number.isFinite(payload.lng)) {
      setNotice("Please complete all fields and enter valid map coordinates."); return;
    }
    if (!supabase) { setNotice("Demo mode: connect Supabase and apply supabase/schema.sql to receive reports."); return; }
    const { error } = await supabase.from("road_reports").insert(payload);
    if (error) setNotice("Could not submit. Please try again later.");
    else { setNotice("Thanks! Your report is pending moderator review and will appear after approval."); setShowForm(false); setForm({ title: "", category: "congestion", district: "Kanchanpur", area: "", details: "", lat: "28.963", lng: "80.178" }); }
  }
  return <main className="min-h-screen">
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <a href="#" className="flex items-center gap-3"><span className="rounded-xl bg-blue-700 p-2 text-white"><TrafficCone size={23}/></span><span><strong className="block text-lg tracking-tight">Traffic Alert Nepal</strong><small className="text-slate-500">Safer roads, together</small></span></a>
        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex"><a href="#map" className="hover:text-blue-700">Map</a><a href="#updates" className="hover:text-blue-700">Road updates</a><a href="#safety" className="hover:text-blue-700">Safety</a></nav>
        <div className="flex items-center gap-2"><button onClick={() => setLang(ne ? "en" : "ne")} className="rounded-lg border px-3 py-2 text-sm font-semibold">{ne ? "EN" : "नेपाली"}</button><button onClick={() => setShowForm(true)} className="hidden items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 sm:flex"><Plus size={17}/>{copy.report}</button></div>
      </div>
    </header>
    <section className="bg-gradient-to-br from-[#0b1f43] via-[#123c78] to-[#1763a8] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-[1.15fr_.85fr] md:items-center md:py-24">
        <div><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-widest text-blue-100"><ShieldCheck size={14}/>{copy.eyebrow}</div><h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight md:text-6xl">{copy.heading}</h1><p className="mt-5 max-w-xl text-lg leading-8 text-blue-100">{copy.intro}</p><div className="mt-8 flex flex-wrap gap-3"><button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-blue-900 hover:bg-blue-50">{copy.report}<ArrowRight size={18}/></button><a href="#map" className="rounded-xl border border-white/30 px-5 py-3 font-semibold hover:bg-white/10">{ne ? "नक्सा हेर्नुहोस्" : "Explore map"}</a></div><p className="mt-6 text-xs text-blue-200">Starting area: Kanchanpur · Kailali · Sudurpashchim</p></div>
        <div className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-blue-100">Community status</span><span className="rounded-full bg-amber-300/20 px-3 py-1 text-xs font-bold text-amber-100">Early access</span></div><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white/10 p-4"><MapPin className="mb-3 text-blue-200"/><strong className="text-2xl">2</strong><p className="text-sm text-blue-100">Districts to start</p></div><div className="rounded-2xl bg-white/10 p-4"><CheckCircle2 className="mb-3 text-emerald-300"/><strong className="text-2xl">Review</strong><p className="text-sm text-blue-100">Before public display</p></div></div><p className="mt-4 text-xs leading-5 text-blue-100">Map markers currently include clearly labelled demo examples until a live database is connected.</p></div>
      </div>
    </section>
    <section id="map" className="mx-auto max-w-7xl px-5 py-12"><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold tracking-widest text-blue-700">EXPLORE</p><h2 className="mt-1 text-2xl font-extrabold">{copy.map}</h2><p className="mt-1 text-sm text-slate-500">OpenStreetMap · Kanchanpur and Kailali</p></div><span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">Demo data clearly marked</span></div><div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-sm"><div className="h-[390px] overflow-hidden rounded-2xl"><TrafficMap reports={visible}/></div></div><p className="mt-3 text-xs text-slate-500">Map reports show public road conditions only. Do not submit live locations of individual police officers or enforcement activity.</p></section>
    <section id="updates" className="mx-auto max-w-7xl px-5 pb-16"><div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold tracking-widest text-blue-700">COMMUNITY FEED</p><h2 className="mt-1 text-2xl font-extrabold">{copy.feed}</h2></div><select value={filter} onChange={e => setFilter(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm"><option value="all">All updates</option>{categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div><div className="grid gap-4 md:grid-cols-3">{visible.map(r => <article key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold capitalize text-blue-800">{r.category}</span><span className="text-xs text-slate-400"><Clock3 className="mr-1 inline" size={13}/> {r.id.startsWith("d") ? "Demo" : new Date(r.created_at).toLocaleString()}</span></div><h3 className="mt-4 text-lg font-bold">{r.title}</h3><p className="mt-2 flex items-center gap-1 text-sm text-slate-500"><MapPin size={14}/>{r.area}, {r.district}</p><p className="mt-3 text-sm leading-6 text-slate-600">{r.details}</p></article>)}</div>{visible.length === 0 && <p className="rounded-2xl bg-white p-8 text-center text-slate-500">No reports in this category yet.</p>}</section>
    <section id="safety" className="border-y border-blue-100 bg-blue-50"><div className="mx-auto grid max-w-7xl gap-6 px-5 py-10 md:grid-cols-3"><div className="flex gap-3"><ShieldCheck className="shrink-0 text-blue-700"/><div><h3 className="font-bold">Moderated reports</h3><p className="mt-1 text-sm text-slate-600">Submissions stay private until a moderator approves them.</p></div></div><div className="flex gap-3"><AlertTriangle className="shrink-0 text-amber-600"/><div><h3 className="font-bold">Use official information</h3><p className="mt-1 text-sm text-slate-600">Confirm urgent conditions with traffic police or local authorities.</p></div></div><div className="flex gap-3"><CheckCircle2 className="shrink-0 text-emerald-700"/><div><h3 className="font-bold">Report road hazards</h3><p className="mt-1 text-sm text-slate-600">Share congestion, crashes, closures, diversions and dangerous road conditions.</p></div></div></div></section>
    <footer className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 px-5 py-8 text-xs text-slate-500"><span>© {new Date().getFullYear()} Traffic Alert Nepal</span><span>Community information is not an emergency service. Never use your phone while driving.</span></footer>
    {showForm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"><div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><div><p className="text-xs font-bold tracking-widest text-blue-700">COMMUNITY REPORT</p><h2 className="mt-1 text-2xl font-extrabold">Share a road update</h2></div><button onClick={() => setShowForm(false)} className="rounded-full p-2 hover:bg-slate-100"><X/></button></div><p className="mt-2 text-sm text-slate-500">Do not report police checkpoints, officer positions or other enforcement locations. Focus on road safety.</p><form onSubmit={submitReport} className="mt-5 space-y-4"><label className="block text-sm font-semibold">Short title<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="mt-1 w-full rounded-xl border p-3 font-normal" placeholder="e.g. Waterlogging near bridge"/></label><label className="block text-sm font-semibold">Type<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="mt-1 w-full rounded-xl border p-3 font-normal">{categories.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}</select></label><label className="block text-sm font-semibold">District<select value={form.district} onChange={e=>setForm({...form,district:e.target.value})} className="mt-1 w-full rounded-xl border p-3 font-normal"><option>Kanchanpur</option><option>Kailali</option></select></label><label className="block text-sm font-semibold">Road / landmark<input required value={form.area} onChange={e=>setForm({...form,area:e.target.value})} className="mt-1 w-full rounded-xl border p-3 font-normal" placeholder="Town, road or public landmark"/></label><div className="rounded-2xl border border-blue-100 bg-blue-50 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-bold text-slate-900">Report location</p><p className="mt-1 text-xs text-slate-600">Use your device location to fill the map coordinates automatically.</p></div><button type="button" onClick={useCurrentLocation} disabled={locating} className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{locating ? "Locating…" : "Use my current location"}</button></div>{locationStatus && <p className="mt-2 text-xs text-blue-900">{locationStatus}</p>}<div className="mt-3 grid grid-cols-2 gap-3"><label className="block text-sm font-semibold">Latitude<input required value={form.lat} onChange={e=>setForm({...form,lat:e.target.value})} className="mt-1 w-full rounded-xl border bg-white p-3 font-normal"/></label><label className="block text-sm font-semibold">Longitude<input required value={form.lng} onChange={e=>setForm({...form,lng:e.target.value})} className="mt-1 w-full rounded-xl border bg-white p-3 font-normal"/></label></div></div><label className="block text-sm font-semibold">Details<textarea required rows={3} value={form.details} onChange={e=>setForm({...form,details:e.target.value})} className="mt-1 w-full rounded-xl border p-3 font-normal" placeholder="Describe what other road users should know..."/></label><div className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">Reports are not published immediately. A moderator must review and approve them first.</div>{notice && <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800">{notice}</p>}<button type="submit" className="w-full rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800">Submit for review</button></form></div></div>}
  </main>;
}
