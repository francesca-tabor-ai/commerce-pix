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
    sanitizedInputs?: PromptInputs  // Inputs after sanitization
    constraints: string[]
    template: string
    generatedAt: string
    complianceOverrides?: string[]  // Record of any overrides applied
    complianceWarnings?: string[]   // Warnings about sanitized content
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
// Compliance Validation & Sanitization
// ============================================================================

interface ComplianceResult {
  sanitizedInputs: PromptInputs
  overrides: string[]
  warnings: string[]
}

/**
 * Sanitize text to remove disallowed content
 */
function sanitizeText(text: string, disallowedTerms: string[]): string {
  let sanitized = text
  
  for (const term of disallowedTerms) {
    const regex = new RegExp(term, 'gi')
    sanitized = sanitized.replace(regex, '')
  }
  
  return sanitized.trim()
}

/**
 * Check if text contains disallowed terms
 */
function containsDisallowedTerms(text: string, disallowedTerms: string[]): boolean {
  const lowerText = text.toLowerCase()
  return disallowedTerms.some(term => lowerText.includes(term.toLowerCase()))
}

/**
 * Validate and sanitize inputs for main_white mode
 * 
 * Guardrails:
 * - Force pure white background
 * - No text overlays or words
 * - No props or context items
 * - Product must be centered
 * - Realistic lighting only
 */
function validateMainWhiteInputs(inputs: PromptInputs): ComplianceResult {
  const overrides: string[] = []
  const warnings: string[] = []
  const sanitizedInputs: PromptInputs = { ...inputs }
  
  // Disallowed terms for main_white
  const disallowedTerms = [
    'text', 'words', 'label', 'typography', 'caption',
    'props', 'accessories', 'objects', 'items',
    'background scene', 'environment', 'context',
    'dramatic lighting', 'colored background', 'gradient',
    'shadow play', 'artistic lighting', 'moody',
  ]
  
  // Check and sanitize product description
  if (inputs.productDescription) {
    if (containsDisallowedTerms(inputs.productDescription, disallowedTerms)) {
      const original = inputs.productDescription
      sanitizedInputs.productDescription = sanitizeText(inputs.productDescription, disallowedTerms)
      overrides.push(`Removed disallowed terms from product description for main_white mode`)
      warnings.push(`Original description contained terms incompatible with main_white: "${original}" → "${sanitizedInputs.productDescription}"`)
    }
  }
  
  // Check and sanitize constraints
  if (inputs.constraints && inputs.constraints.length > 0) {
    const originalConstraints = [...inputs.constraints]
    sanitizedInputs.constraints = inputs.constraints
      .map(c => sanitizeText(c, disallowedTerms))
      .filter(c => c.length > 0)
    
    if (originalConstraints.length !== sanitizedInputs.constraints.length) {
      overrides.push(`Removed ${originalConstraints.length - sanitizedInputs.constraints.length} constraints incompatible with main_white mode`)
      warnings.push(`Some constraints were removed for violating main_white rules`)
    }
  }
  
  // Force main_white specific constraints
  const forcedConstraints = [
    'MANDATORY: Pure white background (RGB: 255, 255, 255) - NO exceptions',
    'MANDATORY: Absolutely no text, words, or labels anywhere in image',
    'MANDATORY: No props, accessories, or context items - product ONLY',
    'MANDATORY: Product centered in frame, front-facing angle',
    'MANDATORY: Realistic studio lighting - no artistic or dramatic effects',
  ]
  
  sanitizedInputs.constraints = [
    ...(sanitizedInputs.constraints || []),
    ...forcedConstraints,
  ]
  
  overrides.push('Applied main_white mandatory constraints: white background, no text, no props, centered product, realistic lighting')
  
  return { sanitizedInputs, overrides, warnings }
}

/**
 * Validate and sanitize inputs for lifestyle mode
 * 
 * Guardrails:
 * - Allow context props but must be realistic
 * - No fake items or misrepresentation
 * - Product must be accurate and real
 * - Props must be appropriate for context
 */
