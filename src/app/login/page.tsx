'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [diagnostic, setDiagnostic] = useState<{ google: string, supabase: string }>({ google: 'checking...', supabase: 'checking...' })
    const router = useRouter()

    useState(() => {
        // Simple diagnostic
        const checkConnectivity = async () => {
            try {
                const start = Date.now()
                await fetch('https://www.google.com', { mode: 'no-cors' })
                setDiagnostic(prev => ({ ...prev, google: `OK (${Date.now() - start}ms)` }))
            } catch (e) {
                setDiagnostic(prev => ({ ...prev, google: 'FAILED' }))
            }

            try {
                const start = Date.now()
                const res = await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/', {
                    method: 'GET',
                    headers: { 'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '' }
                })
                setDiagnostic(prev => ({ ...prev, supabase: res.ok ? `OK (${Date.now() - start}ms)` : `ERROR ${res.status}` }))
            } catch (e: any) {
                setDiagnostic(prev => ({ ...prev, supabase: `FAILED: ${e.message}` }))
            }
        }
        checkConnectivity()
    })

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: email.split('@')[0],
                }
            }
        })
        console.log('Signup response:', { data, error })
        if (error) setError(error.message)
        else {
            alert('Signup successful! You can now log in (or check your email if confirmation is enabled in Supabase).')
            console.log('User created:', data.user)
        }
        setLoading(false)
    }

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        console.log('Attempting sign-in with:', {
            email,
            url: process.env.NEXT_PUBLIC_SUPABASE_URL
        })
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            console.log('Signin response:', { data, error })
            if (error) {
                console.error('Supabase Auth Error:', error)
                setError(error.message)
            } else {
                router.push('/')
            }
        } catch (err: any) {
            console.error('Fatal Signin Error:', err)
            setError(`Connection Failed: ${err.message || 'Unknown network error'}. Check if the emulator has internet access and can reach ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
        } finally {
            setLoading(false)
        }
    }

    const handleGitHubLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
        })
        if (error) setError(error.message)
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-50">
            <div className="p-8 bg-white shadow-xl rounded-2xl w-full max-w-md">
                <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Welcome Back</h1>

                <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-mono">
                    <div className="flex justify-between">
                        <span>GOOGLE CONNECTIVITY:</span>
                        <span className={diagnostic.google.includes('OK') ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{diagnostic.google}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                        <span>SUPABASE API:</span>
                        <span className={diagnostic.supabase.includes('OK') ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{diagnostic.supabase}</span>
                    </div>
                    <p className="mt-2 text-slate-400 uppercase">Host: {typeof window !== 'undefined' ? window.location.host : 'SSR'}</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleSignIn}
                            disabled={loading}
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                        >
                            Log In
                        </button>
                        <button
                            onClick={handleSignUp}
                            disabled={loading}
                            className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                        >
                            Sign Up
                        </button>
                    </div>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGitHubLogin}
                        className="mt-4 w-full flex justify-center items-center gap-2 bg-[#24292F] text-white py-2 px-4 rounded-md hover:bg-[#24292F]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#24292F] transition-colors"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                        GitHub
                    </button>
                </div>
            </div>
        </div>
    )
}
