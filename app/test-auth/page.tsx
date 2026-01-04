'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestAuthPage() {
  const [results, setResults] = useState<string[]>([])
  const [testing, setTesting] = useState(false)
  const supabase = createClient()

  const log = (message: string) => {
    setResults(prev => [...prev, message])
    console.log(message)
  }

  const testAuth = async () => {
    setTesting(true)
    setResults([])
    
    const testEmail = `test${Date.now()}@example.com`
    const testPassword = 'test123456'
    
    log('=== Testing Supabase Authentication ===')
    log('')
    
    try {
      // Test Sign Up
      log('1. Testing Sign Up...')
      log(`   Email: ${testEmail}`)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      })
      
      if (signUpError) {
        log(`   ✗ Error: ${signUpError.message}`)
      } else {
        log('   ✓ Sign up successful!')
        log(`   User ID: ${signUpData.user?.id}`)
        log(`   Email: ${signUpData.user?.email}`)
      }
      log('')
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Test Sign In
      log('2. Testing Sign In...')
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      })
      
      if (signInError) {
        log(`   ✗ Error: ${signInError.message}`)
      } else {
        log('   ✓ Sign in successful!')
        log(`   User ID: ${signInData.user?.id}`)
        log(`   Email: ${signInData.user?.email}`)
        log(`   Session: ${signInData.session?.access_token?.substring(0, 20)}...`)
      }
      log('')
      
      // Get Session
      log('3. Testing Get Session...')
      const { data: sessionData } = await supabase.auth.getSession()
      if (sessionData.session) {
        log('   ✓ Session found!')
        log(`   User: ${sessionData.session.user.email}`)
      } else {
        log('   ✗ No session found')
      }
      log('')
      
      // Sign Out
      log('4. Testing Sign Out...')
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        log(`   ✗ Error: ${signOutError.message}`)
      } else {
        log('   ✓ Sign out successful!')
      }
      log('')
      
      // Verify signed out
      log('5. Verifying signed out...')
      const { data: finalSession } = await supabase.auth.getSession()
      if (finalSession.session) {
        log('   ✗ Session still exists!')
      } else {
        log('   ✓ Successfully signed out')
      }
      
      log('')
      log('=== All Tests Complete ===')
    } catch (error: any) {
      log(`✗ Unexpected error: ${error.message}`)
    }
    
    setTesting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Test Page
          </h1>
          
          <p className="text-gray-600 mb-6">
            This page tests the Supabase authentication flow including sign up, sign in, session management, and sign out.
          </p>
          
          <button
            onClick={testAuth}
            disabled={testing}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            {testing ? 'Testing...' : 'Run Authentication Tests'}
          </button>
          
          {results.length > 0 && (
            <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm overflow-auto max-h-96">
              {results.map((line, i) => (
                <div key={i}>{line || '\u00A0'}</div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-6 text-center">
          <a
            href="/auth/login"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            ← Back to Login
          </a>
        </div>
      </div>
    </div>
  )
}

