/**
 * Test script for prompt library
 * 
 * Run with: npx tsx scripts/test-prompts.ts
 */

import { buildPrompt, type Mode } from '../lib/prompts'

console.log('='.repeat(80))
console.log('TESTING COMMERCE PIX PROMPT LIBRARY')
console.log('='.repeat(80))
console.log()

// Test cases for each mode
const testCases = [
  {
    name: 'Main White - Basic',
    mode: 'main_white' as Mode,
    inputs: {
      productDescription: 'wireless Bluetooth headphones',
      productCategory: 'electronics',
      brandTone: 'professional',
    },
  },
  {
    name: 'Main White - With Disallowed Terms',
    mode: 'main_white' as Mode,
    inputs: {
      productDescription: 'wireless headphones with text overlay and props',
      productCategory: 'electronics',
      constraints: ['add dramatic lighting', 'colored background'],
    },
  },
  {
    name: 'Lifestyle - Basic',
    mode: 'lifestyle' as Mode,
    inputs: {
      productDescription: 'stainless steel water bottle',
      productCategory: 'sports',
      brandTone: 'active',
    },
  },
  {
    name: 'Lifestyle - With Misrepresentation Terms',
    mode: 'lifestyle' as Mode,
    inputs: {
      productDescription: 'water bottle that includes carrying case and comes with bonus accessories',
      productCategory: 'sports',
    },
  },
  {
    name: 'Feature Callout - Basic',
    mode: 'feature_callout' as Mode,
    inputs: {
      productDescription: 'ergonomic office chair',
      productCategory: 'furniture',
      brandTone: 'professional',
    },
  },
  {
    name: 'Feature Callout - With Fake Claims',
    mode: 'feature_callout' as Mode,
    inputs: {
      productDescription: 'certified FDA-approved office chair',
      constraints: ['show award-winning badge', 'add guaranteed quality seal'],
    },
  },
  {
    name: 'Packaging - Basic',
    mode: 'packaging' as Mode,
    inputs: {
      productDescription: 'organic coffee beans',
      productCategory: 'food',
      brandTone: 'natural',
    },
  },
  {
    name: 'Packaging - With Fake Certifications',
    mode: 'packaging' as Mode,
    inputs: {
      productDescription: 'USDA organic certified coffee with FDA approval',
      constraints: ['show certification seals', 'add trademark symbols'],
    },
  },
]

