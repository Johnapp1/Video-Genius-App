import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Save, 
  Download, 
  Copy, 
  CheckCircle,
  FileText,
  Search,
  Image,
  Music,
  List
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@shared/schema";

interface GeneratedResultsProps {
  projectId: string | null;
  onShowSection: (section: "dashboard" | "projects") => void;
}

interface MusicPrompt {
  prompt?: string;
  BPM?: string;
  style?: string;
  mood?: string;
}

interface GeneratedContent {
  script?: {
    hook: { title: string; content: string; duration: string };
    introduction: { title: string; content: string; duration: string };
    mainContent: Array<{ title: string; content: string; duration?: string }>;
    conclusion: { title: string; content: string; duration: string };
    totalWords: number;
    estimatedDuration: string;
  };
  seo?: {
    titles: string[];
    description: string;
    tags: string[];
  };
  thumbnails?: {
    conceptName: string;
    description: string;
    curiosityWords: string[];
    concepts: Array<{ name: string; description: string }>;
    aiPrompts: string[];
  };
  assets?: {
    musicPrompts: (string | MusicPrompt)[];
    imagePrompts: string[];
    bulletPoints: Array<{ title: string; subPoints: string[] }>;
  };
}

export default function GeneratedResults({ projectId, onShowSection }: GeneratedResultsProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
    enabled: !!projectId,
  });

  const generatedContent = project?.generatedContent as GeneratedContent | undefined;

  const copyToClipboard = async (content: string, sectionName: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedSection(sectionName);
      toast({
        title: "Copied to Clipboard",
        description: `${sectionName} content has been copied.`,
      });
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy content to clipboard.",
        variant: "destructive",
      });
    }
  };

  const copyScriptContent = () => {
    if (!generatedContent?.script) return;
    
    const script = generatedContent.script;
    const fullScript = `
${script.hook.title}
${script.hook.content}

${script.introduction.title}
${script.introduction.content}

${script.mainContent.map(section => `${section.title}\n${section.content}`).join('\n\n')}

${script.conclusion.title}
${script.conclusion.content}
    `.trim();
    
    copyToClipboard(fullScript, "Script");
  };

  const copySEOContent = () => {
    if (!generatedContent?.seo) return;
    
    const seo = generatedContent.seo;
    const seoContent = `
TITLES:
${seo.titles.map((title, index) => `${index + 1}. ${title}`).join('\n')}

DESCRIPTION:
${seo.description}

TAGS:
${seo.tags.join(', ')}
    `.trim();
    
    copyToClipboard(seoContent, "SEO Package");
  };

  const copyThumbnailContent = () => {
    if (!generatedContent?.thumbnails) return;
    
    const thumbnails = generatedContent.thumbnails;
    const thumbnailContent = `
CURIOSITY WORDS:
${thumbnails.curiosityWords.join(', ')}

DESIGN CONCEPTS:
${thumbnails.concepts?.map((concept, index) => `${index + 1}. ${concept.name}: ${concept.description}`).join('\n')}

AI GENERATION PROMPTS:
${thumbnails.aiPrompts?.map((prompt, index) => `${index + 1}. ${prompt}`).join('\n')}
    `.trim();
    
    copyToClipboard(thumbnailContent, "Thumbnail Concepts");
  };

  const copyAssetsContent = () => {
    if (!generatedContent?.assets) return;
    
    const assets = generatedContent.assets;
    const assetsContent = `
MUSIC PROMPTS:
${assets.musicPrompts?.map((prompt, index) => {
  if (typeof prompt === 'string') {
    return `${index + 1}. ${prompt}`;
  } else {
    const parts = [];
    if (prompt.prompt) parts.push(`Style: ${prompt.prompt}`);
    if (prompt.BPM) parts.push(`BPM: ${prompt.BPM}`);
    if (prompt.style) parts.push(`Genre: ${prompt.style}`);
    if (prompt.mood) parts.push(`Mood: ${prompt.mood}`);
    return `${index + 1}. ${parts.join(', ')}`;
  }
}).join('\n')}

IMAGE PROMPTS:
${assets.imagePrompts?.map((prompt, index) => `${index + 1}. ${prompt}`).join('\n')}

BULLET POINTS:
${assets.bulletPoints?.map((point, index) => `${index + 1}. ${point.title}\n${point.subPoints.map(sub => `   • ${sub}`).join('\n')}`).join('\n\n')}
    `.trim();
    
    copyToClipboard(assetsContent, "Production Assets");
  };

  const exportAllContent = () => {
    if (!generatedContent) return;
    
    let allContent = `AI YOUTUBE CREATOR STUDIO - CONTENT PACKAGE\n`;
    allContent += `Project: ${project?.title || 'Untitled'}\n`;
    allContent += `Generated: ${new Date().toLocaleDateString()}\n`;
    allContent += `${'='.repeat(50)}\n\n`;

    if (generatedContent.script) {
      const script = generatedContent.script;
      allContent += `VIDEO SCRIPT\n${'='.repeat(20)}\n\n`;
      allContent += `${script.hook.title}\n${script.hook.content}\n\n`;
      allContent += `${script.introduction.title}\n${script.introduction.content}\n\n`;
      allContent += script.mainContent.map(section => `${section.title}\n${section.content}`).join('\n\n');
      allContent += `\n\n${script.conclusion.title}\n${script.conclusion.content}\n\n`;
    }

    if (generatedContent.seo) {
      const seo = generatedContent.seo;
      allContent += `SEO PACKAGE\n${'='.repeat(20)}\n\n`;
      allContent += `TITLES:\n${seo.titles.map((title, index) => `${index + 1}. ${title}`).join('\n')}\n\n`;
      allContent += `DESCRIPTION:\n${seo.description}\n\n`;
      allContent += `TAGS:\n${seo.tags.join(', ')}\n\n`;
    }

    if (generatedContent.thumbnails) {
      const thumbnails = generatedContent.thumbnails;
      allContent += `THUMBNAIL CONCEPTS\n${'='.repeat(20)}\n\n`;
      allContent += `CURIOSITY WORDS:\n${thumbnails.curiosityWords.join(', ')}\n\n`;
      if (thumbnails.concepts) {
        allContent += `DESIGN CONCEPTS:\n${thumbnails.concepts.map((concept, index) => `${index + 1}. ${concept.name}: ${concept.description}`).join('\n')}\n\n`;
      }
      if (thumbnails.aiPrompts) {
        allContent += `AI GENERATION PROMPTS:\n${thumbnails.aiPrompts.map((prompt, index) => `${index + 1}. ${prompt}`).join('\n')}\n\n`;
      }
    }

    if (generatedContent.assets) {
      const assets = generatedContent.assets;
      allContent += `PRODUCTION ASSETS\n${'='.repeat(20)}\n\n`;
      if (assets.musicPrompts) {
        allContent += `MUSIC PROMPTS:\n${assets.musicPrompts.map((prompt, index) => `${index + 1}. ${prompt}`).join('\n')}\n\n`;
      }
      if (assets.imagePrompts) {
        allContent += `IMAGE PROMPTS:\n${assets.imagePrompts.map((prompt, index) => `${index + 1}. ${prompt}`).join('\n')}\n\n`;
      }
      if (assets.bulletPoints) {
        allContent += `BULLET POINTS:\n${assets.bulletPoints.map((point, index) => `${index + 1}. ${point.title}\n${point.subPoints.map(sub => `   • ${sub}`).join('\n')}`).join('\n\n')}\n`;
      }
    }

    copyToClipboard(allContent, "Complete Content Package");
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="border border-gray-200">
                  <CardHeader className="border-b border-gray-200">
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project || !generatedContent) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="border border-gray-200">
            <CardContent className="p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Content Not Found</h3>
              <p className="text-gray-600 mb-4">The requested content package could not be found.</p>
              <Button 
                onClick={() => onShowSection("dashboard")}
                className="bg-primary text-white hover:bg-red-700"
                data-testid="button-back-to-dashboard"
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Content Package is Ready!</h2>
            <p className="text-gray-600">Review, edit, and export your AI-generated content</p>
          </div>
          <div className="flex space-x-4">
            <Button 
              className="bg-green-500 text-white hover:bg-green-600 transition-colors"
              onClick={() => onShowSection("projects")}
              data-testid="button-save-project"
            >
              <Save className="mr-2" size={16} />
              Back to Projects
            </Button>
            <Button 
              className="bg-primary text-white hover:bg-red-700 transition-colors"
              onClick={exportAllContent}
              data-testid="button-export-all"
            >
              <Download className="mr-2" size={16} />
              Export All
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Script */}
          {generatedContent.script && (
            <Card className="border border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                    <FileText className="mr-2" size={20} />
                    Video Script
                  </CardTitle>
                  <Button
                    variant="ghost"
                    className={`text-primary hover:text-red-700 font-medium ${copiedSection === "Script" ? "text-green-600" : ""}`}
                    onClick={copyScriptContent}
                    data-testid="button-copy-script"
                  >
                    {copiedSection === "Script" ? (
                      <>
                        <CheckCircle className="mr-1" size={16} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1" size={16} />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose max-w-none space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {typeof generatedContent.script.hook.title === 'string' ? generatedContent.script.hook.title : JSON.stringify(generatedContent.script.hook.title)}
                    </h4>
                    <div className="text-gray-700 bg-gray-50 p-3 rounded" data-testid="content-script-hook">
                      {typeof generatedContent.script.hook.content === 'string' ? generatedContent.script.hook.content : JSON.stringify(generatedContent.script.hook.content)}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {typeof generatedContent.script.introduction.title === 'string' ? generatedContent.script.introduction.title : JSON.stringify(generatedContent.script.introduction.title)}
                    </h4>
                    <div className="text-gray-700 bg-gray-50 p-3 rounded" data-testid="content-script-intro">
                      {typeof generatedContent.script.introduction.content === 'string' ? generatedContent.script.introduction.content : JSON.stringify(generatedContent.script.introduction.content)}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Main Content</h4>
                    <div className="space-y-4" data-testid="content-script-main">
                      {generatedContent.script.mainContent.map((section, index) => (
                        <div key={index}>
                          <h5 className="font-medium text-gray-900 mb-2">
                            {typeof section.title === 'string' ? section.title : JSON.stringify(section.title)}
                          </h5>
                          <div className="text-gray-700 bg-gray-50 p-3 rounded">
                            {typeof section.content === 'string' ? section.content : JSON.stringify(section.content)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {typeof generatedContent.script.conclusion.title === 'string' ? generatedContent.script.conclusion.title : JSON.stringify(generatedContent.script.conclusion.title)}
                    </h4>
                    <div className="text-gray-700 bg-gray-50 p-3 rounded" data-testid="content-script-conclusion">
                      {typeof generatedContent.script.conclusion.content === 'string' ? generatedContent.script.conclusion.content : JSON.stringify(generatedContent.script.conclusion.content)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-600">
                      Words: {generatedContent.script.totalWords}
                    </span>
                    <span className="text-sm text-gray-600">
                      Duration: {generatedContent.script.estimatedDuration}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEO Package */}
          {generatedContent.seo && (
            <Card className="border border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                    <Search className="mr-2" size={20} />
                    SEO Package
                  </CardTitle>
                  <Button
                    variant="ghost"
                    className={`text-primary hover:text-red-700 font-medium ${copiedSection === "SEO Package" ? "text-green-600" : ""}`}
                    onClick={copySEOContent}
                    data-testid="button-copy-seo"
                  >
                    {copiedSection === "SEO Package" ? (
                      <>
                        <CheckCircle className="mr-1" size={16} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1" size={16} />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Optimized Titles (5)</h4>
                    <div className="space-y-2" data-testid="content-seo-titles">
                      {generatedContent.seo.titles.map((title, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded">
                          {index + 1}. {typeof title === 'string' ? title : JSON.stringify(title)}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
                    <div className="p-3 bg-gray-50 rounded text-sm whitespace-pre-wrap" data-testid="content-seo-description">
                      {typeof generatedContent.seo.description === 'string' ? generatedContent.seo.description : JSON.stringify(generatedContent.seo.description)}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2" data-testid="content-seo-tags">
                      {generatedContent.seo.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Thumbnail Concepts */}
          {generatedContent.thumbnails && (
            <Card className="border border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                    <Image className="mr-2" size={20} />
                    Thumbnail Concepts
                  </CardTitle>
                  <Button
                    variant="ghost"
                    className={`text-primary hover:text-red-700 font-medium ${copiedSection === "Thumbnail Concepts" ? "text-green-600" : ""}`}
                    onClick={copyThumbnailContent}
                    data-testid="button-copy-thumbnails"
                  >
                    {copiedSection === "Thumbnail Concepts" ? (
                      <>
                        <CheckCircle className="mr-1" size={16} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1" size={16} />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Curiosity-Driven Phrases (5)</h4>
                    <div className="flex flex-wrap gap-2" data-testid="content-thumbnail-words">
                      {generatedContent.thumbnails.curiosityWords.map((word, index) => (
                        <Badge key={index} className="bg-red-100 text-red-800 font-semibold">
                          {typeof word === 'string' ? word : JSON.stringify(word)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {generatedContent.thumbnails.concepts && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Design Concepts</h4>
                      <div className="space-y-4" data-testid="content-thumbnail-concepts">
                        {generatedContent.thumbnails.concepts.map((concept, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg">
                            <h5 className="font-medium text-gray-900 mb-2">
                              {typeof concept.name === 'string' ? concept.name : JSON.stringify(concept.name)}
                            </h5>
                            <p className="text-sm text-gray-600">
                              {typeof concept.description === 'string' ? concept.description : JSON.stringify(concept.description)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {generatedContent.thumbnails.aiPrompts && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">AI Generation Prompts</h4>
                      <div className="space-y-3" data-testid="content-thumbnail-prompts">
                        {generatedContent.thumbnails.aiPrompts.map((prompt, index) => (
                          <div key={index} className="p-3 bg-blue-50 rounded text-sm">
                            <strong>Prompt {index + 1}:</strong> {typeof prompt === 'string' ? prompt : JSON.stringify(prompt)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Production Assets */}
          {generatedContent.assets && (
            <Card className="border border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                    <Music className="mr-2" size={20} />
                    Production Assets
                  </CardTitle>
                  <Button
                    variant="ghost"
                    className={`text-primary hover:text-red-700 font-medium ${copiedSection === "Production Assets" ? "text-green-600" : ""}`}
                    onClick={copyAssetsContent}
                    data-testid="button-copy-assets"
                  >
                    {copiedSection === "Production Assets" ? (
                      <>
                        <CheckCircle className="mr-1" size={16} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1" size={16} />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {generatedContent.assets.musicPrompts && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Background Music Prompts</h4>
                      <div className="space-y-3" data-testid="content-assets-music">
                        {generatedContent.assets.musicPrompts.map((prompt, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded">
                            <strong>Style {index + 1}:</strong>
                            {typeof prompt === 'string' ? (
                              <span> {prompt}</span>
                            ) : (
                              <div className="mt-2">
                                {prompt.prompt && <div><strong>Style:</strong> {typeof prompt.prompt === 'string' ? prompt.prompt : JSON.stringify(prompt.prompt)}</div>}
                                {prompt.BPM && <div><strong>BPM:</strong> {typeof prompt.BPM === 'string' ? prompt.BPM : JSON.stringify(prompt.BPM)}</div>}
                                {prompt.style && <div><strong>Genre:</strong> {typeof prompt.style === 'string' ? prompt.style : JSON.stringify(prompt.style)}</div>}
                                {prompt.mood && <div><strong>Mood:</strong> {typeof prompt.mood === 'string' ? prompt.mood : JSON.stringify(prompt.mood)}</div>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {generatedContent.assets.imagePrompts && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Image Prompts</h4>
                      <div className="space-y-3" data-testid="content-assets-images">
                        {generatedContent.assets.imagePrompts.map((prompt, index) => (
                          <div key={index} className="p-3 bg-green-50 rounded">
                            <strong>Prompt {index + 1}:</strong> {typeof prompt === 'string' ? prompt : JSON.stringify(prompt)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {generatedContent.assets.bulletPoints && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Main Bullet Points</h4>
                      <div className="space-y-4" data-testid="content-assets-bullets">
                        {generatedContent.assets.bulletPoints.map((point, index) => (
                          <div key={index} className={`border-l-4 pl-4 ${
                            index === 0 ? 'border-primary' : 
                            index === 1 ? 'border-secondary' : 
                            index === 2 ? 'border-green-500' : 
                            index === 3 ? 'border-yellow-500' : 'border-purple-500'
                          }`}>
                            <h5 className="font-medium text-gray-900">
                              {index + 1}. {typeof point.title === 'string' ? point.title : JSON.stringify(point.title)}
                            </h5>
                            <ul className="mt-2 space-y-1 text-sm text-gray-600">
                              {point.subPoints.map((subPoint, subIndex) => (
                                <li key={subIndex}>
                                  • {typeof subPoint === 'string' ? subPoint : JSON.stringify(subPoint)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
