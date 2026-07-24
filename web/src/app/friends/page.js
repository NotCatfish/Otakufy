import PageContainer from '../../components/PageContainer';
import FriendsClient from './FriendsClient';

export const metadata = {
  title: "Friends & Social Hub",
  description: "Connect with friends, challenge rivals, and grow your Japanese learning network.",
};

export default function FriendsPage() {
  return (
    <PageContainer maxWidth="max-w-[1440px]" className="font-medium text-white">
      <FriendsClient />
    </PageContainer>
  );
}
