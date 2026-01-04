# Compliance Checks & Guardrails Documentation

## Overview

Commerce PIX implements **server-side validation and guardrails** for each generation mode to ensure Amazon compliance and prevent misrepresentation. All inputs are automatically sanitized, with overrides and warnings recorded in the `prompt_payload` for full audit trails.

## Key Principles

1. **Automatic Sanitization**: Disallowed content is removed automatically
2. **Safe Defaults**: If user requests disallowed features, safe defaults are applied
3. **Full Audit Trail**: All overrides and warnings recorded in database
4. **Mode-Specific Rules**: Each mode has specific compliance requirements
5. **No User Bypass**: Compliance enforced server-side, users cannot override

---

## Mode-Specific Guardrails

### 1. `main_white` - Strict Amazon Main Image Rules

**Purpose**: Ensure compliance with Amazon main image requirements

#### Enforced Rules

✅ **Force pure white background (RGB: 255, 255, 255)**
- No exceptions
- Overrides any background requests

✅ **No text, words, or labels anywhere**
- Removes all text-related terms from inputs
- Enforces clean product-only shots

✅ **No props or accessories**
- Product ONLY, no context items
- Removes terms like "props", "accessories", "objects"

✅ **Product must be centered**
- Front-facing primary angle
- 80-85% of frame

✅ **Realistic studio lighting only**
- No dramatic, artistic, or moody lighting
- Even, professional illumination

#### Disallowed Terms

The following are automatically removed from descriptions and constraints:
- `text`, `words`, `label`, `typography`, `caption`
- `props`, `accessories`, `objects`, `items`
- `background scene`, `environment`, `context`
- `dramatic lighting`, `colored background`, `gradient`
- `shadow play`, `artistic lighting`, `moody`

#### Mandatory Constraints Added

```
MANDATORY: Pure white background (RGB: 255, 255, 255) - NO exceptions
MANDATORY: Absolutely no text, words, or labels anywhere in image
MANDATORY: No props, accessories, or context items - product ONLY
MANDATORY: Product centered in frame, front-facing angle
MANDATORY: Realistic studio lighting - no artistic or dramatic effects
```

#### Example Sanitization

**User Input**:
```json
{
  "mode": "main_white",
  "productDescription": "wireless headphones with text overlay showing features",
  "constraints": ["add props for context", "dramatic lighting"]
}
```

**Sanitized Input**:
```json
{
  "mode": "main_white",
  "productDescription": "wireless headphones",
  "constraints": [
    "MANDATORY: Pure white background (RGB: 255, 255, 255) - NO exceptions",
    "MANDATORY: Absolutely no text, words, or labels anywhere in image",
    "MANDATORY: No props, accessories, or context items - product ONLY",
    "MANDATORY: Product centered in frame, front-facing angle",
    "MANDATORY: Realistic studio lighting - no artistic or dramatic effects"
  ]
}
```

**Compliance Overrides Recorded**:
```json
[
  "Removed disallowed terms from product description for main_white mode",
  "Removed 2 constraints incompatible with main_white mode",
  "Applied main_white mandatory constraints: white background, no text, no props, centered product, realistic lighting"
]
```

**Warnings Recorded**:
```json
[
  "Original description contained terms incompatible with main_white: \"wireless headphones with text overlay showing features\" → \"wireless headphones\"",
  "Some constraints were removed for violating main_white rules"
]
```

---

### 2. `lifestyle` - Accurate Product Representation

**Purpose**: Allow context while preventing misrepresentation of included items

#### Enforced Rules

✅ **Props allowed but must be realistic**
- Context items OK if appropriate
- Must not suggest items are included

✅ **No misrepresentation of included items**
- Removes terms like "includes", "comes with", "bonus"
- Prevents fake bundle representations

✅ **Product must be accurate**
- No exaggeration of features
- Realistic representation only

✅ **Scene must be achievable in real life**
- No fantasy elements
- Authentic lifestyle settings

#### Disallowed Terms

- `fake`, `mockup`, `placeholder`, `dummy`
- `includes`, `comes with`, `bonus`, `free`
- `set of`, `bundle`, `package includes`

#### Mandatory Constraints Added

```
MANDATORY: All items shown must be realistic and appropriate for context
MANDATORY: Props do NOT imply they are included with product
MANDATORY: Product representation must be accurate - no exaggeration
MANDATORY: Scene must be achievable in real life - no fantasy elements
```

