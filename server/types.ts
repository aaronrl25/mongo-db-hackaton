export type Scope = 'global' | 'project';
export type Preference = {
  id: string; category: string; label: string; value: string; confidence: number;
  scope: Scope; projectId?: string; source: 'explicit' | 'inferred' | 'imported'; evidence: string; updatedAt: string;
};
export type Memory = { id: string; projectId: string; text: string; kind: string; createdAt: string };
export type Message = { id: string; role: 'user' | 'assistant'; content: string; createdAt: string; preferences?: string[] };
