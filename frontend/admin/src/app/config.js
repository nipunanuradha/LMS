export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174';
export const STUDENT_URL = import.meta.env.VITE_STUDENT_URL || 'http://localhost:5173';

const getLandingUrl = () => {
  const envUrl = import.meta.env.VITE_LANDING_URL;
  if (envUrl) return envUrl;
  
  if (typeof window !== 'undefined') {
    const { hostname, origin } = window.location;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return origin.replace(/admin/g, 'landing').replace(/student/g, 'landing');
    }
  }
  return 'http://localhost:3000';
};

export const LANDING_URL = getLandingUrl();

export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('data:')) return url;
  if (url.includes('/uploads/')) {
    const relativePath = url.substring(url.indexOf('/uploads/'));
    return `${API_URL}${relativePath}`;
  }
  if (url.startsWith('/uploads')) {
    return `${API_URL}${url}`;
  }
  if (url.startsWith('uploads/')) {
    return `${API_URL}/${url}`;
  }
  return url;
};

