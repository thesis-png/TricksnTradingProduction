"use client";

import * as React from "react";
import { Menu, X, ArrowUpRight, CreditCard, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/constants";
import { Button } from "./ui/button";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./LanguageSwitcher";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function Navbar() {
  const t = useTranslations("navbar");
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState("home");

  const isJobPage = pathname?.startsWith("/jobs");
  const currentActiveSection = isJobPage ? "jobs-abroad" : activeSection;

  const getNavLinkKey = (label: string) => {
    switch (label.toLowerCase()) {
      case "home": return "home";
      case "jobs abroad": return "jobs";
      case "services": return "services";
      case "for employers": return "employers";
      case "about": return "about";
      case "contact": return "contact";
      default: return "home";
    }
  };

  // Track scroll position for sticky header styling
  React.useEffect(() => {
    if (isJobPage) return; // Skip scroll tracking on job listing pages

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Simple active section highlights
      const scrollPos = window.scrollY + 100;
      for (const link of NAV_LINKS) {
        const hashIndex = link.href.indexOf("#");
        const id = hashIndex !== -1 ? link.href.substring(hashIndex + 1) : "";
        if (!id) continue;
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(id);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isJobPage]);

  // Smooth scroll handler
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // If not on homepage or not an anchor link, let the normal link navigation handle it
    if (pathname !== "/" || !href.includes("#")) {
      setIsOpen(false);
      return;
    }

    e.preventDefault();
    setIsOpen(false);

    const hashIndex = href.indexOf("#");
    const elementId = hashIndex !== -1 ? href.substring(hashIndex + 1) : "";
    const targetId = elementId === "for-employers" ? "employer" : elementId;
    const element = targetId ? document.getElementById(targetId) : null;

    if (element) {
      const offset = window.innerWidth >= 1024 ? 120 : 80; // Adjust for sticky two-row navbar height
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });

      if (elementId === "job-seeker" || elementId === "employer" || elementId === "for-employers") {
        window.location.hash = elementId === "for-employers" ? "#employer" : `#${elementId}`;
      }
    }
  };

  const handleApplyClick = () => {
    setIsOpen(false);
    if (pathname !== "/") {
      window.location.href = "/apply";
      return;
    }
    const element = document.getElementById("job-seeker");
    if (element) {
      const offset = window.innerWidth >= 1024 ? 120 : 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });

      window.location.hash = "#job-seeker";
    }
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 w-full bg-[#050505] border-b border-[rgba(255,255,255,0.07)] shadow-sm transition-all duration-300",
          scrolled ? "bg-[#050505]/88 backdrop-blur-[14px]" : "bg-[#050505]"
        )}
      >
        {/* --- DESKTOP TWO-ROW NAVBAR (lg and above) --- */}
        <div className="hidden lg:flex flex-col w-full">
          {/* Top Row: Height 68px */}
          <div className="h-[68px] flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            {/* Logo Group */}
            <div className="flex items-center shrink-0">
              <a
                href="/#home"
                onClick={(e) => handleScrollTo(e, "/#home")}
                className="flex items-center group focus:outline-none"
              >
                <Image
                  src="/zovo-gateway-logo-transparent.png"
                  alt="ZOVO Gateway Logo"
                  width={220}
                  height={80}
                  className="h-12 md:h-14 w-auto max-w-[210px] object-contain group-hover:scale-102 transition-transform duration-200"
                  priority
                />
              </a>
            </div>

            {/* Actions: Language Switcher + Book Appointment + Apply Now */}
            <div className="flex items-center gap-4 shrink-0 whitespace-nowrap">
              <LanguageSwitcher />
              
              <a
                href="/appointment"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold text-[#F5F1E8] bg-transparent border border-[rgba(184,155,114,0.28)] hover:bg-[rgba(184,155,114,0.10)] transition-all duration-300 whitespace-nowrap"
              >
                <Calendar className="h-4 w-4 text-[#B89B72]" />
                {t("bookAppointment") || "Book Appointment"}
              </a>

              <Button
                onClick={handleApplyClick}
                variant="primary"
                className="gap-1.5 group h-10 px-5 whitespace-nowrap"
              >
                {t("applyNow")}
                <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Bottom Row: Height 48px */}
          <div className="h-[48px] border-t border-[rgba(255,255,255,0.07)] flex items-center justify-center w-full">
            <nav className="flex items-center gap-6 xl:gap-8 justify-center whitespace-nowrap min-w-0">
              {NAV_LINKS.map((link) => {
                const hashIndex = link.href.indexOf("#");
                const id = hashIndex !== -1 ? link.href.substring(hashIndex + 1) : link.href;
                const isActive = currentActiveSection === id;
                const navKey = getNavLinkKey(link.label);
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleScrollTo(e, link.href)}
                    className={cn(
                      "text-[13px] xl:text-sm font-medium transition-colors hover:text-[#C8AD85] relative py-1 focus:outline-none whitespace-nowrap",
                      isActive ? "text-[#B89B72] font-semibold" : "text-[#B8B2A7]"
                    )}
                  >
                    {t(navKey)}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute bottom-[-6px] left-0 right-0 h-0.5 bg-[#B89B72]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </a>
                );
              })}

              {/* Complete Payment Centered Navigation Link */}
              <a
                href="/pay"
                className={cn(
                  "text-[13px] xl:text-sm font-medium transition-colors hover:text-[#C8AD85] relative py-1 focus:outline-none whitespace-nowrap flex items-center gap-1.5",
                  currentActiveSection === "pay" || pathname === "/pay" ? "text-[#B89B72] font-semibold" : "text-[#B8B2A7]"
                )}
              >
                <CreditCard className="h-3.5 w-3.5 text-[#B8B2A7]" />
                {t("completePayment") || "Complete Payment"}
                {(currentActiveSection === "pay" || pathname === "/pay") && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-[-6px] left-0 right-0 h-0.5 bg-[#B89B72]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            </nav>
          </div>
        </div>

        {/* --- MOBILE NAVBAR (below lg) --- */}
        <div className="lg:hidden flex items-center justify-between h-16 max-w-7xl mx-auto px-4 sm:px-6 w-full min-w-0">
          {/* Logo Group */}
          <div className="flex items-center shrink-0 min-w-0 mr-2">
            <a
              href="/#home"
              onClick={(e) => handleScrollTo(e, "/#home")}
              className="flex items-center group focus:outline-none min-w-0"
            >
              <Image
                src="/zovo-gateway-logo-transparent.png"
                alt="ZOVO Gateway Logo"
                width={150}
                height={55}
                className="h-9 xs:h-10 w-auto max-w-[150px] object-contain group-hover:scale-102 transition-transform duration-200"
                priority
              />
            </a>
          </div>

          {/* Mobile Right Controls: LanguageSwitcher (Mobile Header style) + Hamburger Toggle */}
          <div className="flex items-center gap-1.5 xs:gap-2 shrink-0">
            <div>
              <LanguageSwitcher isMobileHeader={true} />
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-white hover:bg-white/10 focus:outline-none cursor-pointer shrink-0 transition-colors"
              aria-expanded={isOpen}
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="h-5 w-5 xs:h-6 xs:w-6" /> : <Menu className="h-5 w-5 xs:h-6 xs:w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[64px] z-30 lg:hidden border-b border-[rgba(255,255,255,0.07)] bg-[#050505]/95 backdrop-blur-[14px] shadow-xl"
          >
            <div className="px-4 pt-4 pb-8 space-y-6">
              <nav className="flex flex-col gap-2">
                {NAV_LINKS.map((link) => {
                  const hashIndex = link.href.indexOf("#");
                  const id = hashIndex !== -1 ? link.href.substring(hashIndex + 1) : link.href;
                  const isActive = currentActiveSection === id;
                  const navKey = getNavLinkKey(link.label);
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={(e) => handleScrollTo(e, link.href)}
                      className={cn(
                        "text-base font-medium px-4 py-2.5 rounded-xl transition-colors",
                        isActive
                          ? "bg-[#101010] text-[#B89B72] font-semibold"
                          : "text-[#B8B2A7] hover:bg-[#101010] hover:text-[#F5F1E8]"
                      )}
                    >
                      {t(navKey)}
                    </a>
                  );
                })}

                {/* Complete Payment Mobile Link */}
                <a
                  href="/pay"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "text-base font-medium px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2.5",
                    currentActiveSection === "pay" || pathname === "/pay"
                      ? "bg-[#101010] text-[#B89B72] font-semibold"
                      : "text-[#B8B2A7] hover:bg-[#101010] hover:text-[#F5F1E8]"
                  )}
                >
                  <CreditCard className="h-4 w-4 text-[#B8B2A7]" />
                  <span>{t("completePayment") || "Complete Payment"}</span>
                </a>
              </nav>
              
              <div className="px-4 pt-4 border-t border-[rgba(255,255,255,0.07)] flex flex-col gap-3">
                <LanguageSwitcher isMobile={true} />
                
                <a
                  href="/appointment"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold text-[#F5F1E8] border border-[rgba(184,155,114,0.28)] hover:bg-[rgba(184,155,114,0.10)] bg-transparent transition-all"
                >
                  <Calendar className="h-4 w-4 text-[#B89B72]" />
                  {t("bookAppointment") || "Book Appointment"}
                </a>
                
                <Button onClick={handleApplyClick} variant="primary" className="w-full justify-center h-11 rounded-xl">
                  {t("applyNow")}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
