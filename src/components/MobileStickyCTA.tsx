"use client";

import * as React from "react";
import { Phone, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/context/LanguageContext";
import { CONTACT_INFO } from "@/constants";

export function getWhatsAppLink(locale: string) {
  const phone = "919874259915";
  let text = "Hi ZOVO Gateway, I want to know more about overseas jobs";
  if (locale === "hi") {
    text = "नमस्ते ZOVO Gateway, मुझे विदेश नौकरी के बारे में जानकारी चाहिए। मेरा नाम: ___, जिला: ___, काम: ___, अनुभव: ___";
  } else if (locale === "bn") {
    text = "নমস্কার ZOVO Gateway, আমি বিদেশে চাকরির বিষয়ে জানতে চাই। আমার নাম: ___, জেলা: ___, কাজ: ___, অভিজ্ঞতা: ___";
  } else if (locale === "ta") {
    text = "வணக்கம் ZOVO Gateway, வெளிநாட்டு வேலை பற்றி தகவல் வேண்டும். என் பெயர்: ___, மாவட்டம்: ___, வேலை: ___, அனுபவம்: ___";
  } else if (locale === "ml") {
    text = "നമസ്കാരം ZOVO Gateway, വിദേശ ജോലിയെക്കുറിച്ച് അറിയണം. എന്റെ പേര്: ___, ജില്ല: ___, ജോലി: ___, അനുഭവം: ___";
  }
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function MobileStickyCTA() {
  const t = useTranslations("sticky");
  const { locale } = useLanguage();
  const whatsappUrl = getWhatsAppLink(locale);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-white/8 py-3 px-4 shadow-none flex items-center gap-3 lg:hidden">
      {/* Call Now button */}
      <a
        href={`tel:${CONTACT_INFO.phoneRaw}`}
        className="flex-1 flex items-center justify-center gap-2 h-12 bg-[#111111] hover:bg-[#141414] text-[#F4F1EA] border border-white/8 rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
      >
        <Phone className="h-4 w-4 text-[#B89B72]" />
        <span>{t("call")}</span>
      </a>

      {/* WhatsApp button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-2 h-12 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl font-bold text-sm transition-all active:scale-[0.98] shadow-sm shadow-[#10B981]/10"
      >
        <MessageCircle className="h-5 w-5 fill-white" />
        <span>{t("whatsapp")}</span>
      </a>
    </div>
  );
}
