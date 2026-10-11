# Free shared patient reviews

## Configured project
**KVPhysio Reviews** is configured in the Free organization, Mumbai region. Project dashboard: https://supabase.com/dashboard/project/ococtfkrvjevgucigejd. The review schema is installed and `dist/config.js` contains only its browser-safe publishable key. Legacy JWT API keys are disabled. Real submission and separate-browser persistence were verified, then the temporary test review was removed. The website changes are awaiting a GitHub push.

## One-time Supabase setup
1. Sign in at https://supabase.com/dashboard and create a project on the **Free** plan. No paid upgrade is needed for this feature.
2. Open SQL Editor, paste `supabase/reviews.sql`, and run it.
3. Copy the project URL and browser-safe **publishable key** from the project's Connect/API settings. A legacy `anon` key also works. Never use `service_role` or a secret key in the website.
4. Enter the URL and publishable key under `reviews` in `dist/config.js`.
5. Start the local preview, post a review, and check it from a different browser. Then push to GitHub when approved.

## Behavior and management
Saved reviews publish immediately, without approval, as requested. They appear in the submitter's slider immediately; other open pages refresh every 30 seconds or when the tab becomes visible. The newest 200 database reviews join the original six. Display names are visitor-chosen; submissions are not verified as actual patients.

Delete a review in Supabase Table Editor → patient_reviews to remove it. It disappears from open pages at their next refresh. The public API cannot edit/delete reviews or read visitor identifiers/consent columns. Database functions run with a fixed empty search path and table access is restricted.

The form requires consent to public display and asks visitors not to publish contact or medical details. It renders text as plain text, not HTML. No names/review bodies are stored in browser storage. A random browser identifier supports a one-minute submission cooldown. This cooldown and honeypot reduce basic repeat/spam submissions; they are not identity verification or a strong bot defense. For heavier abuse, add server-side CAPTCHA or moderation before publication.

Retry requests use the same ID so a timed-out save does not produce duplicate cards. Inputs remain on delivery failure. Missing backend configuration disables submission with an honest setup message; the original six stories still work.

Free projects have usage limits and may pause after inactivity. Stay on the Free plan; do not enable paid upgrades automatically. See https://supabase.com/pricing.
