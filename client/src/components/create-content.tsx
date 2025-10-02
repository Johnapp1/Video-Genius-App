import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Wand2, Upload, Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CreateContentProps {
  onShowProgress: (projectId?: string) => void;
  onShowResults: (projectId: string) => void;
}

type Workflow = "ai-generate" | "upload-script" | null;

const aiGenerateSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  videoLength: z.string().min(1, "Video length is required"),
  contentTemplate: z.string().optional(),
  tone: z.string().min(1, "Tone is required"),
  selectedContentTypes: z.array(z.string()).min(1, "Select at least one content type"),
});

const uploadScriptSchema = z.object({
  title: z.string().min(1, "Title is required"),
  script: z.string().min(1, "Script is required"),
  videoLength: z.string().min(1, "Video length is required"),
  tone: z.string().min(1, "Tone is required"),
  selectedContentTypes: z.array(z.string()).min(1, "Select at least one content type"),
});

type AIGenerateFormData = z.infer<typeof aiGenerateSchema>;
type UploadScriptFormData = z.infer<typeof uploadScriptSchema>;

const contentTypes = [
  { id: "script", label: "Script" },
  { id: "seo", label: "SEO Package" },
  { id: "thumbnails", label: "Thumbnails" },
  { id: "imagePrompts", label: "Image Prompts" },
  { id: "music", label: "Music Prompts" },
  { id: "bulletPoints", label: "Bullet Points" },
];

const videoLengths = [
  "75 seconds (Short)",
  "3-5 minutes (Standard)",
  "8-12 minutes (Extended)",
  "15-20 minutes (Deep Dive)",
  "20+ minutes (Comprehensive)",
];

const toneOptions = [
  { value: "informative", label: "Informative/Professional", description: "Clear, accurate information with expert delivery" },
  { value: "casual", label: "Casual/Conversational", description: "Friendly and approachable with natural speaking style" },
  { value: "comedic", label: "Comedic", description: "Jokes, witty remarks, and entertaining style" },
  { value: "storytelling", label: "Storytelling", description: "Narrative structure with emotional engagement" },
  { value: "persuasive", label: "Persuasive", description: "Convincing approach for reviews and opinions" },
  { value: "empathetic", label: "Sensitive/Empathetic", description: "Sympathetic approach for emotional topics" },
  { value: "experimental", label: "Experimental", description: "Unique styles and unconventional structures" },
];

const templates = [
  { category: "List & Countdown Style", options: [
    "Top 10 [___] You Must Know",
    "10 Ways to [] Without []",
    "5 Mistakes to Avoid When [___]",
    "7 Secrets About [___] Nobody Tells You",
    "The 3 Best [___] for Beginners",
    "10 Tools Every [___] Needs",
    "Top 5 Myths About [___] Debunked",
    "10 Hacks to Make [___] Easier",
  ]},
  { category: "How-To & Tutorial Style", options: [
    "How to [___] Step by Step",
    "How I [___] in [X Days/Months]",
    "The Easiest Way to [___] Even if You're a Beginner",
    "A Beginner's Guide to [___]",
    "The Ultimate Tutorial for [___]",
    "Learn [___] in 10 Minutes",
    "How to [___] Like a Pro",
    "From Zero to [___]: My Process",
  ]},
  { category: "Problem-Solution Style", options: [
    "Struggling with [___]? Try This!",
    "Why You're Failing at [___] (And How to Fix It)",
    "The Fastest Way to Solve [___]",
    "Don't Do [___] Until You Watch This",
    "The Best Solution for [___] Problems",
    "How to Stop [___] Once and for All",
    "What to Do If [___] Happens",
  ]},
  { category: "Transformation & Results Style", options: [
    "I Tried [___] for 30 Days — Here's What Happened",
    "Before and After: [___] Transformation",
    "My Journey from [] to []",
    "What Happened When I Stopped [___]",
    "This Changed My [___] Forever",
    "The Truth About [___] Nobody Shares",
    "[X]-Day Challenge: [___] Edition",
  ]},
  { category: "Expert & Opinion Style", options: [
    "The Future of [___] in [Year]",
    "Is [___] Really Worth It?",
    "What Experts Think About [___]",
    "The Biggest Mistakes I Made With [___]",
    "Why [___] Doesn't Work Anymore",
    "The Best Advice I Ever Got About [___]",
    "My Honest Review of [___]",
  ]},
];

