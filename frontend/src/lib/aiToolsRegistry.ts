export interface AITool {
  tool_name: string;
  domain: string;
  category: "chat" | "coding" | "api" | "image" | "audio" | "video" | "search" | "productivity";
  vendor: string;
  risk_level: "low" | "medium" | "high";
  is_approved: boolean;
}

export const aiToolsRegistry: AITool[] = [
  { tool_name: "OpenAI ChatGPT", domain: "openai.com", category: "chat", vendor: "OpenAI", risk_level: "medium", is_approved: true },
  { tool_name: "OpenAI ChatGPT", domain: "chat.openai.com", category: "chat", vendor: "OpenAI", risk_level: "medium", is_approved: true },
  { tool_name: "OpenAI API", domain: "api.openai.com", category: "api", vendor: "OpenAI", risk_level: "high", is_approved: false },
  { tool_name: "OpenAI Platform", domain: "platform.openai.com", category: "api", vendor: "OpenAI", risk_level: "high", is_approved: true },
  { tool_name: "Anthropic", domain: "anthropic.com", category: "chat", vendor: "Anthropic", risk_level: "medium", is_approved: true },
  { tool_name: "Claude", domain: "claude.ai", category: "chat", vendor: "Anthropic", risk_level: "medium", is_approved: true },
  { tool_name: "Anthropic API", domain: "api.anthropic.com", category: "api", vendor: "Anthropic", risk_level: "high", is_approved: false },
  { tool_name: "Anthropic Console", domain: "console.anthropic.com", category: "api", vendor: "Anthropic", risk_level: "high", is_approved: true },
  { tool_name: "Microsoft Copilot", domain: "copilot.microsoft.com", category: "coding", vendor: "Microsoft", risk_level: "low", is_approved: true },
  { tool_name: "GitHub", domain: "github.com", category: "coding", vendor: "Microsoft", risk_level: "low", is_approved: true },
  { tool_name: "GitHub API", domain: "api.github.com", category: "api", vendor: "Microsoft", risk_level: "high", is_approved: false },
  { tool_name: "Google Gemini", domain: "gemini.google.com", category: "chat", vendor: "Google", risk_level: "medium", is_approved: true },
  { tool_name: "Google AI Studio", domain: "aistudio.google.com", category: "api", vendor: "Google", risk_level: "high", is_approved: true },
  { tool_name: "Google AI API", domain: "generativelanguage.googleapis.com", category: "api", vendor: "Google", risk_level: "high", is_approved: false },
  { tool_name: "Meta AI", domain: "ai.meta.com", category: "chat", vendor: "Meta", risk_level: "medium", is_approved: true },
  { tool_name: "Meta Llama", domain: "llama.meta.com", category: "api", vendor: "Meta", risk_level: "high", is_approved: true },
  { tool_name: "Replicate", domain: "replicate.com", category: "api", vendor: "Replicate", risk_level: "high", is_approved: false },
  { tool_name: "Hugging Face", domain: "huggingface.co", category: "api", vendor: "Hugging Face", risk_level: "high", is_approved: false },
  { tool_name: "Cohere", domain: "cohere.com", category: "api", vendor: "Cohere", risk_level: "high", is_approved: false },
  { tool_name: "Midjourney", domain: "midjourney.com", category: "image", vendor: "Midjourney", risk_level: "medium", is_approved: false },
  { tool_name: "Stability AI", domain: "stability.ai", category: "image", vendor: "Stability AI", risk_level: "high", is_approved: false },
  { tool_name: "DALL-E", domain: "labs.openai.com", category: "image", vendor: "OpenAI", risk_level: "medium", is_approved: true },
  { tool_name: "ElevenLabs", domain: "elevenlabs.io", category: "audio", vendor: "ElevenLabs", risk_level: "medium", is_approved: false },
  { tool_name: "Runway", domain: "runwayml.com", category: "video", vendor: "Runway", risk_level: "high", is_approved: false },
  { tool_name: "Perplexity", domain: "perplexity.ai", category: "search", vendor: "Perplexity", risk_level: "medium", is_approved: false },
  { tool_name: "You.com", domain: "you.com", category: "search", vendor: "You.com", risk_level: "medium", is_approved: false },
  { tool_name: "Notion AI", domain: "notion.so", category: "productivity", vendor: "Notion", risk_level: "low", is_approved: true },
  { tool_name: "Jasper", domain: "jasper.ai", category: "productivity", vendor: "Jasper", risk_level: "medium", is_approved: false },
  { tool_name: "Grammarly", domain: "grammarly.com", category: "productivity", vendor: "Grammarly", risk_level: "low", is_approved: true },
  { tool_name: "GitHub Copilot", domain: "copilot.github.com", category: "coding", vendor: "Microsoft", risk_level: "low", is_approved: true },
  { tool_name: "Tabnine", domain: "tabnine.com", category: "coding", vendor: "Tabnine", risk_level: "medium", is_approved: false },
  { tool_name: "Codeium", domain: "codeium.com", category: "coding", vendor: "Codeium", risk_level: "medium", is_approved: false },
  { tool_name: "Cursor", domain: "cursor.sh", category: "coding", vendor: "Anysphere", risk_level: "medium", is_approved: false },
  { tool_name: "AWS Bedrock", domain: "bedrock.amazonaws.com", category: "api", vendor: "AWS", risk_level: "high", is_approved: true },
  { tool_name: "Azure OpenAI", domain: "openai.azure.com", category: "api", vendor: "Microsoft", risk_level: "high", is_approved: true },
  { tool_name: "Google Vertex AI", domain: "aiplatform.googleapis.com", category: "api", vendor: "Google", risk_level: "high", is_approved: true },
  { tool_name: "Mistral AI", domain: "mistral.ai", category: "api", vendor: "Mistral", risk_level: "high", is_approved: false },
  { tool_name: "Together AI", domain: "together.ai", category: "api", vendor: "Together AI", risk_level: "high", is_approved: false },
  { tool_name: "Groq", domain: "groq.com", category: "api", vendor: "Groq", risk_level: "high", is_approved: false },
  { tool_name: "Ollama", domain: "ollama.ai", category: "api", vendor: "Ollama", risk_level: "low", is_approved: true },
  { tool_name: "LM Studio", domain: "lmstudio.ai", category: "api", vendor: "LM Studio", risk_level: "low", is_approved: true },
  { tool_name: "Writesonic", domain: "writesonic.com", category: "productivity", vendor: "Writesonic", risk_level: "medium", is_approved: false },
  { tool_name: "Copy.ai", domain: "copy.ai", category: "productivity", vendor: "Copy.ai", risk_level: "medium", is_approved: false },
  { tool_name: "Synthesia", domain: "synthesia.io", category: "video", vendor: "Synthesia", risk_level: "high", is_approved: false },
  { tool_name: "Descript", domain: "descript.com", category: "audio", vendor: "Descript", risk_level: "medium", is_approved: false },
  { tool_name: "Whisper API", domain: "whisper.openai.com", category: "audio", vendor: "OpenAI", risk_level: "high", is_approved: false },
  { tool_name: "Leonardo AI", domain: "leonardo.ai", category: "image", vendor: "Leonardo AI", risk_level: "medium", is_approved: false },
  { tool_name: "Poe", domain: "poe.com", category: "chat", vendor: "Quora", risk_level: "medium", is_approved: false },
  { tool_name: "Character.AI", domain: "character.ai", category: "chat", vendor: "Character.AI", risk_level: "medium", is_approved: false },
  { tool_name: "Phind", domain: "phind.com", category: "search", vendor: "Phind", risk_level: "medium", is_approved: false },
  { tool_name: "DeepSeek", domain: "deepseek.com", category: "chat", vendor: "DeepSeek", risk_level: "medium", is_approved: false },
  { tool_name: "DeepSeek API", domain: "api.deepseek.com", category: "api", vendor: "DeepSeek", risk_level: "high", is_approved: false },
  { tool_name: "Suno AI", domain: "suno.ai", category: "audio", vendor: "Suno", risk_level: "medium", is_approved: false },
  { tool_name: "Udio", domain: "udio.com", category: "audio", vendor: "Udio", risk_level: "medium", is_approved: false },
  { tool_name: "Ideogram", domain: "ideogram.ai", category: "image", vendor: "Ideogram", risk_level: "medium", is_approved: false },
  { tool_name: "Lovable", domain: "lovable.dev", category: "coding", vendor: "Lovable", risk_level: "medium", is_approved: false },
  { tool_name: "Bolt", domain: "bolt.new", category: "coding", vendor: "StackBlitz", risk_level: "medium", is_approved: false },
  { tool_name: "v0", domain: "v0.dev", category: "coding", vendor: "Vercel", risk_level: "medium", is_approved: false },
  { tool_name: "Replit AI", domain: "replit.com", category: "coding", vendor: "Replit", risk_level: "medium", is_approved: false },
  { tool_name: "Vercel AI", domain: "sdk.vercel.ai", category: "api", vendor: "Vercel", risk_level: "high", is_approved: false },
  { tool_name: "Fireworks AI", domain: "fireworks.ai", category: "api", vendor: "Fireworks", risk_level: "high", is_approved: false },
  { tool_name: "Anyscale", domain: "anyscale.com", category: "api", vendor: "Anyscale", risk_level: "high", is_approved: false },
];

export const categories = [...new Set(aiToolsRegistry.map(t => t.category))];
export const vendors = [...new Set(aiToolsRegistry.map(t => t.vendor))];
export const riskLevels: AITool["risk_level"][] = ["low", "medium", "high"];
