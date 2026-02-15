import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Feedback } from '../types';
import { Star, MessageSquare } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';

export const Testimonials: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await api.getFeedback(true); // Only approved
      // Exclude personal session reviews
      const experienceReviews = data.filter(f => f.eventId !== 'personal_session');
      setFeedbacks(experienceReviews);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>;

  return (
    <div className="py-24 min-h-screen relative bg-slate-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-bold text-slate-800 font-heading">参加者の声</h2>
          <p className="text-slate-600">体験会に参加された方々からいただいたご感想をご紹介します。</p>
        </div>

        <div className="grid gap-8">
          {feedbacks.length === 0 ? (
            <div className="text-center p-12 bg-white/50 border border-dashed border-slate-200 rounded-xl">
              <p className="text-slate-500">まだ感想がありません。</p>
            </div>
          ) : (
            feedbacks.map(item => (
              <Card key={item.id} className="relative border-none bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-10">
                  <div className="absolute top-8 left-8 text-teal-50 opacity-50 pointer-events-none">
                    <MessageSquare className="w-24 h-24 transform -scale-x-100" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center mb-6">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-5 h-5 ${i < item.rating ? 'fill-current' : 'text-slate-200'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-lg text-slate-700 mb-8 italic leading-relaxed font-heading">
                      "{item.comment}"
                    </p>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                      <span className="font-bold text-slate-900">{item.authorName}</span>
                      <span className="text-sm text-slate-400">
                        {format(parseISO(item.createdAt), 'yyyy/MM/dd')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="mt-20 bg-gradient-to-br from-teal-50 to-purple-50 rounded-3xl p-12 text-center border border-white/60 shadow-inner">
          <h3 className="text-2xl font-bold text-slate-800 mb-4 font-heading">体験会へのご参加をお待ちしております</h3>
          <p className="text-slate-600 mb-8">あなたもシータヒーリングの世界を体験してみませんか？</p>
          <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-lg shadow-teal-200/50 hover:shadow-xl transition-all hover:-translate-y-1">
            <Link to="/schedule">
              日程を確認する
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
