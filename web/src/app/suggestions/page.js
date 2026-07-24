import { createClient } from '@/features/auth/backend/supabaseServer';
import SuggestionsBoard from '@/features/suggestions/frontend/SuggestionsBoard';
import PageContainer from '../../components/PageContainer';

export const metadata = {
  title: "Suggestions",
  description: "User suggestion and feature request board for Otakufy.",
};

export default function SuggestionsPage() {
  return (
    <PageContainer maxWidth="max-w-[1440px]">
      <SuggestionsBoard />
    </PageContainer>
  );
}
