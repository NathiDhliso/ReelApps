import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { callGeminiApi } from '../_shared/gemini.ts';

console.log('chat-persona function loaded');

interface ChatPersonaRequest {
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  nextUserMessage: string;
  userId?: string;
}

interface ChatPersonaResponse {
  reply: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { conversationHistory, nextUserMessage, userId } = await req.json() as ChatPersonaRequest;

    console.log('Generating chat persona reply', {
      userId,
      historyLength: conversationHistory.length,
      nextUserMessage: nextUserMessage.slice(0, 100)
    });

    // Build conversation context for Gemini
    const historyText = conversationHistory.map((turn) => {
      const speaker = turn.role === 'user' ? 'User' : 'Coach';
      return `${speaker}: ${turn.content}`;
    }).join('\n');

    const systemPrompt = `You are an AI personality coach having a friendly, professional conversation with a user.\n` +
      `Goal: gather rich personal anecdotes so you can build a Big-Five personality profile.\n` +
      `If the user responds with very short or off-topic small talk, politely acknowledge and ask a deeper follow-up or the next personality question.\n` +
      `Always keep the user engaged and on topic, but feel human and supportive.\n` +
      `NEVER mention the Big-Five model explicitly.\n` +
      `Respond in 1-3 short sentences.\n`;

    const prompt = `${systemPrompt}\n\nConversation so far:\n${historyText}\nUser: ${nextUserMessage}\n\nCoach:`;

    const geminiReplyRaw = await callGeminiApi(prompt);
    const reply = geminiReplyRaw.trim();

    const response: ChatPersonaResponse = { reply };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('chat-persona error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate reply', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}); 