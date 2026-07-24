import LoginForm from '../../../../features/auth/frontend/LoginForm';
import PageContainer from '../../components/PageContainer';

export const metadata = {
  title: "Sign In",
  description: "Log in to Otakufy to sync your flashcards, track your streak, and compete on the leaderboard.",
};

export default function LoginPage() {
  return (
    <PageContainer maxWidth="max-w-md" className="flex flex-col items-center justify-center min-h-[70vh] animate-slide-up">
      <LoginForm />
    </PageContainer>
  );
}
