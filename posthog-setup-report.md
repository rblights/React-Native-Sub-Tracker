<wizard-report>
# PostHog post-wizard report

The wizard has completed a full PostHog integration for the Sub Tracker React Native / Expo app. PostHog is initialized as a singleton client in `src/config/posthog.ts`, loaded via `expo-constants` from `app.config.js` extras, and wrapped around the app in `app/_layout.tsx` using `PostHogProvider`. Screen views are tracked automatically via a `useEffect` watching `usePathname`. Users are identified on auth state change via a `ClerkIdentityBridge` component that links Clerk user IDs to PostHog person profiles. Auth, subscription engagement, and session events are captured across the key screens.

| Event | Description | File |
|---|---|---|
| `user_signed_in` | User successfully signs in with email and password. | `app/(auth)/sign-in.tsx` |
| `user_signed_up` | User successfully completes email verification and creates a new account. | `app/(auth)/sign-up.tsx` |
| `password_reset_requested` | User requests a password reset code to be sent to their email. | `app/(auth)/sign-in.tsx` |
| `password_reset_completed` | User successfully resets their password using the emailed verification code. | `app/(auth)/sign-in.tsx` |
| `user_signed_out` | User signs out from the settings screen. | `app/(tabs)/settings.tsx` |
| `subscription_card_expanded` | User expands a subscription card on the home screen to see more details. | `app/(tabs)/index.tsx` |
| `subscription_detail_viewed` | User opens the full detail view of a specific subscription. | `app/subscriptions/[id].tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/479152/dashboard/1873003)
- [Auth conversion funnel (wizard)](https://us.posthog.com/project/479152/insights/0PzO78DQ)
- [Daily sign-ins and sign-ups (wizard)](https://us.posthog.com/project/479152/insights/v2okOEsA)
- [Subscription engagement (wizard)](https://us.posthog.com/project/479152/insights/H9fnhV5O)
- [Sign-out rate (wizard)](https://us.posthog.com/project/479152/insights/dSdl7uQW)

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` to `.env.example` and any monorepo/bootstrap scripts so collaborators know what to set.
- [ ] Confirm the returning-visitor path also calls `identify` — the `ClerkIdentityBridge` component fires on every app load when the user is already signed in, so returning sessions are covered. Verify this in a real device run.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
