"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileUp, Send, Check, Copy, CreditCard, MessageCircle, CheckCircle2 } from "lucide-react";
import { jobSeekerSchema, JobSeekerFormValues } from "@/schemas/formSchemas";
import { CENTRAL_COUNTRIES, CountryData } from "@/data/countries";
import { useToast } from "./ui/toast";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

import { useRouter } from "next/navigation";

interface JobSeekerFormProps {
  prefillCountry?: string;
  prefillJobRole?: string;
  hiddenJobId?: string;
  hiddenCountrySlug?: string;
  onSuccess?: () => void;
}

function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function JobSeekerForm({
  prefillCountry,
  prefillJobRole,
  hiddenJobId,
  hiddenCountrySlug,
  onSuccess
}: JobSeekerFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [seekerCvName, setSeekerCvName] = React.useState<string | null>(null);
  const [submittedApplicationId, setSubmittedApplicationId] = React.useState<string | null>(null);
  const [emailStatus, setEmailStatus] = React.useState<string | null>(null);
  const [copiedId, setCopiedId] = React.useState(false);
  const [isImmediatePaying, setIsImmediatePaying] = React.useState(false);
  const [seekerCvSize, setSeekerCvSize] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [immediatePaymentError, setImmediatePaymentError] = React.useState<string | null>(null);

  const seekerForm = useForm<JobSeekerFormValues>({
    resolver: zodResolver(jobSeekerSchema),
    shouldFocusError: false,
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      currentLocation: "",
      preferredCountry: prefillCountry || "",
      preferredJobRole: prefillJobRole || "",
      experience: undefined,
      passportStatus: undefined,
      message: "",
      consent: false,
      website: "", // honeypot — must stay empty
    }
  });

  // Listen to preselection event and parse search parameters
  React.useEffect(() => {
    // Direct props take precedence
    if (prefillCountry) {
      seekerForm.setValue("preferredCountry", prefillCountry);
    }
    if (prefillJobRole) {
      seekerForm.setValue("preferredJobRole", prefillJobRole);
    }

    if (prefillCountry || prefillJobRole) return;

    // Listen for global pre-selection event
    const handlePreselect = (event: Event) => {
      const customEvent = event as CustomEvent<{ country: string }>;
      if (customEvent.detail && customEvent.detail.country) {
        seekerForm.setValue("preferredCountry", customEvent.detail.country);
      }
    };

    window.addEventListener("preselect-country", handlePreselect);

    // Parse URL search parameters on load
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const countryParam = params.get("country");
      const jobIdParam = params.get("job_id");

      if (countryParam) {
        const match = CENTRAL_COUNTRIES.find(
          (c) => c.slug === countryParam.toLowerCase() || c.name.toLowerCase() === countryParam.toLowerCase()
        );
        if (match) {
          seekerForm.setValue("preferredCountry", match.name);
        } else {
          const formatted = countryParam
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
          seekerForm.setValue("preferredCountry", formatted);
        }
      }

      if (jobIdParam) {
        seekerForm.setValue("message", `Applying for Job Requisition ID: ${jobIdParam}`);
      }
    }

    return () => window.removeEventListener("preselect-country", handlePreselect);
  }, [seekerForm, prefillCountry, prefillJobRole]);

  const handleCopyApplicationId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id.trim().replace(/\s+/g, ""));
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard. Please select and copy manually.",
        type: "error"
      });
    }
  };

  const handleImmediatePayment = async () => {
    if (!submittedApplicationId) return;
    setIsImmediatePaying(true);
    setImmediatePaymentError(null);
    try {
      const cleanId = submittedApplicationId.trim().replace(/\s+/g, "");
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          application_id: cleanId
        })
      });

      let result;
      try {
        result = await res.json();
      } catch {
        throw new Error("Server returned an invalid response. Please try again.");
      }

      if (result.success && result.payment_url) {
        window.location.href = result.payment_url;
      } else {
        setImmediatePaymentError(result.message || "Payment gateway credentials not configured yet");
      }
    } catch (err) {
      setImmediatePaymentError(err instanceof Error ? err.message : "Payment gateway credentials not configured yet");
    } finally {
      setIsImmediatePaying(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedApplicationId(null);
    setCopiedId(false);
    setIsImmediatePaying(false);
    setImmediatePaymentError(null);
    setEmailStatus(null);
    seekerForm.reset();
    setSeekerCvName(null);
    setSeekerCvSize(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // Clean up query parameters from the URL scroll-free
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", window.location.pathname + window.location.hash);
    }
  };

  const getSuccessWhatsAppLink = (appId: string) => {
    const phone = "919874259915";
    const text = `Hi ZOVO Gateway, I submitted my application. My Application ID is ${appId.trim().replace(/\s+/g, "")}. I want to continue the process.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  const onSeekerSubmit = async (data: JobSeekerFormValues) => {
    setIsSubmitting(true);
    try {
      const applicationsPayload = {
        action: "application",
        job_id: hiddenJobId || "GENERAL",
        country_slug: hiddenCountrySlug || "",
        role: data.preferredJobRole,
        full_name: data.fullName,
        mobile_number: data.phone,
        email: data.email.trim(),
        current_location: data.currentLocation,
        preferred_country: data.preferredCountry,
        preferred_job_role: data.preferredJobRole,
        work_experience: data.experience,
        passport_status: data.passportStatus,
        cv_file_name: seekerCvName || "No file uploaded",
        message: data.message || "",
        consent: data.consent === true,
        status: "PENDING",
        payment_status: "Pending",
        payment_required: "YES",
        payment_amount: "",
        submitted_at: new Date().toISOString(),
        website: data.website || "", // honeypot field
      };

      console.log("Application submit payload", applicationsPayload);

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(applicationsPayload)
      });

      let result;
      try {
        result = await res.json();
      } catch {
        throw new Error("Server returned an invalid response. Please try again.");
      }

      if (!res.ok || !result.success) {
        const errorMsg = result.message || result.error || "Backend server returned an error during submission.";
        const missing = result.missingFields && Array.isArray(result.missingFields) && result.missingFields.length > 0
          ? ` (Missing fields: ${result.missingFields.join(", ")})`
          : "";
        throw new Error(`${errorMsg}${missing}`);
      }

      if (!result.application_id) {
        throw new Error("Backend server did not return a valid Application ID.");
      }

      // Show success state with application ID returned from backend response
      const applicationId = result.application_id;
      setSubmittedApplicationId(applicationId);
      if (result.email_status) {
        setEmailStatus(result.email_status);
      }

      toast({
        title: "Application Received!",
        description: "Application submitted successfully. Save your Application ID.",
        type: "success"
      });

      if (applicationId) {
        if (typeof window !== "undefined") {
          const newUrl = `${window.location.pathname}?success=true&ref=${encodeURIComponent(applicationId)}${window.location.hash}`;
          window.history.replaceState(null, "", newUrl);
        }
      }

      seekerForm.reset();
      setSeekerCvName(null);
      setSeekerCvSize(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      toast({
        title: "Submission Failed",
        description: err instanceof Error ? err.message : "An unexpected error occurred. Please try again later.",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const maxBytes = 5 * 1024 * 1024;
      const allowedTypes = [
        "application/pdf", 
        "application/msword", 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ];
      
      if (file.size > maxBytes) {
        toast({
          title: "File Too Large",
          description: "CV file size should be under 5MB.",
          type: "error"
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      
      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload CV in PDF, DOC, or DOCX format.",
          type: "error"
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${(file.size / 1024).toFixed(1)} KB`;
        
      setSeekerCvName(file.name);
      setSeekerCvSize(sizeStr);
      seekerForm.setValue("cvFile", file);
    }
  };

  const handleRemoveCv = () => {
    setSeekerCvName(null);
    setSeekerCvSize(null);
    seekerForm.setValue("cvFile", undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ----------------------------------------------------------------
  // Success State — shown after successful submission
  // ----------------------------------------------------------------
  if (submittedApplicationId) {
    const cleanId = submittedApplicationId.trim().replace(/\s+/g, "");

    return (
      <div className="space-y-6 text-center">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-emerald-950/20 border border-emerald-900/30 flex items-center justify-center">
            <CheckCircle2 className="h-9 w-9 text-emerald-400" />
          </div>
        </div>

        {/* Success Message */}
        <div className="space-y-2">
          <h3 className="text-xl font-display font-bold text-[#F4F1EA]">
            Application Submitted Successfully
          </h3>
          <p className="text-sm text-[#B8B2A7] leading-relaxed">
            Save your Application ID. You will need it to complete payment later.
          </p>
          {emailStatus === "Sent" && (
            <p className="text-xs text-emerald-400 mt-2 font-medium bg-emerald-950/20 border border-emerald-900/30 py-1.5 px-3 rounded-lg inline-block">
              Application slip has been sent to your email.
            </p>
          )}
          {emailStatus === "Failed" && (
            <p className="text-xs text-amber-400 mt-2 font-medium bg-amber-950/20 border border-amber-900/30 py-1.5 px-3 rounded-lg inline-block">
              Application submitted, but email could not be sent. Our team will contact you soon.
            </p>
          )}
        </div>

        {/* Application ID Display */}
        <div className="bg-[#050505] border border-white/8 rounded-2xl p-4 space-y-2">
          <p className="text-xs text-[#7C756A] font-medium uppercase tracking-wider">Application ID</p>
          <p className="text-lg font-mono font-bold text-[#F4F1EA] break-all select-all whitespace-nowrap" translate="no">
            {cleanId}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Copy Application ID */}
          <button
            type="button"
            onClick={() => handleCopyApplicationId(submittedApplicationId)}
            className="w-full flex items-center justify-center gap-2 h-11 bg-[#111111] hover:bg-[#141414] text-[#F4F1EA] border border-white/8 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            {copiedId ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400">Application ID Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy Application ID</span>
              </>
            )}
          </button>

          {/* Pay (Direct Order Creation Flow) */}
          {!immediatePaymentError && (
            <Button
              type="button"
              onClick={handleImmediatePayment}
              isLoading={isImmediatePaying}
              disabled={isImmediatePaying}
              variant="accent"
              className="w-full justify-center gap-2 h-12 text-sm font-bold cursor-pointer shadow-lg shadow-[#B89B72]/20"
            >
              <CreditCard className="h-5 w-5" />
              Pay
            </Button>
          )}

          {/* Payment gateway placeholder / error card inside modal */}
          {immediatePaymentError && (
            <div className="bg-amber-950/10 border border-amber-900/30 rounded-2xl p-4 text-center space-y-3">
              <div className="flex items-center gap-2 text-amber-500 justify-center">
                <span className="font-bold text-sm">Payment Gateway Coming Soon</span>
              </div>
              <p className="text-xs text-[#B8B2A7] leading-relaxed">
                Payment gateway will be available soon. Our team can also assist you on WhatsApp to complete your payment.
              </p>
              <a
                href={`https://wa.me/919874259915?text=${encodeURIComponent(
                  `Hi ZOVO Gateway, I submitted my application. My Application ID is ${cleanId}. I want to complete the payment.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-11 bg-[#111111] hover:bg-[#141414] text-emerald-400 border border-emerald-900/30 rounded-xl font-bold text-sm transition-all active:scale-[0.98] cursor-pointer"
              >
                <MessageCircle className="h-4 w-4 fill-emerald-400" />
                Complete Payment via WhatsApp
              </a>
            </div>
          )}

          {/* Continue on WhatsApp */}
          <a
            href={getSuccessWhatsAppLink(submittedApplicationId)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <MessageCircle className="h-5 w-5 fill-white" />
            Continue on WhatsApp
          </a>

          {/* Book Appointment */}
          <a
            href={`/appointment?application_id=${encodeURIComponent(submittedApplicationId)}&full_name=${encodeURIComponent(seekerForm.getValues("fullName"))}&phone=${encodeURIComponent(seekerForm.getValues("phone"))}&email=${encodeURIComponent(seekerForm.getValues("email"))}`}
            className="w-full flex items-center justify-center gap-2 h-12 bg-transparent text-[#F4F1EA] border border-white/10 hover:bg-white/5 hover:border-white/20 rounded-xl font-bold text-sm transition-all duration-300 active:scale-[0.98] cursor-pointer"
          >
            Book Appointment
          </a>
        </div>

        {/* Submit Another */}
        <button
          type="button"
          onClick={handleResetForm}
          className="text-sm text-[#B89B72] hover:text-[#C8AD85] font-semibold cursor-pointer transition-colors"
        >
          ← Submit Another Application
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={seekerForm.handleSubmit(onSeekerSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
        {/* 1. Full Name */}
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-semibold text-[#B8B2A7]">
            Full Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="fullName"
            placeholder="Enter your full name"
            error={!!seekerForm.formState.errors.fullName}
            {...seekerForm.register("fullName")}
          />
          {seekerForm.formState.errors.fullName && (
            <p className="text-xs text-red-500">{seekerForm.formState.errors.fullName.message}</p>
          )}
        </div>

        {/* 2. Mobile Number */}
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-semibold text-[#B8B2A7]">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder="98765 43210"
            error={!!seekerForm.formState.errors.phone}
            {...seekerForm.register("phone")}
          />
          {seekerForm.formState.errors.phone && (
            <p className="text-xs text-red-500">{seekerForm.formState.errors.phone.message}</p>
          )}
        </div>

        {/* 3. Email Address */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-[#B8B2A7]">
            Email Address <span className="text-red-500">*</span>
          </label>
          <Input
            id="email"
            type="email"
            placeholder="example@email.com"
            error={!!seekerForm.formState.errors.email}
            {...seekerForm.register("email")}
          />
          {seekerForm.formState.errors.email && (
            <p className="text-xs text-red-500">{seekerForm.formState.errors.email.message}</p>
          )}
        </div>

        {/* 4. Current Location */}
        <div className="space-y-2">
          <label htmlFor="currentLocation" className="text-sm font-semibold text-[#B8B2A7]">
            Current Location <span className="text-red-500">*</span>
          </label>
          <Input
            id="currentLocation"
            placeholder="City / District / State"
            error={!!seekerForm.formState.errors.currentLocation}
            {...seekerForm.register("currentLocation")}
          />
          {seekerForm.formState.errors.currentLocation && (
            <p className="text-xs text-red-500">{seekerForm.formState.errors.currentLocation.message}</p>
          )}
        </div>

        {/* 5. Preferred Country */}
        <div className="space-y-2">
          <label htmlFor="preferredCountry" className="text-sm font-semibold text-[#B8B2A7]">
            Preferred Country <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              id="preferredCountry"
              className={`flex h-14 w-full rounded-2xl border border-white/10 bg-[#050505] text-white px-5 py-2 text-base outline-none focus:border-[#B89B72]/60 focus:ring-2 focus:ring-[#B89B72]/20 appearance-none cursor-pointer ${
                seekerForm.formState.errors.preferredCountry ? "border-red-500 focus:ring-red-500/20" : ""
              }`}
              {...seekerForm.register("preferredCountry")}
            >
              <option value="" className="bg-[#050505] text-[#7C756A]">Select country...</option>
              {CENTRAL_COUNTRIES.map((c: CountryData) => (
                <option key={c.slug} value={c.name} className="bg-[#050505] text-white">
                  {getFlagEmoji(c.countryCode)} {c.name}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#7C756A]">
              ▼
            </div>
          </div>
          {seekerForm.formState.errors.preferredCountry && (
            <p className="text-xs text-red-500">{seekerForm.formState.errors.preferredCountry.message}</p>
          )}
        </div>

        {/* 6. Job Interested In */}
        <div className="space-y-2">
          <label htmlFor="preferredJobRole" className="text-sm font-semibold text-[#B8B2A7]">
            Job Interested In <span className="text-red-500">*</span>
          </label>
          <Input
            id="preferredJobRole"
            placeholder="Welder, Driver, Cook, Security Guard"
            error={!!seekerForm.formState.errors.preferredJobRole}
            {...seekerForm.register("preferredJobRole")}
          />
          {seekerForm.formState.errors.preferredJobRole && (
            <p className="text-xs text-red-500">{seekerForm.formState.errors.preferredJobRole.message}</p>
          )}
        </div>

        {/* 7. Work Experience */}
        <div className="space-y-2">
          <label htmlFor="experience" className="text-sm font-semibold text-[#B8B2A7]">
            Work Experience <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              id="experience"
              className={`flex h-14 w-full rounded-2xl border border-white/10 bg-[#050505] text-white px-5 py-2 text-base outline-none focus:border-[#B89B72]/60 focus:ring-2 focus:ring-[#B89B72]/20 appearance-none cursor-pointer ${
                seekerForm.formState.errors.experience ? "border-red-500 focus:ring-red-500/20" : ""
              }`}
              {...seekerForm.register("experience")}
            >
              <option value="" className="bg-[#050505] text-[#7C756A]">Select experience...</option>
              <option value="Fresher" className="bg-[#050505] text-white">Fresher</option>
              <option value="1-2 Years" className="bg-[#050505] text-white">1-2 Years</option>
              <option value="2-5 Years" className="bg-[#050505] text-white">2-5 Years</option>
              <option value="5+ Years" className="bg-[#050505] text-white">5+ Years</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#7C756A]">
              ▼
            </div>
          </div>
          {seekerForm.formState.errors.experience && (
            <p className="text-xs text-red-500">{seekerForm.formState.errors.experience.message}</p>
          )}
        </div>

        {/* 8. Passport Status */}
        <div className="space-y-2">
          <label htmlFor="passportStatus" className="text-sm font-semibold text-[#B8B2A7]">
            Passport Status <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              id="passportStatus"
              className={`flex h-14 w-full rounded-2xl border border-white/10 bg-[#050505] text-white px-5 py-2 text-base outline-none focus:border-[#B89B72]/60 focus:ring-2 focus:ring-[#B89B72]/20 appearance-none cursor-pointer ${
                seekerForm.formState.errors.passportStatus ? "border-red-500 focus:ring-red-500/20" : ""
              }`}
              {...seekerForm.register("passportStatus")}
            >
              <option value="" className="bg-[#050505] text-[#7C756A]">Select passport status...</option>
              <option value="Yes, I have passport" className="bg-[#050505] text-white">Yes, I have passport</option>
              <option value="No, but I have applied" className="bg-[#050505] text-white">No, but I have applied</option>
              <option value="No, I have not applied" className="bg-[#050505] text-white">No, I have not applied</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#7C756A]">
              ▼
            </div>
          </div>
          {seekerForm.formState.errors.passportStatus && (
            <p className="text-xs text-red-500">{seekerForm.formState.errors.passportStatus.message}</p>
          )}
        </div>
      </div>

      {/* 8. Upload CV (Optional) */}
      <div className="space-y-2 font-sans">
        <label className="text-sm font-semibold text-[#B8B2A7] block">
          Upload CV <span className="text-xs font-normal text-[#7C756A]">(optional)</span>
        </label>
        {seekerCvName ? (
          <div className="border border-white/8 rounded-2xl p-4 flex items-center justify-between bg-[#050505] relative">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-950/30 text-emerald-400 border border-emerald-900/30 p-2 rounded-xl shrink-0">
                <Check className="h-5 w-5" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-sm font-semibold text-[#F4F1EA] truncate max-w-[150px] sm:max-w-[320px]">
                  {seekerCvName}
                </p>
                {seekerCvSize && (
                  <p className="text-xs text-[#7C756A] font-medium">{seekerCvSize}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveCv}
              className="px-3 py-1.5 rounded-lg border border-red-900/30 hover:border-red-500 hover:bg-red-950/20 text-red-400 hover:text-red-300 font-semibold text-xs transition-colors cursor-pointer select-none shrink-0"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="border border-dashed border-white/10 hover:border-[#B89B72]/40 transition-colors rounded-2xl p-6 flex flex-col items-center justify-center bg-[#050505] relative group">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleCvChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            />
            <FileUp className="h-8 w-8 text-[#7C756A] mb-2 group-hover:scale-105 group-hover:text-[#B89B72] transition-all" />
            <span className="text-sm text-[#B8B2A7] font-semibold">Click to select file</span>
            <span className="text-xs text-[#7C756A] mt-1 text-center px-4 leading-normal">
              Accepted formats: PDF, DOC, DOCX (Max 5MB)
            </span>
            <span className="text-[10px] text-[#7C756A] mt-0.5 text-center px-4 leading-normal font-medium">
              Our team may ask for the CV again on WhatsApp if required.
            </span>
          </div>
        )}
      </div>

      {/* 9. Message / Extra Details */}
      <div className="space-y-2 font-sans">
        <label htmlFor="seekerMessage" className="text-sm font-semibold text-[#B8B2A7]">
          Message / Extra Details
        </label>
        <Textarea
          id="seekerMessage"
          placeholder="Write any extra details here"
          {...seekerForm.register("message")}
        />
      </div>

      {/* 10. Consent Checkbox */}
      <div className="space-y-2 font-sans pt-2">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-white/10 bg-[#050505] text-[#B89B72] focus:ring-[#B89B72] cursor-pointer"
            {...seekerForm.register("consent")}
          />
          <span className="text-sm text-[#B8B2A7] leading-snug">
            I agree to be contacted by ZOVO Gateway Overseas regarding job opportunities. <span className="text-red-500">*</span>
          </span>
        </label>
        {seekerForm.formState.errors.consent && (
          <p className="text-xs text-red-500 pl-7">{seekerForm.formState.errors.consent.message}</p>
        )}
      </div>

      {/* Submit Button & Helper text */}
      <div className="pt-4 space-y-3">
        {/* Honeypot field — hidden from real users, catches bots */}
        <div aria-hidden="true" className="absolute opacity-0 pointer-events-none" style={{ left: "-9999px", top: "-9999px" }}>
          <label htmlFor="seeker-website">Website</label>
          <input
            id="seeker-website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...seekerForm.register("website")}
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          className="w-full justify-center gap-2 h-12 font-extrabold text-sm transition-all duration-300 shadow-md hover:shadow-lg active:scale-98 cursor-pointer rounded-xl"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          <Send className="h-4 w-4 shrink-0" />
          <span>{isSubmitting ? "Submitting..." : "Submit Application"}</span>
        </Button>
        <p className="text-xs text-center text-neutral-500 font-sans">
          Our team will contact you on WhatsApp/call.
        </p>
      </div>
    </form>
  );
}
