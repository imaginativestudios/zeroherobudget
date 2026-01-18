import { Hono } from "https://deno.land/x/hono@v3.12.11/mod.ts";
import { cors } from "https://deno.land/x/hono@v3.12.11/middleware/cors/index.ts";

const app = new Hono();

// Enable CORS
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["authorization", "x-client-info", "apikey", "content-type"],
}));

// Image generation prompts
const PROMPTS = {
  'small-tile': `Create a clean promotional banner for a browser extension called "Zero Hero Connector". 
Dimensions: 440x280 pixels aspect ratio.
Background: Dark navy/slate gradient (#0f172a to #1e293b).
Center: A minimalist teal (#0D7377) shield icon with a lock symbol inside.
Text below: "Privacy-First Bank Scout" in white, clean sans-serif font.
Subtitle: "Your data stays local" in smaller gray text.
Style: Professional, modern, trust-inspiring.
No busy backgrounds, no people. Ultra high resolution.`,

  'marquee': `Create a wide promotional hero banner for a browser extension called "Zero Hero Connector".
Dimensions: 1280x800 pixels, 16:10 aspect ratio.
Layout: Dark slate background (#0f172a) with subtle gradient.
Left side: Large teal (#0D7377) shield icon with a lock/privacy symbol, glowing subtly.
Right side: 
- Headline: "ZERO HERO CONNECTOR" in bold white text
- Tagline: "Privacy-First Bank Scout" in orange (#F4A259)
- Bullet points in white: "No servers • No Plaid • No passwords shared"
- Small text: "100% local. You control your data."
Style: Clean, modern, enterprise-grade privacy feel.
Keep edges clean with padding (no text near borders).
Ultra high resolution.`,

  'icon-128': `Create a square app icon for a browser extension.
Dimensions: 128x128 pixels, 1:1 aspect ratio.
Design: Teal (#0D7377) circular or rounded square background.
Center: White minimalist shield with a small lock or keyhole symbol inside.
Style: Flat design, minimal gradients, very clear and recognizable at small sizes.
Simple, bold, professional. Ultra high resolution.`
};

// Dimension configs
const DIMENSIONS = {
  'small-tile': { width: 448, height: 288 }, // Closest to 440x280 that's multiple of 32
  'marquee': { width: 1280, height: 800 },
  'icon-128': { width: 512, height: 512 } // Generate larger, resize client-side
};

app.post("/", async (c) => {
  try {
    const { type } = await c.req.json();
    
    if (!type || !PROMPTS[type as keyof typeof PROMPTS]) {
      return c.json({ error: "Invalid image type. Use: small-tile, marquee, or icon-128" }, 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not found");
      return c.json({ error: "API key not configured" }, 500);
    }

    const prompt = PROMPTS[type as keyof typeof PROMPTS];
    const dimensions = DIMENSIONS[type as keyof typeof DIMENSIONS];

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
      return c.json({ error: "Failed to generate image" }, 500);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error("No image in response:", JSON.stringify(data));
      return c.json({ error: "No image generated" }, 500);
    }

    // Return the base64 image data
    return c.json({
      success: true,
      imageData: imageUrl,
      type,
      dimensions: {
        width: dimensions.width,
        height: dimensions.height
      }
    });

  } catch (error) {
    console.error("Error generating image:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Handle OPTIONS for CORS
app.options("/*", (c) => c.text("OK"));

Deno.serve(app.fetch);
