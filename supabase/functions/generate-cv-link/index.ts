// @ts-nocheck

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { nanoid } from "https://deno.land/x/nanoid@v3.0.0/mod.ts";
import { corsHeaders } from '../_shared/cors.ts';

interface GenerateRequest {
  expiresInDays?: number; // defaults to 30
}

interface GenerateResponse {
  url: string;
  slug: string;
  expires_at: string;
}

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

console.log('generate-cv-link function loaded');

serve(async (req) => {
  // CORS pre-flight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization') || '';
  const jwt = authHeader.replace('Bearer ', '');

  // Verify user
  const {
    data: { user },
    error: userErr,
  } = await supabaseAdmin.auth.getUser(jwt);

  if (userErr || !user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }

  const { expiresInDays = 30 } = (await req.json().catch(() => ({}))) as GenerateRequest;
  const expires_at = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();

  // create unique slug (retry on collision)
  let slug = nanoid(10);
  const maxAttempts = 5;
  let attempt = 0;
  while (attempt < maxAttempts) {
    const { count } = await supabaseAdmin
      .from('public_cv_links')
      .select('id', { count: 'exact', head: true })
      .eq('slug', slug);
    if ((count ?? 0) === 0) break;
    slug = nanoid(10);
    attempt++;
  }

  if (attempt === maxAttempts) {
    return new Response(
      JSON.stringify({ error: 'Could not generate unique slug' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  // insert row
  const { error: insertErr } = await supabaseAdmin.from('public_cv_links').insert({
    candidate_id: user.id,
    slug,
    expires_at,
  });

  if (insertErr) {
    console.error('insert error', insertErr);
    return new Response(
      JSON.stringify({ error: insertErr.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  const baseUrl = Deno.env.get('REELCV_PUBLIC_URL') ?? 'https://reelcv.reelapps.com/public';
  const url = `${baseUrl}/${slug}`;

  const response: GenerateResponse = { url, slug, expires_at };
  return new Response(JSON.stringify(response), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}); 