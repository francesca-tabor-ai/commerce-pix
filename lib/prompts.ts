import 'server-only'

/**
 * Prompt Library for Commerce PIX
 * 
 * Server-side only prompt templates for AI image generation.
 * Clients select a mode, not the full prompt.
 */

// ============================================================================
// Types
// ============================================================================

export type Mode = 'main_white' | 'lifestyle' | 'feature_callout' | 'packaging'

export interface PromptInputs {
  productCategory?: string  // e.g., "electronics", "clothing", "food"
  brandTone?: string         // e.g., "professional", "playful", "luxury"
  productDescription?: string // e.g., "wireless headphones", "organic coffee"
  constraints?: string[]     // Additional constraints beyond defaults
}

export interface PromptResult {
  prompt: string              // Full prompt for DALL-E
  promptPayload: {           // JSON object for auditing
    mode: Mode
    version: string
    inputs: PromptInputs
    constraints: string[]
    template: string
    generatedAt: string
  }
}

// ============================================================================
// Amazon Compliance Rules (Applied to all prompts)
// ============================================================================

const AMAZON_COMPLIANCE_RULES = [
  'No visible logos or brand names from other companies',
  'No text or words on the product (except authentic product branding)',
  'No offensive, inappropriate, or misleading imagery',
  'Professional quality suitable for e-commerce',
  'Clear product visibility from front/primary angle',
  'Well-lit with proper exposure and color accuracy',
  'No watermarks, borders, or decorative frames',
  'High resolution and sharp focus on product',
]

// ============================================================================
// Helper Functions
// ============================================================================

function buildConstraintsText(additionalConstraints: string[] = []): string {
  const allConstraints = [...AMAZON_COMPLIANCE_RULES, ...additionalConstraints]
  return allConstraints.map(c => `- ${c}`).join('\n')
}

function getToneDescription(tone?: string): string {
  const tones: Record<string, string> = {
    professional: 'professional, clean, and business-appropriate',
    luxury: 'luxurious, premium, and high-end',
    playful: 'fun, energetic, and approachable',
    minimal: 'minimalist, simple, and elegant',
    bold: 'bold, striking, and attention-grabbing',
  }
  return tone && tones[tone.toLowerCase()] 
    ? tones[tone.toLowerCase()] 
    : 'professional and appealing'
}

function getCategoryContext(category?: string): string {
  const contexts: Record<string, string> = {
    electronics: 'modern tech product',
    clothing: 'fashion item',
    food: 'food product',
    beauty: 'beauty or cosmetic product',
    home: 'home goods item',
    toys: 'toy or children\'s product',
    sports: 'sports or fitness equipment',
    books: 'book or publication',
  }
  return category && contexts[category.toLowerCase()] 
    ? contexts[category.toLowerCase()] 
    : 'product'
}

// ============================================================================
// Prompt Templates
// ============================================================================

/**
 * main_white_v1: Professional product photo on pure white background
 * Ideal for: Amazon main images, product catalogs, e-commerce listings
 */
export function buildMainWhitePrompt(inputs: PromptInputs): PromptResult {
  const productDesc = inputs.productDescription || 'a product'
  const categoryContext = getCategoryContext(inputs.productCategory)
  const tone = getToneDescription(inputs.brandTone)
  
  const template = `Create a professional product photography image of ${productDesc} (${categoryContext}).

COMPOSITION:
- Pure white background (RGB: 255, 255, 255)
- Product centered in frame
- Front-facing primary angle
- Product takes up 80-85% of frame
- Slight shadow under product for depth

LIGHTING:
- Bright, even lighting from multiple angles
- No harsh shadows
- Proper exposure with no overblown highlights
- Natural color representation

STYLE:
- ${tone} aesthetic
- Commercial photography quality
- Professional studio setup
- Sharp focus throughout product

REQUIREMENTS:
${buildConstraintsText(inputs.constraints)}

Create a high-quality e-commerce product image suitable for Amazon main image guidelines.`

  return {
    prompt: template,
    promptPayload: {
      mode: 'main_white',
      version: 'v1',
      inputs,
      constraints: [...AMAZON_COMPLIANCE_RULES, ...(inputs.constraints || [])],
      template: 'main_white_v1',
      generatedAt: new Date().toISOString(),
    },
  }
}

/**
 * lifestyle_v1: Product in real-world context
 * Ideal for: Secondary images, lifestyle shots, usage scenarios
 */
export function buildLifestylePrompt(inputs: PromptInputs): PromptResult {
  const productDesc = inputs.productDescription || 'a product'
  const categoryContext = getCategoryContext(inputs.productCategory)
  const tone = getToneDescription(inputs.brandTone)
  
  const template = `Create a lifestyle product photography image showing ${productDesc} (${categoryContext}) in a real-world setting.

SCENE:
- Natural, authentic environment where product would be used
- Product in context but clearly visible as the focal point
- Realistic setting with complementary props or background
- Human element optional (hands using product, or lifestyle context)

COMPOSITION:
- Product prominent but naturally integrated into scene
- Rule of thirds or other compositionally pleasing arrangement
- Depth of field that keeps product in sharp focus
- Environmental elements support but don't distract from product

LIGHTING:
- Natural or natural-looking lighting
- Warm, inviting atmosphere
- Proper exposure across the scene
- Highlights product features

STYLE:
- ${tone} aesthetic
- Authentic and relatable
- High-quality lifestyle photography
- Aspirational yet achievable scene

REQUIREMENTS:
${buildConstraintsText(inputs.constraints)}

Create a compelling lifestyle image that shows the product in context while maintaining e-commerce standards.`

  return {
    prompt: template,
    promptPayload: {
      mode: 'lifestyle',
      version: 'v1',
      inputs,
      constraints: [...AMAZON_COMPLIANCE_RULES, ...(inputs.constraints || [])],
      template: 'lifestyle_v1',
      generatedAt: new Date().toISOString(),
    },
  }
}