export default function CreateContent({ onShowProgress, onShowResults }: CreateContentProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow>(null);
  const { toast } = useToast();

  const aiForm = useForm<AIGenerateFormData>({
    resolver: zodResolver(aiGenerateSchema),
    defaultValues: {
      selectedContentTypes: ["script", "seo", "thumbnails", "imagePrompts", "music", "bulletPoints"],
    },
  });

  const scriptForm = useForm<UploadScriptFormData>({
    resolver: zodResolver(uploadScriptSchema),
    defaultValues: {
      selectedContentTypes: ["seo", "thumbnails", "imagePrompts", "music", "bulletPoints"],
    },
  });

  const generateContentMutation = useMutation({
    mutationFn: async (data: AIGenerateFormData) => {
      const res = await apiRequest("POST", "/api/generate/ai-content", data);
      return await res.json();
    },
    onSuccess: (project) => {
      toast({
        title: "Content Generated Successfully!",
        description: "Your AI-generated content package is ready.",
      });
      onShowResults(project.id);
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateFromScriptMutation = useMutation({
    mutationFn: async (data: UploadScriptFormData) => {
      const res = await apiRequest("POST", "/api/generate/script-content", data);
      return await res.json();
    },
    onSuccess: (project) => {
      toast({
        title: "Content Generated Successfully!",
        description: "Your content package from script is ready.",
      });
      onShowResults(project.id);
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onAISubmit = async (data: AIGenerateFormData) => {
    onShowProgress();
    // Add delay to show progress
    setTimeout(() => {
      generateContentMutation.mutate(data);
    }, 3000);
  };

  const onScriptSubmit = async (data: UploadScriptFormData) => {
    onShowProgress();
    // Add delay to show progress
    setTimeout(() => {
      generateFromScriptMutation.mutate(data);
    }, 3000);
  };

  const isLoading = generateContentMutation.isPending || generateFromScriptMutation.isPending;

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create New Content</h2>
          <p className="text-gray-600">Choose your workflow and generate amazing YouTube content with AI</p>
        </div>

        {/* Workflow Selection */}
        <Card className="border border-gray-200 mb-8">
          <CardHeader>
            <CardTitle>Choose Your Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div 
                className={`border-2 rounded-lg p-6 cursor-pointer transition-colors ${
                  selectedWorkflow === "ai-generate" ? "border-primary" : "border-gray-200"
                } hover:border-primary`}
                onClick={() => setSelectedWorkflow("ai-generate")}
                data-testid="workflow-ai-generate"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4">
                    <Wand2 className="text-white" size={24} />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">AI Generate Complete Package</h4>
                </div>
                <p className="text-gray-600">
                  Let AI create everything: script, SEO, thumbnails, and production assets from your topic and preferences.
                </p>
              </div>
              
              <div 
                className={`border-2 rounded-lg p-6 cursor-pointer transition-colors ${
                  selectedWorkflow === "upload-script" ? "border-secondary" : "border-gray-200"
                } hover:border-secondary`}
                onClick={() => setSelectedWorkflow("upload-script")}
                data-testid="workflow-upload-script"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mr-4">
                    <Upload className="text-white" size={24} />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Upload Custom Script</h4>
                </div>
                <p className="text-gray-600">
                  Have your own script? Upload it and generate SEO package, thumbnails, and production assets.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Generate Form */}
        {selectedWorkflow === "ai-generate" && (
          <Card className="border border-gray-200 mb-6">
            <CardHeader>
              <CardTitle>Content Generation Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={aiForm.handleSubmit(onAISubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="ai-topic" className="block text-sm font-medium text-gray-700 mb-2">
                      Video Topic/Title
                    </Label>
                    <Input
                      id="ai-topic"
                      className="border-2 border-red-500 focus:ring-red-500 focus:border-red-500"
                      placeholder="e.g., How to Master YouTube SEO in 2024"
                      {...aiForm.register("topic")}
                      data-testid="input-topic"
                    />
                    {aiForm.formState.errors.topic && (
                      <p className="text-red-500 text-sm mt-1">{aiForm.formState.errors.topic.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="ai-length" className="block text-sm font-medium text-gray-700 mb-2">
                      Video Length
                    </Label>
                    <Controller
                      name="videoLength"
                      control={aiForm.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="border-2 border-red-500 focus:ring-red-500 focus:border-red-500" data-testid="select-video-length">
                            <SelectValue placeholder="Select video length" />
                          </SelectTrigger>
                          <SelectContent>
                            {videoLengths.map((length) => (
                              <SelectItem key={length} value={length}>{length}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {aiForm.formState.errors.videoLength && (
                      <p className="text-red-500 text-sm mt-1">{aiForm.formState.errors.videoLength.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="ai-tone" className="block text-sm font-medium text-gray-700 mb-2">
                      Script Tone
                    </Label>
                    <Controller
                      name="tone"
                      control={aiForm.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="border-2 border-red-500 focus:ring-red-500 focus:border-red-500" data-testid="select-tone">
                            <SelectValue placeholder="Select script tone" />
                          </SelectTrigger>
                          <SelectContent>
                            {toneOptions.map((tone) => (
                              <SelectItem key={tone.value} value={tone.value}>
                                <div>
                                  <div className="font-medium">{tone.label}</div>
                                  <div className="text-xs text-gray-500">{tone.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {aiForm.formState.errors.tone && (
                      <p className="text-red-500 text-sm mt-1">{aiForm.formState.errors.tone.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="ai-template" className="block text-sm font-medium text-gray-700 mb-2">
                    Content Template (Optional)
                  </Label>
                  <Controller
                    name="contentTemplate"
                    control={aiForm.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="border-2 border-red-500 focus:ring-red-500 focus:border-red-500" data-testid="select-template">
                          <SelectValue placeholder="Select a template..." />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((category) => (
                            <div key={category.category}>
                              <div className="px-2 py-1 text-sm font-semibold text-gray-500">{category.category}</div>
                              {category.options.map((option) => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Content to Generate
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {contentTypes.map((type) => (
                      <label key={type.id} className="flex items-center space-x-3">
                        <Checkbox
                          className="border-2 border-red-500 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          checked={aiForm.watch("selectedContentTypes").includes(type.id)}
                          onCheckedChange={(checked) => {
                            const current = aiForm.getValues("selectedContentTypes");
                            if (checked) {
                              aiForm.setValue("selectedContentTypes", [...current, type.id]);
                            } else {
                              aiForm.setValue("selectedContentTypes", current.filter(id => id !== type.id));
                            }
                          }}
                          data-testid={`checkbox-${type.id}`}
                        />
                        <span className="text-sm font-medium text-gray-700">{type.label}</span>
                      </label>
                    ))}
                  </div>
                  {aiForm.formState.errors.selectedContentTypes && (
                    <p className="text-red-500 text-sm mt-1">{aiForm.formState.errors.selectedContentTypes.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary text-white hover:bg-red-700 transition-colors"
                  disabled={isLoading}
                  data-testid="button-generate-content"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2" size={16} />
                      Generate Content Package
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Upload Script Form */}
        {selectedWorkflow === "upload-script" && (
          <Card className="border border-gray-200 mb-6">
            <CardHeader>
              <CardTitle>Upload Your Custom Script</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={scriptForm.handleSubmit(onScriptSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="script-content" className="block text-sm font-medium text-gray-700 mb-2">
                    Video Script
                  </Label>
                  <Textarea
                    id="script-content"
                    className="border-2 border-red-500 focus:ring-red-500 focus:border-red-500 h-64 resize-none"
                    placeholder="Paste your video script here..."
                    {...scriptForm.register("script")}
                    data-testid="textarea-script"
                  />
                  <p className="text-sm text-gray-500 mt-2">Or drag and drop a text file here</p>
                  {scriptForm.formState.errors.script && (
                    <p className="text-red-500 text-sm mt-1">{scriptForm.formState.errors.script.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="script-title" className="block text-sm font-medium text-gray-700 mb-2">
                      Video Title
                    </Label>
                    <Input
                      id="script-title"
                      className="border-2 border-red-500 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter video title"
                      {...scriptForm.register("title")}
                      data-testid="input-script-title"
                    />
                    {scriptForm.formState.errors.title && (
                      <p className="text-red-500 text-sm mt-1">{scriptForm.formState.errors.title.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="script-length" className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Length
                    </Label>
                    <Controller
                      name="videoLength"
                      control={scriptForm.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="border-2 border-red-500 focus:ring-red-500 focus:border-red-500" data-testid="select-script-length">
                            <SelectValue placeholder="Select video length" />
                          </SelectTrigger>
                          <SelectContent>
                            {videoLengths.map((length) => (
                              <SelectItem key={length} value={length}>{length}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {scriptForm.formState.errors.videoLength && (
                      <p className="text-red-500 text-sm mt-1">{scriptForm.formState.errors.videoLength.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="script-tone" className="block text-sm font-medium text-gray-700 mb-2">
                      Script Tone
                    </Label>
                    <Controller
                      name="tone"
                      control={scriptForm.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="border-2 border-red-500 focus:ring-red-500 focus:border-red-500" data-testid="select-script-tone">
                            <SelectValue placeholder="Select script tone" />
                          </SelectTrigger>
                          <SelectContent>
                            {toneOptions.map((tone) => (
                              <SelectItem key={tone.value} value={tone.value}>
                                <div>
                                  <div className="font-medium">{tone.label}</div>
                                  <div className="text-xs text-gray-500">{tone.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {scriptForm.formState.errors.tone && (
                      <p className="text-red-500 text-sm mt-1">{scriptForm.formState.errors.tone.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Content to Generate
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {contentTypes.filter(type => type.id !== "script").map((type) => (
                      <label key={type.id} className="flex items-center space-x-3">
                        <Checkbox
                          className="border-2 border-red-500 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          checked={scriptForm.watch("selectedContentTypes").includes(type.id)}
                          onCheckedChange={(checked) => {
                            const current = scriptForm.getValues("selectedContentTypes");
                            if (checked) {
                              scriptForm.setValue("selectedContentTypes", [...current, type.id]);
                            } else {
                              scriptForm.setValue("selectedContentTypes", current.filter(id => id !== type.id));
                            }
                          }}
                          data-testid={`checkbox-script-${type.id}`}
                        />
                        <span className="text-sm font-medium text-gray-700">{type.label}</span>
                      </label>
                    ))}
                  </div>
                  {scriptForm.formState.errors.selectedContentTypes && (
                    <p className="text-red-500 text-sm mt-1">{scriptForm.formState.errors.selectedContentTypes.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-secondary text-white hover:bg-blue-700 transition-colors"
                  disabled={isLoading}
                  data-testid="button-process-script"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2" size={16} />
                      Process Script & Generate Package
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
