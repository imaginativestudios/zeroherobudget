import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Image generation prompts - Zero Hero branding with "Sophisticated Adventure" theme
const PROMPTS: Record<string, string> = {
  'small-tile': `Create a promotional banner for the "Zero Hero Connector" browser extension.
Dimensions: 440x280 pixels aspect ratio.
Background: Rich dark teal gradient (#0D7377 to #0A5B5E) with subtle depth.

CENTER COMPOSITION:
- Top: The text "ZERO HERO" as the main logo in elegant white serif font (like Cinzel or Playfair Display), with a distinctive slashed zero "Ø" character. This is the brand logo.
- Below logo: A minimalist white shield icon with a teal lock symbol inside.
- Below shield: "CONNECTOR" in smaller white sans-serif tracking.

Bottom area: Tagline "Privacy-First Bank Scout" in gold/amber (#F4A259) text.

Style: Premium, sophisticated adventure aesthetic. Clean and professional.
No busy backgrounds, no people. Ultra high resolution.`,

  'marquee': `Create a wide promotional hero banner for "Zero Hero" browser extension.
Dimensions: 1280x800 pixels, 16:10 aspect ratio.
Background: Dark slate (#0f172a) with subtle teal gradient accent.

LAYOUT:
LEFT SIDE (40%): 
- Large teal (#0D7377) shield icon with a white lock symbol, subtle glow effect.

RIGHT SIDE (60%):
- TOP: "ZERO HERO" as the main brand logo in elegant white serif font (like Cinzel or Playfair Display). The zero should be a slashed "Ø" character for distinctive branding.
- BELOW LOGO: "CONNECTOR" in smaller white uppercase letters with wide tracking.
- TAGLINE: "Privacy-First Bank Scout" in gold/amber (#F4A259) italic text.
- BULLET POINTS in white: "• No servers • No Plaid • No passwords shared"
- FOOTER TEXT: "100% local. You control your data." in gray text.

Style: Sophisticated adventure aesthetic, premium feel, trust-inspiring.
Clean edges with ample padding (no text near borders).
Ultra high resolution.`
};

// Dimension configs (icons now generated from SVG on client)
const DIMENSIONS: Record<string, { width: number; height: number }> = {
  'small-tile': { width: 448, height: 288 },
  'marquee': { width: 1280, height: 800 }
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type } = await req.json();
    
    if (!type || !PROMPTS[type]) {
      return new Response(
        JSON.stringify({ error: "Invalid image type. Use: small-tile, marquee, or icon-128" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not found");
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = PROMPTS[type];
    const dimensions = DIMENSIONS[type];

    console.log(`Generating ${type} image with dimensions ${dimensions.width}x${dimensions.height}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        modalities: ["image", "text"]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate image" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error("No image in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "No image generated" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return the base64 image data
    return new Response(
      JSON.stringify({
        success: true,
        imageData: imageUrl,
        type,
        dimensions: {
          width: dimensions.width,
          height: dimensions.height
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error generating image:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
