"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { NextIntlClientProvider } from "next-intl";

import en from "@/messages/en.json";
import hi from "@/messages/hi.json";
import bn from "@/messages/bn.json";
import ta from "@/messages/ta.json";
import ml from "@/messages/ml.json";

export type Locale = "en" | "hi" | "bn" | "ta" | "ml";

const MESSAGES_MAP = { en, hi, bn, ta, ml };

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  sessionLocale: Locale | null;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [sessionLocale, setSessionLocale] = useState<Locale | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem("zovogateway_locale") || localStorage.getItem("tricksntrading_locale") || localStorage.getItem("trendy_locale")) as Locale;
    setTimeout(() => {
      if (saved && MESSAGES_MAP[saved]) {
        setLocaleState(saved);
      }
      setMounted(true);
    }, 0);
  }, []);

  const setLocale = (newLocale: Locale) => {
    localStorage.setItem("zovogateway_locale", newLocale);
    setLocaleState(newLocale);
    setSessionLocale(newLocale);
    window.dispatchEvent(new Event("locale-changed"));
  };

  // Render provider with current locale (defaults to "en" on server/first render to avoid hydration mismatch)
  return (
    <LanguageContext.Provider value={{ locale, setLocale, sessionLocale }}>
      <NextIntlClientProvider locale={locale} messages={MESSAGES_MAP[locale]} timeZone="Asia/Kolkata">
        <div key={mounted ? "hydrated" : "server"}>
          {children}
        </div>
      </NextIntlClientProvider>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