#### Example Sanitization

**User Input**:
```json
{
  "mode": "lifestyle",
  "productDescription": "coffee mug set of 4 includes free coasters",
  "constraints": ["show bundle with bonus items"]
}
```

**Sanitized Input**:
```json
{
  "mode": "lifestyle",
  "productDescription": "coffee mug",
  "constraints": [
    "MANDATORY: All items shown must be realistic and appropriate for context",
    "MANDATORY: Props do NOT imply they are included with product",
    "MANDATORY: Product representation must be accurate - no exaggeration",
    "MANDATORY: Scene must be achievable in real life - no fantasy elements"
  ]
}
```

**Compliance Overrides Recorded**:
```json
[
  "Removed terms suggesting misrepresentation from description",
  "Removed constraints that could misrepresent included items",
  "Applied lifestyle mandatory constraints: realistic props, no misrepresentation, accurate product"
]
```

---

### 3. `feature_callout` - Text Allowed But Factual Only

**Purpose**: Enable feature highlights while preventing fake claims

#### Enforced Rules

✅ **Text overlays ARE allowed** (ONLY mode where text is permitted)
- Informative text OK
- Must be factual, not promotional

✅ **No fake certifications or claims**
- Removes terms like "FDA approved", "certified"
- No unverifiable statements

✅ **No promotional hype**
- Removes "best seller", "award-winning", "#1"
- Focus on actual product features

✅ **Visual callouts must be professional**
- Arrows, circles, lines allowed
- Must be subtle and clean

#### Disallowed Terms

- `certified`, `approved`, `FDA`, `medical grade`
- `guaranteed`, `proven`, `scientifically tested`
- `award-winning`, `best seller`, `#1`
- `patent`, `trademarked`, `copyrighted`

#### Mandatory Constraints Added

```
ALLOWED: Subtle text overlays for feature descriptions (only mode where text is permitted)
MANDATORY: Text must be informative and factual - no promotional claims
MANDATORY: No certifications, awards, or unverifiable claims
MANDATORY: Visual callouts (arrows, circles) must be professional and minimal
MANDATORY: Focus on actual product features, not marketing hype
```

#### Example Sanitization

**User Input**:
```json
{
  "mode": "feature_callout",
  "productDescription": "FDA approved medical-grade water bottle, award-winning #1 seller",
  "constraints": ["show certified organic badge", "patent pending notation"]
}
```

**Sanitized Input**:
```json
{
  "mode": "feature_callout",
  "productDescription": "water bottle",
  "constraints": [
    "ALLOWED: Subtle text overlays for feature descriptions (only mode where text is permitted)",
    "MANDATORY: Text must be informative and factual - no promotional claims",
    "MANDATORY: No certifications, awards, or unverifiable claims",
    "MANDATORY: Visual callouts (arrows, circles) must be professional and minimal",
    "MANDATORY: Focus on actual product features, not marketing hype"
  ]
}
```

**Compliance Overrides Recorded**:
```json
[
  "Removed potentially fake claims from description",
  "Removed constraints with unverifiable claims",
  "Applied feature_callout mandatory constraints: text allowed but must be factual, no fake claims"
]
```

---

### 4. `packaging` - Generic Design, No Fake Certifications

**Purpose**: Show professional packaging without invented claims

#### Enforced Rules

✅ **Generic professional packaging**
- Retail-ready appearance
- No specific competitor branding

✅ **No certification seals or badges**
- Removes "organic seal", "USDA organic"
- No award or certification marks

✅ **No fake ingredient claims**
- Removes specific health statements
- No unverifiable benefits

✅ **No trademarked symbols**
- Removes ®, ™, patent claims
- Generic brand elements only

#### Disallowed Terms

- `organic seal`, `USDA organic`, `certified organic`
- `FDA approved`, `medical device`, `prescription`
- `patent pending`, `trademarked`, `®`, `™`
- `award seal`, `badge`, `certification mark`
- `contains [specific ingredient claim]`

#### Mandatory Constraints Added

```
MANDATORY: Show product with generic professional retail packaging
MANDATORY: No certification seals, badges, or award marks on package
MANDATORY: No specific ingredient claims or health statements
MANDATORY: Package design must be realistic and achievable
MANDATORY: No trademarked symbols (®, ™) or patent claims
```

