import { useAuth } from '@/hooks/use-auth';

/**
 * Utility function to make authenticated API calls with automatic token refresh
 */
export async function authenticatedFetch(
  url: string, 
  options: RequestInit = {},
  refreshToken?: () => Promise<string | null>
): Promise<Response> {
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Make the initial request
  let response = await fetch(url, defaultOptions);

  // If we get a 401 with token expired, try to refresh the token
  if (response.status === 401 && refreshToken) {
    try {
      const responseData = await response.json();
      
      // Check if it's specifically a token expiration error
      if (responseData.tokenExpired) {
        console.log('Token expired, attempting to refresh...');
        
        const newToken = await refreshToken();
        
        if (newToken) {
          console.log('Token refreshed, retrying request...');
          
          // Retry the request with the new token
          const retryOptions: RequestInit = {
            ...defaultOptions,
            headers: {
              ...defaultOptions.headers,
              'Authorization': `Bearer ${newToken}`,
            },
          };
          
          response = await fetch(url, retryOptions);
        } else {
          console.error('Failed to refresh token');
          // Redirect to login if token refresh fails
          window.location.href = '/login';
          return response;
        }
      }
    } catch (error) {
      console.error('Error handling token refresh:', error);
    }
  }

  return response;
}

/**
 * Hook to get an authenticated fetch function
 */
export function useAuthenticatedFetch() {
  const { refreshToken } = useAuth();
  
  return (url: string, options: RequestInit = {}) => 
    authenticatedFetch(url, options, refreshToken);
}
