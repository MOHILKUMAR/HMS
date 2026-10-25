/// <reference types="vite/client" />
// Swastik HMS Hardened REST API Client

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://swastik-hms-api.onrender.com';
const TOKEN_KEY = 'swastik_auth_token_v1';
const USER_KEY = 'swastik_auth_user_v1';

export interface AuthSession {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    mobile?: string;
  };
}

export const ApiService = {
  /**
   * Save authenticated session securely in sessionStorage
   */
  setSession(token: string, user: any) {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /**
   * Get active session token
   */
  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get authenticated user profile
   */
  getStoredUser(): any | null {
    const raw = sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  /**
   * Terminate active staff session
   */
  clearSession() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },

  /**
   * Staff Login with Email & Password
   */
  async staffLogin(email: string, password: string): Promise<{ token: string; user: any }> {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Authentication failed. Please check credentials.');
    }

    this.setSession(data.token, data.user);
    return data;
  },

  /**
   * Fetch public directory of staff accounts for login assistance
   */
  async fetchStaffDirectory(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/staff`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  /**
   * Authenticated HTTP Fetch wrapper (attaches Bearer token)
   */
  async authFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');

    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  },

  /**
   * Request WhatsApp OTP to be dispatched to patient phone number
   */
  async sendWhatsAppOtp(mobile: string): Promise<{ success: boolean; message: string; testOtp?: string }> {
    const res = await fetch(`${API_BASE_URL}/api/auth/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to dispatch verification OTP');
    }
    return data;
  },

  /**
   * Verify patient OTP strictly on the server (no client bypass)
   */
  async verifyWhatsAppOtp(mobile: string, otp: string, patientName?: string): Promise<{ success: boolean; token?: string; patient?: any; error?: string }> {
    const res = await fetch(`${API_BASE_URL}/api/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, otp, patientName }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Invalid or expired verification code' };
    }

    if (data.token) {
      this.setSession(data.token, data.patient);
    }
    return { success: true, token: data.token, patient: data.patient };
  },

  /**
   * Record audit event server-side
   */
  async recordAudit(action: string, module: string, recordId: string, details: string) {
    try {
      await this.authFetch('/api/audit', {
        method: 'POST',
        body: JSON.stringify({ action, module, recordId, details }),
      });
    } catch (err) {
      console.error('[Audit Log Error]', err);
    }
  },

  /**
   * Check backend health
   */
  async checkHealth(): Promise<{ status: string; version: string } | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch {
      return null;
    }
  }
};
