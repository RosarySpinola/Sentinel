import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-4">
        <SignUp
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
          signInUrl="/sign-in"
          forceRedirectUrl="/simulator"
        />
      </div>
    </div>
  );
}
