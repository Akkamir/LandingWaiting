"use client";
import { useEffect, useState } from "react";

export default function LottieTest() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const testLottieFile = async () => {
      try {
        const response = await fetch("/Bouncing Square.json");
        console.log("Lottie file test:", {
          status: response.status,
          ok: response.ok,
          url: response.url
        });
        
        if (response.ok) {
          setStatus("success");
        } else {
          setStatus("error");
          setError(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Unknown error");
        console.error("Lottie file test failed:", err);
      }
    };

    testLottieFile();
  }, []);

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs z-50">
      <div className="font-bold">Lottie Test:</div>
      <div className={`mt-1 ${status === "success" ? "text-green-400" : status === "error" ? "text-red-400" : "text-yellow-400"}`}>
        {status === "loading" && "Testing..."}
        {status === "success" && "✅ File accessible"}
        {status === "error" && `❌ ${error}`}
      </div>
    </div>
  );
}
