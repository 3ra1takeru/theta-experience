import React, { useState } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Star, Send, Sparkles, Heart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OCCUPATIONS } from '../constants';

export const FeedbackForm: React.FC = () => {
    const navigate = useNavigate();
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [name, setName] = useState('');
    const [gender, setGender] = useState('');
    const [ageGroup, setAgeGroup] = useState('');
    const [occupation, setOccupation] = useState('');
    const [prefecture, setPrefecture] = useState('');
    const [comment, setComment] = useState('');
    const [sessionType, setSessionType] = useState('experience'); // Default to experience
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !comment.trim()) return;

        setIsSubmitting(true);
        try {
            await api.submitFeedback({
                eventId: sessionType === 'personal_session' ? 'personal_session' : 'experience', // Explicit IDs
                authorName: name,
                rating,
                comment,
                prefecture,
                ageGroup,
                gender,
                occupation
            });
            setIsSuccess(true);
            setTimeout(() => {
                navigate('/testimonials');
            }, 3000);
        } catch (error) {
            console.error(error);
            alert('送信に失敗しました。もう一度お試しください。');
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50/50 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[300px] h-[300px] bg-teal-100/40 rounded-full blur-[60px] animate-float-slow"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-100/40 rounded-full blur-[80px] animate-float" style={{ animationDelay: '1s' }}></div>
                </div>

                <Card className="w-full max-w-md border-none shadow-xl bg-white/80 backdrop-blur-md text-center p-8 animate-in fade-in zoom-in duration-500">
                    <CardContent className="space-y-6 pt-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 animate-bounce">
                            <Sparkles className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 font-heading">ありがとうございます！</h2>
                        <p className="text-slate-600 leading-relaxed">
                            貴重なご感想をいただき、感謝いたします。<br />
                            あなたの言葉が、誰かの新しい一歩になるかもしれません。
                        </p>
                        <p className="text-sm text-slate-400 mt-4">参加者の声ページへ移動します...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-24 px-4 bg-slate-50 relative overflow-hidden flex items-center justify-center">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-[100px] animate-float-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-100/40 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            <Card className="w-full max-w-lg border-white/60 shadow-xl bg-white/70 backdrop-blur-sm relative z-10">
                <CardHeader className="text-center pb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner text-teal-600">
                        <Heart className="w-6 h-6 fill-current" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-800 font-heading">ご感想をお聞かせください</CardTitle>
                    <CardDescription className="text-slate-500">
                        セッションはいかがでしたか？<br />
                        率直なご感想をお待ちしております。
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Rating */}
                        <div className="space-y-3 text-center">
                            <Label className="text-slate-700 font-medium">参加満足度</Label>
                            <div className="flex justify-center gap-2 group">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                    >
                                        <Star
                                            className={`w-8 h-8 transition-colors duration-200 ${star <= (hoverRating || rating)
                                                ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                                                : "text-slate-300 fill-slate-100"
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <p className="text-sm text-slate-400 h-5">
                                {(hoverRating || rating) === 5 && "とても満足！"}
                                {(hoverRating || rating) === 4 && "良かった"}
                                {(hoverRating || rating) === 3 && "普通"}
                                {(hoverRating || rating) === 2 && "いまひとつ"}
                                {(hoverRating || rating) === 1 && "改善してほしい"}
                            </p>
                        </div>

                        {/* Attributes Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-700">性別</Label>
                                <Select value={gender} onValueChange={setGender}>
                                    <SelectTrigger className="bg-white/50 border-slate-200">
                                        <SelectValue placeholder="選択してください" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="女性">女性</SelectItem>
                                        <SelectItem value="男性">男性</SelectItem>
                                        <SelectItem value="その他">その他</SelectItem>
                                        <SelectItem value="回答しない">回答しない</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700">年代</Label>
                                <Select value={ageGroup} onValueChange={setAgeGroup}>
                                    <SelectTrigger className="bg-white/50 border-slate-200">
                                        <SelectValue placeholder="選択してください" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10代">10代</SelectItem>
                                        <SelectItem value="20代">20代</SelectItem>
                                        <SelectItem value="30代">30代</SelectItem>
                                        <SelectItem value="40代">40代</SelectItem>
                                        <SelectItem value="50代">50代</SelectItem>
                                        <SelectItem value="60代以上">60代以上</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-700">ご職業</Label>
                            <Select value={occupation} onValueChange={setOccupation}>
                                <SelectTrigger className="bg-white/50 border-slate-200">
                                    <SelectValue placeholder="選択してください" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {OCCUPATIONS.map(occ => (
                                        <SelectItem key={occ} value={occ}>{occ}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>


                        {/* Session Type Selection */}
                        <div className="space-y-2">
                            <Label className="text-slate-700">参加されたメニュー</Label>
                            <Select value={sessionType} onValueChange={setSessionType}>
                                <SelectTrigger className="bg-white/50 border-slate-200">
                                    <SelectValue placeholder="選択してください" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="experience">シータヒーリング体験会</SelectItem>
                                    <SelectItem value="personal_session">個人セッション</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>



                        <div className="space-y-2">
                            <Label className="text-slate-700">お住まいの都道府県</Label>
                            <Select value={prefecture} onValueChange={setPrefecture}>
                                <SelectTrigger className="bg-white/50 border-slate-200">
                                    <SelectValue placeholder="選択してください" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県", "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県", "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県", "海外"].map(p => (
                                        <SelectItem key={p} value={p}>{p}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-700">お名前（ニックネーム可）</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="例: シータ花子"
                                className="bg-white/50 border-slate-200 focus:border-teal-400 focus:ring-teal-400/20"
                                required
                            />
                        </div>

                        {/* Comment */}
                        <div className="space-y-2">
                            <Label htmlFor="comment" className="text-slate-700">ご感想・気づきなど</Label>
                            <Textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="体験会に参加して感じたことや、変化があったことなどを自由にお書きください。"
                                className="min-h-[120px] bg-white/50 border-slate-200 focus:border-teal-400 focus:ring-teal-400/20 resize-none"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 rounded-full text-base font-medium bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-lg shadow-teal-200/50 transition-all hover:-translate-y-1"
                            disabled={isSubmitting}
                        >
                            <div className="flex items-center gap-2">
                                {isSubmitting ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                                {isSubmitting ? '送信中...' : '感想を送る'}
                            </div>
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div >
    );
};
