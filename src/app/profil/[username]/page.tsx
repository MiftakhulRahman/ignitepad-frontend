'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Briefcase, 
  ExternalLink,
  Github,
  Linkedin,
  Globe
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  cover_image?: string;
  role: string;
  created_at: string;
  github_url?: string;
  linkedin_url?: string;
  website_url?: string;
  nim?: string;
  nidn?: string;
  niyp?: string;
}

export default function ProfilePage() {
  const { username } = useParams();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useAuthStore();

  useEffect(() => {
    if (username) {
      console.log('Username from useParams:', username); // Added console.log
      fetchUserProfile();
    }
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/${username}`);
      
      if (!response.ok) {
        throw new Error('User not found');
      }
      
      const userData = await response.json();
      setUserProfile(userData);
      setError(null);
    } catch (err) {
      setError('Profile not found');
      toast.error('User profile not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-red-500">Profile not found</div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userProfile.id;
  
  // Format role display
  const roleDisplay = userProfile.role === 'admin' 
    ? { text: 'Administrator', color: 'bg-red-100 text-red-800' } 
    : userProfile.role === 'dosen' 
    ? { text: 'Dosen', color: 'bg-blue-100 text-blue-800' } 
    : { text: 'Mahasiswa', color: 'bg-green-100 text-green-800' };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-r from-primary to-secondary relative">
          {userProfile.cover_image ? (
            <img 
              src={userProfile.cover_image} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary to-secondary" />
          )}
        </div>
        
        <div className="container mx-auto px-4 relative -mt-16">
          <Card className="relative">
            <CardContent className="p-0">
              {/* Profile Header */}
              <div className="p-6 pb-20">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-24 w-24 border-4 border-background">
                      <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                      <AvatarFallback className="text-2xl">
                        {userProfile.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="pt-4">
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold">{userProfile.name}</h1>
                        <Badge className={`${roleDisplay.color} capitalize`}>
                          {roleDisplay.text}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">@{userProfile.username}</p>
                      
                      {userProfile.bio && (
                        <p className="mt-2 text-foreground max-w-2xl">{userProfile.bio}</p>
                      )}
                      
                      <div className="flex items-center mt-3 flex-wrap gap-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="h-4 w-4 mr-1" />
                          {userProfile.email}
                        </div>
                        
                        {userProfile.nim && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <User className="h-4 w-4 mr-1" />
                            {userProfile.nim}
                          </div>
                        )}
                        
                        {userProfile.nidn && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <User className="h-4 w-4 mr-1" />
                            {userProfile.nidn}
                          </div>
                        )}
                        
                        {userProfile.niyp && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <User className="h-4 w-4 mr-1" />
                            {userProfile.niyp}
                          </div>
                        )}
                        
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          Joined {new Date(userProfile.created_at).getFullYear()}
                        </div>
                      </div>
                      
                      <div className="flex items-center mt-4 gap-2">
                        {userProfile.github_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={userProfile.github_url} target="_blank" rel="noopener noreferrer">
                              <Github className="h-4 w-4 mr-1" />
                              GitHub
                            </a>
                          </Button>
                        )}
                        
                        {userProfile.linkedin_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={userProfile.linkedin_url} target="_blank" rel="noopener noreferrer">
                              <Linkedin className="h-4 w-4 mr-1" />
                              LinkedIn
                            </a>
                          </Button>
                        )}
                        
                        {userProfile.website_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={userProfile.website_url} target="_blank" rel="noopener noreferrer">
                              <Globe className="h-4 w-4 mr-1" />
                              Website
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {isOwnProfile && (
                    <Button variant="outline">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Tabs */}
              <Tabs defaultValue="projects" className="border-t">
                <div className="px-6">
                  <TabsList>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="achievements">Achievements</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="projects" className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Projects will be loaded here */}
                    <div className="text-center py-8 text-muted-foreground">
                      User projects will be displayed here
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="activity" className="p-6">
                  <div className="text-center py-8 text-muted-foreground">
                    User activity will be displayed here
                  </div>
                </TabsContent>
                
                <TabsContent value="achievements" className="p-6">
                  <div className="text-center py-8 text-muted-foreground">
                    User achievements will be displayed here
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}