#### Example Sanitization

**User Input**:
```json
{
  "mode": "packaging",
  "productDescription": "USDA Organic® protein powder with FDA approved seal",
  "constraints": ["show patent pending notation", "certified organic badge on box"]
}
```

**Sanitized Input**:
```json
{
  "mode": "packaging",
  "productDescription": "protein powder",
  "constraints": [
    "MANDATORY: Show product with generic professional retail packaging",
    "MANDATORY: No certification seals, badges, or award marks on package",
    "MANDATORY: No specific ingredient claims or health statements",
    "MANDATORY: Package design must be realistic and achievable",
    "MANDATORY: No trademarked symbols (®, ™) or patent claims"
  ]
}
```

**Compliance Overrides Recorded**:
```json
[
  "Removed fake certifications/claims from description",
  "Removed constraints with fake certifications",
  "Applied packaging mandatory constraints: no fake certifications, no invented claims, generic design"
]
```

---

## Implementation Details

### Validation Pipeline

```
User Input
    ↓
Mode-Specific Validation
    ↓
Check for Disallowed Terms
    ↓
Sanitize Text (remove disallowed content)
    ↓
Apply Mandatory Constraints
    ↓
Record Overrides & Warnings
    ↓
Sanitized Input + Audit Trail
    ↓
Build Prompt
    ↓
Store in prompt_payload (database)
```

### Code Structure

**File**: `lib/prompts.ts`

**Key Functions**:
- `validateInputs(mode, inputs)` - Main validation dispatcher
- `validateMainWhiteInputs(inputs)` - main_white guardrails
- `validateLifestyleInputs(inputs)` - lifestyle guardrails
- `validateFeatureCalloutInputs(inputs)` - feature_callout guardrails
- `validatePackagingInputs(inputs)` - packaging guardrails
- `sanitizeText(text, disallowedTerms)` - Remove disallowed content
- `containsDisallowedTerms(text, terms)` - Check for violations

### Audit Trail in Database

Every generation stores complete compliance information in `assets.prompt_payload`:

```json
{
  "mode": "main_white",
  "version": "v1",
  "inputs": {
    "productDescription": "wireless headphones with text overlay",
    "constraints": ["add props", "dramatic lighting"]
  },
  "sanitizedInputs": {
    "productDescription": "wireless headphones",
    "constraints": [
      "MANDATORY: Pure white background (RGB: 255, 255, 255) - NO exceptions",
      "MANDATORY: Absolutely no text, words, or labels anywhere in image",
      "MANDATORY: No props, accessories, or context items - product ONLY",
      "MANDATORY: Product centered in frame, front-facing angle",
      "MANDATORY: Realistic studio lighting - no artistic or dramatic effects"
    ]
  },
  "constraints": [...],
  "template": "main_white_v1",
  "generatedAt": "2026-01-05T00:15:00.000Z",
  "complianceOverrides": [
    "Removed disallowed terms from product description for main_white mode",
    "Removed 2 constraints incompatible with main_white mode",
    "Applied main_white mandatory constraints: white background, no text, no props, centered product, realistic lighting"
  ],
  "complianceWarnings": [
    "Original description contained terms incompatible with main_white: \"wireless headphones with text overlay\" → \"wireless headphones\"",
    "Some constraints were removed for violating main_white rules"
  ]
}
```

---

## Testing

### Test Scenarios

#### Scenario 1: main_white with Disallowed Content

**Input**:
```bash
POST /api/generate
{
  "inputAssetId": "uuid",
  "mode": "main_white",
  "productDescription": "headphones with product label text",
  "constraints": ["add background props", "moody dramatic lighting"]
}
```

**Expected Behavior**:
- ✅ "with product label text" removed from description
- ✅ Both constraints removed
- ✅ Mandatory white background constraint added
- ✅ Overrides recorded in prompt_payload
- ✅ Warnings recorded in prompt_payload

#### Scenario 2: lifestyle with Misrepresentation

**Input**:
```bash
POST /api/generate
{
  "inputAssetId": "uuid",
  "mode": "lifestyle",
  "productDescription": "coffee mug bundle includes free coasters",
  "constraints": ["show set of 4 mugs", "bonus items included"]
}
```

