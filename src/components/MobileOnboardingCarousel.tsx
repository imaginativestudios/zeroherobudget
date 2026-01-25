import { useState } from 'react';
import { X, ChevronRight, Check, DollarSign, TrendingDown, CreditCard, BarChart3, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import useEmblaCarousel from 'embla-carousel-react';

interface MobileOnboardingCarouselProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const slides = [
  {
    icon: Sparkles,
    title: "Welcome to Zero Hero",
    description: "Let's take a quick tour of how you can take control of your finances and pay off debt faster.",
    color: "text-primary",
  },
  {
    icon: DollarSign,
    title: "Track Everything",
    description: "Monitor your income, expenses, and subscriptions all in one place. Know exactly where your money goes.",
    color: "text-accent-dark",
  },
  {
    icon: TrendingDown,
    title: "Pay Down Your Debt",
    description: "Choose between Snowball and Avalanche strategies. Pay off debt faster and save on interest.",
    color: "text-destructive",
  },
  {
    icon: BarChart3,
    title: "Stay Organized",
    description: "View detailed reports, track transactions, and manage budgets to stay on top of your financial goals.",
    color: "text-chart-1",
  },
  {
    icon: CreditCard,
    title: "Guidance When You Need It",
    description: "Have questions? A helpful assistant is always available in the bottom-right corner to guide you.",
    color: "text-primary",
  },
];

export const MobileOnboardingCarousel = ({ isOpen, onComplete, onSkip }: MobileOnboardingCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollTo = (index: number) => {
    emblaApi?.scrollTo(index);
  };

  const scrollNext = () => {
    if (currentIndex === slides.length - 1) {
      onComplete();
    } else {
      emblaApi?.scrollNext();
    }
  };

  // Track current slide
  useState(() => {
    if (emblaApi) {
      emblaApi.on('select', () => {
        setCurrentIndex(emblaApi.selectedScrollSnap());
      });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onSkip()}>
      <DialogContent className="p-0 gap-0 max-w-md border-0 bg-gradient-to-br from-primary via-primary-light to-primary-dark overflow-hidden">
        {/* Skip Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 h-10 w-10 rounded-full"
          onClick={onSkip}
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Carousel Container */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {slides.map((slide, index) => {
              const Icon = slide.icon;
              return (
                <div key={index} className="flex-[0_0_100%] min-w-0 px-6 py-12">
                  <div className="flex flex-col items-center text-center space-y-6 h-[400px] justify-center">
                    {/* Icon */}
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-scale-in">
                      <Icon className={`h-10 w-10 text-white`} />
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-white leading-tight px-4">
                      {slide.title}
                    </h2>

                    {/* Description */}
                    <p className="text-base text-white leading-relaxed px-4 max-w-sm">
                      {slide.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 pb-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary ${
                index === currentIndex 
                  ? 'w-8 bg-white' 
                  : 'w-2 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1} of ${slides.length}`}
              aria-current={index === currentIndex ? 'true' : undefined}
            />
          ))}
        </div>

        {/* Navigation Button */}
        <div className="px-6 pb-8">
          <Button
            size="lg"
            className="w-full h-12 bg-white text-primary-dark hover:bg-white/90 font-semibold text-base"
            onClick={scrollNext}
          >
            {currentIndex === slides.length - 1 ? (
              <>
                <Check className="h-5 w-5 mr-2" />
                Get Started
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
