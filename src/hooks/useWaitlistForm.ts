import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAnalytics } from "./useAnalytics";
import { validateEmailClient, sanitizeUserInput, clientRateLimit, logSecurityEvent } from "@/lib/security";

export type WaitlistStatus = "idle" | "loading" | "success" | "error";

export function useWaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<WaitlistStatus>("idle");
  const [message, setMessage] = useState<string>("");
  const [showToast, setShowToast] = useState(false);
  const { trackEvent } = useAnalytics();
  const router = useRouter();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting côté client
    if (!clientRateLimit.isAllowed('waitlist-form')) {
      setStatus("error");
      setMessage("Trop de tentatives. Veuillez patienter.");
      logSecurityEvent('Rate limit exceeded', { email: email.substring(0, 3) + '***' });
      return;
    }
    
    // Sanitisation et validation côté client
    const sanitizedEmail = sanitizeUserInput(email);
    if (!validateEmailClient(sanitizedEmail)) {
      setStatus("error");
      setMessage("Email invalide.");
      trackEvent({
        event: 'form_validation_error',
        category: 'engagement',
        label: 'waitlist_form'
      });
      logSecurityEvent('Invalid email format', { email: sanitizedEmail.substring(0, 3) + '***' });
      return;
    }

    try {
      setStatus("loading");
      setMessage("");
      
      trackEvent({
        event: 'form_submit_start',
        category: 'conversion',
        label: 'waitlist_form'
      });
      
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest" // Protection CSRF basique
        },
        body: JSON.stringify({ email: sanitizedEmail }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur inconnue");
      
      setStatus("success");
      setMessage("Merci, tu es bien inscrit(e) ! Redirection vers le produit...");
      setShowToast(true);
      setEmail("");
      
      trackEvent({
        event: 'conversion',
        category: 'conversion',
        label: 'waitlist_signup',
        value: 1
      });
      
      // Redirection vers la page du produit après 2 secondes
      setTimeout(() => {
        trackEvent({
          event: 'redirect_to_product',
          category: 'navigation',
          label: 'post_signup_redirect'
        });
        router.push('/generate');
      }, 2000);
    } catch (err: unknown) {
      setStatus("error");
      const fallback = "Une erreur est survenue.";
      if (err instanceof Error) {
        setMessage(err.message || fallback);
      } else {
        setMessage(fallback);
      }
      
      trackEvent({
        event: 'form_submit_error',
        category: 'error',
        label: 'waitlist_form'
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
