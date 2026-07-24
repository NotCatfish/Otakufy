import { createClient } from '../../../features/auth/backend/supabaseServer';
import DashboardClient from '../components/DashboardClient';

export const metadata = {
  title: "Dashboard",
  description: "Track your Japanese learning streak, Satori score, due SRS cards, and recent study activity.",
};

export default function Home() {
  return <DashboardClient />;
}
