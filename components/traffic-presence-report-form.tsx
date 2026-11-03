"use client";

import { useState, type FormEvent } from "react";
import { Camera, Send, LocateFixed } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function TrafficPresenceReportForm({ lang }: { lang: "en" | "ne" }) {
  const ne = lang === "ne";
  const [district, setDistrict] = useState<"Kanchanpur" | "Kailali">("Kanchanpur");
  const [area, setArea] = useState("");
  const [details, setDetails] = useState("");
  const [observedAt, setObservedAt] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [approxLocation, setApproxLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setMessage(ne ? "यो ब्राउजरले स्थान सुविधा समर्थन गर्दैन।" : "Geolocation is not supported by this browser.");
      return;
    }
    setLocating(true);
    setMessage("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        // Keep only a coarse neighborhood-level location; never save exact GPS coordinates.
        setApproxLocation({ lat: Number(coords.latitude.toFixed(2)), lng: Number(coords.longitude.toFixed(2)) });
        setLocating(false);
      },
      () => {
        setMessage(ne ? "स्थान अनुमति दिनुहोस् वा क्षेत्र आफैँ लेख्नुहोस्।" : "Allow location access or enter the area manually.");
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  }

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!supabase) {
      setMessage(ne ? "रिपोर्ट सेवा कन्फिगर गरिएको छैन।" : "Report service is not configured.");
      return;
    }
    if (photos.length !== 3) {
      setMessage(ne ? "ठ्याक्कै ३ वटा फोटो छान्नुहोस्।" : "Please select exactly 3 photos.");
      return;
    }
    if (photos.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024)) {
      setMessage(ne ? "JPG, PNG वा WebP फोटो मात्र (प्रत्येक ५ MB सम्म) अपलोड गर्नुहोस्।" : "Use JPG, PNG or WebP photos, up to 5 MB each.");
      return;
    }

    setSubmitting(true);
    const submissionId = crypto.randomUUID();
    const uploaded: string[] = [];
    try {
      for (let i = 0; i < photos.length; i += 1) {
        const file = photos[i];
        const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
        const path = `submissions/${submissionId}/photo-${i + 1}.${ext}`;
        const { error } = await supabase.storage.from("traffic-report-photos").upload(path, file, {
          contentType: file.type,
          upsert: false
        });
        if (error) throw error;
        uploaded.push(path);
      }

      const { error } = await supabase.from("traffic_presence_reports").insert({
        district,
        area: area.trim(),
        observed_at: new Date(observedAt).toISOString(),
        details: details.trim(),
        approx_lat: approxLocation?.lat ?? null,
        approx_lng: approxLocation?.lng ?? null,
        photo_paths: uploaded,
        status: "pending",
        expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
      });
      if (error) throw error;

      setArea("");
      setDetails("");
      setObservedAt("");
      setPhotos([]);
      setApproxLocation(null);
      const input = document.getElementById("traffic-presence-photos") as HTMLInputElement | null;
      if (input) input.value = "";
      setMessage(ne ? "३ फोटोसहित रिपोर्ट समीक्षाका लागि पठाइयो।" : "Report submitted with 3 photos for moderator review.");
    } catch (error) {
      if (uploaded.length) await supabase.storage.from("traffic-report-photos").remove(uploaded);
      setMessage(error instanceof Error ? error.message : (ne ? "रिपोर्ट पठाउन सकिएन।" : "Could not submit the report."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-5 pb-12">
      <div className="max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-blue-50 p-3 text-blue-700"><Camera size={22} /></span>
          <div>
            <p className="text-xs font-bold tracking-widest text-blue-700">{ne ? "समुदाय रिपोर्ट" : "COMMUNITY REPORT"}</p>
            <h2 className="text-2xl font-extrabold">{ne ? "ट्राफिक प्रहरी उपस्थिति रिपोर्ट" : "Report a traffic-police presence"}</h2>
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {ne
            ? "जिल्ला र सामान्य क्षेत्र मात्र लेख्नुहोस्। अस्थायी चेकिङको ठ्याक्कै स्थान, GPS निर्देशांक वा प्रहरीको आवागमन नलेख्नुहोस्। रिपोर्ट र फोटो सार्वजनिक नक्सामा देखाइँदैनन्; समीक्षाका लागि मात्र पठाइन्छन्।"
            : "Enter only the district and a broad neighborhood/area. Do not include exact temporary checkpoint positions, GPS coordinates or officer movements. Reports and photos are private and sent to moderators only; they are not published on the public map."}
        </p>
        <form onSubmit={submitReport} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              {ne ? "जिल्ला" : "District"}
              <select value={district} onChange={(e) => setDistrict(e.target.value as "Kanchanpur" | "Kailali")} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal">
                <option value="Kanchanpur">Kanchanpur</option>
                <option value="Kailali">Kailali</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              {ne ? "सामान्य क्षेत्र / टोल" : "General area / neighborhood"}
              <input required minLength={3} maxLength={120} value={area} onChange={(e) => setArea(e.target.value)} placeholder={ne ? "उदाहरण: बजार क्षेत्र" : "e.g. market area"} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal" />
            </label>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="text-sm font-semibold text-slate-700">{ne ? "हालको सामान्य स्थान" : "Approximate current location"}</p><p className="mt-1 text-xs text-slate-500">{approxLocation ? (ne ? "सामान्य स्थान सुरक्षित रूपमा थपियो।" : "Approximate location added.") : (ne ? "वैकल्पिक: GPS अनुमति दिएर सामान्य क्षेत्र थप्नुहोस्।" : "Optional: allow GPS to add your approximate area.")}</p></div>
              <button type="button" onClick={useCurrentLocation} disabled={locating} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-800 disabled:opacity-50"><LocateFixed size={16} />{locating ? (ne ? "स्थान खोज्दै..." : "Locating...") : (ne ? "हालको स्थान प्रयोग गर्नुहोस्" : "Use current location")}</button>
            </div>
            <p className="mt-2 text-xs text-slate-500">{ne ? "गोपनीयताका लागि GPS स्थान करिब १ किमि स्तरमा मात्र राखिन्छ; ठ्याक्कै निर्देशांक भण्डारण हुँदैन।" : "For privacy, GPS is rounded to roughly neighborhood scale (~1 km); exact coordinates are never stored. This location is private to moderators."}</p>
          </div>
          <label className="block text-sm font-semibold text-slate-700">
            {ne ? "देखिएको मिति र समय" : "Date and time observed"}
            <input required type="datetime-local" value={observedAt} onChange={(e) => setObservedAt(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal" />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            {ne ? "थप विवरण" : "Additional details"}
            <textarea required minLength={10} maxLength={1000} value={details} onChange={(e) => setDetails(e.target.value)} rows={4} placeholder={ne ? "सामान्य जानकारी मात्र लेख्नुहोस्..." : "Share general context only..."} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal" />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            {ne ? "ठ्याक्कै ३ फोटो अनिवार्य" : "Exactly 3 photos required"}
            <input id="traffic-presence-photos" required type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => setPhotos(Array.from(e.target.files ?? []))} className="mt-2 block w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm font-normal file:mr-3 file:rounded-lg file:border-0 file:bg-blue-700 file:px-3 file:py-2 file:font-semibold file:text-white" />
            <span className="mt-1 block text-xs font-normal text-slate-500">{ne ? "JPG, PNG वा WebP; प्रत्येक फोटो अधिकतम ५ MB। छानिएका फोटो: " : "JPG, PNG or WebP; maximum 5 MB each. Selected: "}{photos.length}/3</span>
          </label>
          <div className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">
            {ne ? "अनुहार, सवारी नम्बर प्लेट वा संवेदनशील व्यक्तिगत विवरण भएका फोटो नपठाउनुहोस्। फोटो निजी रूपमा राखिन्छन् र सार्वजनिक गरिँदैनन्।" : "Do not upload identifiable faces, number plates or sensitive personal details. Photos are stored privately and are not made public."}
          </div>
          {message && <p role="status" className="rounded-xl bg-slate-100 p-3 text-sm text-slate-700">{message}</p>}
          <button type="submit" disabled={submitting || photos.length !== 3} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50">
            <Send size={17} />{submitting ? (ne ? "पठाउँदै..." : "Submitting...") : (ne ? "रिपोर्ट पठाउनुहोस्" : "Submit report")}
          </button>
        </form>
      </div>
    </section>
  );
}