function validateLifestyleInputs(inputs: PromptInputs): ComplianceResult {
  const overrides: string[] = []
  const warnings: string[] = []
  const sanitizedInputs: PromptInputs = { ...inputs }
  
  // Disallowed terms that suggest fake/misrepresented items
  const disallowedTerms = [
    'fake', 'mockup', 'placeholder', 'dummy',
    'includes', 'comes with', 'bonus', 'free',
    'set of', 'bundle', 'package includes',
  ]
  
  // Check product description for misrepresentation
  if (inputs.productDescription) {
    if (containsDisallowedTerms(inputs.productDescription, disallowedTerms)) {
      const original = inputs.productDescription
      sanitizedInputs.productDescription = sanitizeText(inputs.productDescription, disallowedTerms)
      overrides.push(`Removed terms suggesting misrepresentation from description`)
      warnings.push(`Original description may have suggested included items: "${original}" → "${sanitizedInputs.productDescription}"`)
    }
  }
  
  // Check constraints for misrepresentation
  if (inputs.constraints && inputs.constraints.length > 0) {
    const originalConstraints = [...inputs.constraints]
    sanitizedInputs.constraints = inputs.constraints
      .map(c => {
        if (containsDisallowedTerms(c, disallowedTerms)) {
          warnings.push(`Constraint removed for potential misrepresentation: "${c}"`)
          return ''
        }
        return c
      })
      .filter(c => c.length > 0)
    
    if (originalConstraints.length !== sanitizedInputs.constraints.length) {
      overrides.push(`Removed constraints that could misrepresent included items`)
    }
  }
  
  // Force lifestyle accuracy constraints
  const forcedConstraints = [
    'MANDATORY: All items shown must be realistic and appropriate for context',
    'MANDATORY: Props do NOT imply they are included with product',
    'MANDATORY: Product representation must be accurate - no exaggeration',
    'MANDATORY: Scene must be achievable in real life - no fantasy elements',
  ]
  
  sanitizedInputs.constraints = [
    ...(sanitizedInputs.constraints || []),
    ...forcedConstraints,
  ]
  
  overrides.push('Applied lifestyle mandatory constraints: realistic props, no misrepresentation, accurate product')
  
  return { sanitizedInputs, overrides, warnings }
}

/**
 * Validate and sanitize inputs for feature_callout mode
 * 
 * Guardrails:
 * - Text overlays ARE allowed (only mode that permits this)
 * - Text must be informative, not promotional
 * - No fake certifications or claims
 * - Visual callouts must be professional
 */
function validateFeatureCalloutInputs(inputs: PromptInputs): ComplianceResult {
  const overrides: string[] = []
  const warnings: string[] = []
  const sanitizedInputs: PromptInputs = { ...inputs }
  
  // Disallowed promotional/fake claims
  const disallowedTerms = [
    'certified', 'approved', 'FDA', 'medical grade',
    'guaranteed', 'proven', 'scientifically tested',
    'award-winning', 'best seller', '#1',
    'patent', 'trademarked', 'copyrighted',
  ]
  
  // Check product description for fake claims
  if (inputs.productDescription) {
    if (containsDisallowedTerms(inputs.productDescription, disallowedTerms)) {
      const original = inputs.productDescription
      sanitizedInputs.productDescription = sanitizeText(inputs.productDescription, disallowedTerms)
      overrides.push(`Removed potentially fake claims from description`)
      warnings.push(`Original description contained unverifiable claims: "${original}" → "${sanitizedInputs.productDescription}"`)
    }
  }
  
  // Check constraints for fake certifications
  if (inputs.constraints && inputs.constraints.length > 0) {
    const originalConstraints = [...inputs.constraints]
    sanitizedInputs.constraints = inputs.constraints
      .map(c => {
        if (containsDisallowedTerms(c, disallowedTerms)) {
          warnings.push(`Constraint removed for unverifiable claim: "${c}"`)
          return ''
        }
        return c
      })
      .filter(c => c.length > 0)
    
    if (originalConstraints.length !== sanitizedInputs.constraints.length) {
      overrides.push(`Removed constraints with unverifiable claims`)
    }
  }
  
  // Force feature_callout specific constraints
  const forcedConstraints = [
    'ALLOWED: Subtle text overlays for feature descriptions (only mode where text is permitted)',
    'MANDATORY: Text must be informative and factual - no promotional claims',
    'MANDATORY: No certifications, awards, or unverifiable claims',
    'MANDATORY: Visual callouts (arrows, circles) must be professional and minimal',
    'MANDATORY: Focus on actual product features, not marketing hype',
  ]
  
  sanitizedInputs.constraints = [
    ...(sanitizedInputs.constraints || []),
    ...forcedConstraints,
  ]
  
  overrides.push('Applied feature_callout mandatory constraints: text allowed but must be factual, no fake claims')
  
  return { sanitizedInputs, overrides, warnings }
}

