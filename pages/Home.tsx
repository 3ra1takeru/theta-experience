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
      <section className="relative bg-gradient-to-b from-teal-50 to-white pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6">
              本来のあなたらしさを<br />
              <span className="text-teal-600">呼び覚ます</span>旅へ
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed">
              シータヒーリング®は、脳波をシータ波にすることで潜在意識にアクセスし、
              心身の深い癒しと現実の変化を促すメディテーションテクニックです。<br />
              まずは体験会で、その可能性に触れてみませんか？
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/schedule" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-200 transition-all transform hover:-translate-y-0.5">
                体験会に申し込む
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/testimonials" className="inline-flex items-center justify-center px-8 py-3 border border-slate-200 text-base font-medium rounded-full text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-all">
                参加者の声を見る
              </Link>
            </div>
          </div>
        </div>
        
        {/* Abstract shapes background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute top-40 -left-20 w-72 h-72 bg-teal-100 rounded-full blur-3xl opacity-50"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="p-6 rounded-2xl bg-slate-50 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Video className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Zoom・対面どちらも対応</h3>
              <p className="text-slate-600">
                ご自宅からリラックスして参加できるオンライン開催と、直接エネルギーを感じられる対面開催をお選びいただけます。
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">安心の少人数制</h3>
              <p className="text-slate-600">
                お一人お一人の体験を大切にするため、少人数での開催を基本としています。初めての方も安心してご参加ください。
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">体験後のフォロー</h3>
              <p className="text-slate-600">
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
                      <div className="absolute top-0 -right-4 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-pulse" style={{animationDelay: '1s'}}></div>
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
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">開催予定の体験会</h2>
            <p className="text-slate-600">直近の開催スケジュールです。お席に限りがございますのでお早めに。</p>
          </div>

          {loading ? (
             <div className="text-center py-8"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div></div>
          ) : upcomingEvents.length === 0 ? (
             <div className="text-center py-8 text-slate-500">現在予定されている体験会はありません。</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-1">
              {upcomingEvents.map(event => {
                const remaining = getRemainingSeats(event.id, event.capacity);
                const isFull = remaining === 0;
                
                return (
                  <div key={event.id} className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-6 hover:shadow-md transition-shadow">
                     <div className={`flex-shrink-0 flex flex-col items-center justify-center rounded-lg p-4 min-w-[100px] text-white ${isFull ? 'bg-slate-400' : 'bg-teal-600'}`}>
                        <span className="text-lg font-bold">{format(parseISO(event.date), 'M/d', { locale: ja })}</span>
                        <span className="text-sm opacity-90">({format(parseISO(event.date), 'E', { locale: ja })})</span>
                     </div>
                     
                     <div className="flex-grow text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                           <h3 className="text-lg font-bold text-slate-900">{event.title}</h3>
                           {isFull && <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-1 rounded">満席</span>}
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-slate-500">
                           <div className="flex items-center"><Clock className="w-4 h-4 mr-1.5" /> {event.startTime} - {event.endTime}</div>
                           <div className="flex items-center">
                              {event.type === EventType.ZOOM ? <Monitor className="w-4 h-4 mr-1.5" /> : <MapPin className="w-4 h-4 mr-1.5" />}
                              {event.type}
                           </div>
                           <div className={`flex items-center font-bold ${isFull ? 'text-red-500' : 'text-teal-600'}`}>
                              <Users className="w-4 h-4 mr-1.5" />
                              {isFull ? 'キャンセル待ち' : `残席 ${remaining}名`}
                           </div>
                        </div>
                     </div>

                     <div className="flex-shrink-0">
                        <Link 
                          to="/schedule" 
                          className={`inline-block px-8 py-3 rounded-lg text-sm font-medium transition-colors ${isFull ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                        >
                          {isFull ? '満席' : '詳細・予約'}
                        </Link>
                     </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link to="/schedule" className="font-medium text-teal-600 hover:text-teal-700 inline-flex items-center transition-colors">
              すべての日程を見る <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonial Teaser */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Star className="w-12 h-12 text-yellow-400 mx-auto mb-6" fill="currentColor" />
          <blockquote className="text-2xl md:text-3xl font-light italic mb-8">
            "シータヒーリングに出会って、長年抱えていた心のモヤモヤが晴れました。<br className="hidden md:block"/>
            自分の人生を自分で創造できるという感覚を取り戻せました。"
          </blockquote>
          <div className="text-slate-400 font-medium">- 過去の体験会参加者様より</div>
          <div className="mt-10">
            <Link to="/testimonials" className="text-teal-300 hover:text-teal-200 underline underline-offset-4">
              もっと感想を読む
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};