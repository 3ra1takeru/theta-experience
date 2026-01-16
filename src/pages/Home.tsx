import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Video, Users, Star, Clock, MapPin, Monitor, Sparkles, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import { Event, Registration, EventType, InstructorProfile } from '../types';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const Home: React.FC = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [instructor, setInstructor] = useState<InstructorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [e, r, i] = await Promise.all([
          api.getEvents(),
          api.getRegistrations(),
          api.getInstructorProfile()
        ]);
        // Filter upcoming, sort by date, take top 3
        const upcoming = e
          .filter(evt => evt.status === 'upcoming')
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3);
        setUpcomingEvents(upcoming);
        setRegistrations(r);
        setInstructor(i);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getRemainingSeats = (eventId: string, capacity: number) => {
    const count = registrations.filter(r => r.eventId === eventId && r.status === 'confirmed').length;
    return Math.max(0, capacity - count);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-slate-800 font-heading leading-tight">
                本来のあなたらしさを<br />
                <span className="bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent">呼び覚ます</span>旅へ
              </h1>
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                シータヒーリング®は、脳波をシータ波にすることで潜在意識にアクセスし、
                心身の深い癒しと現実の変化を促すメディテーションテクニックです。<br />
                まずは体験会で、その可能性に触れてみませんか？
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="rounded-full h-14 px-8 text-base bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-500 hover:to-teal-600 shadow-lg shadow-teal-200/50 transition-all hover:-translate-y-1">
                <Link to="/schedule">
                  <Sparkles className="mr-2 w-5 h-5 animate-pulse" />
                  体験会に申し込む
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full h-14 px-8 text-base border-border bg-white/40 hover:bg-white/60 backdrop-blur-sm shadow-sm transition-all hover:-translate-y-1">
                <Link to="/testimonials">
                  参加者の声を見る
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Abstract shapes background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-purple-200/40 rounded-full blur-[60px] md:blur-[100px] animate-float-slow"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-teal-100/50 rounded-full blur-[50px] md:blur-[80px] animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-[20%] left-[10%] w-[150px] h-[150px] md:w-[300px] md:h-[300px] bg-pink-100/40 rounded-full blur-[40px] md:blur-[60px] animate-breathe"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Video, color: "teal", title: "Zoom・対面どちらも対応", desc: "ご自宅からリラックスして参加できるオンライン開催と、直接エネルギーを感じられる対面開催をお選びいただけます。" },
              { icon: Heart, color: "purple", title: "安心の少人数制", desc: "お一人お一人の体験を大切にするため、少人数での開催を基本としています。初めての方も安心してご参加ください。" },
              { icon: Users, color: "amber", title: "体験後のフォロー", desc: "体験会後にはアンケートを通じてご質問にお答えしたり、次のステップへのアドバイスをお送りしています。" }
            ].map((feature, i) => (
              <Card key={i} className="rounded-3xl border-none shadow-none bg-white/60 backdrop-blur-sm hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8 pt-10">
                  <div className={`w-16 h-16 bg-gradient-to-br from-${feature.color}-100 to-${feature.color}-50 text-${feature.color}-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner`}>
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4 font-heading">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Instructor Section (Dynamic) */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {instructor && (
            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
              {/* Image / Avatar Area */}
              <div className="shrink-0 relative group">
                <div className={`w-64 h-64 rounded-full shadow-2xl relative z-10 overflow-hidden border-4 border-white ring-1 ring-slate-100 transform transition-transform duration-500 hover:scale-105 ${!instructor.imageUrl && 'bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center'}`}>
                  {instructor.imageUrl ? (
                    <img src={instructor.imageUrl} alt={instructor.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-white text-center">
                      <div className="text-6xl mb-2 filter drop-shadow-md">🔭</div>
                      <span className="font-bold text-xl tracking-widest drop-shadow-sm">TAKERU</span>
                    </div>
                  )}
                </div>
                {/* Decorative circles */}
                <div className="absolute top-0 -left-4 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute top-0 -right-4 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>

              {/* Text Content */}
              <div className="text-center md:text-left flex-grow space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-bold mb-4 tracking-wide uppercase">
                    <Sparkles className="w-3 h-3" /> Instructor
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 font-heading">{instructor.name}</h2>
                  <p className="text-teal-600 font-medium text-lg">{instructor.title}</p>
                </div>

                <div className="space-y-4 text-slate-600 leading-relaxed text-lg whitespace-pre-wrap font-light">
                  {instructor.introduction}
                </div>

                {(instructor.instagramUrl || instructor.websiteUrl) && (
                  <div className="flex justify-center md:justify-start gap-3 pt-2">
                    {instructor.instagramUrl && (
                      <Button asChild variant="outline" size="sm" className="rounded-full gap-2">
                        <a href={instructor.instagramUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" /> Instagram
                        </a>
                      </Button>
                    )}
                    {instructor.websiteUrl && (
                      <Button asChild variant="outline" size="sm" className="rounded-full gap-2">
                        <a href={instructor.websiteUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" /> Website
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Schedule Section */}
      <section className="py-20 relative bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold text-slate-800 font-heading">開催予定の体験会</h2>
            <p className="text-slate-500">直近の開催スケジュールです。お席に限りがございますのでお早めに。</p>
          </div>

          {loading ? (
            <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div></div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-white/50 border border-dashed border-slate-200 rounded-xl">現在予定されている体験会はありません。</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-1">
              {upcomingEvents.map(event => {
                const remaining = getRemainingSeats(event.id, event.capacity);
                const isFull = remaining === 0;

                return (
                  <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur group">
                    <CardContent className="p-0 flex flex-col md:flex-row">
                      <div className={`flex items-center justify-center p-6 md:w-32 shrink-0 text-white ${isFull ? 'bg-slate-400' : 'bg-gradient-to-br from-teal-400 to-teal-600'}`}>
                        <div className="text-center">
                          <span className="block text-2xl font-bold font-heading leading-none">{format(parseISO(event.date), 'M/d', { locale: ja })}</span>
                          <span className="block text-sm opacity-90 font-medium mt-1">({format(parseISO(event.date), 'E', { locale: ja })})</span>
                        </div>
                      </div>

                      <div className="flex-grow p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                        <div className="flex-grow space-y-3">
                          <div className="flex items-center justify-center md:justify-start gap-3">
                            <h3 className="text-xl font-bold text-slate-800 font-heading group-hover:text-teal-600 transition-colors">{event.title}</h3>
                            {isFull && <div className="text-[10px] font-bold bg-red-100 text-red-500 px-2 py-1 rounded border border-red-200 uppercase tracking-wide">FULL</div>}
                          </div>
                          <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-slate-500">
                            <div className="flex items-center"><Clock className="w-4 h-4 mr-1.5 text-teal-400" /> {event.startTime} - {event.endTime}</div>
                            <div className="flex items-center">
                              {event.type === EventType.ZOOM ? <Monitor className="w-4 h-4 mr-1.5 text-blue-400" /> : <MapPin className="w-4 h-4 mr-1.5 text-teal-400" />}
                              {event.type}
                            </div>
                            <div className={`flex items-center font-bold ${isFull ? 'text-red-400' : 'text-teal-500'}`}>
                              <Users className="w-4 h-4 mr-1.5" />
                              {isFull ? 'キャンセル待ち' : `残席 ${remaining}名`}
                            </div>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          <Button asChild disabled={isFull} className={`rounded-full px-8 ${isFull ? 'bg-slate-100 text-slate-400 hover:bg-slate-100 cursor-not-allowed' : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 shadow-sm'}`}>
                            <Link to="/schedule">
                              {isFull ? '満席' : '詳細・予約'}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          <div className="mt-12 text-center">
            <Button asChild variant="link" className="text-teal-600 hover:text-teal-800 font-medium">
              <Link to="/schedule">
                すべての日程を見る <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonial Teaser */}
      <section className="py-24 relative overflow-hidden bg-slate-900">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 to-slate-900 -z-10"></div>
        <div className="absolute top-1/4 left-1/4 text-yellow-200/20 animate-pulse"><Star className="w-8 h-8" /></div>
        <div className="absolute bottom-1/4 right-1/3 text-purple-200/20 animate-pulse" style={{ animationDelay: '1.5s' }}><Star className="w-6 h-6" /></div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-10 backdrop-blur-md border border-white/10 shadow-2xl">
            <Star className="w-8 h-8 text-yellow-300 fill-current" />
          </div>
          <blockquote className="text-2xl md:text-4xl font-light italic mb-10 text-white/90 font-heading leading-relaxed">
            "シータヒーリングに出会って、長年抱えていた心のモヤモヤが晴れました。<br className="hidden md:block" />
            自分の人生を自分で創造できるという感覚を取り戻せました。"
          </blockquote>
          <div className="text-teal-200 font-medium tracking-wide">- 過去の体験会参加者様より</div>
          <div className="mt-12">
            <Button asChild variant="outline" size="lg" className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm px-8">
              <Link to="/testimonials">
                もっと感想を読む
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};