/**
 * feature_callout_v1: Highlight specific product features
 * Ideal for: Feature highlights, infographic-style images, benefit callouts
 */
export function buildFeatureCalloutPrompt(inputs: PromptInputs): PromptResult {
  const productDesc = inputs.productDescription || 'a product'
  const categoryContext = getCategoryContext(inputs.productCategory)
  const tone = getToneDescription(inputs.brandTone)
  
  const template = `Create a feature callout product photography image for ${productDesc} (${categoryContext}) that highlights key features and benefits.

COMPOSITION:
- Clean, uncluttered background (light gray or white)
- Product positioned to showcase important features
- Multiple angles or close-up details if beneficial
- Visual hierarchy emphasizing key selling points

VISUAL ELEMENTS:
- Subtle visual cues pointing to key features (arrows, circles, or lines)
- Close-up insets showing important details or textures
- Zoom-in sections highlighting specific areas
- Clean, minimal graphic elements that enhance rather than distract

LIGHTING:
- Bright, clear lighting
- Detail-revealing illumination
- Consistent lighting across all elements
- No harsh shadows that obscure features

STYLE:
- ${tone} aesthetic
- Informative and clear
- Professional infographic-style presentation
- Marketing-focused but not cluttered

REQUIREMENTS:
${buildConstraintsText(inputs.constraints)}
- Visual callouts must be subtle and professional
- Focus on product features, not text

Create an informative feature callout image that clearly communicates product benefits while maintaining professional quality.`

  return {
    prompt: template,
    promptPayload: {
      mode: 'feature_callout',
      version: 'v1',
      inputs,
      constraints: [...AMAZON_COMPLIANCE_RULES, ...(inputs.constraints || [])],
      template: 'feature_callout_v1',
      generatedAt: new Date().toISOString(),
    },
  }
}

/**
 * packaging_v1: Product in retail packaging
 * Ideal for: Package shots, unboxing previews, retail displays
 */
export function buildPackagingPrompt(inputs: PromptInputs): PromptResult {
  const productDesc = inputs.productDescription || 'a product'
  const categoryContext = getCategoryContext(inputs.productCategory)
  const tone = getToneDescription(inputs.brandTone)
  
  const template = `Create a product packaging photography image showing ${productDesc} (${categoryContext}) in its retail package.

COMPOSITION:
- Product shown in complete retail packaging
- Angled view that shows front panel and side/top for dimension
- Package takes up 75-85% of frame
- Clean white or light gray background
- Package positioned at appealing 3/4 angle

PACKAGING PRESENTATION:
- Packaging appears professional and retail-ready
- Brand elements visible but not specific competitor logos
- Package design appears modern and shelf-worthy
- Clear view of what's inside (if window box) or package graphics
- Sealed, new condition appearance

LIGHTING:
- Professional studio lighting
- Even illumination showing package details
- Minimal glare on any plastic/glossy surfaces
- Colors rendered accurately
- Shadows add depth without obscuring details

STYLE:
- ${tone} aesthetic
- Retail photography quality
- Professional and polished
- Suitable for online and offline retail

REQUIREMENTS:
${buildConstraintsText(inputs.constraints)}
- Generic retail packaging design (no specific competitor branding)
- Professional product packaging appearance

Create a high-quality packaging image suitable for e-commerce and retail display.`

  return {
    prompt: template,
    promptPayload: {
      mode: 'packaging',
      version: 'v1',
      inputs,
      constraints: [...AMAZON_COMPLIANCE_RULES, ...(inputs.constraints || [])],
      template: 'packaging_v1',
      generatedAt: new Date().toISOString(),
    },
  }
}

// ============================================================================
// Main Builder Function
// ============================================================================

/**
 * Build a prompt for the specified mode
 * 
 * @param mode - Generation mode
 * @param inputs - Structured prompt inputs
 * @returns Prompt result with full prompt and audit payload
 */
export function buildPrompt(mode: Mode, inputs: PromptInputs = {}): PromptResult {
  switch (mode) {
    case 'main_white':
      return buildMainWhitePrompt(inputs)
    case 'lifestyle':
      return buildLifestylePrompt(inputs)
    case 'feature_callout':
      return buildFeatureCalloutPrompt(inputs)
    case 'packaging':
      return buildPackagingPrompt(inputs)
    default:
      throw new Error(`Unknown mode: ${mode}`)
  }
}

// ============================================================================
// Exports
// ============================================================================

export {
  buildMainWhitePrompt,
  buildLifestylePrompt,
  buildFeatureCalloutPrompt,
  buildPackagingPrompt,
}