/**
 * Validate and sanitize inputs for packaging mode
 * 
 * Guardrails:
 * - Show product + packaging
 * - No invented certifications or seals
 * - No fake claims on package
 * - Package design must be generic/realistic
 */
function validatePackagingInputs(inputs: PromptInputs): ComplianceResult {
  const overrides: string[] = []
  const warnings: string[] = []
  const sanitizedInputs: PromptInputs = { ...inputs }
  
  // Disallowed fake certifications and claims
  const disallowedTerms = [
    'organic seal', 'USDA organic', 'certified organic',
    'FDA approved', 'medical device', 'prescription',
    'patent pending', 'trademarked', '®', '™',
    'award seal', 'badge', 'certification mark',
    'contains [specific ingredient claim]',
  ]
  
  // Check product description for fake package claims
  if (inputs.productDescription) {
    if (containsDisallowedTerms(inputs.productDescription, disallowedTerms)) {
      const original = inputs.productDescription
      sanitizedInputs.productDescription = sanitizeText(inputs.productDescription, disallowedTerms)
      overrides.push(`Removed fake certifications/claims from description`)
      warnings.push(`Original description contained unverifiable certifications: "${original}" → "${sanitizedInputs.productDescription}"`)
    }
  }
  
  // Check constraints for fake certifications
  if (inputs.constraints && inputs.constraints.length > 0) {
    const originalConstraints = [...inputs.constraints]
    sanitizedInputs.constraints = inputs.constraints
      .map(c => {
        if (containsDisallowedTerms(c, disallowedTerms)) {
          warnings.push(`Constraint removed for fake certification: "${c}"`)
          return ''
        }
        return c
      })
      .filter(c => c.length > 0)
    
    if (originalConstraints.length !== sanitizedInputs.constraints.length) {
      overrides.push(`Removed constraints with fake certifications`)
    }
  }
  
  // Force packaging specific constraints
  const forcedConstraints = [
    'MANDATORY: Show product with generic professional retail packaging',
    'MANDATORY: No certification seals, badges, or award marks on package',
    'MANDATORY: No specific ingredient claims or health statements',
    'MANDATORY: Package design must be realistic and achievable',
    'MANDATORY: No trademarked symbols (®, ™) or patent claims',
  ]
  
  sanitizedInputs.constraints = [
    ...(sanitizedInputs.constraints || []),
    ...forcedConstraints,
  ]
  
  overrides.push('Applied packaging mandatory constraints: no fake certifications, no invented claims, generic design')
  
  return { sanitizedInputs, overrides, warnings }
}

/**
 * Validate and sanitize inputs based on mode
 */
function validateInputs(mode: Mode, inputs: PromptInputs): ComplianceResult {
  switch (mode) {
    case 'main_white':
      return validateMainWhiteInputs(inputs)
    case 'lifestyle':
      return validateLifestyleInputs(inputs)
    case 'feature_callout':
      return validateFeatureCalloutInputs(inputs)
    case 'packaging':
      return validatePackagingInputs(inputs)
    default:
      return { sanitizedInputs: inputs, overrides: [], warnings: [] }
  }
}

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
 * 
 * STRICTEST MODE - Amazon Main Image Compliance:
 * - PURE white background (RGB: 255, 255, 255) - no exceptions
 * - NO props, accessories, or additional objects
 * - Realistic product representation only
 * - Centered composition
 * - NO text overlays, labels, or words anywhere
 */
