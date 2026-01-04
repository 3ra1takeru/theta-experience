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
    <div className="py-12 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">参加者の声</h2>
          <p className="text-slate-600">体験会に参加された方々からいただいたご感想をご紹介します。</p>
        </div>

        <div className="grid gap-8">
          {feedbacks.length === 0 ? (
            <div className="text-center p-8 bg-slate-50 rounded-lg">
              <p>まだ感想がありません。</p>
            </div>
          ) : (
            feedbacks.map(item => (
              <div key={item.id} className="bg-slate-50 p-8 rounded-2xl relative">
                <div className="absolute top-6 left-6 text-slate-200">
                  <MessageSquare className="w-12 h-12 transform -scale-x-100" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < item.rating ? 'fill-current' : 'text-slate-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-lg text-slate-700 mb-6 italic leading-relaxed">
                    "{item.comment}"
                  </p>
                  <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                    <span className="font-semibold text-slate-900">{item.authorName}</span>
                    <span className="text-sm text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-16 bg-teal-50 rounded-xl p-8 text-center">
          <h3 className="text-lg font-bold text-teal-800 mb-2">体験会へのご参加をお待ちしております</h3>
          <p className="text-teal-600 mb-6">あなたもシータヒーリングの世界を体験してみませんか？</p>
          <a href="#/schedule" className="inline-block bg-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors">
            日程を確認する
          </a>
        </div>
      </div>
    </div>
  );
};
