"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Briefcase, 
  MapPin, 
  Calendar, 
  AlertCircle, 
  MessageCircle, 
  Clock,
  Award
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JobSeekerForm } from "@/components/JobSeekerForm";
import { CONTACT_INFO } from "@/constants";
import { useTranslations } from "next-intl";

// Helper to convert ISO 2-letter country code into flag emoji
function getFlagEmoji(countryCode: string) {
  if (!countryCode) return "";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Helper to parse semicolon-separated values into bullet points
function parseBulletPoints(text: string | undefined | null): string[] {
  if (!text) return [];
  return text
    .split(";")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

// Defensive helper to parse job fields supporting both snake_case and camelCase
const getJobField = <T,>(job: Record<string, unknown> | null | undefined, snakeKey: string, camelKey: string, fallbackValue: T): T => {
  if (job && job[snakeKey] !== undefined) return job[snakeKey] as T;
  if (job && job[camelKey] !== undefined) return job[camelKey] as T;
  return fallbackValue;
};

interface Job {
  job_id: string;
  role: string;
  company_name: string;
  city: string;
  category: string;
  experience_level: string;
  salary: string | number;
  currency: string;
  job_type: string;
  job_description: string;
  is_urgent: string;
  is_premium: string;
  posted_at: string;
  requirements?: string;
  benefits?: string;
}

export default function CountryJobsPage() {
  const params = useParams();
  const countrySlug = (params?.country_slug as string) || "";
  const tJobs = useTranslations("jobsPage");

  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [countryName, setCountryName] = React.useState("");
  const [countryCode, setCountryCode] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);
  const [applyJob, setApplyJob] = React.useState<Job | null>(null);

  // Prevent background scroll when modal is open
  React.useEffect(() => {
    if (selectedJob || applyJob) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedJob, applyJob]);

  // Handle Escape key closure
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedJob(null);
        setApplyJob(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Normalize fallback country name if API is loading or empty
  const formattedFallbackName = React.useMemo(() => {
    if (!countrySlug) return "";
    return countrySlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }, [countrySlug]);

  React.useEffect(() => {
    if (!countrySlug) return;

    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        
        // 1. Fetch country details to resolve country code and proper name
        const countriesRes = await fetch("/api/countries");
        if (countriesRes.ok && active) {
          const result = await countriesRes.json();
          if (result.success && Array.isArray(result.data)) {
            interface Country {
              country_slug: string;
              country_id?: string;
              country_name: string;
              country_code: string;
            }
            const match = (result.data as Country[]).find(
              (c) => c.country_slug === countrySlug || c.country_id?.toLowerCase() === countrySlug.toLowerCase()
            );
            if (match) {
              setCountryName(match.country_name);
              setCountryCode(match.country_code);
            }
          }
        }

        // 2. Fetch jobs for the country
        const jobsRes = await fetch(`/api/jobs?country=${countrySlug}`);
        if (!jobsRes.ok) {
          throw new Error(`Failed to fetch jobs (Status: ${jobsRes.status})`);
        }
        
        const jobsResult = await jobsRes.json();
        if (active) {
          if (jobsResult.success && Array.isArray(jobsResult.data)) {
            setJobs(jobsResult.data);
          } else if (jobsResult.success && !jobsResult.data) {
            setJobs([]);
          } else {
            setError(jobsResult.error || "Failed to load jobs");
          }
        }
      } catch (err) {
        if (active) {
          console.error("Error loading country jobs page:", err);
          setError(err instanceof Error ? err.message : "An unexpected error occurred");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [countrySlug]);

  const displayCountryName = countryName || formattedFallbackName;

  // Custom WhatsApp link pre-filled with dynamic job role inquiry
  const getJobWhatsAppUrl = (role: string) => {
    const text = `Hi ZOVO Gateway, I want to apply for the ${role} job in ${displayCountryName}. Requisition ID is active. Please guide me on work permit requirements.`;
    return `https://wa.me/${CONTACT_INFO.phoneRaw}?text=${encodeURIComponent(text)}`;
  };

  // General country-level WhatsApp inquiry
  const generalWhatsAppUrl = `https://wa.me/${CONTACT_INFO.phoneRaw}?text=${encodeURIComponent(
    `Hi ZOVO Gateway, I want to know about active job openings and immigration options in ${displayCountryName}.`
  )}`;

  return (
    <>
      <Navbar />

      <main className="flex-1 w-full bg-[#050505]">
        {/* Header Hero Section */}
        <section className="relative pt-28 pb-16 bg-[#0B0B0B] border-b border-white/8 text-[#F4F1EA] overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-0 w-[600px] h-[300px] bg-gradient-to-r from-[#B89B72]/5 to-transparent rounded-full blur-[100px] pointer-events-none" />
          
          <div className="max-w-5xl mx-auto px-4 relative z-10 space-y-6">
            {/* Back Button */}
            <a 
              href="/#jobs-abroad"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B8B2A7] hover:text-white transition-colors cursor-pointer group focus:outline-none"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 text-[#B89B72]" />
              <span>Back to Locations</span>
            </a>

            {/* Title Block */}
            <div className="flex flex-wrap items-center gap-3">
              {countryCode && (
                <span className="text-4xl select-none leading-none" role="img" aria-label="Country Flag">
                  {getFlagEmoji(countryCode)}
                </span>
              )}
              <h1 className="text-3.5xl md:text-5xl font-display font-extrabold tracking-tight">
                {tJobs("titlePrefix")} <span className="text-[#B89B72]">{displayCountryName}</span>
              </h1>
            </div>

            <p className="text-[#B8B2A7] max-w-2xl text-sm md:text-base leading-relaxed">
              {tJobs("subtitle", { country: displayCountryName })}
            </p>
          </div>
        </section>

        {/* Jobs Container */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            
            {loading ? (
              /* --- skeleton loading states --- */
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-full bg-[#111111] rounded-3xl p-6 md:p-8 border border-white/8 shadow-none space-y-6 animate-pulse">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-3 flex-1">
                        <div className="h-6 bg-white/5 rounded-md w-3/4" />
                        <div className="h-4 bg-white/5 rounded-md w-1/2" />
                      </div>
                      <div className="h-6 bg-white/5 rounded-full w-20" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Array.from({ length: 4 }).map((_, idx) => (
                        <div key={idx} className="h-8 bg-white/5 rounded-xl" />
                      ))}
                    </div>
                    <div className="h-16 bg-white/5 rounded-2xl" />
                    <div className="flex gap-4 pt-2">
                      <div className="h-11 bg-white/5 rounded-xl flex-1" />
                      <div className="h-11 bg-white/5 rounded-xl flex-1" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              /* --- Error block --- */
              <div className="text-center py-16 bg-[#111111] border border-white/8 rounded-3xl px-6 max-w-xl mx-auto">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-[#F4F1EA] mb-2">Error Loading Jobs</h3>
                <p className="text-[#B8B2A7] text-sm mb-6">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-2.5 bg-[#B89B72] text-[#050505] font-semibold rounded-xl hover:bg-[#C8AD85] transition-all cursor-pointer border-none"
                >
                  Try Again
                </button>
              </div>
            ) : jobs.length === 0 ? (
              /* --- Empty State block --- */
              <div className="text-center py-16 bg-[#111111] border border-white/8 rounded-3xl shadow-none px-6 max-w-xl mx-auto flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#B89B72]/10 flex items-center justify-center mb-6">
                  <Briefcase className="h-8 w-8 text-[#B89B72]" />
                </div>
                <h3 className="text-xl font-display font-extrabold text-[#F4F1EA] mb-3 text-center">
                  {tJobs("empty.title")}
                </h3>
                <p className="text-[#B8B2A7] text-sm md:text-base leading-relaxed mb-8 max-w-md text-center">
                  {tJobs("empty.description")}
                </p>
                <a 
                  href={generalWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#111111] hover:bg-[#141414] text-[#F4F1EA] border border-white/8 px-6 py-3.5 rounded-2xl font-bold transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  <MessageCircle className="h-5 w-5 shrink-0 fill-current text-[#B89B72]" />
                  <span>{tJobs("buttons.whatsapp")}</span>
                </a>
              </div>
            ) : (
              /* --- Job Listings State --- */
              <div className="space-y-6">
                {jobs.map((item: Job) => {
                  const itemRecord = item as unknown as Record<string, unknown>;
                  // Resolve parameters dynamically to support all standard casing (snake/camel)
                  const jobId = getJobField<string>(itemRecord, "job_id", "jobId", "");
                  const role = getJobField<string>(itemRecord, "role", "title", "Job Vacancy");
                  const companyName = getJobField<string>(itemRecord, "company_name", "companyName", "");
                  const city = getJobField<string>(itemRecord, "city", "city", "");
                  const category = getJobField<string>(itemRecord, "category", "category", "");
                  const expLevel = getJobField<string>(itemRecord, "experience_level", "experienceLevel", "");
                  const salary = getJobField<string | number>(itemRecord, "salary", "salary", "");
                  const currency = getJobField<string>(itemRecord, "currency", "currency", "");
                  const jobType = getJobField<string>(itemRecord, "job_type", "jobType", "");
                  const jobDesc = getJobField<string>(itemRecord, "job_description", "jobDescription", getJobField<string>(itemRecord, "description", "description", ""));
                  const isUrgent = getJobField<string>(itemRecord, "is_urgent", "isUrgent", "");
                  const isPremium = getJobField<string>(itemRecord, "is_premium", "isPremium", "");
                  const postedAt = getJobField<string>(itemRecord, "posted_at", "postedAt", "");
                  const requirements = getJobField<string>(itemRecord, "requirements", "requirements", "");
                  const benefits = getJobField<string>(itemRecord, "benefits", "benefits", "");

                  const normalizedJob: Job = {
                    job_id: jobId,
                    role: role,
                    company_name: companyName,
                    city: city,
                    category: category,
                    experience_level: expLevel,
                    salary: salary,
                    currency: currency,
                    job_type: jobType,
                    job_description: jobDesc,
                    is_urgent: isUrgent,
                    is_premium: isPremium,
                    posted_at: postedAt,
                    requirements: requirements,
                    benefits: benefits,
                  };

                  return (
                    <div 
                      key={jobId}
                      className="w-full bg-[#111111] rounded-3xl p-6 md:p-8 border border-white/8 hover:border-[#B89B72]/40 shadow-none transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
                    >
                      {/* Top Accent line for premium/urgent highlights */}
                      {(isPremium === "YES" || isUrgent === "YES") && (
                        <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-gradient-to-r from-[#B89B72] to-[#75624A]" />
                      )}

                      {/* Header block with badges */}
                      <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                        <div className="space-y-1.5 flex-1 min-w-[200px]">
                          <h3 className="text-xl md:text-2xl font-display font-extrabold text-[#F4F1EA] leading-snug tracking-tight">
                            {role}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-[#B8B2A7] font-sans mt-1">
                            {companyName && (
                              <span className="font-semibold text-[#B8B2A7]">{companyName}</span>
                            )}
                            {(city || displayCountryName) && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-[#B89B72]" />
                                {city ? `${city}, ${displayCountryName}` : displayCountryName}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Badges Container */}
                        <div className="flex flex-wrap items-center gap-2">
                          {isUrgent === "YES" && (
                            <span className="inline-flex items-center gap-1 bg-rose-950/20 border border-rose-900/30 text-rose-400 font-extrabold text-[10px] sm:text-xs px-2.5 py-1 rounded-full uppercase tracking-wider select-none">
                              <Clock className="h-3 w-3 shrink-0 animate-pulse" />
                              {tJobs("badges.urgent")}
                            </span>
                          )}
                          {isPremium === "YES" && (
                            <span className="inline-flex items-center gap-1 bg-amber-950/20 border border-amber-900/30 text-amber-400 font-extrabold text-[10px] sm:text-xs px-2.5 py-1 rounded-full uppercase tracking-wider select-none">
                              <Award className="h-3 w-3 shrink-0" />
                              {tJobs("badges.premium")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick Details Chips */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6 font-sans">
                        {category && (
                          <div className="bg-[#050505] border border-white/8 p-2.5 rounded-2xl flex flex-col justify-center">
                            <span className="text-[10px] font-bold text-[#7C756A] uppercase tracking-wide">{tJobs("labels.category")}</span>
                            <span className="text-xs md:text-sm font-bold text-[#B8B2A7] truncate">{category}</span>
                          </div>
                        )}
                        {jobType && (
                          <div className="bg-[#050505] border border-white/8 p-2.5 rounded-2xl flex flex-col justify-center">
                            <span className="text-[10px] font-bold text-[#7C756A] uppercase tracking-wide">{tJobs("labels.jobType")}</span>
                            <span className="text-xs md:text-sm font-bold text-[#B8B2A7] truncate">{jobType}</span>
                          </div>
                        )}
                        {expLevel && (
                          <div className="bg-[#050505] border border-white/8 p-2.5 rounded-2xl flex flex-col justify-center">
                            <span className="text-[10px] font-bold text-[#7C756A] uppercase tracking-wide">{tJobs("labels.experience")}</span>
                            <span className="text-xs md:text-sm font-bold text-[#B8B2A7] truncate">{expLevel}</span>
                          </div>
                        )}
                        {salary && (
                          <div className="bg-amber-950/10 border border-amber-900/20 p-2.5 rounded-2xl flex flex-col justify-center">
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">{tJobs("labels.salaryOffered")}</span>
                            <span className="text-xs md:text-sm font-extrabold text-[#B89B72] truncate">
                              {currency} {salary}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Job Description Block */}
                      {jobDesc && (
                        <div className="mb-6 font-sans">
                          <p className="text-[#B8B2A7] text-sm leading-relaxed line-clamp-3">
                            {jobDesc}
                          </p>
                        </div>
                      )}

                      {/* Footer block (Posted time and Actions) */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/8">
                        {postedAt && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-[#7C756A] font-sans">
                            <Calendar className="h-3.5 w-3.5 text-[#7C756A]" />
                            <span>{tJobs("labels.posted")} {postedAt}</span>
                          </span>
                        )}

                        {/* Actions buttons */}
                        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                          {/* View More Details Button */}
                          <button
                            onClick={() => setSelectedJob(normalizedJob)}
                            className="flex-1 sm:flex-none text-center px-5 py-2.5 rounded-xl border border-white/10 hover:border-white/30 bg-transparent text-[#B8B2A7] hover:text-white font-bold text-xs md:text-sm transition-all duration-300 active:scale-98 cursor-pointer whitespace-nowrap font-sans"
                          >
                            {tJobs("buttons.viewMore") || "View More"}
                          </button>

                          {/* Apply Now Attention-Grabbing Button Container */}
                          <div className="relative flex-1 sm:flex-none group">
                            <span className="absolute -top-3.5 right-2 bg-[#050505] text-[#B89B72] border border-white/8 text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider animate-bounce select-none pointer-events-none whitespace-nowrap shadow-sm">
                              {tJobs("buttons.startHere") || "Start here"}
                            </span>
                            <button 
                              onClick={() => setApplyJob(normalizedJob)}
                              className="w-full flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#B89B72] text-[#050505] hover:bg-[#C8AD85] border-none font-extrabold text-xs md:text-sm transition-all duration-300 shadow-none active:scale-98 cursor-pointer whitespace-nowrap font-sans"
                            >
                              <span>{tJobs("buttons.applyNow")}</span>
                              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                            </button>
                          </div>

                          {/* WhatsApp Inquiry Button */}
                          <a 
                            href={getJobWhatsAppUrl(role)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl border border-emerald-900/30 hover:border-emerald-505 bg-[#111111] hover:bg-[#141414] text-emerald-400 font-bold text-xs md:text-sm transition-all duration-300 active:scale-98 cursor-pointer"
                          >
                            <MessageCircle className="h-4.5 w-4.5 shrink-0 fill-current" />
                            <span>{tJobs("buttons.inquire")}</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </section>
      </main>

      {/* Modal Popup */}
      {selectedJob && (
        <div 
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 transition-opacity duration-300 animate-in fade-in"
          onClick={() => setSelectedJob(null)}
        >
          <div 
            className="bg-[#111111] w-full max-w-2xl rounded-3xl border border-white/8 shadow-none relative flex flex-col max-h-[90vh] md:max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedJob(null)}
              className="absolute top-4 right-4 md:top-6 md:right-6 text-neutral-400 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-full focus:outline-none cursor-pointer"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="p-6 md:p-8 border-b border-white/8 pr-12 md:pr-16">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {selectedJob.is_urgent === "YES" && (
                  <span className="inline-flex items-center gap-1 bg-rose-950/20 border border-rose-900/30 text-rose-400 font-extrabold text-[10px] sm:text-xs px-2.5 py-1 rounded-full uppercase tracking-wider select-none">
                    <Clock className="h-3 w-3 shrink-0 animate-pulse" />
                    {tJobs("badges.urgent")}
                  </span>
                )}
                {selectedJob.is_premium === "YES" && (
                  <span className="inline-flex items-center gap-1 bg-amber-950/20 border border-amber-900/30 text-amber-400 font-extrabold text-[10px] sm:text-xs px-2.5 py-1 rounded-full uppercase tracking-wider select-none">
                    <Award className="h-3 w-3 shrink-0" />
                    {tJobs("badges.premium")}
                  </span>
                )}
              </div>

              <h2 className="text-2xl md:text-3xl font-display font-extrabold text-[#F4F1EA] leading-snug tracking-tight">
                {selectedJob.role}
              </h2>
              
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs md:text-sm text-[#B8B2A7] font-sans">
                {selectedJob.company_name && (
                  <span className="font-semibold text-[#B8B2A7]">{selectedJob.company_name}</span>
                )}
                {(selectedJob.city || displayCountryName) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-[#B89B72]" />
                    {selectedJob.city ? `${selectedJob.city}, ${displayCountryName}` : displayCountryName}
                  </span>
                )}
              </div>
            </div>

            {/* Modal Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-thin">
              {/* Quick Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-sans">
                {selectedJob.category && (
                  <div className="bg-[#050505] border border-white/8 p-2.5 rounded-2xl flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-[#7C756A] uppercase tracking-wide">{tJobs("labels.category")}</span>
                    <span className="text-xs md:text-sm font-bold text-[#B8B2A7] truncate">{selectedJob.category}</span>
                  </div>
                )}
                {selectedJob.job_type && (
                  <div className="bg-[#050505] border border-white/8 p-2.5 rounded-2xl flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-[#7C756A] uppercase tracking-wide">{tJobs("labels.jobType")}</span>
                    <span className="text-xs md:text-sm font-bold text-[#B8B2A7] truncate">{selectedJob.job_type}</span>
                  </div>
                )}
                {selectedJob.experience_level && (
                  <div className="bg-[#050505] border border-white/8 p-2.5 rounded-2xl flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-[#7C756A] uppercase tracking-wide">{tJobs("labels.experience")}</span>
                    <span className="text-xs md:text-sm font-bold text-[#B8B2A7] truncate">{selectedJob.experience_level}</span>
                  </div>
                )}
                {selectedJob.salary && (
                  <div className="bg-amber-950/10 border border-amber-900/20 p-2.5 rounded-2xl flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">{tJobs("labels.salaryOffered")}</span>
                    <span className="text-xs md:text-sm font-extrabold text-[#B89B72] truncate">
                      {selectedJob.currency} {selectedJob.salary}
                    </span>
                  </div>
                )}
              </div>

              {/* Full Description */}
              {selectedJob.job_description && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-[#7C756A] font-sans">Job Description</h4>
                  <p className="text-[#B8B2A7] text-sm md:text-base leading-relaxed whitespace-pre-line font-sans">
                    {selectedJob.job_description}
                  </p>
                </div>
              )}

              {/* Requirements */}
              {selectedJob.requirements && parseBulletPoints(selectedJob.requirements).length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/8">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-[#7C756A] font-sans">Requirements</h4>
                  <ul className="space-y-2.5 font-sans">
                    {parseBulletPoints(selectedJob.requirements).map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-[#B8B2A7] text-sm md:text-base leading-relaxed">
                        <span className="text-[#B89B72] font-bold shrink-0 select-none mt-1">&#8226;</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits */}
              {selectedJob.benefits && parseBulletPoints(selectedJob.benefits).length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/8">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-[#7C756A] font-sans">Benefits</h4>
                  <ul className="space-y-2.5 font-sans">
                    {parseBulletPoints(selectedJob.benefits).map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2 text-[#B8B2A7] text-sm md:text-base leading-relaxed">
                        <span className="text-[#B89B72] font-bold shrink-0 select-none mt-1">&#8226;</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-6 md:p-8 bg-[#0B0B0B] border-t border-white/8 rounded-b-3xl flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
              {/* WhatsApp Button */}
              <a 
                href={getJobWhatsAppUrl(selectedJob.role)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl border border-emerald-900/30 hover:border-emerald-500 bg-[#111111] hover:bg-[#141414] text-emerald-400 font-bold text-xs md:text-sm transition-all duration-300 active:scale-98 cursor-pointer"
              >
                <MessageCircle className="h-4.5 w-4.5 shrink-0 fill-current" />
                <span>{tJobs("buttons.inquire")}</span>
              </a>

              {/* Apply Now Attention-Grabbing Button Container */}
              <div className="relative flex-1 sm:flex-none group">
                <span className="absolute -top-3.5 right-2 bg-[#050505] text-[#B89B72] border border-white/8 text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider animate-bounce select-none pointer-events-none whitespace-nowrap shadow-sm">
                  {tJobs("buttons.startHere") || "Start here"}
                </span>
                <button 
                  onClick={() => {
                    setApplyJob(selectedJob);
                    setSelectedJob(null);
                  }}
                  className="w-full flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#B89B72] text-[#050505] hover:bg-[#C8AD85] border-none font-extrabold text-xs md:text-sm transition-all duration-300 shadow-none active:scale-98 cursor-pointer whitespace-nowrap font-sans"
                >
                  <span>{tJobs("buttons.applyNow")}</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apply Now Modal Popup */}
      {applyJob && (
        <div 
          className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 transition-opacity duration-300 animate-in fade-in"
          onClick={() => setApplyJob(null)}
        >
          <div 
            className="bg-[#111111] w-full max-w-2xl rounded-3xl border border-white/8 shadow-none relative flex flex-col max-h-[90vh] md:max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setApplyJob(null)}
              className="absolute top-4 right-4 md:top-6 md:right-6 text-neutral-400 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-full focus:outline-none cursor-pointer"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="p-6 md:p-8 border-b border-white/8 pr-12 md:pr-16">
              <h2 className="text-xl md:text-2xl font-display font-extrabold text-[#F4F1EA] leading-snug tracking-tight">
                Apply for {applyJob.role}
              </h2>
              <p className="text-xs md:text-sm text-[#B8B2A7] font-sans mt-1">
                Our team will contact you on WhatsApp or call.
              </p>
            </div>

            {/* Modal Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-thin">
              <JobSeekerForm 
                prefillCountry={displayCountryName}
                prefillJobRole={applyJob.role}
                hiddenJobId={applyJob.job_id}
                hiddenCountrySlug={countrySlug}
                onSuccess={() => setApplyJob(null)}
              />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
