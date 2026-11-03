"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { MapPin, Phone, ShieldCheck, ExternalLink, TrafficCone } from "lucide-react";

const TrafficMap = dynamic(() => import("@/components/traffic-map"), { ssr: false });

type TrafficOffice = {
  id: string;
  name: string;
  nameNe: string;
  district: "Kanchanpur" | "Kailali";
  area: string;
  phone: string;
  lat: number;
  lng: number;
  kind: string;
};

const offices: TrafficOffice[] = [
  {
    id: "kanchanpur-dtpo",
    name: "District Traffic Police Office, Kanchanpur",
    nameNe: "जिल्ला ट्राफिक प्रहरी कार्यालय, कञ्चनपुर",
    district: "Kanchanpur",
    area: "Mahendranagar, Bhimdatta",
    phone: "099-522017",
    lat: 28.9705456,
    lng: 80.1843596,
    kind: "District office"
  },
  {
    id: "kailali-dtpo",
    name: "District Traffic Police Office, Kailali",
    nameNe: "जिल्ला ट्राफिक प्रहरी कार्यालय, कैलाली",
    district: "Kailali",
    area: "Dhangadhi",
    phone: "091-521699",
    lat: 28.702,
    lng: 80.57808,
    kind: "District office"
  },
  {
    id: "attariya-traffic-office",
    name: "Highway Safety and Traffic Management Office",
    nameNe: "राजमार्ग सुरक्षा तथा ट्राफिक व्यवस्थापन कार्यालय",
    district: "Kailali",
    area: "Attariya, Godawari",
    phone: "091-550029",
    lat: 28.81338,
    lng: 80.55568,
    kind: "Regional office"
  }
];

export default function Home() {
  const [lang, setLang] = useState<"en" | "ne">("en");
  const [district, setDistrict] = useState<"All" | "Kanchanpur" | "Kailali">("All");
  const ne = lang === "ne";
  const visible = offices.filter((office) => district === "All" || office.district === district);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <a href="#" className="flex items-center gap-3">
            <span className="rounded-xl bg-blue-700 p-2 text-white"><TrafficCone size={24} /></span>
            <span><strong className="block text-lg tracking-tight">Traffic Alert Nepal</strong><small className="text-slate-500">{ne ? "ट्राफिक प्रहरी कार्यालय नक्सा" : "Traffic police office map"}</small></span>
          </a>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:inline">{ne ? "कञ्चनपुर · कैलाली" : "Kanchanpur · Kailali"}</span>
            <button onClick={() => setLang(ne ? "en" : "ne")} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold">{ne ? "EN" : "नेपाली"}</button>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-[#0b1f43] via-[#123c78] to-[#1763a8] text-white">
        <div className="mx-auto max-w-7xl px-5 py-14 md:py-20">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-widest text-blue-100"><ShieldCheck size={15} />{ne ? "सार्वजनिक जानकारी" : "PUBLIC DIRECTORY"}</div>
          <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-6xl">{ne ? "ट्राफिक प्रहरी कार्यालयहरू कहाँ छन्?" : "Find traffic police offices."}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-100">{ne ? "कञ्चनपुर र कैलालीका सार्वजनिक रूपमा सूचीकृत ट्राफिक प्रहरी कार्यालयहरूको नक्सा र सम्पर्क विवरण।" : "A simple map and contact directory of publicly listed traffic police offices in Kanchanpur and Kailali."}</p>
          <div className="mt-7 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-white/10 px-4 py-2">{ne ? "स्थायी सार्वजनिक कार्यालयहरू मात्र" : "Permanent public offices only"}</span>
            <span className="rounded-full bg-white/10 px-4 py-2">{ne ? "लाइभ चेकिङ लोकेसन छैन" : "No live checkpoint locations"}</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-widest text-blue-700">{ne ? "नक्सा" : "MAP"}</p>
            <h2 className="mt-1 text-2xl font-extrabold">{ne ? "ट्राफिक प्रहरी कार्यालयको स्थान" : "Traffic police office locations"}</h2>
            <p className="mt-1 text-sm text-slate-500">{ne ? "OpenStreetMap द्वारा सञ्चालित" : "Powered by OpenStreetMap"}</p>
          </div>
          <select value={district} onChange={(event) => setDistrict(event.target.value as typeof district)} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm">
            <option value="All">{ne ? "सबै जिल्ला" : "All districts"}</option>
            <option value="Kanchanpur">Kanchanpur</option>
            <option value="Kailali">Kailali</option>
          </select>
        </div>
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="h-[420px] overflow-hidden rounded-2xl"><TrafficMap locations={visible} /></div>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">{ne ? "नक्साका पिनहरू सार्वजनिक कार्यालयका स्थान हुन्, प्रहरीको तैनाथी वा चेकिङ भइरहेको स्थान होइनन्।" : "Pins identify public office locations, not where officers are deployed or where checks are happening."}</p>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16">
        <div className="mb-5"><p className="text-xs font-bold tracking-widest text-blue-700">{ne ? "सम्पर्क विवरण" : "CONTACT DIRECTORY"}</p><h2 className="mt-1 text-2xl font-extrabold">{ne ? "सूचीकृत कार्यालयहरू" : "Listed offices"}</h2></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((office) => (
            <article key={office.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">{office.district}</span><span className="text-xs text-slate-500">{ne ? (office.kind === "Regional office" ? "प्रदेश कार्यालय" : "जिल्ला कार्यालय") : office.kind}</span></div>
              <h3 className="mt-4 text-lg font-bold leading-7">{ne ? office.nameNe : office.name}</h3>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><MapPin size={16} />{office.area}</p>
              <a href={`tel:${office.phone}`} className="mt-4 inline-flex items-center gap-2 font-semibold text-blue-700 hover:text-blue-900"><Phone size={16} />{office.phone}</a>
              <a href={`https://www.google.com/maps/search/?api=1&query=${office.lat},${office.lng}`} target="_blank" rel="noreferrer" className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-semibold text-slate-700 hover:text-blue-700">{ne ? "नक्सामा खोल्नुहोस्" : "Open directions"}<ExternalLink size={16} /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-blue-100 bg-blue-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-bold">{ne ? "ट्राफिक प्रहरी सहायता नम्बर" : "Traffic police assistance"}</h2><p className="mt-1 text-sm text-slate-600">{ne ? "आपतकालीन वा सडक सहायता आवश्यक परे १०३ मा फोन गर्नुहोस्।" : "For traffic assistance, call the official traffic police helpline."}</p></div>
          <a href="tel:103" className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"><Phone size={18} />103</a>
        </div>
      </section>
      <footer className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 px-5 py-8 text-xs text-slate-500"><span>© {new Date().getFullYear()} Traffic Alert Nepal</span><span>{ne ? "कार्यालय विवरण नेपाल प्रहरीको सार्वजनिक निर्देशिकाबाट।" : "Office contacts sourced from the public Nepal Police directory."}</span></footer>
    </main>
  );
}
