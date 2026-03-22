"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { DAYS_DE } from "@/lib/utils";
import type { Metadata } from "next";

export default function KontaktPage() {
  const [formState, setFormState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState("sending");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setFormState("sent");
        (e.target as HTMLFormElement).reset();
      } else {
        setFormState("error");
      }
    } catch {
      setFormState("error");
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <span className="text-primary font-semibold text-sm uppercase tracking-wider">
          Kontakt
        </span>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-neutral-800 mt-2 mb-4">
          So erreichen Sie uns
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-8">
          <div className="bg-warm-50 rounded-2xl p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-800 mb-1">Adresse</h3>
                <p className="text-neutral-600">
                  Am alten Flugplatz 100<br />10318 Berlin
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-800 mb-1">Telefon</h3>
                <p className="text-neutral-600">030 56553364</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-800 mb-1">E-Mail</h3>
                <p className="text-neutral-600">info@culinarium-biesenhorst.de</p>
              </div>
            </div>
          </div>

          <div className="bg-warm-50 rounded-2xl p-6">
            <h3 className="font-heading text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Öffnungszeiten
            </h3>
            <ul className="space-y-2">
              {DAYS_DE.slice(0, 5).map((day) => (
                <li key={day} className="flex justify-between text-sm">
                  <span className="text-neutral-600">{day}</span>
                  <span className="font-medium text-neutral-800">06:00 – 14:00</span>
                </li>
              ))}
              {DAYS_DE.slice(5).map((day) => (
                <li key={day} className="flex justify-between text-sm">
                  <span className="text-neutral-600">{day}</span>
                  <span className="text-neutral-400">Geschlossen</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-8">
          <h2 className="font-heading text-2xl font-bold text-neutral-800 mb-6">
            Schreiben Sie uns
          </h2>

          {formState === "sent" ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-neutral-800 mb-2">
                Nachricht gesendet!
              </h3>
              <p className="text-neutral-500">
                Vielen Dank. Wir melden uns schnellstmöglich bei Ihnen.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  placeholder="Ihr Name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                  E-Mail *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  placeholder="ihre@email.de"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-neutral-700 mb-1">
                  Betreff *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  placeholder="Worum geht es?"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-1">
                  Nachricht *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
                  placeholder="Ihre Nachricht an uns..."
                />
              </div>
              {formState === "error" && (
                <p className="text-red-600 text-sm">
                  Fehler beim Senden. Bitte versuchen Sie es erneut.
                </p>
              )}
              <button
                type="submit"
                disabled={formState === "sending"}
                className="w-full bg-primary text-white py-3 px-6 rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="h-5 w-5" />
                {formState === "sending" ? "Wird gesendet..." : "Nachricht senden"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
