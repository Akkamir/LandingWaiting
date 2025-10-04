import { renderHook, act } from "@testing-library/react";
import { useWaitlistForm } from "@/hooks/useWaitlistForm";

// Mock fetch
global.fetch = jest.fn();

describe("useWaitlistForm Hook", () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it("initializes with correct default state", () => {
    const { result } = renderHook(() => useWaitlistForm());
    
    expect(result.current.email).toBe("");
    expect(result.current.status).toBe("idle");
    expect(result.current.message).toBe("");
    expect(result.current.showToast).toBe(false);
  });

  it("updates email correctly", () => {
    const { result } = renderHook(() => useWaitlistForm());
    
    act(() => {
      result.current.setEmail("test@example.com");
    });
    
    expect(result.current.email).toBe("test@example.com");
  });

  it("handles successful form submission", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    const { result } = renderHook(() => useWaitlistForm());
    
    act(() => {
      result.current.setEmail("test@example.com");
    });

    await act(async () => {
      const mockEvent = {
        preventDefault: jest.fn()
      } as any;
      
      await result.current.handleJoin(mockEvent);
    });

    expect(result.current.status).toBe("success");
    expect(result.current.showToast).toBe(true);
  });

  it("handles form submission errors", async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useWaitlistForm());
    
    act(() => {
      result.current.setEmail("test@example.com");
    });

    await act(async () => {
      const mockEvent = {
        preventDefault: jest.fn()
      } as any;
      
      await result.current.handleJoin(mockEvent);
    });

    expect(result.current.status).toBe("error");
    expect(result.current.message).toBe("Erreur d'inscription. Réessaie.");
  });
});
