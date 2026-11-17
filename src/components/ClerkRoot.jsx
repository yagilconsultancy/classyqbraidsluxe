import { Outlet } from 'react-router-dom';
import { ClerkProvider } from '@clerk/react';

const KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Clerk's SDK is heavy, so it only loads for /login and /admin.
export default function ClerkRoot() {
  return (
    <ClerkProvider publishableKey={KEY} afterSignOutUrl="/">
      <Outlet />
    </ClerkProvider>
  );
}
