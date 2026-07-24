import QuizEngine from '../../../../../features/practice/frontend/QuizEngine';
import Link from 'next/link';
import PageContainer from '../../../components/PageContainer';

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
    return (
      <PageContainer className="flex flex-col items-center justify-center min-h-[70vh] text-center font-light">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">Work in Progress</h1>
        <p className="text-xl md:text-2xl font-medium opacity-80 mb-12">The listening module is currently under development.</p>
        <Link 
          href="/"
          className="px-8 py-3 border-2 border-white rounded-full text-sm font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-300"
        >
          Return to Dashboard
        </Link>
      </PageContainer>
    );
  }

  // We can eventually use the category (kanji, vocabulary) to load different decks
  return (
    <div className="w-full">
      <QuizEngine category={category} />
    </div>
  );
}
