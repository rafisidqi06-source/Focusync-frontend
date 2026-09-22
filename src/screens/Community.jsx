import React, { useState } from 'react'
import { Heart, MessageCircle, Share2, Users, TrendingUp, Search, Plus } from 'lucide-react'

export default function CommunityDesktop() {
  const [activeTab, setActiveTab] = useState('feed') // 'feed' | 'leaderboard'
  const [searchQuery, setSearchQuery] = useState('')

  const posts = [
    {
      id: 1,
      author: 'Rina Wijaya',
      avatar: 'R',
      role: 'Mahasiswa',
      time: '2 jam lalu',
      content: 'Hari ini saya berhasil fokus 5 jam berturut-turut! Ternyata fokus di pagi hari lebih efektif untuk saya. Kalian bagaimana?',
      mood: '😊',
      likes: 234,
      comments: 45,
      liked: false,
    },
    {
      id: 2,
      author: 'Budi Santoso',
      avatar: 'B',
      role: 'Pekerja Lepas',
      time: '4 jam lalu',
      content: 'Sharing tips: mematikan notifikasi di semua app selama fokus session sangat membantu. Produktivitas naik drastis!',
      mood: '💪',
      likes: 156,
      comments: 32,
      liked: false,
    },
  ]

  const leaderboard = [
    { rank: 1, name: 'Rina Wijaya', focus: '47h', streak: '12 hari', emoji: '🥇' },
    { rank: 2, name: 'Budi Santoso', focus: '44h', streak: '10 hari', emoji: '🥈' },
    { rank: 3, name: 'Siti Nurhaliza', focus: '42h', streak: '9 hari', emoji: '🥉' },
    { rank: 4, name: 'Ahmad Wijaya', focus: '38h', streak: '8 hari', emoji: '4️⃣' },
    { rank: 5, name: 'Dini Cahyani', focus: '35h', streak: '7 hari', emoji: '5️⃣' },
  ]

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Komunitas</h1>
            <p className="text-lg text-slate-500">Berbagi pengalaman dan inspirasi dengan pengguna lain</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
            <Plus size={20} />
            Posting Baru
          </button>
        </div>

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
            {posts.map((post) => (
              <div
                key={post.id}
                className="rounded-2xl bg-white border border-black/[0.05] shadow-sm p-6 hover:shadow-md transition"
              >
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-3 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-bold text-lg">
                      {post.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900">{post.author}</p>
                        <span className="text-sm text-slate-500">•</span>
                        <p className="text-sm text-slate-500">{post.role}</p>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{post.time}</p>
                    </div>
                  </div>
                  <span className="text-2xl">{post.mood}</span>
                </div>

                {/* Post Content */}
                <p className="text-slate-700 leading-relaxed mb-4">{post.content}</p>

                {/* Post Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-sm text-slate-500">
                  <div className="flex gap-6">
                    <button className="flex items-center gap-2 hover:text-red-500 transition group">
                      <Heart
                        size={18}
                        className={`group-hover:fill-red-500 ${post.liked ? 'fill-red-500 text-red-500' : ''}`}
                      />
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
            <div className="grid grid-cols-3 gap-4 mb-6">
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
