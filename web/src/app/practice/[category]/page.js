import QuizEngine from '@/features/practice/frontend/QuizEngine';
import Link from 'next/link';
import PageContainer from '../../../components/PageContainer';
import ListeningPlaceholder from '@/features/practice/components/ListeningPlaceholder';

export async function generateMetadata({ params }) {
  const { category } = await params;
  const capitalized = category ? (category.charAt(0).toUpperCase() + category.slice(1)) : 'Practice';
  return {
    title: `${capitalized} Practice`,
    description: `Interactive SRS flashcards and quiz practice for Japanese ${category}.`,
  };
}

export default async function PracticePage({ params }) {
  const { category } = await params;
  
  if (category === 'listening') {
    return <ListeningPlaceholder />;
  }

  // We can eventually use the category (kanji, vocabulary) to load different decks
  return (
    <div className="w-full">
      <QuizEngine category={category} />
    </div>
  );
}
