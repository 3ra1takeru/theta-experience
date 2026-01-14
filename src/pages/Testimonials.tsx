import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Feedback } from '../types';
import { Star, MessageSquare } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await api.getFeedback(true); // Only approved
      setFeedbacks(data);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="p-12 text-center text-slate-500">読み込み中...</div>;

  return (
    <div className="py-24 min-h-screen relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-800 mb-6 font-heading">参加者の声</h2>
          <p className="text-slate-600">体験会に参加された方々からいただいたご感想をご紹介します。</p>
        </div>

        <div className="grid gap-8">
          {feedbacks.length === 0 ? (
            <div className="text-center p-8 glass rounded-xl">
              <p className="text-slate-500">まだ感想がありません。</p>
            </div>
          ) : (
            feedbacks.map(item => (
              <div key={item.id} className="glass p-10 rounded-3xl relative hover:shadow-lg transition-shadow border border-white/50">
                <div className="absolute top-8 left-8 text-teal-100/50">
                  <MessageSquare className="w-16 h-16 transform -scale-x-100" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < item.rating ? 'fill-current' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-lg text-slate-700 mb-8 italic leading-relaxed font-heading">
                    "{item.comment}"
                  </p>
                  <div className="flex items-center justify-between border-t border-teal-100/50 pt-6">
                    <span className="font-bold text-slate-900">{item.authorName}</span>
                    <span className="text-sm text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-20 bg-gradient-to-br from-teal-50 to-purple-50 rounded-2xl p-12 text-center border border-white/60 shadow-inner">
          <h3 className="text-2xl font-bold text-slate-800 mb-4 font-heading">体験会へのご参加をお待ちしております</h3>
          <p className="text-slate-600 mb-8">あなたもシータヒーリングの世界を体験してみませんか？</p>
          <a href="#/schedule" className="inline-block bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-3 rounded-full font-medium hover:from-teal-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            日程を確認する
          </a>
        </div>
      </div>
    </div>
  );
};
