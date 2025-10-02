interface ToastProps {
  show: boolean;
  message: string;
  onClose: () => void;
}

export function Toast({ show, message, onClose }: ToastProps) {
  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 card px-4 py-3 text-sm text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)] z-50">
      {message}
    </div>
  );
}
