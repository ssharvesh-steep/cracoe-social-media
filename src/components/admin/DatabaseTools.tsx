'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Download, Trash2, AlertTriangle, Database, Loader2 } from 'lucide-react'

export default function DatabaseTools() {
    const [loading, setLoading] = useState(false)

    const exportData = async (tableName: string) => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from(tableName)
                .select('*')

            if (error) throw error

            // Convert to JSON and download
            const jsonStr = JSON.stringify(data, null, 2)
            const blob = new Blob([jsonStr], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${tableName}_export_${new Date().toISOString()}.json`
            a.click()
            URL.revokeObjectURL(url)

            alert(`Exported ${data?.length || 0} records from ${tableName}`)
        } catch (error: any) {
            alert('Export error: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const clearTable = async (tableName: string) => {
        if (!confirm(`⚠️ WARNING: This will delete ALL data from the ${tableName} table. This action CANNOT be undone. Are you absolutely sure?`)) {
            return
        }

        if (!confirm(`Type "DELETE ALL ${tableName.toUpperCase()}" to confirm (just kidding, click OK to proceed)`)) {
            return
        }

        setLoading(true)
        try {
            const { error } = await supabase
                .from(tableName)
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

            if (error) throw error
            alert(`All data cleared from ${tableName}`)
        } catch (error: any) {
            alert('Clear error: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const tables = [
        { name: 'profiles', description: 'User profiles and account data' },
        { name: 'posts', description: 'All user posts and content' },
        { name: 'follows', description: 'User following relationships' },
        { name: 'notifications', description: 'User notification history' },
        { name: 'likes', description: 'Post likes and reactions' },
        { name: 'comments', description: 'Post comments and replies' },
        { name: 'bookmarks', description: 'User bookmarked posts' },
        { name: 'reposts', description: 'User reposts of content' },
        { name: 'conversations', description: 'Direct message conversations' },
        { name: 'messages', description: 'Individual chat messages' },
        { name: 'hashtags', description: 'Global hashtag registry' },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Database className="w-8 h-8 text-blue-600" />
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Database Tools</h2>
                    <p className="text-sm text-gray-500">Advanced database management and export tools</p>
                </div>
            </div>

            {/* Warning Banner */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Caution: Destructive Operations</p>
                    <p>These tools perform direct database operations. Always export data before clearing tables.</p>
                </div>
            </div>

            {/* Tables */}
            <div className="space-y-4">
                {tables.map((table) => (
                    <div key={table.name} className="border border-gray-200 rounded-lg p-6 bg-white">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{table.name}</h3>
                                <p className="text-sm text-gray-500">{table.description}</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => exportData(table.name)}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                Export JSON
                            </button>

                            <button
                                onClick={() => clearTable(table.name)}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Trash2 className="w-4 h-4" />
                                Clear All Data
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Database Stats */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-purple-50">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => {
                            tables.forEach(table => exportData(table.name))
                        }}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold disabled:opacity-50"
                    >
                        <Download className="w-5 h-5" />
                        Export All Tables
                    </button>

                    <button
                        onClick={() => {
                            if (confirm('⚠️ This will clear ALL tables. Export your data first! Continue?')) {
                                tables.forEach(table => clearTable(table.name))
                            }
                        }}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-semibold disabled:opacity-50"
                    >
                        <Trash2 className="w-5 h-5" />
                        Clear All Tables
                    </button>
                </div>
            </div>
        </div>
    )
}
