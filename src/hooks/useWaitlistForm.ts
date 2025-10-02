import { useState } from "react";
import { useAnalytics } from "./useAnalytics";

export type WaitlistStatus = "idle" | "loading" | "success" | "error";

export function useWaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<WaitlistStatus>("idle");
  const [message, setMessage] = useState<string>("");
  const [showToast, setShowToast] = useState(false);
  const { trackEvent } = useAnalytics();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setMessage("Email invalide.");
      trackEvent('form_validation_error', {
        'event_category': 'engagement',
        'event_label': 'waitlist_form'
      });
      return;
    }

    try {
      setStatus("loading");
      setMessage("");
      
      trackEvent('form_submit_start', {
        'event_category': 'conversion',
        'event_label': 'waitlist_form'
      });
      
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur inconnue");
      
      setStatus("success");
      setMessage("Merci, tu es bien inscrit(e) !");
      setShowToast(true);
      setEmail("");
      
      trackEvent('conversion', {
        'event_category': 'conversion',
        'event_label': 'waitlist_signup',
        'value': 1
      });
    } catch (err: unknown) {
      setStatus("error");
      const fallback = "Une erreur est survenue.";
      if (err instanceof Error) {
        setMessage(err.message || fallback);
      } else {
        setMessage(fallback);
      }
      
      trackEvent('form_submit_error', {
        'event_category': 'error',
        'event_label': 'waitlist_form'
      });
    }
  };

  return {
    email,
    setEmail,
    status,
    message,
    showToast,
    setShowToast,
    handleJoin
  };
}
