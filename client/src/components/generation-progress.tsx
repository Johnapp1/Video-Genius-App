import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wand2, CheckCircle, Loader2, Search, Image, Music, PartyPopper } from "lucide-react";

interface GenerationProgressProps {
  onShowResults: (projectId?: string) => void;
  projectId: string | null;
}

interface ProgressStep {
  id: string;
  title: string;
  icon: React.ReactNode;
  status: "pending" | "in_progress" | "completed";
}

export default function GenerationProgress({ onShowResults, projectId }: GenerationProgressProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  const [steps, setSteps] = useState<ProgressStep[]>([
    {
      id: "analyze",
      title: "Analyzing topic and requirements",
      icon: <Search size={20} />,
      status: "pending",
    },
    {
      id: "script",
      title: "Generating video script",
      icon: <Wand2 size={20} />,
      status: "pending",
    },
    {
      id: "seo",
      title: "Creating SEO package",
      icon: <Search size={20} />,
      status: "pending",
    },
    {
      id: "thumbnails",
      title: "Designing thumbnail concepts",
      icon: <Image size={20} />,
      status: "pending",
    },
    {
      id: "assets",
      title: "Generating production assets",
      icon: <Music size={20} />,
      status: "pending",
    },
  ]);

  useEffect(() => {
    // Simulate progress
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          setTimeout(() => setIsComplete(true), 1000);
          return 100;
        }
        return prev + 20;
      });
    }, 1000);

    const stepTimer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(stepTimer);
          return prev;
        }
        
        // Update current step to in progress
        setSteps(prevSteps => 
          prevSteps.map((step, index) => {
            if (index === prev) {
              return { ...step, status: "in_progress" };
            }
            return step;
          })
        );

        // Mark previous step as completed after delay
        setTimeout(() => {
          setSteps(prevSteps => 
            prevSteps.map((step, index) => {
              if (index === prev) {
                return { ...step, status: "completed" };
              }
              return step;
            })
          );
        }, 800);

        return prev + 1;
      });
    }, 1200);

    return () => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
    };
  }, [onShowResults, steps.length]);

  const getStepIcon = (step: ProgressStep) => {
    switch (step.status) {
      case "completed":
        return <CheckCircle className="text-green-600" size={20} />;
      case "in_progress":
        return <Loader2 className="text-yellow-600 animate-spin" size={20} />;
      default:
        return <div className="text-gray-400">{step.icon}</div>;
    }
  };

  const getStepTextColor = (step: ProgressStep) => {
    switch (step.status) {
      case "completed":
        return "text-gray-900";
      case "in_progress":
        return "text-gray-900";
      default:
        return "text-gray-600";
    }
  };

  const getStepStatusText = (step: ProgressStep) => {
    switch (step.status) {
      case "completed":
        return "Completed";
      case "in_progress":
        return "In Progress";
      default:
        return "Pending";
    }
  };

  const getStepStatusColor = (step: ProgressStep) => {
    switch (step.status) {
      case "completed":
        return "text-green-600";
      case "in_progress":
        return "text-yellow-600";
      default:
        return "text-gray-400";
    }
  };

  if (isComplete) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border border-gray-200">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <PartyPopper className="text-green-600" size={40} data-testid="icon-success" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Content Generated Successfully!</h2>
                <p className="text-gray-600 mb-8 text-lg">
                  Your AI-powered YouTube content package is ready to view. All your scripts, SEO optimization, thumbnails, and production assets have been created.
                </p>
                <Button 
                  onClick={() => onShowResults()}
                  className="bg-primary text-white hover:bg-red-700 px-8 py-6 text-lg font-semibold transition-colors"
                  data-testid="button-view-content"
                  disabled={!projectId}
                >
                  <CheckCircle className="mr-2" size={20} />
                  View Your Content
                </Button>
                {!projectId && (
                  <p className="text-sm text-gray-500 mt-4">Waiting for content generation to complete...</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="border border-gray-200">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Wand2 className="text-white text-2xl" size={32} data-testid="icon-generation" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Your Content Package</h2>
              <p className="text-gray-600">Please wait while AI creates your video content...</p>
            </div>

            <div className="space-y-6 mb-8">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center justify-between" data-testid={`step-${step.id}`}>
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100">
                      {getStepIcon(step)}
                    </div>
                    <span className={`font-medium ${getStepTextColor(step)}`}>
                      {step.title}
                    </span>
                  </div>
                  <span className={`font-medium ${getStepStatusColor(step)}`} data-testid={`status-${step.id}`}>
                    {getStepStatusText(step)}
                  </span>
                </div>
              ))}
            </div>

            <div>
              <div className="bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-primary h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                  data-testid="progress-bar"
                ></div>
              </div>
              <p className="text-center text-sm text-gray-600" data-testid="progress-text">
                {progress}% Complete - Estimated time: {progress < 100 ? "2-3 minutes" : "Complete!"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
