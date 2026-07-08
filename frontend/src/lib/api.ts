const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  // Always include credentials to send/receive HTTPOnly cookies
  options.credentials = 'include';
  options.headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, options);
    
    let result = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    }
    
    if (!response.ok) {
      throw new Error(result?.message || `Gagal memproses permintaan (${response.status})`);
    }
    
    return result;
  } catch (error: any) {
    console.error('API Fetch Error:', error);
    throw error;
  }
};
