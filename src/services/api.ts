import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = '/api-proxy';
const DEFAULT_EMAIL = 'display@mbsport.com';
const DEFAULT_PASSWORD = '20260615';

class ApiService {
  private client: AxiosInstance;
  private token: string | null = null;
  private isAuthenticating: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 8000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to attach Bearer token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Skip attaching token for auth endpoints
        if (config.url?.includes('/auth/login') || config.url?.includes('/auth/register')) {
          return config;
        }

        if (!this.token) {
          // If not authenticated, trigger login and wait for it
          try {
            const token = await this.authenticate();
            if (config.headers) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          } catch (err) {
            console.error('Failed auto-authentication:', err);
          }
        } else {
          if (config.headers) {
            config.headers.Authorization = `Bearer ${this.token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token expiration (401)
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          this.token = null; // Reset token
          try {
            const token = await this.authenticate();
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return this.client(originalRequest);
          } catch (authError) {
            return Promise.reject(authError);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Method to perform login and get JWT token
  private async authenticate(): Promise<string> {
    if (this.isAuthenticating) {
      return this.isAuthenticating;
    }

    this.isAuthenticating = (async () => {
      try {
        const response = await axios.post(`${API_URL}/auth/login`, {
          email: DEFAULT_EMAIL,
          password: DEFAULT_PASSWORD,
        });
        const token = response.data.accessToken;
        this.token = token;
        return token;
      } catch (error) {
        console.error('Authentication request failed:', error);
        throw error;
      } finally {
        this.isAuthenticating = null;
      }
    })();

    return this.isAuthenticating;
  }

  // API Endpoints
  public async getCurrentRace() {
    const response = await this.client.get('/races/current');
    return response.data;
  }

  public async getRaceHistory(limit = 5, agencyId?: string) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (agencyId) params.set('agencyId', agencyId);
    const response = await this.client.get(`/races/history?${params.toString()}`);
    return response.data;
  }

  public async getLiveOdds(raceId: string) {
    const response = await this.client.get(`/odds/race/${raceId}/live`);
    return response.data;
  }

  public async getRaceResults(raceId: string) {
    const response = await this.client.get(`/races/${raceId}/results`);
    return response.data;
  }

  public getVideoUrl(filename: string): string {
    // URL directa al servidor de videos — evita buffering del proxy Nginx
    // del display que puede interferir con streaming de archivos grandes.
    return `https://api.mbsport.lat/videos/${filename}`;
  }

  /** @deprecated usa getVideoUrl + <video src> para streaming nativo */
  public async getVideoBlob(filename: string) {
    const response = await this.client.get(`/videos/${filename}`, {
      responseType: 'blob',
      timeout: 120000,
    });
    return response.data;
  }

  public async getGameStatus(agencyId?: string) {
    const url = agencyId ? `/race-engine/status?agencyId=${agencyId}` : '/race-engine/status';
    const response = await this.client.get(url);
    return response.data;
  }
}

export const api = new ApiService();
