import { BreadcrumbItem } from '@/lib/stores/breadcrumb-store';

export interface BreadcrumbConfig {
  items: BreadcrumbItem[];
  dynamic?: {
    [key: string]: (data: any) => BreadcrumbItem;
  };
}

export const breadcrumbConfig: Record<string, BreadcrumbConfig> = {
  '/': {
    items: [{ label: 'Home', href: '/' }],
  },

  // Projects
  '/projects': {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Projects' },
    ],
  },
  '/projects/[slug]': {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Projects', href: '/projects' },
      { label: '', dynamic: true },
    ],
    dynamic: {
      slug: (project) => ({ label: project.title }),
    },
  },

  // Challenges
  '/challenges': {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Challenges' },
    ],
  },
  '/challenges/[slug]': {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Challenges', href: '/challenges' },
      { label: '', dynamic: true },
    ],
    dynamic: {
      slug: (challenge) => ({ label: challenge.title }),
    },
  },

  // Dashboard
  '/dashboard': {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Dashboard' },
    ],
  },
  '/dashboard/my-projects': {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'My Projects' },
    ],
  },
  '/dashboard/my-projects/create': {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'My Projects', href: '/dashboard/my-projects' },
      { label: 'Create New' },
    ],
  },
  '/dashboard/my-projects/edit/[slug]': {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'My Projects', href: '/dashboard/my-projects' },
      { label: '', dynamic: true },
      { label: 'Edit' },
    ],
    dynamic: {
      slug: (project) => ({ label: project.title, href: `/projects/${project.slug}` }),
    },
  },
  '/dashboard/saved': {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Saved Projects' },
    ],
  },
  '/dashboard/challenges': {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'My Challenges' },
    ],
  },
  '/dashboard/settings': {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Settings' },
    ],
  },

  // Profile
  '/profile/[username]': {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Profile', dynamic: true },
    ],
    dynamic: {
      username: (user) => ({ label: user.name }),
    },
  },
};
