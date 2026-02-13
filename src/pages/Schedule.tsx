import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { PREFECTURES } from '../constants';
import { Event, EventType, Registration, PaymentSettings } from '../types';
import { Calendar, MapPin, Monitor, Clock, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// PayPal Client ID (Provided by User)
// PayPal Client ID is now in App.tsx



const formatTime = (timeStr: string) => {
  if (!timeStr) return '';
  // If it's an ISO string, parse it to get local time (JST) instead of raw UTC
  if (timeStr.includes('T')) {
    try {
      return format(parseISO(timeStr), 'H:mm');
    } catch (e) {
      return timeStr.split('T')[1].substring(0, 5); // Fallback
    }
  }
  return timeStr;
};

const safeFormatDate = (dateStr: string, fmt: string, options?: any) => {
  try {
    if (!dateStr || dateStr.startsWith('#')) return 'Invalid Date';
    return format(parseISO(dateStr), fmt, options);
  } catch (e) {
    return 'Invalid Date';
  }
};

export const Schedule: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);

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
    const [eventsData, regsData, settingsData] = await Promise.all([
      api.getEvents(),
      api.getRegistrations(),
      api.getPaymentSettings()
    ]);

    setEvents(eventsData);
    setRegistrations(regsData);
    setPaymentSettings(settingsData);
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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleValueChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
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
    <div className="py-24 min-h-screen relative bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-bold text-slate-800 font-heading">体験会スケジュール</h2>
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
            .sort((a, b) => {
              const tA = new Date(a.date).getTime();
              const tB = new Date(b.date).getTime();
              if (isNaN(tA)) return 1;
              if (isNaN(tB)) return -1;
              return tA - tB;
            })
            .length === 0 ? (
            <div className="text-center py-12 bg-white/50 border border-dashed border-slate-200 rounded-xl">
              <p className="text-slate-500">現在予定されている体験会はありません。</p>
            </div>
          ) : (
            events.map(event => {
              const remaining = getRemainingSeats(event.id, event.capacity);
              const isFull = remaining === 0;

              return (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur group">
                  <CardContent className="p-0 flex flex-col md:flex-row">
                    <div className={`p-6 flex flex-col justify-center items-center w-full md:w-36 shrink-0 text-white ${isFull ? 'bg-slate-400' : 'bg-gradient-to-br from-teal-400 to-teal-600'}`}>
                      <span className="text-2xl font-bold font-heading">{safeFormatDate(event.date, 'M/d', { locale: ja })}</span>
                      <span className="text-sm opacity-90 font-medium">({safeFormatDate(event.date, 'E', { locale: ja })})</span>
                      <div className="mt-3 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-white/20 rounded-full backdrop-blur-sm">
                        {event.type === EventType.ZOOM ? 'Zoom' : '対面'}
                      </div>
                    </div>

                    <div className="p-6 md:p-8 flex-grow">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-slate-800 font-heading group-hover:text-teal-600 transition-colors">{event.title}</h3>
                        {isFull && <span className="text-xs font-bold bg-red-100 text-red-500 px-3 py-1 rounded-full border border-red-200">満席</span>}
                      </div>

                      <p className="text-slate-600 mb-6 text-sm leading-relaxed">{event.description}</p>

                      <div className="flex flex-wrap gap-6 text-sm text-slate-500 mb-8">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-teal-400" />
                          {formatTime(event.startTime)} - {formatTime(event.endTime)}
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

                      <Button
                        onClick={() => handleBookClick(event)}
                        disabled={isFull}
                        className={`rounded-full px-8 h-10 ${isFull ? 'bg-slate-200 text-slate-400 hover:bg-slate-200 cursor-not-allowed' : 'bg-slate-800 text-white hover:bg-slate-700 shadow-md'}`}
                      >
                        {isFull ? '満席' : '申し込む'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Booking Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => { if (!open) setSelectedEvent(null); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              {submitSuccess ? "お申し込み完了" : "体験会へのお申し込み"}
            </DialogTitle>
            {selectedEvent && !submitSuccess && (
              <DialogDescription>
                {selectedEvent.title} <br />
                {safeFormatDate(selectedEvent.date, 'yyyy年M月d日', { locale: ja })} {formatTime(selectedEvent.startTime)}-{formatTime(selectedEvent.endTime)}
                <br />
                <span className="font-bold text-slate-800">参加費: ¥{selectedEvent.price.toLocaleString()}</span>
              </DialogDescription>
            )}
          </DialogHeader>

          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <p className="mt-4 text-sm text-slate-500">
                お申し込みありがとうございます。<br />
                手続き完了メールをお送りしましたのでご確認ください。
              </p>
              <div className="mt-8">
                <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={() => setSelectedEvent(null)}>
                  閉じる
                </Button>
              </div>
            </div>
          ) : (
            selectedEvent && (
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">お名前</Label>
                  <Input id="name" name="name" required value={formData.name} onChange={handleFormChange} placeholder="山田 太郎" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dob">生年月日</Label>
                    <Input id="dob" name="dob" type="date" max="9999-12-31" required value={formData.dob} onChange={handleFormChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prefecture">都道府県</Label>
                    <Select name="prefecture" value={formData.prefecture} onValueChange={(val) => handleValueChange('prefecture', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="選択" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {PREFECTURES.map(pref => (
                          <SelectItem key={pref} value={pref}>{pref}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input id="email" name="email" type="email" required value={formData.email} onChange={handleFormChange} placeholder="example@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">電話番号</Label>
                  <Input id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleFormChange} placeholder="090-1234-5678" />
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-3 pt-2">
                  <Label>お支払い方法</Label>
                  <RadioGroup value={formData.paymentMethod} onValueChange={(val) => handleValueChange('paymentMethod', val)} className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal" className="font-normal cursor-pointer">PayPal (クレジットカード)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="paypay" id="paypay" />
                      <Label htmlFor="paypay" className="font-normal cursor-pointer">PayPay</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                      <Label htmlFor="bank_transfer" className="font-normal cursor-pointer">銀行振込</Label>
                    </div>
                  </RadioGroup>
                </div>

                {paymentError && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <div>
                      <p className="font-bold text-xs">エラー</p>
                      {paymentError}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  {!isFormValid ? (
                    <div className="text-center p-3 bg-slate-50 rounded text-slate-500 text-xs mb-4">
                      全ての必須項目を入力してください
                    </div>
                  ) : (
                    <>
                      {formData.paymentMethod === 'paypal' && (
                        <div className="space-y-3">
                          <p className="text-center text-xs text-slate-500 mb-2">PayPalでお支払い</p>
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
                            <p className="my-2 font-mono bg-white p-2 rounded border text-center select-all">ID: {paymentSettings?.paypayId || 'na2wa8'}</p>
                            <p className="text-xs text-slate-500">※送金完了後、下のボタンを押して予約を確定してください。</p>
                          </div>
                          <Button type="submit" disabled={isSubmitting} className="w-full bg-teal-600 hover:bg-teal-700">
                            {isSubmitting ? '処理中...' : '送金しました（予約確定）'}
                          </Button>
                        </div>
                      )}

                      {formData.paymentMethod === 'bank_transfer' && (
                        <div className="space-y-4">
                          <div className="bg-slate-50 p-4 rounded text-sm text-slate-700">
                            <p className="font-bold mb-2">銀行振込</p>
                            <p>以下へのお振込みをお願いいたします。</p>
                            <ul className="list-disc list-inside my-2 space-y-1 text-xs">
                              <li>銀行名: {paymentSettings?.bankName || 'auじぶん銀行'}</li>
                              <li>支店名: {paymentSettings?.bankBranch || 'だいだい支店'}</li>
                              <li>口座: {paymentSettings?.bankAccount || '普通 3524711'}</li>
                              <li>名義: {paymentSettings?.bankAccountName || 'スズキ タケル'}</li>
                            </ul>
                            <p className="text-xs text-slate-500">※お振込み後、下のボタンを押して予約を確定してください。</p>
                          </div>
                          <Button type="submit" disabled={isSubmitting} className="w-full bg-teal-600 hover:bg-teal-700">
                            {isSubmitting ? '処理中...' : '振込依頼完了（予約確定）'}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <Button type="button" variant="outline" className="w-full mt-2" onClick={() => setSelectedEvent(null)}>
                  キャンセル
                </Button>
              </form>
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};