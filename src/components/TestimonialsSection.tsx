"use client";

import { motion } from "framer-motion";
import { Play, Quote, ArrowUpRight } from "lucide-react";
import { TESTIMONIALS, testimonialVideoUrl } from "@/data/testimonials";
import { useTranslations } from "next-intl";

export function TestimonialsSection() {
  const t = useTranslations("testimonials");

  // Duplicate items twice to ensure smooth, infinite, seamless looping marquee on wider screens
  const marqueeItems = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section id="testimonials" className="py-20 bg-[#080808] relative overflow-hidden w-full border-t border-[rgba(255,255,255,0.07)]">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -z-10 w-[450px] h-[450px] bg-[#B89B72]/0.01 rounded-full blur-[90px] translate-x-1/4 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-[#B89B72]/0.01 rounded-full blur-[80px] -translate-x-1/4 translate-y-1/4" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="text-xs font-bold text-[#B89B72] tracking-widest uppercase">
            {t("sectionLabel")}
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-[#F5F1E8]">
            {t("heading")}
          </h2>
          <p className="text-base md:text-lg text-[#B8B2A7] leading-relaxed font-sans">
            {t("subtitle")}
          </p>
        </div>

        {/* Featured Video Testimonial Card */}
        <div className="max-w-3xl mx-auto mb-20">
          <a
            href={testimonialVideoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Watch ZOVO Gateway testimonial video on YouTube"
            className="group block bg-[#101010] rounded-[2rem] border border-[rgba(255,255,255,0.07)] p-4 md:p-6 hover:border-[rgba(184,155,114,0.28)] hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B89B72]"
          >
            {/* Visual Thumbnail Area */}
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#050505] flex items-center justify-center border border-[rgba(255,255,255,0.07)]">
              
              {/* Subtle background abstract lines pattern */}
              <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#FAFAF7_1px,transparent_1px)] [background-size:16px_16px]" />
              
              {/* Pulsing Play Button */}
              <div className="relative z-10 w-20 h-20 rounded-full bg-[#B89B72] hover:bg-[#C8AD85] text-[#050505] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                <span className="absolute inset-0 rounded-full bg-[#B89B72]/30 animate-ping" />
                <Play className="h-8 w-8 fill-current ml-1" />
              </div>
              
              {/* Badge Overlay */}
              <div className="absolute bottom-4 left-4 bg-[#050505]/75 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-[rgba(255,255,255,0.08)] text-xs font-semibold text-[#B89B72] flex items-center gap-1.5">
                <span className="flex h-2 w-2 rounded-full bg-[#B89B72] animate-pulse" />
                {t("video_label")}
              </div>
            </div>

            {/* Content Details inside Card */}
            <div className="pt-6 pb-2 px-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <h3 className="font-display font-extrabold text-xl text-[#F5F1E8] group-hover:text-[#B89B72] transition-colors">
                  {t("video_title")}
                </h3>
                <p className="text-sm text-[#B8B2A7] leading-relaxed font-sans">
                  {t("video_description")}
                </p>
              </div>
              <div className="shrink-0">
                <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-[rgba(184,155,114,0.28)] bg-transparent text-[#F5F1E8] hover:bg-[rgba(184,155,114,0.10)] font-bold text-sm shadow-md transition-colors">
                  {t("video_cta")}
                  <ArrowUpRight className="h-4 w-4 text-[#B89B72]" />
                </span>
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* Infinite Horizontal Testimonial Marquee */}
      <div className="relative w-full overflow-hidden flex items-center py-4">
        {/* Left/Right Subtle Shadow Fades */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-40 bg-gradient-to-r from-[#080808] via-[#080808]/70 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-40 bg-gradient-to-l from-[#080808] via-[#080808]/70 to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee gap-6 px-4">
          {marqueeItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="flex-shrink-0 w-[300px] sm:w-[350px] p-6 rounded-2xl bg-[#101010] border border-[rgba(255,255,255,0.07)] hover:border-[rgba(184,155,114,0.28)] transition-all duration-300 relative flex flex-col justify-between"
            >
              {/* Quote Mark Decoration */}
              <div className="absolute top-4 right-4 text-[rgba(184,155,114,0.30)]">
                <Quote className="h-8 w-8 fill-current rotate-180" />
              </div>

              {/* Testimonial Text */}
              <p className="text-sm text-[#B8B2A7] leading-relaxed font-sans mb-6 relative z-10 font-medium">
                "{t(item.textKey)}"
              </p>

              {/* Candidate Info with Warm Gold Indicator Accent */}
              <div className="pt-4 border-t border-[rgba(255,255,255,0.07)] flex items-center justify-between">
                <div>
                  <h4 className="font-display font-extrabold text-sm text-[#F5F1E8]">
                    {t(item.nameKey)}
                  </h4>
                  <p className="text-xs text-[#7D766B] font-sans mt-0.5">
                    {t(item.roleKey)}
                  </p>
                </div>
                <div className="h-1.5 w-6 rounded-full bg-[#B89B72]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
