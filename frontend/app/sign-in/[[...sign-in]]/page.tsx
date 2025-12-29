import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-4">
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-card border border-border shadow-lg",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton: "border-border hover:bg-accent",
              formButtonPrimary: "bg-primary hover:bg-primary/90",
              footerActionLink: "text-primary hover:text-primary/90",
            },
          }}
          signUpUrl="/sign-up"
          forceRedirectUrl="/simulator"
        />
      </div>
    </div>
  );
}
