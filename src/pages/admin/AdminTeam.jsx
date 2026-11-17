import { UserProfile } from '@clerk/react';

// Single-admin app: there's no team to invite (see migration spec,
// "Single admin"). This page is where the admin manages their own
// account -- including setting up TOTP multi-factor authentication,
// which Clerk provides natively under its Security tab.
export default function AdminTeam() {
  return (
    <div className="max-w-3xl">
      <UserProfile
        routing="virtual"
        appearance={{
          variables: {
            colorPrimary: "hsl(40 72% 36%)", // --primary (gold)
          },
          elements: {
            card: "shadow-sm border border-border rounded-2xl",
            rootBox: "w-full",
          },
        }}
      />
    </div>
  );
}
