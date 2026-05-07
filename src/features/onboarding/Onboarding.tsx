import { useCallback, useRef, useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import styles from './Onboarding.module.css';

interface OnboardingProps {
  onComplete: () => void;
}

interface SlideData {
  image: string;
  title: string;
  description: string;
}

const SLIDES: Record<string, SlideData[]> = {
  en: [
    {
      image: '/images/onboarding-1.svg',
      title: 'Log expenses in seconds',
      description: 'Open, add, done. No forms, no friction. Track every spend before you even think about it.',
    },
    {
      image: '/images/onboarding-2.svg',
      title: 'See where your money goes',
      description: 'Daily totals, clear history, and simple insights. Know your habits without the headache.',
    },
    {
      image: '/images/onboarding-3.svg',
      title: 'Your money, your rules',
      description: 'Any currency, any language. Works offline, stays private. This is your money, your way.',
    },
  ],
  es: [
    {
      image: '/images/onboarding-1.svg',
      title: 'Registra gastos en segundos',
      description: 'Abre, agrega, listo. Sin formularios, sin fricción. Registra cada gasto antes de pensarlo.',
    },
    {
      image: '/images/onboarding-2.svg',
      title: 'Mira a dónde va tu dinero',
      description: 'Totales diarios, historial claro e ideas simples. Conoce tus hábitos sin complicaciones.',
    },
    {
      image: '/images/onboarding-3.svg',
      title: 'Tu dinero, tus reglas',
      description: 'Cualquier moneda, cualquier idioma. Funciona sin conexión, se mantiene privado. Tu dinero, a tu manera.',
    },
  ],
  ar: [
    {
      image: '/images/onboarding-1.svg',
      title: 'سجّل النفقات في ثوانٍ',
      description: 'افتح، أضف، انتهى. بلا نماذج، بلا تعقيد. تتبع كل إنفاق قبل حتى أن تفكر فيه.',
    },
    {
      image: '/images/onboarding-2.svg',
      title: 'شاهد أين تذهب أموالك',
      description: 'مجاميع يومية، سجل واضح، ورؤى بسيطة. تعرّف على عاداتك دون صداع.',
    },
    {
      image: '/images/onboarding-3.svg',
      title: 'أموالك، قواعدك',
      description: 'أي عملة، أي لغة. يعمل بلا إنترنت، ويبقى خاصاً. أموالك بطريقتك.',
    },
  ],
  fr: [
    {
      image: '/images/onboarding-1.svg',
      title: 'Notez vos dépenses en secondes',
      description: 'Ouvrez, ajoutez, terminé. Pas de formulaires, pas de friction. Suivez chaque dépense en un instant.',
    },
    {
      image: '/images/onboarding-2.svg',
      title: 'Voyez où va votre argent',
      description: 'Totaux quotidiens, historique clair et idées simples. Connaissez vos habitudes sans prise de tête.',
    },
    {
      image: '/images/onboarding-3.svg',
      title: 'Votre argent, vos règles',
      description: 'N\'importe quelle devise, n\'importe quelle langue. Fonctionne hors ligne, reste privé. Votre argent, à votre façon.',
    },
  ],
};

function getSlides(language: string): SlideData[] {
  return SLIDES[language] || SLIDES['en'];
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { language } = useLanguage();
  const [page, setPage] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const slides = getSlides(language);

  const goNext = useCallback(() => {
    if (page < slides.length - 1) setPage(p => p + 1);
    else onComplete();
  }, [page, slides.length, onComplete]);

  const goPrev = useCallback(() => {
    if (page > 0) setPage(p => p - 1);
  }, [page]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  }, [goNext, goPrev]);

  return (
    <div
      className={styles.container}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.imageContainer}>
        <img
          src={slides[page].image}
          alt=""
          className={styles.backgroundImage}
          key={page}
        />
        <div className={styles.imageOverlay}></div>
      </div>

      <div className={styles.content}>
        <div className={styles.dots} role="tablist" aria-label="Onboarding progress">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${i === page ? styles.dotActive : ''}`}
              role="tab"
              aria-selected={i === page}
            />
          ))}
        </div>

        <h2 className={styles.title}>{slides[page].title}</h2>
        <p className={styles.description}>{slides[page].description}</p>

        <div className={styles.actions}>
          {page < slides.length - 1 ? (
            <>
              <button className={styles.skipBtn} onClick={onComplete}>
                Skip
              </button>
              <button className={styles.nextBtn} onClick={goNext}>
                Next
              </button>
            </>
          ) : (
            <button className={styles.startBtn} onClick={onComplete}>
              Get Started
            </button>
          )}
        </div>

        <p className={styles.tagline}>Go for freedom</p>
      </div>
    </div>
  );
}
