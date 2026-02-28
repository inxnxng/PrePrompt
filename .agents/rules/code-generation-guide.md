* Do not put all logic and UI into `app/page.tsx`.
* Create distinct, reusable components in `src/components/`.
* `app/page.tsx` should primarily compose these components to showcase functionality.
* Keep client-side state localized to specific feature components where possible, or use Zustand for global state.
