"use client";
import { StackProvider, SignIn } from "@stackframe/stack";
import { stackClientApp } from "@/lib/stack";

export default function LoginPage() {
  return (
    <StackProvider app={stackClientApp}>
      <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background to-muted/50">
        <SignIn
          fullPage={true}
          automaticRedirect={true}
          firstTab="password"
          extraInfo={<>By signing in, you agree to our <a href="/terms">Terms</a></>}
        />
      </div>
    </StackProvider>
  );
} 