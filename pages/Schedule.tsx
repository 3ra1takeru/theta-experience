import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Event, EventType, Registration } from '../types';
import { Calendar, MapPin, Monitor, Clock, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

export const Schedule: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // Booking Form State
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    // Fetch both events and registrations to calculate remaining seats
    const [eventsData, regsData] = await Promise.all([
      api.getEvents(),
      api.getRegistrations()
    ]);
    
    // Filter only upcoming
    const upcoming = eventsData.filter(e => e.status === 'upcoming').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setEvents(upcoming);
    setRegistrations(regsData);
    setLoading(false);
  };

  const getRemainingSeats = (eventId: string, capacity: number) => {
    const count = registrations.filter(r => r.eventId === eventId && r.status === 'confirmed').length;
    return Math.max(0, capacity - count);
  };

  const handleBookClick = (event: Event) => {
    setSelectedEvent(event);
    setSubmitSuccess(false);
    setFormData({ name: '', email: '', phone: '' });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setIsSubmitting(true);
    try {
      await api.createRegistration({
        eventId: selectedEvent.id,
        applicantName: formData.name,
        email: formData.email,
        phone: formData.phone
      });
      setSubmitSuccess(true);
      // Refresh to update seat count
      loadEvents();
    } catch (error) {
      alert('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>;
  }

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">体験会スケジュール</h2>
          <p className="text-slate-600">ご希望の日程を選んでお申し込みください。</p>
        </div>

        <div className="space-y-6">
          {events.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <p className="text-slate-500">現在予定されている体験会はありません。</p>
            </div>
          ) : (
            events.map(event => {
              const remaining = getRemainingSeats(event.id, event.capacity);
              const isFull = remaining === 0;

              return (
                <div key={event.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col md:flex-row">
                  <div className={`text-white p-6 flex flex-col justify-center items-center w-full md:w-32 shrink-0 ${isFull ? 'bg-slate-400' : 'bg-teal-600'}`}>
                    <span className="text-lg font-semibold">{format(parseISO(event.date), 'M/d', { locale: ja })}</span>
                    <span className="text-sm opacity-90">({format(parseISO(event.date), 'E', { locale: ja })})</span>
                    <div className="mt-2 text-xs uppercase font-bold tracking-wider px-2 py-1 bg-white/20 rounded">
                      {event.type === EventType.ZOOM ? 'Zoom' : '対面'}
                    </div>
                  </div>
                  
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="text-xl font-bold text-slate-900">{event.title}</h3>
                       {isFull && <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-1 rounded">満席</span>}
                    </div>
                    
                    <p className="text-slate-600 mb-4 text-sm">{event.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-6">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1.5" />
                        {event.startTime} - {event.endTime}
                      </div>
                      <div className="flex items-center">
                        {event.type === EventType.ZOOM ? <Monitor className="w-4 h-4 mr-1.5" /> : <MapPin className="w-4 h-4 mr-1.5" />}
                        {event.type === EventType.ZOOM ? 'オンライン (Zoom)' : event.location || '場所詳細はお申し込み後'}
                      </div>
                      <div className="flex items-center font-medium text-teal-700">
                        ¥{event.price.toLocaleString()}
                      </div>
                      <div className={`flex items-center font-bold ${isFull ? 'text-red-500' : 'text-teal-600'}`}>
                        <Users className="w-4 h-4 mr-1.5" />
                        {isFull ? 'キャンセル待ち' : `残席 ${remaining}名`}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleBookClick(event)}
                      disabled={isFull}
                      className={`inline-flex items-center px-6 py-2 text-sm font-medium rounded-lg transition-colors ${isFull ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                    >
                      {isFull ? '満席' : '申し込む'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900 bg-opacity-75 transition-opacity" onClick={() => setSelectedEvent(null)}></div>

            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    {submitSuccess ? (
                      <div className="text-center py-8">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                          <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h3 className="text-xl leading-6 font-medium text-slate-900" id="modal-title">
                          お申し込み完了
                        </h3>
                        <p className="mt-4 text-sm text-slate-500">
                          お申し込みありがとうございます。<br/>
                          確認メールをお送りしましたのでご確認ください。
                        </p>
                        <div className="mt-8">
                          <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 sm:text-sm"
                            onClick={() => setSelectedEvent(null)}
                          >
                            閉じる
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-xl leading-6 font-bold text-slate-900 mb-2" id="modal-title">
                          体験会へのお申し込み
                        </h3>
                        <p className="text-sm text-slate-500 mb-6">
                          {selectedEvent.title} <br/>
                          {format(parseISO(selectedEvent.date), 'yyyy年M月d日', {locale:ja})} {selectedEvent.startTime}-{selectedEvent.endTime}
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">お名前</label>
                            <input
                              type="text"
                              name="name"
                              id="name"
                              required
                              className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                              value={formData.name}
                              onChange={handleFormChange}
                            />
                          </div>
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">メールアドレス</label>
                            <input
                              type="email"
                              name="email"
                              id="email"
                              required
                              className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                              value={formData.email}
                              onChange={handleFormChange}
                            />
                          </div>
                          <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-700">電話番号</label>
                            <input
                              type="tel"
                              name="phone"
                              id="phone"
                              required
                              className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                              value={formData.phone}
                              onChange={handleFormChange}
                            />
                          </div>

                          <div className="mt-8 flex justify-end gap-3">
                            <button
                              type="button"
                              className="inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 sm:text-sm"
                              onClick={() => setSelectedEvent(null)}
                            >
                              キャンセル
                            </button>
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:text-sm disabled:opacity-50"
                            >
                              {isSubmitting ? '送信中...' : '申し込む'}
                            </button>
                          </div>
                        </form>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};