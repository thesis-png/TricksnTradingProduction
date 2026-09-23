"use client";

import { motion } from "framer-motion";
import { Phone, Mail, MapPin, MessageSquare, Clock } from "lucide-react";
import { CONTACT_INFO } from "@/constants";
import { Button } from "./ui/button";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/context/LanguageContext";
import { getWhatsAppLink } from "./MobileStickyCTA";

export function ContactSection() {
  const t = useTranslations("contact");
  const { locale } = useLanguage();
  const whatsappUrl = getWhatsAppLink(locale);

  return (
    <section id="contact" className="py-20 bg-[#050505] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="text-xs font-bold text-[#B6925B] tracking-widest uppercase">
            {t("tag")}
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-[#F5F5F5]">
            {t("title")}
          </h2>
          <p className="text-base md:text-lg text-neutral-400 leading-relaxed font-sans">
            {t("desc")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          {/* Contact Information Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 space-y-8 flex flex-col justify-between"
          >
            <div className="space-y-6">
              <h3 className="font-display font-extrabold text-2xl text-[#F5F5F5]">
                {t("office_title")}
              </h3>
              <p className="text-sm text-neutral-400 font-sans leading-relaxed">
                {t("office_desc")}
              </p>

              {/* Working Hours */}
              <div className="flex gap-4 p-4 rounded-2xl bg-[#111111] border border-white/8">
                <Clock className="h-5 w-5 text-[#B6925B] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-display font-bold text-sm text-[#F5F5F5]">{t("timings")}</h4>
                  <p className="text-xs text-neutral-400 mt-1 font-sans">
                    {t("timings_desc")}
                  </p>
                </div>
              </div>

              {/* Contact Items List */}
              <div className="space-y-4">
                {/* Phone Call */}
                <a
                  href={`tel:${CONTACT_INFO.phoneRaw}`}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[#0B0B0B] border border-white/8 hover:border-[#B6925B]/40 hover:bg-[#111111] group transition-all"
                >
                  <div className="bg-[#111111] text-[#F5F5F5] border border-white/8 group-hover:bg-[#B6925B] group-hover:text-[#050505] transition-all p-3 rounded-xl shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-xs text-neutral-500 uppercase tracking-wider">{t("call")}</h4>
                    <p className="font-sans font-bold text-base md:text-lg text-[#F5F5F5] group-hover:text-[#B6925B] transition-colors mt-0.5">
                      {CONTACT_INFO.phone}
                    </p>
                  </div>
                </a>

                {/* Email Direct */}
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[#0B0B0B] border border-white/8 hover:border-[#B6925B]/40 hover:bg-[#111111] group transition-all"
                >
                  <div className="bg-[#111111] text-[#F5F5F5] border border-white/8 group-hover:bg-[#B6925B] group-hover:text-[#050505] transition-all p-3 rounded-xl shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-xs text-neutral-500 uppercase tracking-wider">{t("email")}</h4>
                    <p className="font-sans font-bold text-base md:text-lg text-[#F5F5F5] group-hover:text-[#B6925B] transition-colors mt-0.5">
                      {CONTACT_INFO.email}
                    </p>
                  </div>
                </a>

                {/* Office Location Address */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0B0B0B] border border-white/8">
                  <div className="bg-[#111111] text-[#F5F5F5] border border-white/8 p-3 rounded-xl shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-xs text-neutral-500 uppercase tracking-wider">{t("address")}</h4>
                    <p className="font-sans font-semibold text-sm text-neutral-300 mt-0.5 leading-relaxed whitespace-pre-line">
                      {CONTACT_INFO.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Call to Action */}
            <div className="pt-4">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="accent-emerald" className="w-full gap-2 h-12 shadow-lg shadow-emerald-500/10 cursor-pointer">
                  <MessageSquare className="h-5 w-5 shrink-0" />
                  {t("chat_wa")}
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Interactive Google Map block */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 h-[350px] lg:h-auto min-h-[400px] w-full rounded-3xl overflow-hidden border border-white/8 shadow-none"
          >
            <iframe
              src={CONTACT_INFO.mapEmbedUrl}
              className="w-full h-full border-0"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="ZOVO Gateway Kolkata Office Coordinates"
              aria-label="Google Map location showing ZOVO Gateway Office"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
