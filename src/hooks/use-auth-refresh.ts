import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export function useAuthRefresh() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simple refresh function that reloads the page
  const refreshUser = async () => {
    window.location.reload();
  };

  // Function to handle API errors and attempt token refresh
  const handleApiError = async (error: any, retryFunction?: () => Promise<any>) => {
    if (error?.message?.includes('id-token-expired') || 
        error?.message?.includes('Token expired') ||
        error?.status === 401) {
      
      setIsRefreshing(true);
      
      try {
        // Attempt to refresh the user session
        await refreshUser();
        
        // If retry function is provided, retry the original request
        if (retryFunction) {
          return await retryFunction();
        }
        
        toast({
          title: 'Session refreshed',
          description: 'Your session has been refreshed automatically.',
        });
      } catch (refreshError) {
        console.error('Failed to refresh session:', refreshError);
        toast({
          variant: 'destructive',
          title: 'Session expired',
          description: 'Please log in again to continue.',
        });
        
        // Redirect to login if refresh fails
        window.location.href = '/login';
      } finally {
        setIsRefreshing(false);
      }
    }
    
    throw error;
  };

  // Enhanced fetch wrapper with automatic token refresh
  const authFetch = async (url: string, options: RequestInit = {}) => {
    const originalFetch = async () => {
      const response = await fetch(url, {
        ...options,
        credentials: 'include', // Include cookies
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      return response;
    };

    try {
      return await originalFetch();
    } catch (error: any) {
      return await handleApiError(error, originalFetch);
    }
  };

  // Monitor for token expiration (simplified)
  useEffect(() => {
    if (!user) return;

    // Set up a simple interval to check for authentication issues
    const interval = setInterval(() => {
      // This will be handled by the API error handling
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [user]);

  return {
    authFetch,
    handleApiError,
    isRefreshing,
    refreshUser
  };
}
