import Anthropic from '@anthropic-ai/sdk';
import type { Preference } from './types.ts';

const claude = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;
type InterviewTurn = { role: 'user' | 'assistant'; content: string };
type ExtractedPreference = Omit<Preference, 'id' | 'updatedAt'>;

export async function personalityInterview(history: InterviewTurn[], projectId: string) {
  if (!claude) throw new Error('Claude is not configured. Add ANTHROPIC_API_KEY to use the personality interview.');
  const response = await claude.messages.create({
    model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-6',
    max_tokens: 1200,
    system: `You are DevPersona's warm, perceptive developer-personality interviewer. Learn: preferred languages/frameworks, conventions, architecture, state management, testing/debugging, response length, code vs explanations, and refactoring permission. Ask exactly ONE concise question at a time. Respond as strict JSON with keys reply (string), complete (boolean), and preferences (array). Extract preferences only from the user's latest answer. Each preference needs category, label, value, confidence 0..1, scope global|project, projectId, source explicit|inferred, and evidence containing a short exact or close paraphrase. Use project scope only when the user clearly limits it to the current project (${projectId}). When all areas are sufficiently covered, set complete true and reply with a short personality summary.`,
    messages: history.length ? history : [{ role: 'user', content: 'Begin my developer personality interview.' }],
  });
  const text = response.content.filter(x => x.type === 'text').map(x => x.text).join('');
  try {
    const clean = text.replace(/^```json\s*|\s*```$/g, '');
    return JSON.parse(clean) as { reply: string; preferences: ExtractedPreference[]; complete: boolean };
  } catch {
    return { reply: text || 'Tell me how you like to work as a developer.', preferences: [], complete: false };
  }
}
