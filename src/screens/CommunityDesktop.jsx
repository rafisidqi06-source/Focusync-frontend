import React, { useState } from 'react'
import { Heart, MessageCircle, Share2, Search, Plus, X } from 'lucide-react'
import { useAppState } from '../state/store.jsx'

// Catatan: leaderboard tetap data contoh (mock) karena aplikasi ini menyimpan
// data secara lokal per-perangkat (localStorage), tidak ada backend yang
// menghubungkan skor antar pengguna. Untuk leaderboard yang nyata, perlu
// backend + database multi-user.
const leaderboard = [
  { rank: 1, name: 'Rina Wijaya', focus: '47h', streak: '12 hari', emoji: '🥇' },
  { rank: 2, name: 'Budi Santoso', focus: '44h', streak: '10 hari', emoji: '🥈' },
  { rank: 3, name: 'Siti Nurhaliza', focus: '42h', streak: '9 hari', emoji: '🥉' },
  { rank: 4, name: 'Ahmad Wijaya', focus: '38h', streak: '8 hari', emoji: '4️⃣' },
  { rank: 5, name: 'Dini Cahyani', focus: '35h', streak: '7 hari', emoji: '5️⃣' },
]

export default function CommunityDesktop() {
  const { state, actions } = useAppState()
  const [activeTab, setActiveTab] = useState('feed') // 'feed' | 'leaderboard'
  const [searchQuery, setSearchQuery] = useState('')
  const [showComposer, setShowComposer] = useState(false)
  const [newText, setNewText] = useState('')
  const [newTag, setNewTag] = useState('')

  const posts = state.communityPosts.filter((post) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      post.author.toLowerCase().includes(q) ||
      post.text.toLowerCase().includes(q) ||
      post.tag.toLowerCase().includes(q)
    )
  })

  const handleSubmitPost = (e) => {
    e.preventDefault()
    const trimmed = newText.trim()
    if (!trimmed) return
    actions.addCommunityPost(trimmed, newTag.trim() || undefined)
    setNewText('')
    setNewTag('')
    setShowComposer(false)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-4xl font-bold text-slate-900 mb-1 lg:mb-2">Komunitas</h1>
            <p className="text-sm lg:text-lg text-slate-500">Berbagi pengalaman dan inspirasi dengan pengguna lain</p>
          </div>
          <button
            onClick={() => setShowComposer((v) => !v)}
            className="flex items-center justify-center gap-2 px-5 lg:px-6 py-2.5 lg:py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            {showComposer ? <X size={20} /> : <Plus size={20} />}
            {showComposer ? 'Batal' : 'Posting Baru'}
          </button>
        </div>

        {/* Composer */}
        {showComposer && (
          <form
            onSubmit={handleSubmitPost}
            className="rounded-2xl bg-white border border-black/[0.05] shadow-sm p-6 space-y-3"
          >
            <textarea
              autoFocus
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Ceritakan pengalaman atau tips fokusmu..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Tag (opsional, misal: Fokus)"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!newText.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Kirim
              </button>
            </div>
          </form>
        )}

        {/* Search & Tabs */}
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Cari post atau pengguna..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {['feed', 'leaderboard'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 rounded-xl font-medium transition ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab === 'feed' ? 'Feed' : 'Leaderboard'}
              </button>
            ))}
          </div>
        </div>

        {/* Feed Tab */}
        {activeTab === 'feed' && (
          <div className="space-y-4">
            {posts.length === 0 && (
              <p className="text-center text-slate-400 py-10">Belum ada post yang cocok.</p>
            )}
            {posts.map((post) => (
              <div
                key={post.id}
                className="rounded-2xl bg-white border border-black/[0.05] shadow-sm p-6 hover:shadow-md transition"
              >
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-3 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                      {post.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900">{post.author}</p>
                        <span className="text-sm text-slate-500">•</span>
                        <p className="text-sm text-slate-500">{post.tag}</p>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{post.time}</p>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-slate-700 leading-relaxed mb-4">{post.text}</p>

                {/* Post Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-sm text-slate-500">
                  <div className="flex gap-6">
                    <button
                      onClick={() => actions.likePost(post.id)}
                      className="flex items-center gap-2 hover:text-red-500 transition group"
                    >
                      <Heart size={18} className="group-hover:fill-red-500" />
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-blue-500 transition">
                      <MessageCircle size={18} />
                      <span>{post.comments}</span>
                    </button>
                  </div>
                  <button className="flex items-center gap-2 hover:text-green-500 transition">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {leaderboard.slice(0, 3).map((user) => (
                <div
                  key={user.rank}
                  className={`rounded-2xl p-6 text-center text-white ${
                    user.rank === 1
                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg'
                      : user.rank === 2
                      ? 'bg-gradient-to-br from-gray-400 to-gray-600'
                      : 'bg-gradient-to-br from-orange-400 to-orange-600'
                  }`}
                >
                  <p className="text-4xl mb-2">{user.emoji}</p>
                  <p className="font-bold text-lg mb-2">{user.name}</p>
                  <p className="text-sm opacity-90">{user.focus}</p>
                </div>
              ))}
            </div>

            {/* Full Leaderboard */}
            <div className="rounded-2xl bg-white border border-black/[0.05] shadow-sm divide-y divide-slate-100">
              {leaderboard.map((user) => (
                <div key={user.rank} className="flex items-center gap-4 p-6 hover:bg-slate-50 transition">
                  <span className="text-2xl">{user.emoji}</span>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{user.name}</p>
                    <p className="text-sm text-slate-500">{user.streak}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 text-lg">{user.focus}</p>
                    <p className="text-xs text-slate-400">Focus Time</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-slate-400">
              *Leaderboard ini masih data contoh — belum terhubung ke pengguna lain sungguhan.
            </p>

            {/* Leaderboard Tips */}
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6">
              <h3 className="font-bold text-emerald-900 mb-3">🎯 Tips Naik Leaderboard</h3>
              <ul className="space-y-2 text-emerald-800 text-sm">
                <li>• Konsisten dalam sesi fokus setiap hari</li>
                <li>• Mulai dari target realistis, naikkan secara bertahap</li>
                <li>• Aktif sharing tips dan memotivasi komunitas</li>
                <li>• Manfaatkan peak hours productivity-mu</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
