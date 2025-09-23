import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

interface ScriptSection {
  title: string;
  content: string;
  duration?: string;
}

interface GeneratedScript {
  hook: ScriptSection;
  introduction: ScriptSection;
  mainContent: ScriptSection[];
  conclusion: ScriptSection;
  totalWords: number;
  estimatedDuration: string;
}

interface SEOPackage {
  titles: string[];
  description: string;
  tags: string[];
}

interface ThumbnailConcept {
  conceptName: string;
  description: string;
  curiosityWords: string[];
  aiPrompts: string[];
}

interface ProductionAssets {
  musicPrompts: string[];
  imagePrompts: string[];
  bulletPoints: {
    title: string;
    subPoints: string[];
  }[];
}

interface GeneratedContent {
  script?: GeneratedScript;
  seo?: SEOPackage;
  thumbnails?: ThumbnailConcept;
  assets?: ProductionAssets;
}

const AVOIDED_PHRASES = [
  "Let's dive into",
  "Today, we're going to uncover",
  "Have you ever wondered why",
  "In this video, I'll walk you through",
  "By the end of this video, you'll know exactly how to",
  "If you've been struggling with",
  "So, let's get started",
  "Here's what you need to know about",
  "Welcome back to another episode of",
  "Let's break this down step by step",
  "Now, let's move on to",
  "But that's not all",
  "Here's where it gets interesting",
  "The next step is crucial",
  "On the other hand",
  "What does this mean for you",
  "That brings us to the next point",
  "Before we continue, let's quickly recap",
  "So far, we've covered",
  "Next up, we have",
  "Let's embark on this journey together",
  "We're about to delve deeper into",
  "Think of this as your roadmap to",
  "Join me as we explore",
  "Let's take a closer look",
  "We're stepping into the world of",
  "Let's uncover the secrets behind",
  "We're peeling back the layers of",
  "Let's explore this step by step",
  "Together, we'll navigate through"
];

function getDurationInMinutes(videoLength: string): number {
  switch (videoLength) {
    case "75 seconds (Short)": return 1.25;
    case "3-5 minutes (Standard)": return 4;
    case "8-12 minutes (Extended)": return 10;
    case "15-20 minutes (Deep Dive)": return 17.5;
    case "20+ minutes (Comprehensive)": return 25;
    default: return 4;
  }
}

function getTargetWords(videoLength: string): number {
  const minutes = getDurationInMinutes(videoLength);
  return Math.round(minutes * 150); // 150 words per minute speaking rate
}

export async function generateScript(topic: string, videoLength: string, template?: string): Promise<GeneratedScript> {
  const targetWords = getTargetWords(videoLength);
  const durationMinutes = getDurationInMinutes(videoLength);
  
  const templateInstruction = template ? 
    `Use this content template structure: "${template}". Fill in the blanks with relevant information about the topic.` : 
    "Create an engaging and informative script structure.";

  const prompt = `
Create a detailed YouTube video script about "${topic}" with the following requirements:

LENGTH: Target ${targetWords} words total (approximately ${durationMinutes} minutes)
READING LEVEL: 6th grade level - use simple, clear language
TONE: Human-like, conversational, engaging - NOT robotic or AI-sounding

${templateInstruction}

STRICTLY AVOID these overused AI phrases and similar patterns:
${AVOIDED_PHRASES.join(", ")}

Instead, use natural conversational starters, storytelling elements, and human-like transitions.

Structure the script with these sections:
1. HOOK (0-5 seconds): Attention-grabbing opener that creates curiosity
2. INTRODUCTION (5-30 seconds): Brief personal introduction and video preview
3. MAIN CONTENT: The core teaching/entertainment content broken into logical sections
4. CONCLUSION: Summary and strong call-to-action

Return the response in JSON format with this structure:
{
  "hook": {
    "title": "Hook",
    "content": "script content",
    "duration": "0-5 seconds"
  },
  "introduction": {
    "title": "Introduction", 
    "content": "script content",
    "duration": "5-30 seconds"
  },
  "mainContent": [
    {
      "title": "Section title",
      "content": "script content",
      "duration": "estimated duration"
    }
  ],
  "conclusion": {
    "title": "Conclusion & CTA",
    "content": "script content", 
    "duration": "estimated duration"
  },
  "totalWords": number,
  "estimatedDuration": "X minutes Y seconds"
}

Make the script sound like it was written by a real person, not AI. Use personal anecdotes, contractions, and natural speech patterns.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert YouTube scriptwriter who creates engaging, human-like content that avoids AI clichés and robotic language."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    throw new Error("Failed to generate script: " + (error as Error).message);
  }
}

export async function generateSEOPackage(topic: string, script?: string): Promise<SEOPackage> {
  const contentToAnalyze = script || topic;
  
  const prompt = `
Create a comprehensive SEO package for a YouTube video about "${topic}".

${script ? 'Use this script content to inform the SEO strategy:' : 'Base the SEO on the topic:'} 
${contentToAnalyze}

Generate:
1. 5 optimized video titles that are clickable and searchable
2. A compelling video description with timestamps, keywords, and resources
3. Relevant tags for discoverability

Return in JSON format:
{
  "titles": ["title1", "title2", "title3", "title4", "title5"],
  "description": "detailed description with timestamps and keywords",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8"]
}

Focus on:
- Click-worthy titles that balance keywords with emotional hooks
- Rich descriptions that include relevant timestamps
- Mix of broad and specific tags
- Keywords that people actually search for
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a YouTube SEO expert who understands the algorithm and what makes content discoverable."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    throw new Error("Failed to generate SEO package: " + (error as Error).message);
  }
}

