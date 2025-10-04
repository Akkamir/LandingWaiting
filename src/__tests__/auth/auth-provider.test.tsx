import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/lib/auth/auth-provider';

// Mock Supabase
vi.mock('@/lib/auth/supabase', () => ({
  supabaseBrowser: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithOtp: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
  },
  createUserProfile: vi.fn(),
  getUserProfile: vi.fn(),
  updateUserProfile: vi.fn(),
}));

// Mock component to test the provider
function TestComponent() {
  const { authState, login, logout, sendMagicLink } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{authState.loading.toString()}</div>
      <div data-testid="user">{authState.user?.email || 'null'}</div>
      <button onClick={() => login({ email: 'test@example.com', method: 'magic_link' })}>
        Login
      </button>
      <button onClick={() => sendMagicLink('test@example.com')}>
        Send Magic Link
      </button>
      <button onClick={logout}>
        Logout
      </button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide auth context to children', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByTestId('user')).toBeInTheDocument();
  });

  it('should handle login with magic link', async () => {
    const mockSignInWithOtp = vi.fn().mockResolvedValue({
      data: { user: { id: '1', email: 'test@example.com' } },
      error: null,
    });

    vi.mocked(require('@/lib/auth/supabase').supabaseBrowser.auth.signInWithOtp).mockImplementation(mockSignInWithOtp);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: {
          emailRedirectTo: expect.any(String),
        },
      });
    });
  });

  it('should handle magic link sending', async () => {
    const mockSignInWithOtp = vi.fn().mockResolvedValue({
      data: { user: { id: '1', email: 'test@example.com' } },
      error: null,
    });

    vi.mocked(require('@/lib/auth/supabase').supabaseBrowser.auth.signInWithOtp).mockImplementation(mockSignInWithOtp);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const magicLinkButton = screen.getByText('Send Magic Link');
    fireEvent.click(magicLinkButton);

    await waitFor(() => {
      expect(mockSignInWithOtp).toHaveBeenCalled();
    });
  });

  it('should handle logout', async () => {
    const mockSignOut = vi.fn().mockResolvedValue({ error: null });

    vi.mocked(require('@/lib/auth/supabase').supabaseBrowser.auth.signOut).mockImplementation(mockSignOut);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  it('should handle auth state changes', async () => {
    const mockOnAuthStateChange = vi.fn();
    const mockUnsubscribe = vi.fn();
    
    vi.mocked(require('@/lib/auth/supabase').supabaseBrowser.auth.onAuthStateChange).mockImplementation(
      (callback) => {
        mockOnAuthStateChange(callback);
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      }
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(mockOnAuthStateChange).toHaveBeenCalled();
  });
});
