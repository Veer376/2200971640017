import axios from 'axios';
import Log from '../utils/logger';

// Define the API base URL
const API_BASE_URL = 'http://localhost:5000';

// Define interfaces for API data
export interface CreateUrlRequest {
  url: string;
  validity?: number;
  shortcode?: string;
}

export interface CreateUrlResponse {
  shortLink: string;
  expiry: string;
}

export interface ClickData {
  timestamp: string;
  source: string;
  location: string;
}

export interface UrlStats {
  originalUrl: string;
  shortcode: string;
  clicks: number;
  createdAt: string;
  expiry: string;
  clickData: ClickData[];
}

// Create API service
const apiService = {
  // Create a shortened URL
  createShortUrl: async (data: CreateUrlRequest): Promise<CreateUrlResponse> => {
    try {
      Log('info', 'api', `Creating short URL for ${data.url}`);
      const response = await axios.post<CreateUrlResponse>(`${API_BASE_URL}/shorturls`, data);
      Log('debug', 'api', `Short URL created successfully: ${response.data.shortLink}`);
      return response.data;
    } catch (error) {
      Log('error', 'api', `Failed to create short URL: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  },

  // Get statistics for a shortened URL
  getUrlStats: async (shortcode: string): Promise<UrlStats> => {
    try {
      Log('info', 'api', `Fetching stats for shortcode: ${shortcode}`);
      const response = await axios.get<UrlStats>(`${API_BASE_URL}/shorturls/${shortcode}`);
      Log('debug', 'api', `Stats fetched successfully for ${shortcode}`);
      return response.data;
    } catch (error) {
      Log('error', 'api', `Failed to fetch stats for ${shortcode}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
};

export default apiService;
