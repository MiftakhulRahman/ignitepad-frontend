'use client';

import { useQuery } from '@tanstack/react-query';
import { challengeApi } from '@/lib/api/challenges';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { useBreadcrumb } from '@/lib/hooks/use-breadcrumb';
import { Calendar, Users, Trophy, Search } from 'lucide-react';

export default function ChallengesPage() {
  useBreadcrumb();
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['challenges', filters],
    queryFn: () => challengeApi.getAll(filters),
  });

  const statuses = [
    { value: '', label: 'All Status' },
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb />

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Challenges</h1>
        <p className="text-muted-foreground">
          Join exciting academic challenges and compete with peers
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search challenges..."
            className="pl-10"
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value, page: 1 })
            }
          />
        </div>
        <select
          className="px-4 py-2 border rounded-md bg-background"
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value, page: 1 })
          }
        >
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {/* Challenges Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted" />
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded w-full mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.data.map((challenge) => (
              <Link key={challenge.id} href={`/challenges/${challenge.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  {challenge.banner && (
                    <div className="h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={challenge.banner}
                        alt={challenge.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="line-clamp-2 flex-1">
                        {challenge.title}
                      </CardTitle>
                      <span
                        className={`px-2 py-1 text-xs rounded whitespace-nowrap ${
                          challenge.status === 'open'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : challenge.status === 'closed'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            : challenge.status === 'completed'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}
                      >
                        {challenge.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {challenge.description}
                    </p>
                    <div className="space-y-2 text-sm">
                      {challenge.deadline && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Deadline:{' '}
                            {new Date(challenge.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{challenge.participant_count} participants</span>
                      </div>
                      {challenge.winner_project_id && (
                        <div className="flex items-center gap-2 text-yellow-600">
                          <Trophy className="h-4 w-4" />
                          <span>Winner announced</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {data.meta.last_page > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={filters.page === 1}
                onClick={() =>
                  setFilters({ ...filters, page: filters.page - 1 })
                }
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {data.meta.current_page} of {data.meta.last_page}
              </span>
              <Button
                variant="outline"
                disabled={filters.page === data.meta.last_page}
                onClick={() =>
                  setFilters({ ...filters, page: filters.page + 1 })
                }
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No challenges found.</p>
        </div>
      )}
    </div>
  );
}
