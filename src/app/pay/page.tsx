"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  CreditCard,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  User,
  Phone,
  Briefcase,
  Globe,
  Clock,
  IndianRupee,
  ShieldCheck,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

interface ApplicationData {
  application_id: string;
  full_name: string;
  mobile_number: string;
  email?: string;
  job_id: string;
  country_slug: string;
  role: string;
  preferred_country: string;
  preferred_job_role: string;
  payment_required: string;
  payment_amount: string;
  payment_status: string;
  status: string;
}

type PageState = "lookup" | "summary" | "gateway-pending";

// ------------------------------------------------------------------
// Inner component that uses useSearchParams (needs Suspense boundary)
// ------------------------------------------------------------------

function PaymentFlow() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [pageState, setPageState] = React.useState<PageState>("lookup");
  const [applicationId, setApplicationId] = React.useState("");
  const [applicationData, setApplicationData] =
    React.useState<ApplicationData | null>(null);
  const [isLooking, setIsLooking] = React.useState(false);
  const [isPaying, setIsPaying] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState(false);

  // Auto-populate application_id from URL query param
  React.useEffect(() => {
    const idFromUrl = searchParams.get("application_id");
    if (idFromUrl) {
      setApplicationId(idFromUrl);
    }
  }, [searchParams]);

  // ----------------------------------------------------------------
  // Lookup handler
  // ----------------------------------------------------------------
  const handleLookup = async () => {
    const cleanApplicationId = applicationId.trim().replace(/\s+/g, "");
    if (!cleanApplicationId) {
      toast({
        title: "Application ID Required",
        description: "Please enter your Application ID to continue.",
        type: "error",
      });
      return;
    }

    setIsLooking(true);
    try {
      const res = await fetch("/api/applications/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application_id: cleanApplicationId }),
      });

      let result;
      try {
        result = await res.json();
      } catch {
        throw new Error("Server returned an invalid response.");
      }

      if (!res.ok || !result.success) {
        toast({
          title: "Application Not Found",
          description:
            result.message ||
            "No application found. Please check your Application ID or contact us on WhatsApp.",
          type: "error",
        });
        return;
      }

      setApplicationData(result.data);
      setPageState("summary");
    } catch (err) {
      toast({
        title: "Lookup Failed",
        description:
          err instanceof Error
            ? err.message
            : "An unexpected error occurred. Please try again.",
        type: "error",
      });
    } finally {
      setIsLooking(false);
    }
  };

  // ----------------------------------------------------------------
  // Payment handler
  // ----------------------------------------------------------------
  const handlePayment = async () => {
    if (!applicationData) return;

    setIsPaying(true);
    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application_id: applicationData.application_id.trim().replace(/\s+/g, ""),
          amount: applicationData.payment_amount || undefined,
        }),
      });

      let result;
      try {
        result = await res.json();
      } catch {
        throw new Error("Server returned an invalid response.");
      }

      if (!result.success || result.gateway_ready === false) {
        setPageState("gateway-pending");
        return;
      }
    } catch {
      setPageState("gateway-pending");
    } finally {
      setIsPaying(false);
    }
  };

  // ----------------------------------------------------------------
  // Copy application ID
  // ----------------------------------------------------------------
  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      toast({
        title: "Copy Failed",
        description: "Could not copy. Please select and copy manually.",
        type: "error",
      });
    }
  };

  // ----------------------------------------------------------------
  // WhatsApp link builders
  // ----------------------------------------------------------------
  const getPaymentWhatsAppLink = (appId: string) => {
    const phone = "919874259915";
    const text = `Hi ZOVO Gateway, I want help with payment for my Application ID ${appId}.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  const getHelpWhatsAppLink = () => {
    const phone = "919874259915";
    const text = "Hi ZOVO Gateway, I need help with my application payment process.";
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  // ----------------------------------------------------------------
  // Determine payment status badge
  // ----------------------------------------------------------------
  const getPaymentBadge = (status: string | undefined) => {
    const s = status ? status.trim().toLowerCase() : "pending";
    if (s === "paid" || s === "success" || s === "completed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/20 text-emerald-400 border border-emerald-900/30">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Paid
        </span>
      );
    }
    if (s === "failed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-950/20 text-rose-400 border border-rose-900/30">
          <AlertTriangle className="h-3.5 w-3.5" />
          Failed
        </span>
      );
    }
    if (s === "processing") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-950/20 text-blue-400 border border-blue-900/30">
          Processing
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950/20 text-amber-400 border border-amber-900/30">
        Pending
      </span>
    );
  };

  // ----------------------------------------------------------------
  // Render helpers
  // ----------------------------------------------------------------

  const renderLookupState = () => (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-[#111111] rounded-3xl border border-white/8 shadow-none p-6 sm:p-10 space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[#050505] border border-white/8 flex items-center justify-center shadow-lg">
            <Search className="h-7 w-7 text-[#B89B72]" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-display font-extrabold text-[#F4F1EA]">
            Complete Your Payment
          </h1>
          <p className="text-sm text-[#B8B2A7] leading-relaxed max-w-md mx-auto">
            Enter your Application ID to view your details and complete your secure payment.
          </p>
        </div>

        {/* Input */}
        <div className="space-y-2 font-sans">
          <label
            htmlFor="pay-application-id"
            className="text-sm font-semibold text-[#B8B2A7]"
          >
            Application ID
          </label>
          <Input
            id="pay-application-id"
            placeholder="e.g. APP-1717100000-123"
            value={applicationId}
            onChange={(e) => setApplicationId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLookup();
            }}
          />
        </div>

        {/* Lookup Button */}
        <Button
          id="btn-find-application"
          variant="primary"
          className="w-full justify-center gap-2 h-12 cursor-pointer font-extrabold"
          onClick={handleLookup}
          isLoading={isLooking}
          disabled={isLooking}
        >
          <Search className="h-4 w-4" />
          {isLooking ? "Finding..." : "Find My Application"}
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* WhatsApp Help */}
        <a
          href={getHelpWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all active:scale-[0.98] cursor-pointer"
        >
          <MessageCircle className="h-5 w-5 fill-white" />
          Need help? Contact us on WhatsApp
        </a>
      </div>
    </div>
  );

  const renderApplicationDetailsCard = () => {
    if (!applicationData) return null;

    return (
      <div className="bg-[#111111] rounded-3xl border border-white/8 shadow-none overflow-hidden">
        {/* Header */}
        <div className="bg-[#0B0B0B] border-b border-white/8 px-6 sm:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-display font-extrabold text-[#F4F1EA]">
                Payment Summary
              </h2>
              <p className="text-sm text-[#B8B2A7] mt-1">
                Review your application details below.
              </p>
            </div>
            <button
              onClick={() => {
                setPageState("lookup");
                setApplicationData(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111111] hover:bg-[#141414] border border-white/8 text-[#B89B72] text-xs font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
              Search another
            </button>
          </div>
        </div>

        {/* Details grid inside wide card */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Application ID */}
          <div className="space-y-1">
            <p className="text-xs text-[#7C756A] font-semibold uppercase tracking-wide">Application ID</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#F4F1EA] break-all select-all font-mono">
                {applicationData.application_id}
              </span>
              <button
                onClick={() => handleCopyId(applicationData.application_id)}
                className="text-neutral-500 hover:text-[#B89B72] transition-colors cursor-pointer shrink-0"
                title="Copy Application ID"
              >
                {copiedId ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Candidate Name */}
          <div className="space-y-1">
            <p className="text-xs text-[#7C756A] font-semibold uppercase tracking-wide">Candidate Name</p>
            <p className="text-sm font-semibold text-[#F4F1EA] break-all">
              {applicationData.full_name}
            </p>
          </div>

          {/* Mobile Number */}
          <div className="space-y-1">
            <p className="text-xs text-[#7C756A] font-semibold uppercase tracking-wide">Mobile Number</p>
            <p className="text-sm font-semibold text-[#F4F1EA] break-all" translate="no">
              {applicationData.mobile_number}
            </p>
          </div>

          {/* Job Role */}
          <div className="space-y-1">
            <p className="text-xs text-[#7C756A] font-semibold uppercase tracking-wide">Job Role</p>
            <p className="text-sm font-semibold text-[#F4F1EA]">
              {applicationData.preferred_job_role || applicationData.role || "—"}
            </p>
          </div>

          {/* Preferred Country */}
          <div className="space-y-1">
            <p className="text-xs text-[#7C756A] font-semibold uppercase tracking-wide">Preferred Country</p>
            <p className="text-sm font-semibold text-[#F4F1EA]">
              {applicationData.preferred_country || "—"}
            </p>
          </div>

          {/* Application Status */}
          <div className="space-y-1">
            <p className="text-xs text-[#7C756A] font-semibold uppercase tracking-wide">Application Status</p>
            <p className="text-sm font-semibold text-[#F4F1EA]">
              {applicationData.status || "Pending"}
            </p>
          </div>

          {/* Payment Status */}
          <div className="space-y-1">
            <p className="text-xs text-[#7C756A] font-semibold uppercase tracking-wide">Payment Status</p>
            <div>
              {getPaymentBadge(applicationData.payment_status)}
            </div>
          </div>

          {/* Payment Amount */}
          <div className="space-y-1">
            <p className="text-xs text-[#7C756A] font-semibold uppercase tracking-wide">Payment Amount</p>
            <p className="text-lg font-extrabold text-[#F4F1EA]">
              {applicationData.payment_amount
                ? `₹${applicationData.payment_amount}`
                : "To be confirmed"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderNextStepsPanel = () => {
    if (!applicationData) return null;

    const s = applicationData.payment_status ? applicationData.payment_status.trim().toLowerCase() : "pending";
    const isPaidStatus = s === "paid" || s === "success" || s === "completed";
    const isFailedStatus = s === "failed";
    const isProcessingStatus = s === "processing";
    const isPending = !isPaidStatus && !isFailedStatus && !isProcessingStatus;

    return (
      <div className="bg-[#111111] rounded-3xl border border-white/8 shadow-none p-6 sm:p-8 space-y-6">
        <h3 className="text-xl font-display font-extrabold text-[#F4F1EA]">
          Next Steps
        </h3>

        <div className="space-y-4">
          {isPending && (
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#050505] border border-white/8 flex items-center justify-center text-xs font-bold text-[#F4F1EA] shrink-0 mt-0.5">
                  1
                </div>
                <p className="text-sm text-[#B8B2A7]">
                  <strong>Confirm your details:</strong> Make sure your Application ID, name, and trade details are correct.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#050505] border border-white/8 flex items-center justify-center text-xs font-bold text-[#F4F1EA] shrink-0 mt-0.5">
                  2
                </div>
                {applicationData.payment_amount ? (
                  <p className="text-sm text-[#B8B2A7]">
                    <strong>Continue payment:</strong> Your payment is pending. Please continue when you are ready.
                  </p>
                ) : (
                  <p className="text-sm text-[#B8B2A7]">
                    <strong>Continue payment:</strong> Payment amount will be confirmed by our team.
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#050505] border border-white/8 flex items-center justify-center text-xs font-bold text-[#F4F1EA] shrink-0 mt-0.5">
                  3
                </div>
                <p className="text-sm text-[#B8B2A7]">
                  <strong>Team verification:</strong> Our immigration specialists will verify your secure payment and contact you soon.
                </p>
              </div>
            </div>
          )}

          {isFailedStatus && (
            <div className="space-y-3">
              <div className="flex gap-3 items-start bg-rose-950/20 rounded-2xl p-4 border border-rose-900/30">
                <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-sm text-rose-400">
                  Your previous payment attempt failed. Please try again or contact our support team.
                </p>
              </div>
            </div>
          )}

          {isProcessingStatus && (
            <div className="space-y-3">
              <div className="flex gap-3 items-start bg-blue-950/20 rounded-2xl p-4 border border-blue-900/30">
                <Clock className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-400">
                  Your payment is currently being processed. Please wait a moment while we update your status.
                </p>
              </div>
            </div>
          )}

          {isPaidStatus && (
            <div className="space-y-3">
              <div className="flex gap-3 items-start bg-emerald-950/20 rounded-2xl p-4 border border-emerald-900/30">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-400">
                  Payment already completed. No further payment is required. Your visa documentation is in progress.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 pt-2">
          {isPending && (
            <Button
              id="btn-confirm-pay"
              variant="primary"
              className="w-full justify-center gap-2 h-12 text-base font-bold cursor-pointer shadow-none"
              onClick={handlePayment}
              isLoading={isPaying}
              disabled={isPaying}
            >
              <CreditCard className="h-5 w-5" />
              {isPaying ? "Processing..." : "Confirm & Pay"}
            </Button>
          )}

          {isPaidStatus && (
            <button
              type="button"
              disabled
              className="w-full flex items-center justify-center gap-2 h-12 bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 rounded-xl font-bold text-sm cursor-not-allowed select-none"
            >
              Payment Completed
            </button>
          )}

          {/* Continue on WhatsApp */}
          <a
            href={getPaymentWhatsAppLink(applicationData.application_id)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <MessageCircle className="h-5 w-5 fill-white" />
            Continue on WhatsApp
          </a>

          {/* Book Appointment Link with exact params */}
          <a
            href={`/appointment?visitor_type=Candidate&application_id=${encodeURIComponent(
              applicationData.application_id
            )}&full_name=${encodeURIComponent(
              applicationData.full_name
            )}&mobile_number=${encodeURIComponent(
              applicationData.mobile_number
            )}&email=${encodeURIComponent(applicationData.email || "")}`}
            className="w-full flex items-center justify-center gap-2 h-12 bg-transparent text-[#B89B72] border border-[#B89B72] hover:bg-[#B89B72] hover:text-[#050505] rounded-xl font-bold text-sm transition-all duration-300 active:scale-[0.98] cursor-pointer"
          >
            Book Appointment
          </a>
        </div>

        {/* Help Card */}
        <div className="bg-[#050505] border border-white/8 rounded-2xl p-4 text-center font-sans">
          <p className="text-xs text-[#7C756A] font-semibold uppercase tracking-wide">Need help with payment?</p>
          <p className="text-sm font-semibold text-[#F4F1EA] mt-1.5">
            Call or WhatsApp us at{" "}
            <a href="tel:+919874259915" className="text-[#B89B72] hover:underline font-bold" translate="no">
              +91 98742 59915
            </a>
          </p>
        </div>
      </div>
    );
  };

  const renderGatewayPending = () => (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-[#111111] rounded-3xl border border-white/8 shadow-none p-6 sm:p-10 space-y-6 text-center">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-950/20 border border-amber-900/30 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-amber-400" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-display font-extrabold text-[#F4F1EA]">
            Payment Gateway Pending
          </h2>
          <p className="text-sm text-[#B8B2A7] leading-relaxed">
            Our online payment gateway is currently under maintenance. You can complete your secure payment directly with our team on WhatsApp.
          </p>
        </div>

        {/* WhatsApp CTA */}
        <a
          href={getPaymentWhatsAppLink(
            applicationData?.application_id || applicationId
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all active:scale-[0.98] cursor-pointer"
        >
          <MessageCircle className="h-5 w-5 fill-white" />
          Complete Payment via WhatsApp
        </a>

        {/* Back button */}
        <button
          onClick={() => {
            setPageState(applicationData ? "summary" : "lookup");
          }}
          className="text-sm text-[#B89B72] hover:text-[#C8AD85] font-bold cursor-pointer transition-colors"
        >
          ← Go back to application details
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Consistent back arrow link inside the container */}
      <div className="flex items-center justify-between">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#B8B2A7] hover:text-white transition-colors cursor-pointer group focus:outline-none"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 text-[#B89B72]" />
          <span>Back to Home</span>
        </a>
      </div>

      <AnimatePresence mode="wait">
        {pageState === "lookup" && (
          <motion.div
            key="lookup"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
          >
            {renderLookupState()}
          </motion.div>
        )}

        {pageState === "summary" && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.8fr] gap-8"
          >
            {/* Left Column: Details */}
            <div className="space-y-6">
              {renderApplicationDetailsCard()}
            </div>

            {/* Right Column: Actions */}
            <div className="space-y-6">
              {renderNextStepsPanel()}
            </div>
          </motion.div>
        )}

        {pageState === "gateway-pending" && (
          <motion.div
            key="gateway-pending"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
          >
            {renderGatewayPending()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ------------------------------------------------------------------
// Page Component
// ------------------------------------------------------------------

export default function PayPage() {
  return (
    <>
      <Navbar />

      <main className="flex-1 w-full bg-[#050505] text-[#F4F1EA] pt-32 pb-28 md:pb-20 px-4">
        <React.Suspense
          fallback={
            <div className="w-full max-w-md mx-auto bg-[#111111] rounded-3xl border border-white/8 shadow-none p-10 flex flex-col items-center gap-4">
              <span className="w-10 h-10 rounded-full border-4 border-[#B89B72] border-t-transparent animate-spin" />
              <p className="text-sm text-[#B8B2A7] font-semibold font-sans">
                Loading payment portal...
              </p>
            </div>
          }
        >
          <PaymentFlow />
        </React.Suspense>
      </main>

      <Footer />
    </>
  );
}
