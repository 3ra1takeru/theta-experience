import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Event, Registration, Feedback, EventType, InstructorProfile } from '../types';
import { format, parseISO } from 'date-fns';
import { Plus, Download, Send, Check, Trash2, XCircle, User, Save, Upload, FileText, Copy } from 'lucide-react';
import { ja } from 'date-fns/locale';

export const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'events' | 'applications' | 'feedback' | 'profile'>('events');

  // Data State
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [instructor, setInstructor] = useState<InstructorProfile | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Actions
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    type: EventType.ZOOM,
    capacity: 5,
    price: 3000,
    status: 'upcoming'
  });
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);

  // --- Import States ---
  const [importMode, setImportMode] = useState<'single' | 'csv'>('single');
  const [csvText, setCsvText] = useState('');

  // Event Import
  const [showEventImportModal, setShowEventImportModal] = useState(false);
  const [singleEventInput, setSingleEventInput] = useState<Partial<Event>>({
    title: '', date: '', startTime: '10:00', endTime: '12:00', type: EventType.ZOOM, capacity: 5, price: 3000, status: 'completed'
  });

  // Registration Import
  const [showRegImportModal, setShowRegImportModal] = useState(false);
  const [singleRegInput, setSingleRegInput] = useState<{eventId: string, name: string, email: string, phone: string, date: string}>({
     eventId: '', name: '', email: '', phone: '', date: format(new Date(), 'yyyy-MM-dd')
  });
  
  // Feedback Import
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [singleFeedback, setSingleFeedback] = useState({
    authorName: '',
    rating: 5,
    comment: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  // --- Auth Handlers ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // Simple mock auth
      setIsAuthenticated(true);
      loadAllData();
    } else {
      alert('パスワードが違います');
    }
  };

  // --- Data Loading ---
  const loadAllData = async () => {
    setLoading(true);
    const [e, r, f, i] = await Promise.all([
      api.getEvents(),
      api.getRegistrations(),
      api.getFeedback(false), // Get all for admin
      api.getInstructorProfile()
    ]);
    setEvents(e);
    setRegistrations(r);
    setFeedbackList(f);
    setInstructor(i);
    setLoading(false);
  };

  // --- Event Creation (Standard) ---
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;
    
    await api.createEvent(newEvent as Omit<Event, 'id'>);
    setShowCreateModal(false);
    loadAllData();
  };

  // --- Import Handlers: Events ---
  const handleSingleEventImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleEventInput.title || !singleEventInput.date) return;
    await api.importEvents([singleEventInput as any]);
    setShowEventImportModal(false);
    loadAllData();
  };

  const handleCsvEventImport = async () => {
     if (!csvText.trim()) return;
     const lines = csvText.split('\n').filter(l => l.trim().length > 0);
     const items: any[] = [];
     for (const line of lines) {
       // Format: Title, Date(YYYY-MM-DD), Start, End, Type, Cap, Price, Status
       const parts = line.split(',');
       if (parts.length < 2) continue;
       items.push({
         title: parts[0].trim(),
         date: new Date(parts[1].trim()).toISOString(),
         startTime: parts[2]?.trim() || '10:00',
         endTime: parts[3]?.trim() || '12:00',
         type: parts[4]?.trim() === '対面' ? EventType.IN_PERSON : EventType.ZOOM,
         capacity: parseInt(parts[5]?.trim()) || 5,
         price: parseInt(parts[6]?.trim()) || 3000,
         status: parts[7]?.trim() || 'completed',
         description: 'インポートされたイベント'
       });
     }
     if (items.length > 0 && window.confirm(`${items.length}件のイベントをインポートしますか？`)) {
       await api.importEvents(items);
       setShowEventImportModal(false);
       setCsvText('');
       loadAllData();
     }
  };

  // --- Import Handlers: Registrations ---
  const handleSingleRegImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleRegInput.eventId || !singleRegInput.name) return;
    await api.importRegistrations([{
      eventId: singleRegInput.eventId,
      applicantName: singleRegInput.name,
      email: singleRegInput.email,
      phone: singleRegInput.phone,
      registeredAt: new Date(singleRegInput.date).toISOString(),
      status: 'confirmed'
    } as any]);
    setShowRegImportModal(false);
    loadAllData();
  };

  const handleCsvRegImport = async () => {
    if (!csvText.trim()) return;
    const lines = csvText.split('\n').filter(l => l.trim().length > 0);
    const items: any[] = [];
    for (const line of lines) {
      // Format: EventID, Name, Email, Phone, RegDate
      const parts = line.split(',');
      if (parts.length < 2) continue;
      items.push({
        eventId: parts[0].trim(),
        applicantName: parts[1].trim(),
        email: parts[2]?.trim() || '',
        phone: parts[3]?.trim() || '',
        registeredAt: parts[4] ? new Date(parts[4].trim()).toISOString() : new Date().toISOString(),
        status: 'confirmed'
      });
    }
    if (items.length > 0 && window.confirm(`${items.length}件のお申し込みをインポートしますか？`)) {
      await api.importRegistrations(items);
      setShowRegImportModal(false);
      setCsvText('');
      loadAllData();
    }
  };

  // --- Email Sending Simulation ---
  const handleSendSurvey = async (eventId: string) => {
    if(!window.confirm('このイベントの参加者全員（出席者）にアンケートメールを送信しますか？')) return;
    
    setSendingEmailId(eventId);
    const count = await api.sendSurveyEmail(eventId);
    setSendingEmailId(null);
    alert(`${count}件のメールを送信しました。\n(シミュレーション: 実際には送信されません)`);
    loadAllData(); // refresh flags
  };

  // --- Feedback Moderation ---
  const handleApproveFeedback = async (id: string) => {
    await api.approveFeedback(id);
    loadAllData();
  };

  const handleUnapproveFeedback = async (id: string) => {
    await api.unapproveFeedback(id);
    loadAllData();
  };

  const handleDeleteFeedback = async (id: string) => {
    if(window.confirm('本当に削除しますか？')) {
      await api.deleteFeedback(id);
      loadAllData();
    }
  };

  // --- Feedback Import ---
  const handleSingleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.importFeedback([{
      authorName: singleFeedback.authorName,
      rating: singleFeedback.rating,
      comment: singleFeedback.comment,
      eventId: 'manual-import',
      // Pass date as 'createdAt' for the API helper to use
      createdAt: new Date(singleFeedback.date).toISOString()
    } as any]);
    
    setShowFeedbackModal(false);
    setSingleFeedback({ authorName: '', rating: 5, comment: '', date: format(new Date(), 'yyyy-MM-dd') });
    loadAllData();
  };

  const handleCsvImport = async () => {
    if (!csvText.trim()) return;

    // Simple CSV parser: Name,Rating,Date,Comment
    // Assumes no commas in name/comment for simplicity, or standard CSV behavior
    const lines = csvText.split('\n').filter(l => l.trim().length > 0);
    const items: any[] = [];

    for (const line of lines) {
      // Split by comma
      const parts = line.split(',');
      if (parts.length < 3) continue; // Skip invalid lines

      const authorName = parts[0].trim();
      const rating = parseInt(parts[1].trim()) || 5;
      const dateStr = parts[2].trim();
      // Join the rest as comment in case it contained commas
      const comment = parts.slice(3).join(',').trim();

      let dateObj = new Date();
      if (dateStr) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) dateObj = d;
      }

      items.push({
        authorName,
        rating,
        comment,
        eventId: 'csv-import',
        createdAt: dateObj.toISOString()
      });
    }

    if (items.length > 0) {
      if(window.confirm(`${items.length}件のデータをインポートしますか？`)) {
        await api.importFeedback(items);
        setShowFeedbackModal(false);
        setCsvText('');
        loadAllData();
      }
    } else {
      alert('有効なデータが見つかりませんでした。\nフォーマットを確認してください:\n名前,評価(1-5),日付(yyyy-mm-dd),感想本文');
    }
  };

  // --- Instructor Profile Save ---
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instructor) return;

    setProfileSaving(true);
    try {
      await api.updateInstructorProfile(instructor);
      alert('プロフィールを保存しました');
    } catch (error) {
      console.error(error);
      alert('保存に失敗しました');
    } finally {
      setProfileSaving(false);
    }
  };

  // --- Utility ---
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`コピーしました: ${text}`);
  };

  // --- Simple "Login" Screen ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
          <h2 className="text-xl font-bold mb-6 text-center text-slate-800">管理者ログイン</h2>
          <input
            type="password"
            className="w-full border border-slate-300 p-3 rounded mb-4"
            placeholder="パスワード (admin123)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-slate-900 text-white p-3 rounded font-bold hover:bg-slate-800">ログイン</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">管理ダッシュボード</h1>
          <button onClick={() => setIsAuthenticated(false)} className="text-sm text-slate-500 hover:text-red-500">ログアウト</button>
        </header>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-white p-1 rounded-lg shadow-sm w-fit mb-6">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'events' ? 'bg-teal-100 text-teal-800' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            イベント管理
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'applications' ? 'bg-teal-100 text-teal-800' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            お申し込み一覧
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'feedback' ? 'bg-teal-100 text-teal-800' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            感想・アンケート
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-teal-100 text-teal-800' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            講師プロフィール
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
          {loading && <div className="p-4 text-center">読み込み中...</div>}
          
          {/* TAB: EVENTS */}
          {!loading && activeTab === 'events' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">登録イベント一覧</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                        setImportMode('single');
                        setCsvText('');
                        setShowEventImportModal(true);
                    }}
                    className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 text-sm"
                  >
                    <Upload className="w-4 h-4" /> 追加・インポート
                  </button>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 text-sm"
                  >
                    <Plus className="w-4 h-4" /> 新規作成
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-3 font-semibold text-slate-600 w-24">ID (Copy)</th>
                      <th className="p-3 font-semibold text-slate-600">日付</th>
                      <th className="p-3 font-semibold text-slate-600">イベント名</th>
                      <th className="p-3 font-semibold text-slate-600">形式</th>
                      <th className="p-3 font-semibold text-slate-600">ステータス</th>
                      <th className="p-3 font-semibold text-slate-600">アクション</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {events.map(event => (
                      <tr key={event.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <button onClick={() => copyToClipboard(event.id)} className="text-xs text-slate-400 hover:text-teal-600 flex items-center gap-1" title="IDをコピー">
                            {event.id.substring(0,6)}... <Copy className="w-3 h-3" />
                          </button>
                        </td>
                        <td className="p-3">{format(parseISO(event.date), 'yyyy/MM/dd')} {event.startTime}</td>
                        <td className="p-3 font-medium">{event.title}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${event.type === EventType.ZOOM ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                            {event.type}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${event.status === 'upcoming' ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-800'}`}>
                            {event.status === 'upcoming' ? '受付中' : '終了'}
                          </span>
                        </td>
                        <td className="p-3">
                          {event.status !== 'upcoming' && (
                             <button 
                               onClick={() => handleSendSurvey(event.id)}
                               disabled={sendingEmailId === event.id}
                               className="flex items-center gap-1 text-purple-600 hover:text-purple-800 text-xs border border-purple-200 px-2 py-1 rounded bg-purple-50"
                             >
                               {sendingEmailId === event.id ? '送信中...' : <><Send className="w-3 h-3" /> アンケート送信</>}
                             </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: APPLICATIONS (Spreadsheet view) */}
          {!loading && activeTab === 'applications' && (
            <div className="p-0">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <div className="text-xs text-slate-500 font-mono">データソース: LocalStorage (Simulated Sheet)</div>
                <div className="flex gap-2">
                  <button 
                     onClick={() => {
                        setImportMode('single');
                        setCsvText('');
                        setShowRegImportModal(true);
                     }}
                     className="flex items-center gap-2 text-white bg-slate-800 hover:bg-slate-900 text-sm px-3 py-1 rounded shadow-sm transition-colors"
                  >
                    <Upload className="w-4 h-4" /> 追加・インポート
                  </button>
                  <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm border bg-white px-3 py-1 rounded shadow-sm">
                    <Download className="w-4 h-4" /> CSVダウンロード
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-600">
                      <th className="border-r border-slate-300 p-2 text-center w-12 font-normal">No.</th>
                      <th className="border-r border-slate-300 p-2 text-left font-normal">登録日時</th>
                      <th className="border-r border-slate-300 p-2 text-left font-normal">参加イベント</th>
                      <th className="border-r border-slate-300 p-2 text-left font-normal">お名前</th>
                      <th className="border-r border-slate-300 p-2 text-left font-normal">Email</th>
                      <th className="border-r border-slate-300 p-2 text-left font-normal">電話番号</th>
                      <th className="border-r border-slate-300 p-2 text-center font-normal">ステータス</th>
                      <th className="p-2 text-center font-normal">アンケート送付</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg, idx) => {
                      const evt = events.find(e => e.id === reg.eventId);
                      return (
                        <tr key={reg.id} className="hover:bg-blue-50">
                          <td className="border-r border-slate-200 border-b border-slate-100 p-2 text-center text-slate-500">{idx + 1}</td>
                          <td className="border-r border-slate-200 border-b border-slate-100 p-2 text-slate-700">
                            {format(parseISO(reg.registeredAt), 'yyyy-MM-dd HH:mm')}
                          </td>
                          <td className="border-r border-slate-200 border-b border-slate-100 p-2 text-slate-700 truncate max-w-[200px]" title={evt?.title}>
                            {evt ? evt.title : `ID:${reg.eventId}`}
                          </td>
                          <td className="border-r border-slate-200 border-b border-slate-100 p-2 text-slate-900 font-medium">{reg.applicantName}</td>
                          <td className="border-r border-slate-200 border-b border-slate-100 p-2 text-slate-600">{reg.email}</td>
                          <td className="border-r border-slate-200 border-b border-slate-100 p-2 text-slate-600">{reg.phone}</td>
                          <td className="border-r border-slate-200 border-b border-slate-100 p-2 text-center">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">確定</span>
                          </td>
                          <td className="border-b border-slate-100 p-2 text-center">
                            {reg.surveySent ? <span className="text-green-500 text-xs">済</span> : <span className="text-slate-300 text-xs">-</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: FEEDBACK */}
          {!loading && activeTab === 'feedback' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-lg">感想の承認・管理</h3>
                 <button 
                    onClick={() => {
                        setImportMode('single');
                        setCsvText('');
                        setShowFeedbackModal(true);
                    }}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 text-sm"
                  >
                    <Upload className="w-4 h-4" /> 感想を追加・インポート
                 </button>
              </div>
              
              <div className="space-y-4">
                {feedbackList.length === 0 && <div className="text-center text-slate-500 py-8">感想はまだありません。</div>}
                {feedbackList.map(fb => (
                  <div key={fb.id} className={`p-4 rounded-lg border ${fb.isApproved ? 'border-slate-200 bg-white' : 'border-yellow-200 bg-yellow-50'} flex justify-between gap-4`}>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-slate-900">{fb.authorName}</span>
                        <div className="flex text-yellow-500 text-xs">{'★'.repeat(fb.rating)}</div>
                        {!fb.isApproved ? (
                          <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">承認待ち</span>
                        ) : (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">公開中</span>
                        )}
                      </div>
                      <p className="text-slate-700 text-sm mb-2">{fb.comment}</p>
                      <div className="text-xs text-slate-400">
                         イベントID: {fb.eventId} | 投稿日: {format(parseISO(fb.createdAt), 'yyyy/MM/dd')}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 justify-center shrink-0">
                      {fb.isApproved ? (
                        <button onClick={() => handleUnapproveFeedback(fb.id)} className="p-2 bg-slate-100 text-slate-500 rounded hover:bg-slate-200" title="承認を取り消して非公開にする">
                          <XCircle className="w-5 h-5" />
                        </button>
                      ) : (
                        <button onClick={() => handleApproveFeedback(fb.id)} className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200" title="承認して公開">
                          <Check className="w-5 h-5" />
                        </button>
                      )}
                      <button onClick={() => handleDeleteFeedback(fb.id)} className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200" title="削除">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* TAB: INSTRUCTOR PROFILE */}
          {!loading && activeTab === 'profile' && instructor && (
             <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg">講師プロフィール編集</h3>
                </div>
                <form onSubmit={handleSaveProfile} className="max-w-2xl space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">講師名</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full border border-slate-300 p-2 rounded focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      value={instructor.name} 
                      onChange={e => setInstructor({...instructor, name: e.target.value})} 
                    />
                  </div>
                  {/* ... Existing profile fields ... */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">肩書き・資格</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full border border-slate-300 p-2 rounded focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      value={instructor.title} 
                      onChange={e => setInstructor({...instructor, title: e.target.value})} 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      自己紹介文 
                      <span className="text-xs text-slate-400 ml-2 font-normal">※改行は反映されます</span>
                    </label>
                    <textarea 
                      required 
                      rows={8}
                      className="w-full border border-slate-300 p-2 rounded focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      value={instructor.introduction} 
                      onChange={e => setInstructor({...instructor, introduction: e.target.value})} 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      顔写真URL
                      <span className="text-xs text-slate-400 ml-2 font-normal">※VPSにアップロードした画像のURLを入力（空欄の場合はデフォルトアイコン）</span>
                    </label>
                    <input 
                      type="text" 
                      className="w-full border border-slate-300 p-2 rounded focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      placeholder="https://your-server.com/images/takeru.jpg"
                      value={instructor.imageUrl || ''} 
                      onChange={e => setInstructor({...instructor, imageUrl: e.target.value})} 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Instagram URL</label>
                       <input 
                         type="url" 
                         className="w-full border border-slate-300 p-2 rounded focus:ring-2 focus:ring-teal-500 focus:outline-none"
                         value={instructor.instagramUrl || ''} 
                         onChange={e => setInstructor({...instructor, instagramUrl: e.target.value})} 
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Website URL</label>
                       <input 
                         type="url" 
                         className="w-full border border-slate-300 p-2 rounded focus:ring-2 focus:ring-teal-500 focus:outline-none"
                         value={instructor.websiteUrl || ''} 
                         onChange={e => setInstructor({...instructor, websiteUrl: e.target.value})} 
                       />
                     </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={profileSaving}
                      className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {profileSaving ? '保存中...' : '保存する'}
                    </button>
                  </div>
                </form>
             </div>
          )}
        </div>
      </div>

      {/* Create Event Modal (Standard Future) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">新規体験会登録（通常）</h3>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">タイトル</label>
                <input required type="text" className="w-full border p-2 rounded" value={newEvent.title || ''} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">概要</label>
                <textarea className="w-full border p-2 rounded" value={newEvent.description || ''} onChange={e => setNewEvent({...newEvent, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">日付</label>
                  <input required type="date" className="w-full border p-2 rounded" onChange={e => setNewEvent({...newEvent, date: new Date(e.target.value).toISOString()})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">形式</label>
                  <select className="w-full border p-2 rounded" value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value as EventType})}>
                    <option value={EventType.ZOOM}>Zoom</option>
                    <option value={EventType.IN_PERSON}>対面</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-slate-700">開始時間</label>
                  <input required type="time" className="w-full border p-2 rounded" value={newEvent.startTime || ''} onChange={e => setNewEvent({...newEvent, startTime: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">終了時間</label>
                  <input required type="time" className="w-full border p-2 rounded" value={newEvent.endTime || ''} onChange={e => setNewEvent({...newEvent, endTime: e.target.value})} />
                </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700">定員</label>
                  <input required type="number" className="w-full border p-2 rounded" value={newEvent.capacity} onChange={e => setNewEvent({...newEvent, capacity: parseInt(e.target.value)})} />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">キャンセル</button>
                <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">登録</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Event Modal */}
      {showEventImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">イベント追加・インポート</h3>
            <div className="flex gap-2 mb-4 border-b border-slate-100 pb-2">
               <button onClick={() => setImportMode('single')} className={`flex items-center gap-1 text-sm font-medium px-3 py-2 rounded transition-colors ${importMode === 'single' ? 'bg-teal-50 text-teal-700' : 'text-slate-500 hover:text-slate-800'}`}>
                 <User className="w-4 h-4" /> 1件詳細登録
               </button>
               <button onClick={() => setImportMode('csv')} className={`flex items-center gap-1 text-sm font-medium px-3 py-2 rounded transition-colors ${importMode === 'csv' ? 'bg-teal-50 text-teal-700' : 'text-slate-500 hover:text-slate-800'}`}>
                 <FileText className="w-4 h-4" /> CSV一括登録
               </button>
            </div>
            
            {importMode === 'single' ? (
               <form onSubmit={handleSingleEventImport} className="space-y-4">
                 <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800 mb-2">過去のイベントや、詳細ステータスを指定して登録できます。</div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700">タイトル</label>
                    <input required type="text" className="w-full border p-2 rounded" value={singleEventInput.title} onChange={e => setSingleEventInput({...singleEventInput, title: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">日付</label>
                      <input required type="date" className="w-full border p-2 rounded" value={singleEventInput.date ? format(new Date(singleEventInput.date), 'yyyy-MM-dd') : ''} onChange={e => setSingleEventInput({...singleEventInput, date: new Date(e.target.value).toISOString()})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">ステータス</label>
                      <select className="w-full border p-2 rounded" value={singleEventInput.status} onChange={e => setSingleEventInput({...singleEventInput, status: e.target.value as any})}>
                         <option value="upcoming">受付中</option>
                         <option value="completed">終了/満員</option>
                         <option value="canceled">中止</option>
                      </select>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-slate-700">開始時間</label><input type="time" className="w-full border p-2 rounded" value={singleEventInput.startTime} onChange={e => setSingleEventInput({...singleEventInput, startTime: e.target.value})} /></div>
                    <div><label className="block text-sm font-medium text-slate-700">終了時間</label><input type="time" className="w-full border p-2 rounded" value={singleEventInput.endTime} onChange={e => setSingleEventInput({...singleEventInput, endTime: e.target.value})} /></div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-slate-700">形式</label>
                       <select className="w-full border p-2 rounded" value={singleEventInput.type} onChange={e => setSingleEventInput({...singleEventInput, type: e.target.value as any})}>
                          <option value={EventType.ZOOM}>Zoom</option>
                          <option value={EventType.IN_PERSON}>対面</option>
                       </select>
                    </div>
                    <div><label className="block text-sm font-medium text-slate-700">価格</label><input type="number" className="w-full border p-2 rounded" value={singleEventInput.price} onChange={e => setSingleEventInput({...singleEventInput, price: parseInt(e.target.value)})} /></div>
                 </div>
                 <div className="flex justify-end gap-2 mt-4">
                    <button type="button" onClick={() => setShowEventImportModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">キャンセル</button>
                    <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">追加</button>
                 </div>
               </form>
            ) : (
               <div className="space-y-4">
                  <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded">
                    <p className="font-bold mb-1">フォーマット (カンマ区切り):</p>
                    <p>タイトル, 日付(yyyy-mm-dd), 開始, 終了, 形式(Zoom/対面), 定員, 価格, ステータス(upcoming/completed)</p>
                  </div>
                  <textarea className="w-full border p-2 rounded h-40 font-mono text-sm" placeholder="Paste CSV here..." value={csvText} onChange={e => setCsvText(e.target.value)} />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowEventImportModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">キャンセル</button>
                    <button type="button" onClick={handleCsvEventImport} className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">インポート</button>
                  </div>
               </div>
            )}
          </div>
        </div>
      )}

      {/* Import Registration Modal */}
      {showRegImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">お申し込み追加・インポート</h3>
            <div className="flex gap-2 mb-4 border-b border-slate-100 pb-2">
               <button onClick={() => setImportMode('single')} className={`flex items-center gap-1 text-sm font-medium px-3 py-2 rounded transition-colors ${importMode === 'single' ? 'bg-teal-50 text-teal-700' : 'text-slate-500 hover:text-slate-800'}`}>
                 <User className="w-4 h-4" /> 1件登録
               </button>
               <button onClick={() => setImportMode('csv')} className={`flex items-center gap-1 text-sm font-medium px-3 py-2 rounded transition-colors ${importMode === 'csv' ? 'bg-teal-50 text-teal-700' : 'text-slate-500 hover:text-slate-800'}`}>
                 <FileText className="w-4 h-4" /> CSV一括登録
               </button>
            </div>

            {importMode === 'single' ? (
               <form onSubmit={handleSingleRegImport} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700">対象イベント</label>
                    <select required className="w-full border p-2 rounded" value={singleRegInput.eventId} onChange={e => setSingleRegInput({...singleRegInput, eventId: e.target.value})}>
                       <option value="">選択してください</option>
                       {events.map(e => (
                          <option key={e.id} value={e.id}>{format(parseISO(e.date), 'MM/dd')} {e.title}</option>
                       ))}
                    </select>
                 </div>
                 <div><label className="block text-sm font-medium text-slate-700">お名前</label><input required type="text" className="w-full border p-2 rounded" value={singleRegInput.name} onChange={e => setSingleRegInput({...singleRegInput, name: e.target.value})} /></div>
                 <div><label className="block text-sm font-medium text-slate-700">Email</label><input type="email" className="w-full border p-2 rounded" value={singleRegInput.email} onChange={e => setSingleRegInput({...singleRegInput, email: e.target.value})} /></div>
                 <div><label className="block text-sm font-medium text-slate-700">電話番号</label><input type="text" className="w-full border p-2 rounded" value={singleRegInput.phone} onChange={e => setSingleRegInput({...singleRegInput, phone: e.target.value})} /></div>
                 <div><label className="block text-sm font-medium text-slate-700">登録日 (記録用)</label><input type="date" className="w-full border p-2 rounded" value={singleRegInput.date} onChange={e => setSingleRegInput({...singleRegInput, date: e.target.value})} /></div>
                 
                 <div className="flex justify-end gap-2 mt-4">
                    <button type="button" onClick={() => setShowRegImportModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">キャンセル</button>
                    <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">追加</button>
                 </div>
               </form>
            ) : (
               <div className="space-y-4">
                  <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded">
                    <p className="font-bold mb-1">フォーマット (カンマ区切り):</p>
                    <p>イベントID, 名前, Email, 電話番号, 登録日(yyyy-mm-dd)</p>
                    <p className="text-xs mt-1 text-slate-400">※イベントIDは「イベント管理」タブでコピーできます。</p>
                  </div>
                  <textarea className="w-full border p-2 rounded h-40 font-mono text-sm" placeholder="Paste CSV here..." value={csvText} onChange={e => setCsvText(e.target.value)} />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowRegImportModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">キャンセル</button>
                    <button type="button" onClick={handleCsvRegImport} className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">インポート</button>
                  </div>
               </div>
            )}
          </div>
        </div>
      )}

      {/* Feedback Import Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">過去の感想を追加</h3>
            
            <div className="flex gap-2 mb-4 border-b border-slate-100 pb-2">
               <button 
                  onClick={() => setImportMode('single')}
                  className={`flex items-center gap-1 text-sm font-medium px-3 py-2 rounded transition-colors ${importMode === 'single' ? 'bg-teal-50 text-teal-700' : 'text-slate-500 hover:text-slate-800'}`}
               >
                 <User className="w-4 h-4" /> 1件登録
               </button>
               <button 
                  onClick={() => setImportMode('csv')}
                  className={`flex items-center gap-1 text-sm font-medium px-3 py-2 rounded transition-colors ${importMode === 'csv' ? 'bg-teal-50 text-teal-700' : 'text-slate-500 hover:text-slate-800'}`}
               >
                 <FileText className="w-4 h-4" /> CSV一括登録
               </button>
            </div>

            {importMode === 'single' ? (
              <form onSubmit={handleSingleFeedbackSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">お名前・イニシャル</label>
                  <input required type="text" className="w-full border p-2 rounded" value={singleFeedback.authorName} onChange={e => setSingleFeedback({...singleFeedback, authorName: e.target.value})} />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700">評価 (1-5)</label>
                   <select className="w-full border p-2 rounded" value={singleFeedback.rating} onChange={e => setSingleFeedback({...singleFeedback, rating: parseInt(e.target.value)})}>
                      <option value={5}>5 (とても良い)</option>
                      <option value={4}>4 (良い)</option>
                      <option value={3}>3 (普通)</option>
                      <option value={2}>2 (微妙)</option>
                      <option value={1}>1 (悪い)</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700">投稿日</label>
                   <input required type="date" className="w-full border p-2 rounded" value={singleFeedback.date} onChange={e => setSingleFeedback({...singleFeedback, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">感想コメント</label>
                  <textarea required rows={4} className="w-full border p-2 rounded" value={singleFeedback.comment} onChange={e => setSingleFeedback({...singleFeedback, comment: e.target.value})} />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button type="button" onClick={() => setShowFeedbackModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">キャンセル</button>
                  <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">追加する</button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                 <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded">
                    <p className="font-bold mb-1">フォーマット (カンマ区切り):</p>
                    <p>名前, 評価(数字), 日付(yyyy-mm-dd), 感想本文</p>
                    <p className="mt-2 text-slate-400">例:<br/>山田花子, 5, 2023-10-01, とても良かったです。<br/>匿名希望, 4, 2023-09-15, 楽しかったです。</p>
                 </div>
                 <textarea 
                    className="w-full border p-2 rounded h-40 font-mono text-sm" 
                    placeholder="ここにデータを貼り付けてください..."
                    value={csvText}
                    onChange={e => setCsvText(e.target.value)}
                 />
                 <div className="flex justify-end gap-2 mt-4">
                  <button type="button" onClick={() => setShowFeedbackModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">キャンセル</button>
                  <button type="button" onClick={handleCsvImport} className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">インポート実行</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};