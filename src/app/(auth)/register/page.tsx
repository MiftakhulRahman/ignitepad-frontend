'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth-store';
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

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'mahasiswa' as 'mahasiswa' | 'dosen',
    nim: '',
    nidn: '',
    niyp: '',
  });
  const [error, setError] = useState('');

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (response) => {
      console.log('Register response:', response);
      
      // Backend returns: { user, access_token, message, token_type }
      const user = response.data?.user || response.user;
      const token = response.data?.access_token || response.access_token || response.data?.token || response.token;
      
      if (user && token) {
        setAuth(user, token);
        router.push('/dashboard');
      } else {
        console.error('Invalid response structure:', response);
        setError('Invalid response from server');
      }
    },
    onError: (error: any) => {
      console.error('Register error:', error);
      setError(
        error.response?.data?.message ||
          'Registration failed. Please try again.'
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match');
      return;
    }

    registerMutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an Account</CardTitle>
        <CardDescription>
          Join Ignitepad to start sharing your projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/10 rounded-md">
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">I am a</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="mahasiswa"
                  checked={formData.role === 'mahasiswa'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as 'mahasiswa' | 'dosen',
                    })
                  }
                  className="mr-2"
                />
                Mahasiswa
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="dosen"
                  checked={formData.role === 'dosen'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as 'mahasiswa' | 'dosen',
                    })
                  }
                  className="mr-2"
                />
                Dosen
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>
            <Input
              id="username"
              type="text"
              placeholder="johndoe"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
            />
          </div>

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

          {/* Conditional Fields */}
          {formData.role === 'mahasiswa' && (
            <div className="space-y-2">
              <label htmlFor="nim" className="text-sm font-medium">
                NIM
              </label>
              <Input
                id="nim"
                type="text"
                placeholder="2255202001"
                value={formData.nim}
                onChange={(e) =>
                  setFormData({ ...formData, nim: e.target.value })
                }
                required
              />
            </div>
          )}

          {formData.role === 'dosen' && (
            <>
              <div className="space-y-2">
                <label htmlFor="nidn" className="text-sm font-medium">
                  NIDN
                </label>
                <Input
                  id="nidn"
                  type="text"
                  placeholder="1234567890"
                  value={formData.nidn}
                  onChange={(e) =>
                    setFormData({ ...formData, nidn: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="niyp" className="text-sm font-medium">
                  NIYP (Optional)
                </label>
                <Input
                  id="niyp"
                  type="text"
                  placeholder="0987654321"
                  value={formData.niyp}
                  onChange={(e) =>
                    setFormData({ ...formData, niyp: e.target.value })
                  }
                />
              </div>
            </>
          )}

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

          <div className="space-y-2">
            <label htmlFor="password_confirmation" className="text-sm font-medium">
              Confirm Password
            </label>
            <Input
              id="password_confirmation"
              type="password"
              placeholder="••••••••"
              value={formData.password_confirmation}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  password_confirmation: e.target.value,
                })
              }
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
