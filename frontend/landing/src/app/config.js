export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const getAdminUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_ADMIN_URL;
  if (envUrl) return envUrl;
  
  if (typeof window !== 'undefined') {
    const { hostname, origin } = window.location;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return origin.replace(/landing/g, 'admin').replace(/student/g, 'admin');
    }
  }
  return 'http://localhost:5174';
};

const getStudentUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_STUDENT_URL;
  if (envUrl) return envUrl;
  
  if (typeof window !== 'undefined') {
    const { hostname, origin } = window.location;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return origin.replace(/landing/g, 'student').replace(/admin/g, 'student');
    }
  }
  return 'http://localhost:5173';
};

export const ADMIN_URL = getAdminUrl();
export const STUDENT_URL = getStudentUrl();

export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('data:')) return url;
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Check if running on production (non-localhost)
    const isProduction = typeof window !== 'undefined' && 
      !window.location.hostname.includes('localhost') && 
      !window.location.hostname.includes('127.0.0.1');
    const isUrlLocalhost = url.includes('localhost') || url.includes('127.0.0.1');
    
    // Only rewrite localhost URLs to production API_URL when running in production
    if (isProduction && isUrlLocalhost) {
      const relativePath = url.substring(url.indexOf('/uploads/'));
      return `${API_URL}${relativePath}`;
    }
    return url;
  }
  
  if (url.startsWith('/uploads')) {
    return `${API_URL}${url}`;
  }
  if (url.startsWith('uploads/')) {
    return `${API_URL}/${url}`;
  }
  return url;
};

