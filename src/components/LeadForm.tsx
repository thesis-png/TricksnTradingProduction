"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  employerSchema,
  EmployerFormValues
} from "@/schemas/formSchemas";
import { INDUSTRIES } from "@/constants";
import { useToast } from "./ui/toast";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { useTranslations } from "next-intl";
import { JobSeekerForm } from "./JobSeekerForm";

export function LeadForm() {
  const t = useTranslations("forms");
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState("seeker");
  const [isSubmittingEmployer, setIsSubmittingEmployer] = React.useState(false);

  // Employer Form hook
  const employerForm = useForm<EmployerFormValues>({
    resolver: zodResolver(employerSchema),
    shouldFocusError: false,
    defaultValues: {
      companyName: "",
      contactPerson: "",
      phone: "",
      email: "",
      industry: "",
      workersRequired: 1,
      location: "",
      requiredJobRoles: "",
      message: "",
      consent: false,
      website: "", // honeypot — must stay empty
    }
  });

  // Listen for country pre-selection events and query parameters
  React.useEffect(() => {
    const handlePreselect = () => {
      setActiveTab("seeker");
    };

    window.addEventListener("preselect-country", handlePreselect);

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const countryParam = params.get("country");
      const jobIdParam = params.get("job_id");

      if (countryParam || jobIdParam) {
        setActiveTab("seeker");
      }
    }

    return () => window.removeEventListener("preselect-country", handlePreselect);
  }, []);

  // Listen to hash changes for deep linking to specific tabs
  React.useEffect(() => {
    const handleHashChange = () => {
      if (typeof window !== "undefined") {
        const hash = window.location.hash;
        if (hash === "#job-seeker") {
          setActiveTab("seeker");
        } else if (hash === "#employer" || hash === "#for-employers") {
          setActiveTab("employer");
        }
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Employer submit handler
  const onEmployerSubmit = async (data: EmployerFormValues) => {
    setIsSubmittingEmployer(true);
    try {
      const payload = {
        company_name: data.companyName,
        contact_person: data.contactPerson,
        mobile_number: data.phone,
        email: data.email,
        country_location: data.location,
        industry: data.industry,
        workers_required: data.workersRequired,
        required_job_roles: data.requiredJobRoles,
        message: data.message,
        consent: data.consent,
        website: data.website || "", // honeypot field
      };

      const res = await fetch("/api/employer-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok && result.success !== false) {
        toast({
          title: "Inquiry Submitted!",
          description: "Your manpower inquiry has been received successfully. A confirmation email has been sent if an email address was provided. Our team will contact you shortly.",
          type: "success"
        });
        employerForm.reset();
      } else {
        toast({
          title: "Submission Failed",
          description: result.message || "Something went wrong. Please try again later.",
          type: "error"
        });
      }
    } catch {
      toast({
        title: "Submission Failed",
        description: "An unexpected error occurred. Please try again later.",
        type: "error"
      });
    } finally {
      setIsSubmittingEmployer(false);
    }
  };

  return (
    <section id="for-employers" className="pt-20 pb-28 md:pb-20 bg-[#080808] relative overflow-hidden border-t border-[rgba(255,255,255,0.07)]">
      {/* Anchor targets for hash navigation and scrolling */}
      <div id="job-seeker" className="absolute top-0 left-0 h-0 w-0 pointer-events-none" />
      <div id="employer" className="absolute top-0 left-0 h-0 w-0 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(182,146,91,0.03),transparent)]" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <div className="text-xs font-bold text-[#B89B72] tracking-widest uppercase">
            {t("tag")}
          </div>
          <h2 id="lead-forms" className="text-3xl md:text-4xl font-display font-extrabold text-[#F5F1E8]">
            {t("title")}
          </h2>
          <p className="text-sm md:text-base text-[#B8B2A7] leading-relaxed font-sans">
            {t("desc")}
          </p>
        </div>

        {/* Form Container */}
        <Tabs defaultValue="seeker" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-2 bg-[#050505] border border-white/8 p-1 rounded-full w-full max-w-sm sm:max-w-md h-12">
              <TabsTrigger
                id="tab-seeker"
                value="seeker"
                className="rounded-full cursor-pointer text-sm font-semibold"
                onClick={() => setActiveTab("seeker")}
              >
                {t("tab_seeker")}
              </TabsTrigger>
              <TabsTrigger
                id="tab-employer"
                value="employer"
                className="rounded-full cursor-pointer text-sm font-semibold"
                onClick={() => setActiveTab("employer")}
              >
                {t("tab_employer")}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="bg-[#111111] border border-white/8 rounded-3xl p-6 md:p-10 shadow-xl">
            <AnimatePresence mode="wait">
              {/* Job Seeker Form Tab */}
              {activeTab === "seeker" ? (
                <motion.div
                  key="seeker-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <JobSeekerForm />
                </motion.div>
              ) : (
                <motion.form
                  key="employer-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={employerForm.handleSubmit(onEmployerSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Company Name */}
                    <div className="space-y-2">
                      <label htmlFor="companyName" className="text-sm font-semibold text-[#B0B0B0]">
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="companyName"
                        placeholder={t("placeholder_companyName")}
                        error={!!employerForm.formState.errors.companyName}
                        {...employerForm.register("companyName")}
                      />
                      {employerForm.formState.errors.companyName && (
                        <p className="text-xs text-red-500">{employerForm.formState.errors.companyName.message}</p>
                      )}
                    </div>

                    {/* Contact Person */}
                    <div className="space-y-2">
                      <label htmlFor="contactPerson" className="text-sm font-semibold text-[#B0B0B0]">
                        Contact Person <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="contactPerson"
                        placeholder={t("placeholder_contactPerson")}
                        error={!!employerForm.formState.errors.contactPerson}
                        {...employerForm.register("contactPerson")}
                      />
                      {employerForm.formState.errors.contactPerson && (
                        <p className="text-xs text-red-500">{employerForm.formState.errors.contactPerson.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Phone Number */}
                    <div className="space-y-2">
                      <label htmlFor="employerPhone" className="text-sm font-semibold text-[#B0B0B0]">
                        Business Phone Number <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="employerPhone"
                        type="tel"
                        placeholder={t("placeholder_phone")}
                        error={!!employerForm.formState.errors.phone}
                        {...employerForm.register("phone")}
                      />
                      {employerForm.formState.errors.phone && (
                        <p className="text-xs text-red-500">{employerForm.formState.errors.phone.message}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label htmlFor="employerEmail" className="text-sm font-semibold text-[#B0B0B0]">
                        Business Email <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="employerEmail"
                        type="email"
                        placeholder={t("placeholder_employerEmail")}
                        error={!!employerForm.formState.errors.email}
                        {...employerForm.register("email")}
                      />
                      {employerForm.formState.errors.email && (
                        <p className="text-xs text-red-500">{employerForm.formState.errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Industry dropdown */}
                    <div className="space-y-2">
                      <label htmlFor="industry" className="text-sm font-semibold text-[#B0B0B0]">
                        Industry Sector <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="industry"
                          className={`flex h-14 w-full rounded-2xl border border-white/10 bg-[#050505] text-white px-5 py-2 text-base outline-none focus:border-[#B89B72]/60 focus:ring-2 focus:ring-[#B89B72]/20 appearance-none cursor-pointer ${
                            employerForm.formState.errors.industry ? "border-red-500 focus:ring-red-500/20" : ""
                          }`}
                          {...employerForm.register("industry")}
                        >
                          <option value="" className="bg-[#050505] text-[#7D766B]">Select industry...</option>
                          {INDUSTRIES.map((ind) => (
                            <option key={ind.id} value={ind.name} className="bg-[#050505] text-white">
                              {ind.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#737373]">
                          ▼
                        </div>
                      </div>
                      {employerForm.formState.errors.industry && (
                        <p className="text-xs text-red-500">{employerForm.formState.errors.industry.message}</p>
                      )}
                    </div>

                    {/* Workers required */}
                    <div className="space-y-2">
                      <label htmlFor="workersRequired" className="text-sm font-semibold text-[#B0B0B0]">
                        Workers Needed <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="workersRequired"
                        type="number"
                        min="1"
                        placeholder={t("placeholder_workersRequired")}
                        error={!!employerForm.formState.errors.workersRequired}
                        {...employerForm.register("workersRequired", { valueAsNumber: true })}
                      />
                      {employerForm.formState.errors.workersRequired && (
                        <p className="text-xs text-red-500">{employerForm.formState.errors.workersRequired.message}</p>
                      )}
                    </div>

                    {/* Country Location */}
                    <div className="space-y-2">
                      <label htmlFor="location" className="text-sm font-semibold text-[#B0B0B0]">
                        Deploy Location / Country <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="location"
                        placeholder={t("placeholder_location")}
                        error={!!employerForm.formState.errors.location}
                        {...employerForm.register("location")}
                      />
                      {employerForm.formState.errors.location && (
                        <p className="text-xs text-red-500">{employerForm.formState.errors.location.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Required Job Roles */}
                  <div className="space-y-2">
                    <label htmlFor="requiredJobRoles" className="text-sm font-semibold text-[#B0B0B0]">
                      Required Job Roles <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="requiredJobRoles"
                      placeholder="e.g. Welder, Electrician, Carpenter"
                      error={!!employerForm.formState.errors.requiredJobRoles}
                      {...employerForm.register("requiredJobRoles")}
                    />
                    {employerForm.formState.errors.requiredJobRoles && (
                      <p className="text-xs text-red-500">{employerForm.formState.errors.requiredJobRoles.message}</p>
                    )}
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label htmlFor="employerMessage" className="text-sm font-semibold text-[#B0B0B0]">
                      Inquiry Details <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      id="employerMessage"
                      placeholder={t("placeholder_employerMessage")}
                      {...employerForm.register("message")}
                    />
                    {employerForm.formState.errors.message && (
                      <p className="text-xs text-red-500">{employerForm.formState.errors.message.message}</p>
                    )}
                  </div>

                  {/* Consent Checkbox */}
                  <label htmlFor="employerConsent" className="flex items-start gap-3 cursor-pointer group">
                    <input
                      id="employerConsent"
                      type="checkbox"
                      className="mt-0.5 h-5 w-5 rounded border-white/10 bg-[#050505] text-[#B89B72] focus:ring-[#B89B72] cursor-pointer"
                      {...employerForm.register("consent")}
                    />
                    <span className="text-sm text-[#A3A3A3] leading-snug">
                      I agree to be contacted by ZOVO Gateway regarding this inquiry. <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {employerForm.formState.errors.consent && (
                    <p className="text-xs text-red-500 -mt-4">{employerForm.formState.errors.consent.message}</p>
                  )}

                  {/* Honeypot field — hidden from real users, catches bots */}
                  <div aria-hidden="true" className="absolute opacity-0 pointer-events-none" style={{ left: "-9999px", top: "-9999px" }}>
                    <label htmlFor="employer-website">Website</label>
                    <input
                      id="employer-website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      {...employerForm.register("website")}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full justify-center gap-2 h-12 shadow-lg cursor-pointer rounded-xl"
                    isLoading={isSubmittingEmployer}
                    disabled={isSubmittingEmployer}
                  >
                    <Send className="h-4 w-4" />
                    {isSubmittingEmployer ? "Submitting..." : t("submit_employer")}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Tabs>
      </div>
    </section>
  );
}
