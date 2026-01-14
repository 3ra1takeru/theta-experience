import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Video, Users, Star, Clock, MapPin, Monitor, Sparkles, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import { Event, Registration, EventType, InstructorProfile } from '../types';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

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
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-slate-800 mb-6 md:mb-8 font-heading leading-tight">
              本来のあなたらしさを<br />
              <span className="bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent">呼び覚ます</span>旅へ
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-12 leading-relaxed max-w-2xl mx-auto">
              シータヒーリング®は、脳波をシータ波にすることで潜在意識にアクセスし、
              心身の深い癒しと現実の変化を促すメディテーションテクニックです。<br />
              まずは体験会で、その可能性に触れてみませんか？
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link to="/schedule" className="group inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-500 hover:to-teal-600 shadow-lg shadow-teal-200/50 transition-all transform hover:-translate-y-1">
                <Sparkles className="mr-2 w-5 h-5 animate-pulse" />
                体験会に申し込む
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/testimonials" className="inline-flex items-center justify-center px-8 py-4 border border-white/60 text-base font-medium rounded-full text-slate-600 bg-white/40 hover:bg-white/60 backdrop-blur-sm shadow-sm transition-all hover:-translate-y-1">
                参加者の声を見る
              </Link>
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
      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-8 rounded-3xl glass-card transform transition-all hover:-translate-y-2 hover:shadow-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Video className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4 font-heading">Zoom・対面どちらも対応</h3>
              <p className="text-slate-600 leading-loose">
                ご自宅からリラックスして参加できるオンライン開催と、直接エネルギーを感じられる対面開催をお選びいただけます。
              </p>
            </div>
            <div className="p-8 rounded-3xl glass-card transform transition-all hover:-translate-y-2 hover:shadow-xl delay-100">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4 font-heading">安心の少人数制</h3>
              <p className="text-slate-600 leading-loose">
                お一人お一人の体験を大切にするため、少人数での開催を基本としています。初めての方も安心してご参加ください。
              </p>
            </div>
            <div className="p-8 rounded-3xl glass-card transform transition-all hover:-translate-y-2 hover:shadow-xl delay-200">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4 font-heading">体験後のフォロー</h3>
              <p className="text-slate-600 leading-loose">
                体験会後にはアンケートを通じてご質問にお答えしたり、次のステップへのアドバイスをお送りしています。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Instructor Section (Dynamic) */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {instructor && (
            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
              {/* Image / Avatar Area */}
              <div className="shrink-0 relative group">
                {instructor.imageUrl ? (
                  <div className="w-64 h-64 rounded-full shadow-xl relative z-10 overflow-hidden border-4 border-white transform transition-transform duration-500 hover:scale-105">
                    <img src={instructor.imageUrl} alt={instructor.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-64 h-64 bg-gradient-to-tr from-teal-500 to-blue-600 rounded-full flex items-center justify-center shadow-xl relative z-10 transform transition-transform duration-500 hover:scale-105">
                    <div className="text-white text-center">
                      <div className="text-6xl mb-2 filter drop-shadow-md">🔭</div>
                      <span className="font-bold text-xl tracking-widest drop-shadow-sm">TAKERU</span>
                    </div>
                  </div>
                )}
                {/* Decorative circles behind */}
                <div className="absolute top-0 -left-4 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-pulse"></div>
                <div className="absolute top-0 -right-4 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>

              {/* Text Content */}
              <div className="text-center md:text-left flex-grow">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-semibold mb-6">
                  <Sparkles className="w-4 h-4" /> 講師紹介
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{instructor.name}</h2>
                <p className="text-teal-600 font-medium mb-6 text-lg">{instructor.title}</p>

                <div className="space-y-4 text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
                  {instructor.introduction}
                </div>

                {(instructor.instagramUrl || instructor.websiteUrl) && (
                  <div className="mt-8 flex justify-center md:justify-start gap-4">
                    {instructor.instagramUrl && (
                      <a href={instructor.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-pink-600 transition-colors flex items-center gap-2 border px-4 py-2 rounded-full bg-white shadow-sm">
                        <ExternalLink className="w-4 h-4" /> Instagram
                      </a>
                    )}
                    {instructor.websiteUrl && (
                      <a href={instructor.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-teal-600 transition-colors flex items-center gap-2 border px-4 py-2 rounded-full bg-white shadow-sm">
                        <ExternalLink className="w-4 h-4" /> Website
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Schedule Section */}
      <section className="py-20 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-4 font-heading">開催予定の体験会</h2>
            <p className="text-slate-500">直近の開催スケジュールです。お席に限りがございますのでお早めに。</p>
          </div>

          {loading ? (
            <div className="text-center py-8"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div></div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center py-8 text-slate-400 glass p-8 rounded-xl">現在予定されている体験会はありません。</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-1">
              {upcomingEvents.map(event => {
                const remaining = getRemainingSeats(event.id, event.capacity);
                const isFull = remaining === 0;

                return (
                  <div key={event.id} className="glass p-8 rounded-2xl hover:shadow-lg transition-all border border-white/60 flex flex-col md:flex-row items-center gap-8 group">
                    <div className={`flex-shrink-0 flex flex-col items-center justify-center rounded-2xl p-6 min-w-[110px] text-white shadow-md ${isFull ? 'bg-slate-400' : 'bg-gradient-to-br from-teal-400 to-teal-600'}`}>
                      <span className="text-2xl font-bold">{format(parseISO(event.date), 'M/d', { locale: ja })}</span>
                      <span className="text-sm opacity-90 font-medium">({format(parseISO(event.date), 'E', { locale: ja })})</span>
                    </div>

                    <div className="flex-grow text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                        <h3 className="text-xl font-bold text-slate-800 font-heading group-hover:text-teal-600 transition-colors">{event.title}</h3>
                        {isFull && <span className="text-xs font-bold bg-red-100 text-red-500 px-2 py-1 rounded">満席</span>}
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
                      <Link
                        to="/schedule"
                        className={`inline-block px-8 py-3 rounded-full text-sm font-medium transition-all shadow-sm hover:shadow ${isFull ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'}`}
                      >
                        {isFull ? '満席' : '詳細・予約'}
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link to="/schedule" className="font-medium text-teal-600 hover:text-teal-800 inline-flex items-center transition-colors border-b border-transparent hover:border-teal-600 pb-0.5">
              すべての日程を見る <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonial Teaser */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900 -z-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 -z-10"></div>

        {/* Floating sparkles */}
        <div className="absolute top-1/4 left-1/4 text-yellow-200/20 animate-pulse"><Star className="w-8 h-8" /></div>
        <div className="absolute bottom-1/4 right-1/3 text-purple-200/20 animate-pulse" style={{ animationDelay: '1.5s' }}><Star className="w-6 h-6" /></div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-block p-4 rounded-full bg-white/5 mb-8 backdrop-blur-sm border border-white/10">
            <Star className="w-8 h-8 text-yellow-300" fill="currentColor" />
          </div>
          <blockquote className="text-2xl md:text-4xl font-light italic mb-10 text-white font-heading leading-normal">
            "シータヒーリングに出会って、長年抱えていた心のモヤモヤが晴れました。<br className="hidden md:block" />
            自分の人生を自分で創造できるという感覚を取り戻せました。"
          </blockquote>
          <div className="text-teal-200 font-medium">- 過去の体験会参加者様より</div>
          <div className="mt-12">
            <Link to="/testimonials" className="inline-block px-8 py-3 border border-white/30 rounded-full text-white hover:bg-white/10 transition-colors backdrop-blur-sm">
              もっと感想を読む
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};