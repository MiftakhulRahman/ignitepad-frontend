'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { isAuthenticated, isHydrated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isHydrated, router]);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      console.log('Login response:', response);

      // Handle the expected response structure based on the API definition
      // authApi.login returns Promise<ApiResponse<{ user: User; token: string }>>
      
      // First try the expected format
      let user = response.data?.user;
      let token = response.data?.token;

      // If the expected format isn't available, try to look for other possible formats
      // This handles cases where the backend might return a different structure
      if (!user || !token) {
        // Type assertion to allow accessing additional properties
        const responseData = response.data as any;
        
        // Check if user and additional token fields exist in response data
        if (responseData?.user && (responseData?.access_token || responseData?.token)) {
          user = responseData.user;
          token = responseData.access_token || responseData.token;
        } else {
          // Check if response itself contains user and token (less likely for our API, but for safety)
          // This would indicate a different API contract than expected
          const responseAny = response as any;
          if (responseAny?.user && (responseAny?.access_token || responseAny?.token)) {
            user = responseAny.user;
            token = responseAny.access_token || responseAny.token;
          }
        }
      }

      if (user && token) {
        setAuth(user, token);
        router.push('/dashboard');
      } else {
        console.error('Invalid response structure:', response);
        setError('Invalid response from server');
      }
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      console.error('Error response:', error.response);

      setError(
        error.response?.data?.message || 'Login failed. Please try again.'
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login to Ignitepad</CardTitle>
        <CardDescription>
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/10 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-center">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}