export function buildMainWhitePrompt(inputs: PromptInputs): PromptResult {
  // Validate and sanitize inputs with compliance guardrails
  const { sanitizedInputs, overrides, warnings } = validateInputs('main_white', inputs)
  
  const productDesc = sanitizedInputs.productDescription || 'a product'
  const categoryContext = getCategoryContext(sanitizedInputs.productCategory)
  const tone = getToneDescription(sanitizedInputs.brandTone)
  
  const template = `Create a professional product photography image of ${productDesc} (${categoryContext}) on a PURE WHITE BACKGROUND.

CRITICAL REQUIREMENTS (NO EXCEPTIONS):
- Background: PURE white (RGB: 255, 255, 255) - absolutely no gradient, texture, or color
- Product ONLY: No props, no accessories, no additional objects, no staging items
- NO text overlays: No words, labels, captions, or typography anywhere in the image
- Realistic representation: Product must look exactly as it would in real life
- Centered: Product perfectly centered in frame, taking up 80-85% of image

COMPOSITION:
- Product centered horizontally and vertically
- Front-facing primary angle showing product clearly
- Product fills 80-85% of frame for maximum visibility
- Minimal drop shadow under product for depth (subtle, realistic)
- Clean edges with no background artifacts

LIGHTING:
- Bright, even, professional studio lighting
- Soft light from multiple angles to eliminate harsh shadows
- Proper exposure with accurate colors
- No overblown highlights or dark shadows
- Natural color representation of product

PHOTOGRAPHY QUALITY:
- ${tone} aesthetic
- High-resolution commercial photography standard
- Sharp focus throughout entire product
- Professional studio setup quality
- Suitable for Amazon main image requirements

FORBIDDEN ELEMENTS (STRICTLY PROHIBITED):
- NO text, words, labels, or typography
- NO props, staging items, or accessories
- NO people, hands, or body parts
- NO backgrounds other than pure white
- NO decorative elements or overlays
- NO shadows except subtle product drop shadow

REQUIREMENTS:
${buildConstraintsText(sanitizedInputs.constraints)}

Create a pristine, professional product image that meets Amazon's strictest main image guidelines.`

  return {
    prompt: template,
    promptPayload: {
      mode: 'main_white',
      version: 'v1',
      inputs,
      sanitizedInputs: sanitizedInputs !== inputs ? sanitizedInputs : undefined,
      constraints: [...AMAZON_COMPLIANCE_RULES, ...(sanitizedInputs.constraints || [])],
      template: 'main_white_v1',
      generatedAt: new Date().toISOString(),
      complianceOverrides: overrides.length > 0 ? overrides : undefined,
      complianceWarnings: warnings.length > 0 ? warnings : undefined,
    },
  }
}

/**
 * lifestyle_v1: Product in real-world context
 * Ideal for: Secondary images, lifestyle shots, usage scenarios
 * 
 * KEY REQUIREMENTS:
 * - Realistic scene that could exist in real life
 * - DO NOT invent included items or accessories
 * - Keep product representation accurate and realistic
 * - Props are for context ONLY, not to suggest they're included
 * - No misrepresentation of what customer receives
 */
