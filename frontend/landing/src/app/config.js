export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
export const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:5174';
export const STUDENT_URL = process.env.NEXT_PUBLIC_STUDENT_URL || 'http://localhost:5173';

export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('data:')) return url;
  if (url.includes('localhost:5000')) {
    return url.replace(/https?:\/\/localhost:5000/g, API_URL);
  }
  if (url.startsWith('/uploads')) {
    return `${API_URL}${url}`;
  }
  if (url.startsWith('uploads/')) {
    return `${API_URL}/${url}`;
  }
  return url;
};

