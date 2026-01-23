import { MapPin, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useJourneyProgress } from '@/hooks/useJourneyProgress';
import { JourneyProgressBar } from '@/components/journey/JourneyProgressBar';
import { JourneyStepCard } from '@/components/journey/JourneyStepCard';

export default function Journey() {
  const { steps, completedSteps, totalSteps, overallProgress } = useJourneyProgress();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Page Header */}
      <header>
        <div className="flex items-center gap-3 mb-2">
          <MapPin className="h-7 w-7 text-primary" aria-hidden="true" />
          <h1 className="text-2xl sm:text-3xl font-bold">Financial Journey</h1>
        </div>
        <p className="text-muted-foreground">
          Your path to financial freedom — one step at a time.
        </p>
      </header>

      {/* Overall Progress Card */}
      <Card className="shadow-royal">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" aria-hidden="true" />
                Overall Progress
              </CardTitle>
              <CardDescription>
                {completedSteps} of {totalSteps} steps complete
              </CardDescription>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">
                {Math.round(overallProgress)}%
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="h-3 mb-6" />
          <JourneyProgressBar steps={steps} currentStep={steps.find(s => s.status === 'current')?.id ?? totalSteps} />
        </CardContent>
      </Card>

      {/* Journey Timeline */}
      <section aria-labelledby="journey-timeline-heading">
        <h2 id="journey-timeline-heading" className="sr-only">
          Journey Steps Timeline
        </h2>
        <div className="space-y-4">
          {steps.map((step) => (
            <JourneyStepCard key={step.id} step={step} />
          ))}
        </div>
      </section>

      {/* Completion Message */}
      {completedSteps === totalSteps && (
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 shadow-royal">
          <CardContent className="py-8 text-center">
            <Trophy className="h-12 w-12 text-amber-500 mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-xl font-bold mb-2">Financial Freedom Achieved</h3>
            <p className="text-muted-foreground">
              You've reached every milestone. You now own your time.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
