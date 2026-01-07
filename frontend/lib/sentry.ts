import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

export function initSentry() {
  if (!SENTRY_DSN) {
    console.log("Sentry DSN not configured, error monitoring disabled");
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,

    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Session replay for debugging
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Filter out noisy errors
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "Non-Error promise rejection",
      /Loading chunk \d+ failed/,
    ],

    // Add user context when available
    beforeSend(event) {
      // Scrub sensitive data
      if (event.request?.headers) {
        delete event.request.headers["authorization"];
        delete event.request.headers["cookie"];
      }
      return event;
    },
  });
}

// Helper to set user context after auth
export function setSentryUser(user: { id: string; email?: string } | null) {
  if (user) {
    Sentry.setUser({ id: user.id, email: user.email });
  } else {
    Sentry.setUser(null);
  }
}

// Helper to capture errors with context
export function captureError(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

// Helper for capturing messages
export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info"
) {
  Sentry.captureMessage(message, level);
}