export async function generateThumbnailConcepts(topic: string, script?: string): Promise<ThumbnailConcept> {
  const contentToAnalyze = script || topic;
  
  const prompt = `
Create thumbnail concepts for a YouTube video about "${topic}".

${script ? 'Consider this script content:' : 'Base concepts on the topic:'} 
${contentToAnalyze}

Generate:
1. 5 curiosity-driven words perfect for thumbnails
2. 3 detailed thumbnail design concepts with specific visual descriptions
3. 3 AI image generation prompts for creating the thumbnails

Return in JSON format:
{
  "conceptName": "Main Thumbnail Strategy",
  "description": "Overall thumbnail approach",
  "curiosityWords": ["WORD1", "WORD2", "WORD3", "WORD4", "WORD5"],
  "concepts": [
    {
      "name": "Concept 1 Name",
      "description": "Detailed visual description including colors, layout, text placement, facial expressions, etc."
    },
    {
      "name": "Concept 2 Name", 
      "description": "Detailed visual description"
    },
    {
      "name": "Concept 3 Name",
      "description": "Detailed visual description"
    }
  ],
  "aiPrompts": [
    "Detailed prompt for AI image generation for concept 1",
    "Detailed prompt for AI image generation for concept 2", 
    "Detailed prompt for AI image generation for concept 3"
  ]
}

Focus on:
- Eye-catching curiosity words that drive clicks
- High-contrast, emotionally engaging designs
- Clear, readable text overlays
- Faces with strong emotional expressions
- Bright, attention-grabbing color schemes
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a YouTube thumbnail expert who understands visual psychology and what makes viewers click."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    throw new Error("Failed to generate thumbnail concepts: " + (error as Error).message);
  }
}

export async function generateProductionAssets(topic: string, script?: string, videoLength?: string): Promise<ProductionAssets> {
  const contentToAnalyze = script || topic;
  const duration = videoLength ? getDurationInMinutes(videoLength) : 5;
  
  const prompt = `
Create production assets for a YouTube video about "${topic}" (${duration} minutes long).

${script ? 'Analyze this script content:' : 'Base assets on the topic:'} 
${contentToAnalyze}

Generate:
1. Professional background music prompts (2-3 options)
2. Image prompts for visual content (2 prompts based on script paragraphs)
3. Main bullet points with sub-bullet points (5 main points, 3 sub-points each)

Return in JSON format:
{
  "musicPrompts": [
    "Detailed music prompt 1 with BPM, style, mood",
    "Detailed music prompt 2 with BPM, style, mood"
  ],
  "imagePrompts": [
    "Professional image prompt 1 for visual content",
    "Professional image prompt 2 for visual content"
  ],
  "bulletPoints": [
    {
      "title": "Main Point 1",
      "subPoints": ["Sub-point 1", "Sub-point 2", "Sub-point 3"]
    },
    {
      "title": "Main Point 2", 
      "subPoints": ["Sub-point 1", "Sub-point 2", "Sub-point 3"]
    },
    {
      "title": "Main Point 3",
      "subPoints": ["Sub-point 1", "Sub-point 2", "Sub-point 3"]
    },
    {
      "title": "Main Point 4",
      "subPoints": ["Sub-point 1", "Sub-point 2", "Sub-point 3"]
    },
    {
      "title": "Main Point 5",
      "subPoints": ["Sub-point 1", "Sub-point 2", "Sub-point 3"]
    }
  ]
}

Focus on:
- Music that matches the content tone and energy
- Professional, eye-catching image concepts
- Clear, actionable bullet points that summarize key content
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a video production expert who understands how to create professional supporting content for YouTube videos."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    throw new Error("Failed to generate production assets: " + (error as Error).message);
  }
}

export async function generateImagePrompts(script: string, videoLength: string): Promise<string[]> {
  const targetPrompts = videoLength === "75 seconds (Short)" ? 1 : 2;
  
  const prompt = `
Analyze this video script and generate ${targetPrompts} professional image prompt(s) for visual content:

SCRIPT:
${script}

Create specific, detailed prompts for generating images that would enhance this video content. Focus on:
- Professional, eye-catching visuals
- Images that support key concepts in the script
- High-quality, suitable for video thumbnails or content illustrations

Return in JSON format:
{
  "imagePrompts": [
    "Detailed professional image prompt 1",
    "Detailed professional image prompt 2"
  ]
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert at creating detailed image generation prompts for video content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.imagePrompts || [];
  } catch (error) {
    throw new Error("Failed to generate image prompts: " + (error as Error).message);
  }
}

export async function generateCompleteContent(
  topic: string,
  videoLength: string,
  template: string | undefined,
  selectedContentTypes: string[]
): Promise<GeneratedContent> {
  const content: GeneratedContent = {};

  try {
    // Generate script first if requested
    if (selectedContentTypes.includes("script")) {
      content.script = await generateScript(topic, videoLength, template);
    }

    const scriptText = content.script ? 
      `${content.script.hook.content} ${content.script.introduction.content} ${content.script.mainContent.map(section => section.content).join(' ')} ${content.script.conclusion.content}` 
      : undefined;

    // Generate other content types based on script or topic
    const promises: Promise<void>[] = [];

    if (selectedContentTypes.includes("seo")) {
      promises.push(
        generateSEOPackage(topic, scriptText).then(seo => {
          content.seo = seo;
        })
      );
    }

    if (selectedContentTypes.includes("thumbnails")) {
      promises.push(
        generateThumbnailConcepts(topic, scriptText).then(thumbnails => {
          content.thumbnails = thumbnails;
        })
      );
    }

    if (selectedContentTypes.includes("assets") || selectedContentTypes.includes("music") || selectedContentTypes.includes("bulletPoints")) {
      promises.push(
        generateProductionAssets(topic, scriptText, videoLength).then(assets => {
          content.assets = assets;
        })
      );
    }

    // Wait for all content generation to complete
    await Promise.all(promises);

    return content;
  } catch (error) {
    throw new Error("Failed to generate complete content: " + (error as Error).message);
  }
}

export async function generateContentFromScript(
  title: string,
  script: string,
  videoLength: string,
  selectedContentTypes: string[]
): Promise<GeneratedContent> {
  const content: GeneratedContent = {};

  try {
    const promises: Promise<void>[] = [];

    if (selectedContentTypes.includes("seo")) {
      promises.push(
        generateSEOPackage(title, script).then(seo => {
          content.seo = seo;
        })
      );
    }

    if (selectedContentTypes.includes("thumbnails")) {
      promises.push(
        generateThumbnailConcepts(title, script).then(thumbnails => {
          content.thumbnails = thumbnails;
        })
      );
    }

    if (selectedContentTypes.includes("imagePrompts")) {
      promises.push(
        generateImagePrompts(script, videoLength).then(prompts => {
          if (!content.assets) content.assets = { musicPrompts: [], imagePrompts: [], bulletPoints: [] };
          content.assets.imagePrompts = prompts;
        })
      );
    }

    if (selectedContentTypes.includes("assets") || selectedContentTypes.includes("music") || selectedContentTypes.includes("bulletPoints")) {
      promises.push(
        generateProductionAssets(title, script, videoLength).then(assets => {
          if (content.assets) {
            content.assets = { ...content.assets, ...assets };
          } else {
            content.assets = assets;
          }
        })
      );
    }

    await Promise.all(promises);

    return content;
  } catch (error) {
    throw new Error("Failed to generate content from script: " + (error as Error).message);
  }
}