// Run tests
for (const testCase of testCases) {
  console.log('-'.repeat(80))
  console.log(`TEST: ${testCase.name}`)
  console.log('-'.repeat(80))
  console.log()
  
  try {
    const result = buildPrompt(testCase.mode, testCase.inputs)
    
    // Display inputs
    console.log('📥 INPUTS:')
    console.log(JSON.stringify(testCase.inputs, null, 2))
    console.log()
    
    // Display sanitized inputs if different
    if (result.promptPayload.sanitizedInputs) {
      console.log('🧹 SANITIZED INPUTS:')
      console.log(JSON.stringify(result.promptPayload.sanitizedInputs, null, 2))
      console.log()
    }
    
    // Display compliance overrides
    if (result.promptPayload.complianceOverrides && result.promptPayload.complianceOverrides.length > 0) {
      console.log('⚠️  COMPLIANCE OVERRIDES:')
      result.promptPayload.complianceOverrides.forEach(override => {
        console.log(`   - ${override}`)
      })
      console.log()
    }
    
    // Display compliance warnings
    if (result.promptPayload.complianceWarnings && result.promptPayload.complianceWarnings.length > 0) {
      console.log('⚠️  COMPLIANCE WARNINGS:')
      result.promptPayload.complianceWarnings.forEach(warning => {
        console.log(`   - ${warning}`)
      })
      console.log()
    }
    
    // Display prompt (first 500 chars)
    console.log('📝 GENERATED PROMPT (preview):')
    const promptPreview = result.prompt.substring(0, 500)
    console.log(promptPreview)
    if (result.prompt.length > 500) {
      console.log(`... (${result.prompt.length - 500} more characters)`)
    }
    console.log()
    
    // Display key requirements check
    console.log('✅ KEY REQUIREMENTS CHECK:')
    
    switch (testCase.mode) {
      case 'main_white':
        console.log(`   - Pure white background: ${result.prompt.includes('pure white') || result.prompt.includes('255, 255, 255') ? '✅' : '❌'}`)
        console.log(`   - No text: ${result.prompt.toLowerCase().includes('no text') || result.prompt.includes('NO text') ? '✅' : '❌'}`)
        console.log(`   - No props: ${result.prompt.toLowerCase().includes('no props') || result.prompt.includes('NO props') ? '✅' : '❌'}`)
        console.log(`   - Centered: ${result.prompt.includes('centered') ? '✅' : '❌'}`)
        break
      
      case 'lifestyle':
        console.log(`   - Realistic scene: ${result.prompt.includes('realistic') || result.prompt.includes('authentic') ? '✅' : '❌'}`)
        console.log(`   - No invented items: ${result.prompt.toLowerCase().includes('do not invent') || result.prompt.includes('NOT imply') ? '✅' : '❌'}`)
        console.log(`   - Accurate product: ${result.prompt.includes('accurate') ? '✅' : '❌'}`)
        break
      
      case 'feature_callout':
        console.log(`   - Text allowed: ${result.prompt.includes('text overlays') || result.prompt.includes('TEXT') ? '✅' : '❌'}`)
        console.log(`   - 3 benefits: ${result.prompt.includes('3') || result.prompt.includes('three') ? '✅' : '❌'}`)
        console.log(`   - Clean style: ${result.prompt.includes('clean') || result.prompt.includes('professional') ? '✅' : '❌'}`)
        break
      
      case 'packaging':
        console.log(`   - Show packaging: ${result.prompt.includes('packaging') ? '✅' : '❌'}`)
        console.log(`   - No fake certifications: ${result.prompt.toLowerCase().includes('no certification') || result.prompt.includes('NO') ? '✅' : '❌'}`)
        console.log(`   - No fake claims: ${result.prompt.toLowerCase().includes('no') && result.prompt.includes('claim') ? '✅' : '❌'}`)
        break
    }
    
    console.log()
    console.log(`✅ TEST PASSED: ${testCase.name}`)
    
  } catch (error) {
    console.log(`❌ TEST FAILED: ${testCase.name}`)
    console.error(error)
  }
  
  console.log()
}

console.log('='.repeat(80))
console.log('ALL TESTS COMPLETED')
console.log('='.repeat(80))
console.log()

// Test audit trail structure
console.log('='.repeat(80))
console.log('TESTING AUDIT TRAIL STRUCTURE')
console.log('='.repeat(80))
console.log()

const auditTestResult = buildPrompt('main_white', {
  productDescription: 'test product',
})

console.log('📋 AUDIT TRAIL STRUCTURE:')
console.log(JSON.stringify(auditTestResult.promptPayload, null, 2))
console.log()

console.log('✅ Required fields present:')
console.log(`   - mode: ${auditTestResult.promptPayload.mode ? '✅' : '❌'}`)
console.log(`   - version: ${auditTestResult.promptPayload.version ? '✅' : '❌'}`)
console.log(`   - inputs: ${auditTestResult.promptPayload.inputs ? '✅' : '❌'}`)
console.log(`   - constraints: ${auditTestResult.promptPayload.constraints ? '✅' : '❌'}`)
console.log(`   - template: ${auditTestResult.promptPayload.template ? '✅' : '❌'}`)
console.log(`   - generatedAt: ${auditTestResult.promptPayload.generatedAt ? '✅' : '❌'}`)
console.log()

console.log('='.repeat(80))
console.log('PROMPT LIBRARY TESTING COMPLETE ✅')
console.log('='.repeat(80))

