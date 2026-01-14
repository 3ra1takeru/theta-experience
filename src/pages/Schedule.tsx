import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Event, EventType, Registration } from '../types';
import { Calendar, MapPin, Monitor, Clock, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// PayPal Client ID (Provided by User)
const PAYPAL_CLIENT_ID = "Ab4ZtIdavN0_ZQqqnygXwbEFYCtpp9gLL9cDFH8kbgVVFFMWlZ3INAbvOoOiluYbY3RthfcRHPCH-jvc";

// Prefectures list
const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
];

export const Schedule: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showPastEvents, setShowPastEvents] = useState(false);

  // Booking Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    prefecture: '', // New
    dob: '',        // New
    paymentMethod: 'paypal' // Default
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

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

    setEvents(eventsData);
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
    setPaymentError(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      prefecture: '',
      dob: '',
      paymentMethod: 'paypal'
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isFormValid = formData.name && formData.email && formData.phone && formData.prefecture && formData.dob;

  // Handle successful payment
  const handlePaymentSuccess = async (details: any) => {
    await submitRegistration();
  };

  const submitRegistration = async () => {
    if (!selectedEvent) return;
    setIsSubmitting(true);
    setPaymentError(null);

    try {
      await api.createRegistration({
        eventId: selectedEvent.id,
        applicantName: formData.name,
        email: formData.email,
        phone: formData.phone,
        prefecture: formData.prefecture,
        dob: formData.dob,
        paymentMethod: formData.paymentMethod as any
      });
      setSubmitSuccess(true);
      loadEvents();
    } catch (error) {
      alert('予約登録に失敗しました。お問い合わせください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.paymentMethod === 'paypal') return; // Handled by PayPal buttons
    await submitRegistration();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>;
  }

  return (
    <div className="py-24 min-h-screen relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-800 mb-6 font-heading">体験会スケジュール</h2>
          <p className="text-slate-600">ご希望の日程を選んでお申し込みください。</p>
          <div className="mt-6 flex justify-center">
            <label className="flex items-center space-x-2 cursor-pointer bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-teal-600 rounded focus:ring-teal-500 border-slate-300"
                checked={showPastEvents}
                onChange={(e) => setShowPastEvents(e.target.checked)}
              />
              <span className="text-sm text-slate-700">過去のイベントも表示する</span>
            </label>
          </div>
        </div>

        <div className="space-y-6">
          {events
            .filter(e => showPastEvents ? true : e.status === 'upcoming')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .length === 0 ? (
            <div className="text-center py-12 glass rounded-xl shadow-sm">
              <p className="text-slate-500">現在予定されている体験会はありません。</p>
            </div>
          ) : (
            events.map(event => {
              const remaining = getRemainingSeats(event.id, event.capacity);
              const isFull = remaining === 0;

              return (
                <div key={event.id} className="glass rounded-xl shadow-sm border border-white/50 overflow-hidden hover:shadow-md transition-shadow flex flex-col md:flex-row group">
                  <div className={`text-white p-6 flex flex-col justify-center items-center w-full md:w-36 shrink-0 ${isFull ? 'bg-slate-400' : 'bg-gradient-to-br from-teal-400 to-teal-600'}`}>
                    <span className="text-2xl font-bold font-heading">{format(parseISO(event.date), 'M/d', { locale: ja })}</span>
                    <span className="text-sm opacity-90 font-medium">({format(parseISO(event.date), 'E', { locale: ja })})</span>
                    <div className="mt-3 text-xs uppercase font-bold tracking-wider px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                      {event.type === EventType.ZOOM ? 'Zoom' : '対面'}
                    </div>
                  </div>

                  <div className="p-8 flex-grow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-slate-800 font-heading group-hover:text-teal-600 transition-colors">{event.title}</h3>
                      {isFull && <span className="text-xs font-bold bg-red-100 text-red-500 px-3 py-1 rounded-full">満席</span>}
                    </div>

                    <p className="text-slate-600 mb-6 text-sm leading-relaxed">{event.description}</p>

                    <div className="flex flex-wrap gap-6 text-sm text-slate-500 mb-8">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-teal-400" />
                        {event.startTime} - {event.endTime}
                      </div>
                      <div className="flex items-center">
                        {event.type === EventType.ZOOM ? <Monitor className="w-4 h-4 mr-2 text-blue-400" /> : <MapPin className="w-4 h-4 mr-2 text-teal-400" />}
                        {event.type === EventType.ZOOM ? 'オンライン (Zoom)' : event.location || '場所詳細はお申し込み後'}
                      </div>
                      <div className="flex items-center font-bold text-teal-600 text-base">
                        ¥{event.price.toLocaleString()}
                      </div>
                      <div className={`flex items-center font-bold ${isFull ? 'text-red-400' : 'text-teal-500'}`}>
                        <Users className="w-4 h-4 mr-2" />
                        {isFull ? 'キャンセル待ち' : `残席 ${remaining}名`}
                      </div>
                    </div>

                    <button
                      onClick={() => handleBookClick(event)}
                      disabled={isFull}
                      className={`inline-flex items-center px-8 py-3 text-sm font-medium rounded-full transition-all shadow-sm hover:shadow-lg transform hover:-translate-y-0.5 ${isFull ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:from-slate-700 hover:to-slate-800'}`}
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
        <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "JPY" }}>
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
                            お申し込みありがとうございます。<br />
                            手続き完了メールをお送りしましたのでご確認ください。
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
                            {selectedEvent.title} <br />
                            {format(parseISO(selectedEvent.date), 'yyyy年M月d日', { locale: ja })} {selectedEvent.startTime}-{selectedEvent.endTime}
                            <br />
                            <span className="font-bold text-slate-800">参加費: ¥{selectedEvent.price.toLocaleString()}</span>
                          </p>

                          <form onSubmit={handleManualSubmit} className="space-y-4">
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

                            {/* New Fields */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label htmlFor="dob" className="block text-sm font-medium text-slate-700">生年月日</label>
                                <input
                                  type="date"
                                  name="dob"
                                  id="dob"
                                  required
                                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                  value={formData.dob}
                                  onChange={handleFormChange}
                                />
                              </div>
                              <div>
                                <label htmlFor="prefecture" className="block text-sm font-medium text-slate-700">都道府県</label>
                                <select
                                  name="prefecture"
                                  id="prefecture"
                                  required
                                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                  value={formData.prefecture}
                                  onChange={handleFormChange}
                                >
                                  <option value="">選択してください</option>
                                  {PREFECTURES.map(pref => (
                                    <option key={pref} value={pref}>{pref}</option>
                                  ))}
                                </select>
                              </div>
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

                            {/* Payment Method Selection */}
                            <div className="pt-2">
                              <label className="block text-sm font-medium text-slate-700 mb-2">お支払い方法</label>
                              <div className="space-y-2">
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="paypal"
                                    checked={formData.paymentMethod === 'paypal'}
                                    onChange={handleFormChange}
                                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                                  />
                                  <span className="ml-2 text-sm text-slate-700">PayPal (クレジットカード)</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="paypay"
                                    checked={formData.paymentMethod === 'paypay'}
                                    onChange={handleFormChange}
                                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                                  />
                                  <span className="ml-2 text-sm text-slate-700">PayPay</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="bank_transfer"
                                    checked={formData.paymentMethod === 'bank_transfer'}
                                    onChange={handleFormChange}
                                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                                  />
                                  <span className="ml-2 text-sm text-slate-700">銀行振込</span>
                                </label>
                              </div>
                            </div>

                            {paymentError && (
                              <div className="p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">
                                <p className="font-bold">決済エラー</p>
                                {paymentError}
                              </div>
                            )}

                            <div className="mt-8 border-t pt-4">
                              {!isFormValid ? (
                                <div className="text-center p-4 bg-slate-50 rounded text-slate-500 text-sm mb-4">
                                  全ての必須項目を入力してください
                                </div>
                              ) : (
                                <>
                                  {formData.paymentMethod === 'paypal' && (
                                    <div className="space-y-3">
                                      <p className="text-center text-sm text-slate-500 mb-2">PayPalでお支払い</p>
                                      <div className="relative z-0">
                                        <PayPalButtons
                                          style={{ layout: "vertical", shape: "rect", label: "pay" }}
                                          createOrder={(data, actions) => {
                                            return actions.order.create({
                                              purchase_units: [
                                                {
                                                  description: selectedEvent.title,
                                                  amount: {
                                                    value: selectedEvent.price.toString(),
                                                    currency_code: "JPY"
                                                  },
                                                },
                                              ],
                                              intent: "CAPTURE"
                                            });
                                          }}
                                          onApprove={async (data, actions) => {
                                            if (actions.order) {
                                              const details = await actions.order.capture();
                                              handlePaymentSuccess(details);
                                            }
                                          }}
                                          onError={(err) => {
                                            console.error("PayPal Error:", err);
                                            setPaymentError("決済処理中にエラーが発生しました。");
                                          }}
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {formData.paymentMethod === 'paypay' && (
                                    <div className="space-y-4">
                                      <div className="bg-slate-50 p-4 rounded text-sm text-slate-700">
                                        <p className="font-bold mb-2">PayPayでのお支払い</p>
                                        <p>以下のID宛に送金をお願いいたします。</p>
                                        <p className="my-2 font-mono bg-white p-2 rounded border">ID: theta-demo-user</p>
                                        <p className="text-xs text-slate-500">※送金完了後、下のボタンを押して予約を確定してください。</p>
                                      </div>
                                      <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-3 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:text-sm disabled:opacity-50"
                                      >
                                        {isSubmitting ? '処理中...' : '送金しました（予約確定）'}
                                      </button>
                                    </div>
                                  )}

                                  {formData.paymentMethod === 'bank_transfer' && (
                                    <div className="space-y-4">
                                      <div className="bg-slate-50 p-4 rounded text-sm text-slate-700">
                                        <p className="font-bold mb-2">銀行振込</p>
                                        <p>以下へのお振込みをお願いいたします。</p>
                                        <ul className="list-disc list-inside my-2 space-y-1">
                                          <li>銀行名: ○○銀行</li>
                                          <li>支店名: ○○支店</li>
                                          <li>口座: 普通 1234567</li>
                                          <li>名義: シータヒーリングジム</li>
                                        </ul>
                                        <p className="text-xs text-slate-500">※お振込み後、下のボタンを押して予約を確定してください。</p>
                                      </div>
                                      <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-3 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:text-sm disabled:opacity-50"
                                      >
                                        {isSubmitting ? '処理中...' : '振込依頼完了（予約確定）'}
                                      </button>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>

                            <button
                              type="button"
                              className="mt-2 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 sm:text-sm"
                              onClick={() => setSelectedEvent(null)}
                            >
                              キャンセル
                            </button>
                          </form>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PayPalScriptProvider>
      )}
    </div>
  );
};