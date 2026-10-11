# KV Physiotherapy & Home Visits

Responsive portfolio for Dr. Vijaya Gundewar Bojewar in Pune.

Built with semantic HTML, modern CSS and JavaScript. Patient stories show one card at a time for 1.5 seconds, with looping, pause and manual navigation. Reduced-motion preferences are respected.

## Local development
Run `npm run dev` to preview at http://127.0.0.1:4173. Run `npm run build` to validate scripts.

## Deployment
Patient review submissions now use free Supabase shared storage. See [REVIEWS-SETUP.md](REVIEWS-SETUP.md) and run [supabase/reviews.sql](supabase/reviews.sql) before publishing. The configured URL and browser-safe publishable key are required in dist/config.js. Without them, the review form honestly reports that setup is pending.
The GitHub Actions workflow publishes `dist` to GitHub Pages on pushes to `main`. Enable Pages with GitHub Actions as the source in repository settings. All asset URLs are relative and support a repository path.

## Callback requests
The configured FormSubmit integration sends callback enquiries to gundewarvijaya17@gmail.com. The recipient has activated the service and confirmed receipt of a verification email. Sending from a new host should be checked after deployment. Do not put secrets in the public repository. No client submission data is stored in the repository or browser storage.

The optional Netlify email function is included for an alternative deployment; it is not used by GitHub Pages.
