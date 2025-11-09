'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLSpanElement> {}

const AvatarContext = React.createContext<{
  size?: 'sm' | 'md' | 'lg';
}>({});

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <AvatarContext.Provider value={{}}>
        <div
          ref={ref}
          className={cn(
            'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </AvatarContext.Provider>
    );
  }
);
Avatar.displayName = 'Avatar';

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, ...props }, ref) => {
    return (
      <img
        ref={ref}
        className={cn('aspect-square h-full w-full', className)}
        {...props}
      />
    );
  }
);
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'flex h-full w-full items-center justify-center rounded-full bg-muted',
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };