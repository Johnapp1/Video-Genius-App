import OpenAI from "openai";

// Using gpt-4-turbo for high-quality content generation
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
  bulletPoints: {
    title: string;
    subPoints: string[];
  }[];
}

interface GeneratedContent {
  script?: GeneratedScript;
  seo?: SEOPackage;
  thumbnails?: ThumbnailConcept;
  assets?: ProductionAssets & {
    imagePrompts?: Array<{
      section: string;
      content: string;
      prompts: string[];
    }>;
  };
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

function getToneInstructions(tone: string): string {
  const toneMap: Record<string, string> = {
    informative: "Professional and clear. Focus on accurate information with an expert delivery. Use precise language while staying accessible. Maintain credibility and authority throughout.",
    casual: "Friendly and conversational. Use contractions freely (you're, don't, can't). Talk like you're chatting with a friend. Include humor naturally. Keep it relaxed and approachable.",
    comedic: "Funny and entertaining. Include jokes, witty remarks, and humorous observations. Use comedic timing with setup and punchline structure. Make viewers laugh while delivering value.",
    storytelling: "Narrative-driven and emotional. Build a compelling story arc with character, conflict, and resolution. Create emotional connections. Use vivid imagery and sensory details.",
    persuasive: "Convincing and compelling. Present clear arguments with supporting evidence. Address objections. Build to a strong conclusion that motivates action. Use rhetorical devices effectively.",
    empathetic: "Warm and understanding. Use 'we' language to create connection. Acknowledge difficulties and emotions. Avoid harsh or judgmental language. Show genuine care and support.",
    experimental: "Unique and unconventional. Break traditional structures. Try innovative approaches. Challenge expectations. Create memorable, distinctive content that stands out."
  };
  return toneMap[tone] || toneMap.informative;
}

export async function generateScript(topic: string, videoLength: string, tone: string = "informative", template?: string): Promise<GeneratedScript> {
  const targetWords = getTargetWords(videoLength);
  const durationMinutes = getDurationInMinutes(videoLength);
  
  // Extract quantity from topic (e.g., "15 questions" -> 15)
  const quantityMatch = topic.match(/(\d+)\s*(?:questions?|items?|tips?|ways?|steps?|examples?|ideas?|points?|things?|reasons?|secrets?|hacks?|tricks?|methods?|strategies?|techniques?|facts?)/i);
  const requestedQuantity = quantityMatch ? parseInt(quantityMatch[1]) : null;
  
  // Detect Q&A format
  const isQAFormat = /questions?\s*(?:and|&)?\s*answers?/i.test(topic);
  
  const templateInstruction = template ? 
    `Use this content template structure: "${template}". Fill in the blanks with relevant information about the topic.` : 
    "Create an engaging and informative script structure.";

  const toneInstruction = getToneInstructions(tone);
  
  // Build quantity instruction
  let quantityInstruction = "";
  if (requestedQuantity) {
    if (isQAFormat) {
      quantityInstruction = `\nCRITICAL: The user specifically requested ${requestedQuantity} question and answer pairs. You MUST generate EXACTLY ${requestedQuantity} SEPARATE items in the mainContent array. 

IMPORTANT FORMAT RULES:
- Each question MUST be its own separate item in the array
- Do NOT group questions (e.g., "Questions 3 through 7" is WRONG)
- Each item should be numbered individually: "Question 1", "Question 2", "Question 3", etc.
- Each question gets its own complete answer in the content field
- You need ${requestedQuantity} separate array items, numbered from 1 to ${requestedQuantity}`;
    } else {
      quantityInstruction = `\nCRITICAL: The user specifically requested ${requestedQuantity} items. You MUST generate EXACTLY ${requestedQuantity} SEPARATE items in the mainContent array. Each item should be numbered individually (Item 1, Item 2, etc.). Do NOT group items together.`;
    }
  }

  const prompt = `
Create a WORLD-CLASS YouTube video script about "${topic}" with the following requirements:

LENGTH: Target ${targetWords} words total (approximately ${durationMinutes} minutes)
READING LEVEL: 6th grade level - use simple, clear language that anyone can understand
TONE: ${toneInstruction}
VOCABULARY: Use common words, short sentences, and avoid jargon or complex terms
ENGAGEMENT: Include questions, personal stories, relatable examples, and direct audience address
${quantityInstruction}

${templateInstruction}

STRICTLY AVOID these overused AI phrases and similar patterns:
${AVOIDED_PHRASES.join(", ")}

Instead, use natural conversational starters, storytelling elements, and human-like transitions.

Structure the script with these sections:
1. HOOK (0-5 seconds): MUST be INCREDIBLY attention-grabbing. Use pattern interrupts, shocking facts, bold questions, or compelling teasers. This is THE MOST CRITICAL 5 SECONDS.
2. INTRODUCTION (5-30 seconds): Build credibility and preview the value. Make viewers excited to stay.
3. MAIN CONTENT: The core teaching/entertainment content broken into logical sections with smooth transitions${requestedQuantity ? ` - MUST contain EXACTLY ${requestedQuantity} items` : ""}
4. CONCLUSION: Powerful summary with an irresistible call-to-action that drives engagement

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
  "mainContent": [${isQAFormat && requestedQuantity ? `
    {
      "title": "Question 1: [actual question text]",
      "content": "[complete answer to question 1]",
      "duration": "estimated duration"
    },
    {
      "title": "Question 2: [actual question text]",
      "content": "[complete answer to question 2]",
      "duration": "estimated duration"
    }
    // ... continue with Question 3, Question 4, etc. up to Question ${requestedQuantity}
    // Each question MUST be separate - DO NOT group them` : `
    {
      "title": "${isQAFormat ? 'Question 1: [actual question text]' : 'Section title'}",
      "content": "${isQAFormat ? '[complete answer]' : 'script content'}",
      "duration": "estimated duration"
    }${requestedQuantity ? ` // MUST have exactly ${requestedQuantity} separate items in this array` : ""}`}
  ],
  "conclusion": {
    "title": "Conclusion & CTA",
    "content": "script content", 
    "duration": "estimated duration"
  },
  "totalWords": number,
  "estimatedDuration": "X minutes Y seconds"
}

QUALITY REQUIREMENTS:
- Write as if a real person is speaking naturally, not reading from a script
- Use contractions (you're, don't, can't) and casual language appropriately
- Include personal touches like "I've found that..." or "Here's what worked for me..."
- Ask rhetorical questions to keep viewers engaged
- Use simple transitions like "Now," "Next," "But here's the thing"
- Keep sentences short and punchy for easy comprehension
- Maintain professional credibility while being approachable and relatable
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert YouTube scriptwriter who creates engaging, human-like content that avoids AI clichés and robotic language. You MUST follow user specifications exactly, especially regarding the number of items requested."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const parsedScript = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate quantity if specified
    if (requestedQuantity && parsedScript.mainContent) {
      const actualCount = parsedScript.mainContent.length;
      if (actualCount !== requestedQuantity) {
        console.warn(`Expected ${requestedQuantity} items but got ${actualCount}. Retrying...`);
        
        // Retry with more explicit instructions
        const retryResponse = await openai.chat.completions.create({
          model: "gpt-4-turbo",
          messages: [
            {
              role: "system",
              content: "You are an expert YouTube scriptwriter. You MUST generate the EXACT number of items requested by the user. This is CRITICAL. Each item must be SEPARATE - never group them together."
            },
            {
              role: "user",
              content: prompt + `\n\nIMPORTANT: You previously generated ${actualCount} items but the user needs EXACTLY ${requestedQuantity} SEPARATE items. 
              
DO NOT GROUP ITEMS! Each item must be individual:
${isQAFormat ? `- Question 1: [question] with answer\n- Question 2: [question] with answer\n- Question 3: [question] with answer\n... up to Question ${requestedQuantity}` : `- Item 1\n- Item 2\n- Item 3\n... up to Item ${requestedQuantity}`}

Generate ${requestedQuantity} complete, separate items now.`
            }
          ],
          response_format: { type: "json_object" },
        });
        
        const retryParsed = JSON.parse(retryResponse.choices[0].message.content || "{}");
        if (retryParsed.mainContent && retryParsed.mainContent.length === requestedQuantity) {
          return retryParsed;
        }
        
        // If still wrong, throw error
        if (retryParsed.mainContent && retryParsed.mainContent.length !== requestedQuantity) {
          throw new Error(`Script generation failed to produce ${requestedQuantity} items as requested (got ${retryParsed.mainContent.length}). Please try again.`);
        }
      }
    }
    
    return parsedScript;
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
2. A compelling video description with timestamps and keywords
3. Relevant tags for discoverability

Return in JSON format:
{
  "titles": ["title1", "title2", "title3", "title4", "title5"],
  "description": "detailed description with timestamps and keywords",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8"]
}

Focus on:
- Click-worthy titles that balance keywords with emotional hooks
- Engaging descriptions with relevant timestamps
- Mix of broad and specific tags
- Keywords that people actually search for

DESCRIPTION REQUIREMENTS:
- Include timestamps if applicable
- Focus on video value and benefits to viewers
- Use natural language and relevant keywords
- DO NOT include "key points covered" sections
- DO NOT include generic "resources" sections
- Keep the description concise and engaging
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
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
1. 5 curiosity-driven phrases (3-4 words each) perfect for thumbnails
2. 3 detailed thumbnail design concepts with specific visual descriptions
3. 3 AI image generation prompts for creating the thumbnails

Return in JSON format:
{
  "conceptName": "Main Thumbnail Strategy",
  "description": "Overall thumbnail approach",
  "curiosityWords": ["PHRASE 1 (3-4 words)", "PHRASE 2 (3-4 words)", "PHRASE 3 (3-4 words)", "PHRASE 4 (3-4 words)", "PHRASE 5 (3-4 words)"],
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
- Eye-catching curiosity phrases (3-4 words each) that drive clicks
- High-contrast, emotionally engaging designs
- Clear, readable text overlays
- Faces with strong emotional expressions
- Bright, attention-grabbing color schemes
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
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
2. Main bullet points with sub-bullet points (5 main points, 3 sub-points each)

Return in JSON format:
{
  "musicPrompts": [
    "Detailed music prompt 1 with BPM, style, mood",
    "Detailed music prompt 2 with BPM, style, mood"
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
- Clear, actionable bullet points that summarize key content
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
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

export async function generateImagePromptsFromRawScript(rawScript: string): Promise<Array<{section: string; content: string; prompts: string[]}>> {
  // Split the raw script into paragraphs for image prompt generation
  const paragraphs = rawScript
    .split('\n\n')
    .map(p => p.trim())
    .filter(p => p.length > 0);
  
  const results = [];
  
  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i];
    const sectionName = `Paragraph ${i + 1}`;
    
    const prompt = `
Analyze this paragraph from a video script and generate 1-2 professional image prompts based on the specific content:

PARAGRAPH: ${sectionName}
CONTENT: ${paragraph}

Create specific, detailed prompts for generating images that would enhance this specific paragraph. Focus on:
- Professional, eye-catching visuals that match the paragraph content
- Images that support the key concepts mentioned in this paragraph
- High-quality, suitable for video content or thumbnails

Return in JSON format:
{
  "imagePrompts": [
    "Detailed professional image prompt 1 based on this paragraph",
    "Detailed professional image prompt 2 based on this paragraph (optional)"
  ]
}
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert at creating detailed image generation prompts for video content based on specific paragraphs."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      results.push({
        section: sectionName,
        content: paragraph,
        prompts: result.imagePrompts || []
      });
    } catch (error) {
      console.error(`Failed to generate image prompts for ${sectionName}:`, error);
      results.push({
        section: sectionName,
        content: paragraph,
        prompts: []
      });
    }
  }

  return results;
}

export async function generateImagePrompts(parsedScript: GeneratedScript): Promise<Array<{section: string; content: string; prompts: string[]}>> {
  const sections = [
    { name: "Hook", content: parsedScript.hook.content },
    { name: "Introduction", content: parsedScript.introduction.content },
    ...parsedScript.mainContent.map((section, index) => ({ 
      name: `Main Content ${index + 1}`, 
      content: section.content 
    })),
    { name: "Conclusion", content: parsedScript.conclusion.content }
  ];

  const results = [];
  
  for (const section of sections) {
    const prompt = `
Analyze this paragraph from a video script and generate 1-2 professional image prompts based on the specific content:

PARAGRAPH: ${section.name}
CONTENT: ${section.content}

Create specific, detailed prompts for generating images that would enhance this specific paragraph. Focus on:
- Professional, eye-catching visuals that match the paragraph content
- Images that support the key concepts mentioned in this paragraph
- High-quality, suitable for video content or thumbnails

Return in JSON format:
{
  "imagePrompts": [
    "Detailed professional image prompt 1 based on this paragraph",
    "Detailed professional image prompt 2 based on this paragraph (optional)"
  ]
}
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert at creating detailed image generation prompts for video content based on specific paragraphs."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      results.push({
        section: section.name,
        content: section.content,
        prompts: result.imagePrompts || []
      });
    } catch (error) {
      console.error(`Failed to generate image prompts for ${section.name}:`, error);
      results.push({
        section: section.name,
        content: section.content,
        prompts: []
      });
    }
  }

  return results;
}

export async function generateCompleteContent(
  topic: string,
  videoLength: string,
  tone: string = "informative",
  template: string | undefined,
  selectedContentTypes: string[]
): Promise<GeneratedContent> {
  const content: GeneratedContent = {};

  try {
    // Generate script first if requested
    if (selectedContentTypes.includes("script")) {
      content.script = await generateScript(topic, videoLength, tone, template);
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

    if (selectedContentTypes.includes("imagePrompts")) {
      promises.push(
        (() => {
          if (content.script) {
            // Use structured script if available
            return generateImagePrompts(content.script);
          } else {
            // Fallback to raw script analysis
            return generateImagePromptsFromRawScript(scriptText || topic);
          }
        })().then(prompts => {
          if (!content.assets) content.assets = { musicPrompts: [], bulletPoints: [] };
          content.assets.imagePrompts = prompts;
        })
      );
    }

    if (selectedContentTypes.includes("assets") || selectedContentTypes.includes("music") || selectedContentTypes.includes("bulletPoints")) {
      promises.push(
        generateProductionAssets(topic, scriptText, videoLength).then(assets => {
          if (content.assets) {
            content.assets = { ...content.assets, ...assets };
          } else {
            content.assets = assets;
          }
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
  tone: string = "informative",
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
        generateImagePromptsFromRawScript(script).then(prompts => {
          if (!content.assets) content.assets = { musicPrompts: [], bulletPoints: [] };
          if (!content.assets.imagePrompts) content.assets.imagePrompts = [];
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