export function buildLifestylePrompt(inputs: PromptInputs): PromptResult {
  // Validate and sanitize inputs with compliance guardrails
  const { sanitizedInputs, overrides, warnings } = validateInputs('lifestyle', inputs)
  
  const productDesc = sanitizedInputs.productDescription || 'a product'
  const categoryContext = getCategoryContext(sanitizedInputs.productCategory)
  const tone = getToneDescription(sanitizedInputs.brandTone)
  
  const template = `Create a lifestyle product photography image showing ${productDesc} (${categoryContext}) in a realistic, authentic real-world setting.

CRITICAL ACCURACY REQUIREMENTS:
- Product representation must be 100% accurate to actual product
- DO NOT invent additional items, accessories, or components
- Props are for CONTEXT ONLY - must not suggest they are included with product
- Scene must be achievable in real life - no fantasy or impossible scenarios
- Product shown EXACTLY as customer will receive it (no embellishments)

SCENE COMPOSITION:
- Natural, authentic environment where product would realistically be used
- Product clearly visible as primary focal point
- Environmental props provide context without implying inclusion
- Human element optional (hands using product, or lifestyle context)
- Realistic setting that enhances product without misrepresenting it

PRODUCT FOCUS:
- Product remains the clear hero of the image
- Product in sharp focus with clear visibility
- Complementary background elements stay secondary
- Rule of thirds or compositionally pleasing arrangement
- Depth of field keeps product prominent

LIGHTING & ATMOSPHERE:
- Natural or natural-looking lighting
- Warm, inviting, and authentic atmosphere
- Proper exposure showing product accurately
- Realistic lighting that could exist in actual setting
- Colors rendered accurately without enhancement

STYLE:
- ${tone} aesthetic
- Authentic and genuinely relatable
- High-quality lifestyle photography
- Aspirational yet realistically achievable scene
- Professional but not overly staged

FORBIDDEN ELEMENTS:
- NO invented accessories that might imply inclusion
- NO additional product components not actually included
- NO fantasy or impossible scenarios
- NO misleading product presentation
- NO props that suggest a bundle or set

REQUIREMENTS:
${buildConstraintsText(sanitizedInputs.constraints)}

Create an authentic lifestyle image that shows product in realistic context while maintaining complete accuracy about what's included.`

  return {
    prompt: template,
    promptPayload: {
      mode: 'lifestyle',
      version: 'v1',
      inputs,
      sanitizedInputs: sanitizedInputs !== inputs ? sanitizedInputs : undefined,
      constraints: [...AMAZON_COMPLIANCE_RULES, ...(sanitizedInputs.constraints || [])],
      template: 'lifestyle_v1',
      generatedAt: new Date().toISOString(),
      complianceOverrides: overrides.length > 0 ? overrides : undefined,
      complianceWarnings: warnings.length > 0 ? warnings : undefined,
    },
  }
}

/**
 * feature_callout_v1: Highlight specific product features
 * Ideal for: Feature highlights, infographic-style images, benefit callouts
 * 
 * KEY REQUIREMENTS:
 * - Text overlays ARE allowed (ONLY mode where text is permitted)
 * - Highlight exactly 3 key benefits/features
 * - Clean e-commerce style suitable for Amazon
 * - Professional, informative, not promotional
 */
export function buildFeatureCalloutPrompt(inputs: PromptInputs): PromptResult {
  // Validate and sanitize inputs with compliance guardrails
  const { sanitizedInputs, overrides, warnings } = validateInputs('feature_callout', inputs)
  
  const productDesc = sanitizedInputs.productDescription || 'a product'
  const categoryContext = getCategoryContext(sanitizedInputs.productCategory)
  const tone = getToneDescription(sanitizedInputs.brandTone)
  
  const template = `Create a feature callout product photography image for ${productDesc} (${categoryContext}) that highlights EXACTLY 3 key product benefits.

COMPOSITION:
- Clean, uncluttered background (light gray or white)
- Product positioned centrally to showcase features
- Space allocated for 3 benefit callouts around product
- Visual hierarchy with product as primary focal point

TEXT OVERLAY REQUIREMENTS (ONLY mode where text is allowed):
- Exactly 3 benefit callouts with short, factual descriptions
- Text must be minimal, informative, and professional
- Font should be clean, modern, sans-serif style
- Text color: dark gray or black for readability
- Text placement: strategically positioned near relevant product features
- Each callout: 3-5 words maximum per benefit

VISUAL ELEMENTS:
- Subtle arrows, lines, or circles connecting text to features
- Minimal graphic elements (dots, icons) that enhance clarity
- Clean, professional infographic style
- No decorative elements that distract from product

LIGHTING:
- Bright, clear, professional lighting
- Detail-revealing illumination on key features
- Consistent lighting across entire image
- No harsh shadows obscuring product details

STYLE:
- ${tone} aesthetic
- Clean e-commerce presentation
- Professional and informative (not promotional)
- Amazon-ready image quality

REQUIREMENTS:
${buildConstraintsText(sanitizedInputs.constraints)}

Create a professional feature callout image with exactly 3 benefits highlighted, suitable for Amazon product listings.`

  return {
    prompt: template,
    promptPayload: {
      mode: 'feature_callout',
      version: 'v1',
      inputs,
      sanitizedInputs: sanitizedInputs !== inputs ? sanitizedInputs : undefined,
      constraints: [...AMAZON_COMPLIANCE_RULES, ...(sanitizedInputs.constraints || [])],
      template: 'feature_callout_v1',
      generatedAt: new Date().toISOString(),
      complianceOverrides: overrides.length > 0 ? overrides : undefined,
      complianceWarnings: warnings.length > 0 ? warnings : undefined,
    },
  }
}

