import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useBreadcrumbStore } from '@/lib/stores/breadcrumb-store';
import { breadcrumbConfig } from '@/lib/constants/breadcrumb-config';

export function useBreadcrumb(dynamicData?: Record<string, any>) {
  const pathname = usePathname();
  const setItems = useBreadcrumbStore((state) => state.setItems);

  useEffect(() => {
    // Find matching route
    let matchedRoute = pathname;
    let config = breadcrumbConfig[pathname];

    // If exact match not found, try dynamic routes
    if (!config) {
      const routes = Object.keys(breadcrumbConfig);
      matchedRoute =
        routes.find((route) => {
          const pattern = route.replace(/\[([^\]]+)\]/g, '([^/]+)');
          const regex = new RegExp(`^${pattern}$`);
          return regex.test(pathname);
        }) || pathname;

      config = breadcrumbConfig[matchedRoute];
    }

    if (!config) {
      // Fallback: auto-generate from pathname
      const segments = pathname.split('/').filter(Boolean);
      const autoItems = [
        { label: 'Home', href: '/' },
        ...segments.map((segment, index) => ({
          label:
            segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
          href:
            index === segments.length - 1
              ? undefined
              : '/' + segments.slice(0, index + 1).join('/'),
        })),
      ];
      setItems(autoItems);
      return;
    }

    // Process breadcrumb items
    const items = config.items.map((item) => {
      if (item.dynamic && config.dynamic && dynamicData) {
        const dynamicKey = Object.keys(config.dynamic)[0];
        const dynamicFn = config.dynamic[dynamicKey];
        return dynamicFn(dynamicData);
      }
      return item;
    });

    setItems(items);
  }, [pathname, dynamicData, setItems]);
}
