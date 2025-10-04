import { useState, useCallback, useMemo } from "react";
import { useAnalytics } from "./useAnalytics";

interface WaitlistFormState {
  email: string;
  status: "idle" | "loading" | "success" | "error";
  message: string;
  showToast: boolean;
}

export function useWaitlistForm() {
  const [state, setState] = useState<WaitlistFormState>({
    email: "",
    status: "idle",
    message: "",
    showToast: false
  });

  const { trackEvent } = useAnalytics();

  const setEmail = useCallback((email: string) => {
    setState(prev => ({ ...prev, email }));
  }, []);

  const setShowToast = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showToast: show }));
  }, []);

  const handleJoin = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!state.email.trim()) {
      setState(prev => ({
        ...prev,
        status: "error",
        message: "Email requis"
      }));
      return;
    }

    setState(prev => ({ ...prev, status: "loading" }));

    try {
      // Track form submission
      trackEvent({
        event: 'form_submit',
        category: 'waitlist',
        label: 'email_signup'
      });

      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: state.email })
      });

      if (!response.ok) {
        throw new Error("Erreur d'inscription");
      }

      setState(prev => ({
        ...prev,
        status: "success",
        message: "Inscription réussie ! Redirection vers le produit...",
        showToast: true
      }));

      // Track successful signup
      trackEvent({
        event: 'conversion',
        category: 'waitlist',
        label: 'email_signup_success'
      });

    } catch (error) {
      setState(prev => ({
        ...prev,
        status: "error",
        message: "Erreur d'inscription. Réessaie."
      }));

      // Track error
      trackEvent({
        event: 'form_error',
        category: 'waitlist',
        label: 'email_signup_error'
      });
    }
  }, [state.email, trackEvent]);

  // Mémoisation des valeurs pour éviter les re-renders
  const memoizedState = useMemo(() => ({
    email: state.email,
    status: state.status,
    message: state.message,
    showToast: state.showToast
  }), [state.email, state.status, state.message, state.showToast]);

  return {
    ...memoizedState,
    setEmail,
    setShowToast,
    handleJoin
  };
}