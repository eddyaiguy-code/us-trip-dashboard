// Auth is intentionally disabled for initial testing.
// We'll re-enable the shared PIN gate once the app flow is fully functional.
export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
