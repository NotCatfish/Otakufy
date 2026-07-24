import ProfileSettings from '@/features/profile/frontend/ProfileSettings';
import PageContainer from '../../components/PageContainer';

export const metadata = {
  title: "Profile Settings",
  description: "Manage your Otakufy profile, custom avatar, study preferences, and account security.",
};

export default function ProfilePage() {
  return (
    <PageContainer maxWidth="max-w-[1440px]">
      <ProfileSettings />
    </PageContainer>
  );
}
