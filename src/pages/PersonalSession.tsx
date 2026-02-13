
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { Feedback } from '../types';
import { Star, MessageSquare } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PREFECTURES } from '../constants';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Age groups
const AGE_GROUPS = [
  "10代", "20代", "30代", "40代", "50代", "60代", "70代以上"
];

export const PersonalSession: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // New fields
  const [dob, setDob] = useState('');
  const [locationType, setLocationType] = useState<'japan' | 'overseas'>('japan');
  const [prefecture, setPrefecture] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState(''); // City/State for overseas

  const [date1, setDate1] = useState('');
  const [date2, setDate2] = useState('');
  const [date3, setDate3] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Feedback[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [newReview, setNewReview] = useState<{
    name: string;
    rating: number;
    comment: string;
    prefecture: string;
    ageGroup: string;
  }>({ name: '', rating: 5, comment: '', prefecture: '', ageGroup: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const allFeedback = await api.getFeedback(true);
        // Filter for personal session reviews
        const sessionReviews = allFeedback.filter(f => f.eventId === 'personal_session');
        setReviews(sessionReviews);
      } catch (error) {
        console.error('Failed to fetch reviews', error);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Construct location string based on type
      // For Personal Session, we overload 'prefecture' to store Location + Dates because standard fields are limited.
      // We really should use a "note" field if it existed, but we don't.
      // Format: "LocationString [希望: Date1, Date2, Date3]"

      let loc = '';
      if (locationType === 'japan') {
        loc = prefecture;
      } else {
        loc = `海外: ${country} ${region}`;
      }

      const dateString = `[希望日時: ${date1}, ${date2}, ${date3}]`;
      const combinedPrefectureField = `${loc} ${dateString}`;

      const registrationData = {
        eventId: 'personal_session',
        applicantName: name,
        email: email,
        phone: '', // Optional
        registeredAt: new Date().toISOString(),
        status: 'confirmed' as const,
        surveySent: false,
        dob: dob,
        prefecture: combinedPrefectureField
      };

      await api.createRegistration(registrationData);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('送信に失敗しました。もう一度お試しください。');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitting(true);
    try {
      await api.submitFeedback({
        eventId: 'personal_session',
        authorName: newReview.name,
        rating: newReview.rating,
        comment: newReview.comment,
        prefecture: newReview.prefecture,
        ageGroup: newReview.ageGroup
      });
      setReviewSubmitted(true);
      setNewReview({ name: '', rating: 5, comment: '', prefecture: '', ageGroup: '' });
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setReviewSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/personal_session_hero.png"
            alt="Personal Session"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold font-heading mb-4 drop-shadow-lg" style={{ fontFamily: 'Zen Old Mincho, serif' }}>
            Personal Session
          </h1>
          <p className="text-xl md:text-2xl font-light tracking-wide text-slate-100">
            あなただけの特別な癒しの時間
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-24">
        {/* Description Section */}
        <section className="text-center space-y-8">
          <h2 className="text-3xl font-bold text-slate-800 font-heading">
            個人セッションについて
          </h2>
          <p className="text-lg text-slate-600 leading-loose max-w-2xl mx-auto">
            シータヒーリング®のテクニックを用いて、あなたの潜在意識に働きかけ、
            悩みやブロックを解消し、本来の輝きを取り戻すお手伝いをさせていただきます。<br />
            対面、またはZoomでのオンラインセッションをお選びいただけます。
          </p>
        </section>

        {/* Calendar & Application Section */}
        <section className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-slate-100">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-slate-800 font-heading flex items-center gap-2">
                <Calendar className="w-6 h-6 text-teal-500" />
                ご予約状況
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                カレンダーの「空き」をご確認の上、下記フォームより第3希望まで日時をお知らせください。
              </p>
              <div className="aspect-square w-full bg-slate-50 rounded-xl overflow-hidden shadow-inner border border-slate-200">
                <iframe
                  src="https://calendar.google.com/calendar/embed?src=near.future.boy@gmail.com&ctz=Asia/Tokyo"
                  style={{ border: 0 }}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  title="Google Calendar"
                ></iframe>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-slate-800 font-heading">
                お申し込みフォーム
              </h3>

              {submitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-teal-50 rounded-xl border border-teal-100">
                  <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 mb-2">送信完了</h4>
                  <p className="text-slate-600">
                    お申し込みありがとうございます。<br />
                    内容を確認の上、折り返しご連絡させていただきます。
                  </p>
                  <Button
                    className="mt-6 text-teal-600 hover:text-teal-700 variant-ghost"
                    onClick={() => setSubmitted(false)}
                    variant="ghost"
                  >
                    続けて申し込む
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">お名前</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="山田 花子"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">生年月日</Label>
                    <Input
                      id="dob"
                      type="date"
                      max="9999-12-31"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>お住まい</Label>
                    <RadioGroup
                      value={locationType}
                      onValueChange={(val: 'japan' | 'overseas') => setLocationType(val)}
                      className="flex space-x-4 mb-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="japan" id="loc-japan" />
                        <Label htmlFor="loc-japan" className="font-normal cursor-pointer">日本国内</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="overseas" id="loc-overseas" />
                        <Label htmlFor="loc-overseas" className="font-normal cursor-pointer">海外</Label>
                      </div>
                    </RadioGroup>

                    {locationType === 'japan' ? (
                      <div className="space-y-2 animate-fade-in">
                        <Label htmlFor="prefecture" className="text-xs text-slate-500">都道府県</Label>
                        <Select value={prefecture} onValueChange={setPrefecture}>
                          <SelectTrigger>
                            <SelectValue placeholder="選択してください" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {PREFECTURES.map(pref => (
                              <SelectItem key={pref} value={pref}>{pref}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 animate-fade-in">
                        <div className="space-y-1">
                          <Label htmlFor="country" className="text-xs text-slate-500">国名</Label>
                          <Input
                            id="country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            placeholder="例: アメリカ"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="region" className="text-xs text-slate-500">州/都市</Label>
                          <Input
                            id="region"
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            placeholder="例: ニューヨーク"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="example@email.com"
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <Label>ご希望日時（第3希望まで）</Label>
                    <div className="grid gap-2">
                      <Input
                        placeholder="第1希望: 例）10月1日 14:00〜"
                        value={date1}
                        onChange={(e) => setDate1(e.target.value)}
                        required
                      />
                      <Input
                        placeholder="第2希望"
                        value={date2}
                        onChange={(e) => setDate2(e.target.value)}
                      />
                      <Input
                        placeholder="第3希望"
                        value={date3}
                        onChange={(e) => setDate3(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white mt-4"
                    disabled={submitting}
                  >
                    {submitting ? '送信中...' : '申し込む'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>


        {/* Reviews Section */}
        <section className="relative rounded-3xl overflow-hidden p-8 md:p-12 mb-20">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/personal_session_reviews_bg.png"
              alt="Background"
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-white/40 to-slate-50/90" />
          </div>

          <div className="relative z-10 space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-bold text-slate-800 font-heading">Voice</h2>
              <p className="text-slate-600">セッションを受けられた方の声</p>
            </div>

            {/* Review List */}
            <div className="grid gap-6 md:grid-cols-2">
              {loadingReviews ? (
                <div className="col-span-2 text-center py-12">読み込み中...</div>
              ) : reviews.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-slate-500 bg-white/50 rounded-xl border border-dashed border-slate-300">
                  まだレビューはありません。
                </div>
              ) : (
                reviews.map((review) => (
                  <Card key={review.id} className="bg-white/80 backdrop-blur-sm border-none shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-slate-400">
                          {format(parseISO(review.createdAt), 'yyyy/MM/dd')}
                        </span>
                      </div>
                      <p className="text-slate-700 italic">"{review.comment}"</p>
                      <div className="flex justify-between items-end border-t border-slate-100 pt-4 mt-2">
                        <div className="text-xs text-slate-500 flex flex-col gap-1">
                          {review.prefecture && <span>{review.prefecture}</span>}
                          {review.ageGroup && <span>{review.ageGroup}</span>}
                        </div>
                        <p className="text-sm font-bold text-slate-900">- {review.authorName}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Review Form */}
            <div className="max-w-xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/50">
              <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">レビューを書く</h3>

              {reviewSubmitted ? (
                <div className="text-center py-8">
                  <p className="text-teal-600 font-bold mb-2">ありがとうございます！</p>
                  <p className="text-slate-600 text-sm">レビューを送信しました。<br />承認後に表示されます。</p>
                  <Button
                    variant="link"
                    className="mt-4 text-slate-400"
                    onClick={() => setReviewSubmitted(false)}
                  >
                    戻る
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="review-name">お名前（イニシャル・ニックネーム可）</Label>
                    <Input
                      id="review-name"
                      value={newReview.name}
                      onChange={e => setNewReview({ ...newReview, name: e.target.value })}
                      required
                      placeholder="A.B"
                      className="bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="review-age" className="text-xs text-slate-500">年代</Label>
                      <Select onValueChange={(val) => setNewReview({ ...newReview, ageGroup: val })}>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {AGE_GROUPS.map(age => (
                            <SelectItem key={age} value={age}>{age}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="review-pref" className="text-xs text-slate-500">都道府県</Label>
                      <Select onValueChange={(val) => setNewReview({ ...newReview, prefecture: val })}>
                        <SelectTrigger className="bg-white">
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

                  <div>
                    <Label>評価</Label>
                    <div className="flex gap-2 text-amber-400 mt-1 cursor-pointer">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-6 h-6 ${star <= newReview.rating ? 'fill-current' : 'text-slate-300'}`}
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="review-comment">ご感想</Label>
                    <Textarea
                      id="review-comment"
                      value={newReview.comment}
                      onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                      required
                      placeholder="セッションの感想をお聞かせください"
                      className="bg-white min-h-[100px]"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white"
                    disabled={reviewSubmitting}
                  >
                    {reviewSubmitting ? '送信中...' : 'レビューを送信'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
