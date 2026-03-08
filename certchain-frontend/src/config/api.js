/**
 * Shared API configuration.
 * Set VITE_API_URL in .env to override the default.
 * Example: VITE_API_URL=https://api.certchain.io
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
