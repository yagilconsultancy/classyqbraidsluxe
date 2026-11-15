import { SignIn } from "@clerk/react";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <SignIn
        routing="path"
        path="/login"
        signUpUrl="/login"
        appearance={{
          variables: {
            colorPrimary: "hsl(40 72% 36%)", // --primary (gold)
          },
          elements: {
            card: "shadow-sm border border-border rounded-2xl",
          },
        }}
      />
    </div>
  );
}