/**
 * packaging_v1: Product in retail packaging
 * Ideal for: Package shots, unboxing previews, retail displays
 * 
 * KEY REQUIREMENTS:
 * - Show product + packaging accurately
 * - NO fake claims, certifications, or seals
 * - NO invented badges, awards, or quality marks
 * - Generic, professional packaging design only
 * - Realistic retail presentation
 */
export function buildPackagingPrompt(inputs: PromptInputs): PromptResult {
  // Validate and sanitize inputs with compliance guardrails
  const { sanitizedInputs, overrides, warnings } = validateInputs('packaging', inputs)
  
  const productDesc = sanitizedInputs.productDescription || 'a product'
  const categoryContext = getCategoryContext(sanitizedInputs.productCategory)
  const tone = getToneDescription(sanitizedInputs.brandTone)
  
  const template = `Create a product packaging photography image showing ${productDesc} (${categoryContext}) in accurate, professional retail packaging.

CRITICAL ACCURACY REQUIREMENTS:
- Product and packaging shown EXACTLY as customer will receive
- NO fake certifications, seals, or badges (e.g., "USDA Organic", "FDA Approved")
- NO award marks, quality seals, or invented credentials
- NO specific ingredient claims or unverified health statements
- NO trademarked symbols (®, ™) or patent claims
- Packaging design must be generic and achievable in real production

COMPOSITION:
- Product shown in complete, professional retail packaging
- Angled 3/4 view showing front panel plus side/top for dimension
- Package takes up 75-85% of frame for clear visibility
- Clean white or light neutral gray background
- Package positioned at appealing, shelf-ready angle

PACKAGING PRESENTATION:
- Professional, retail-ready packaging appearance
- Generic brand elements (no competitor logos)
- Modern, shelf-worthy package design
- Clear view of actual product inside (if window box)
- Sealed, pristine new condition
- Realistic printing and materials quality

PACKAGE DETAILS:
- Simple, clean graphics appropriate for retail
- Product name and category clearly visible
- Generic descriptive text (no fake claims)
- Professional color scheme and typography
- Barcode/UPC area shown but not readable
- Realistic packaging materials (cardboard, plastic, etc.)

LIGHTING & PHOTOGRAPHY:
- Professional studio lighting for retail quality
- Even illumination showing all package details
- Minimal glare on plastic/glossy surfaces
- Accurate color reproduction of packaging
- Subtle shadows for depth without obscuring information

STYLE:
- ${tone} aesthetic
- High-quality retail product photography
- Professional and polished presentation
- Suitable for e-commerce and in-store display
- Realistic and achievable packaging design

STRICTLY FORBIDDEN:
- NO certification seals or badges (organic, FDA, medical, etc.)
- NO award marks or "best in class" claims
- NO trademarked symbols or patent claims
- NO specific health claims or ingredient guarantees
- NO competitor logos or brand references
- NO quality marks that require actual certification

REQUIREMENTS:
${buildConstraintsText(sanitizedInputs.constraints)}

Create an accurate, professional packaging image with realistic retail presentation and NO fake claims or certifications.`

  return {
    prompt: template,
    promptPayload: {
      mode: 'packaging',
      version: 'v1',
      inputs,
      sanitizedInputs: sanitizedInputs !== inputs ? sanitizedInputs : undefined,
      constraints: [...AMAZON_COMPLIANCE_RULES, ...(sanitizedInputs.constraints || [])],
      template: 'packaging_v1',
      generatedAt: new Date().toISOString(),
      complianceOverrides: overrides.length > 0 ? overrides : undefined,
      complianceWarnings: warnings.length > 0 ? warnings : undefined,
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
