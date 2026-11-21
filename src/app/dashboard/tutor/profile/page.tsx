import ProfilePage from "@/app/dashboard/profile/page";

/**
 * Legacy tutor profile route now uses the shared profile experience so every
 * role gets the same API client, upload flow, toasts, and brand styling.
 */
export default function TutorProfilePage() {
  return <ProfilePage />;
}