**Expected Behavior**:
- ✅ "bundle includes free coasters" removed
- ✅ Both constraints removed for misrepresentation
- ✅ Mandatory accuracy constraints added
- ✅ Overrides recorded
- ✅ Warnings recorded

#### Scenario 3: feature_callout with Fake Claims

**Input**:
```bash
POST /api/generate
{
  "inputAssetId": "uuid",
  "mode": "feature_callout",
  "productDescription": "FDA approved certified organic water bottle",
  "constraints": ["show award-winning badge", "patent pending notation"]
}
```

**Expected Behavior**:
- ✅ "FDA approved certified organic" removed
- ✅ Both constraints removed
- ✅ Text allowed but factual only constraint added
- ✅ Overrides recorded
- ✅ Warnings recorded

#### Scenario 4: packaging with Fake Certifications

**Input**:
```bash
POST /api/generate
{
  "inputAssetId": "uuid",
  "mode": "packaging",
  "productDescription": "USDA Organic® protein powder",
  "constraints": ["show certification seal", "trademarked symbol on box"]
}
```

**Expected Behavior**:
- ✅ "USDA Organic®" removed
- ✅ Both constraints removed
- ✅ Generic packaging constraints added
- ✅ Overrides recorded
- ✅ Warnings recorded

### Verification Queries

**Check compliance overrides in database**:
```sql
SELECT 
  id,
  mode,
  prompt_payload->'complianceOverrides' as overrides,
  prompt_payload->'complianceWarnings' as warnings
FROM assets
WHERE kind = 'output'
AND prompt_payload->'complianceOverrides' IS NOT NULL;
```

**Count generations by mode with overrides**:
```sql
SELECT 
  mode,
  COUNT(*) as total,
  SUM(CASE WHEN prompt_payload->'complianceOverrides' IS NOT NULL THEN 1 ELSE 0 END) as with_overrides
FROM assets
WHERE kind = 'output'
GROUP BY mode;
```

---

## Security Benefits

### 1. Automatic Compliance
- All inputs sanitized server-side
- Users cannot bypass rules
- Consistent enforcement across all generations

### 2. Legal Protection
- No fake certifications generated
- No misrepresentation of products
- Amazon compliance maintained

### 3. Brand Safety
- No inappropriate text or claims
- Professional quality guaranteed
- Consistent brand standards

### 4. Full Audit Trail
- Every override recorded
- Historical compliance verification
- Debugging and analysis possible

### 5. User Guidance
- Warnings help users understand rules
- Automatic corrections save time
- No need for manual compliance checks

---

## API Response with Compliance Info

When compliance overrides occur, they are stored in the database but not immediately returned to the API response (to avoid confusion). Users can check the `prompt_payload` in the `assets` table after generation completes.

### Query for Compliance Info

```typescript
// After generation completes
const asset = await getAsset(outputAssetId)

console.log('Compliance Overrides:', asset.prompt_payload.complianceOverrides)
console.log('Compliance Warnings:', asset.prompt_payload.complianceWarnings)
console.log('Original Inputs:', asset.prompt_payload.inputs)
console.log('Sanitized Inputs:', asset.prompt_payload.sanitizedInputs)
```

---

## Future Enhancements

### 1. User Notifications
Show warnings in UI when inputs are sanitized:
```json
{
  "message": "Your inputs were adjusted for Amazon compliance",
  "warnings": [
    "Text overlays not allowed in main_white mode - removed",
    "Props removed for compliance"
  ]
}
```

### 2. Compliance Reports
Generate compliance reports:
- % of generations requiring overrides
- Most common violations by mode
- Trends over time

### 3. Learning Mode
Teach users about compliance:
- Suggest correct inputs
- Explain why terms were removed
- Provide best practices

### 4. Custom Compliance Rules
Allow enterprise customers to add custom rules:
- Industry-specific requirements
- Brand guidelines
- Regional regulations

---

## Related Documentation

- [Prompt Library](./PROMPT_LIBRARY.md) - Prompt templates
- [OpenAI Integration](./OPENAI_INTEGRATION.md) - Image transformation
- [API Documentation](./API_DOCUMENTATION.md) - API reference

---

**Status**: ✅ Implemented  
**Last Updated**: 2026-01-05  
**Version**: 1.0

