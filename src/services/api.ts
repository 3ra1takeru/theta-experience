import { Event, Registration, Feedback, EventType, InstructorProfile, delay } from '../types';

// Initial Mock Data
const INITIAL_EVENTS: Event[] = [
  {
    id: 'evt-1',
    title: 'シータヒーリング基礎体験会',
    description: '潜在意識にアクセスし、本来の自分を取り戻す基礎テクニックを体験します。初心者の方大歓迎です。',
    date: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days later
    startTime: '10:00',
    endTime: '12:00',
    type: EventType.ZOOM,
    capacity: 5,
    price: 3000,
    status: 'upcoming'
  },
  {
    id: 'evt-2',
    title: '【対面】グループヒーリングセッション',
    description: '東京サロンにて行う対面セッションです。直接的なエネルギーワークを体験したい方へ。',
    date: new Date(Date.now() + 86400000 * 10).toISOString(),
    startTime: '14:00',
    endTime: '16:00',
    type: EventType.IN_PERSON,
    location: '東京都渋谷区...',
    capacity: 5,
    price: 5000,
    status: 'upcoming'
  },
  {
    id: 'evt-3',
    title: '【満員】シータヒーリング基礎体験会',
    description: '終了したイベントのサンプルです。',
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    startTime: '19:00',
    endTime: '21:00',
    type: EventType.ZOOM,
    capacity: 5,
    price: 3000,
    status: 'completed'
  },
  {
    id: 'evt-4',
    title: '【満員】特別グループセッション',
    description: '終了したイベントです。',
    date: new Date(Date.now() - 86400000 * 12).toISOString(),
    startTime: '13:00',
    endTime: '15:00',
    type: EventType.IN_PERSON,
    location: '東京都渋谷区',
    capacity: 5,
    price: 5000,
    status: 'completed'
  },
  {
    id: 'evt-5',
    title: '【満員】平日夜のオンライン体験会',
    description: '終了したイベントです。',
    date: new Date(Date.now() - 86400000 * 20).toISOString(),
    startTime: '20:00',
    endTime: '22:00',
    type: EventType.ZOOM,
    capacity: 3,
    price: 3000,
    status: 'completed'
  }
];

const INITIAL_REGS: Registration[] = [
  {
    id: 'reg-1',
    eventId: 'evt-3',
    applicantName: '山田 花子',
    email: 'hanako@example.com',
    phone: '090-1111-2222',
    registeredAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    status: 'confirmed',
    surveySent: true
  }
];

const INITIAL_FEEDBACK: Feedback[] = [
  {
    id: 'fb-1',
    eventId: 'evt-3',
    authorName: 'Y.H 様',
    rating: 5,
    comment: '初めての体験でしたが、とても心が軽くなりました。Zoomでもエネルギーを感じることができて驚きです。',
    isApproved: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'fb-2',
    eventId: 'evt-3',
    authorName: '匿名',
    rating: 4,
    comment: '講師の方の説明がわかりやすかったです。もう少し時間が長いと嬉しかったです。',
    isApproved: false, // Pending approval
    createdAt: new Date().toISOString()
  }
];

const INITIAL_INSTRUCTOR: InstructorProfile = {
  name: '未来少年タケル',
  title: 'ThetaHealing® Certified Instructor',
  introduction: `はじめまして、未来少年タケルです。
「未来は今、この瞬間から創られる」をテーマに、シータヒーリングを通じて多くの方の人生の変容をサポートしています。

私自身、シータヒーリングに出会い、現実が驚くべきスピードで好転していく体験をしました。
その感動とテクニックを、分かりやすく、かつ楽しくお伝えすることが私の使命です。

堅苦しい雰囲気ではなく、リラックスして本来の自分を出せる場作りを大切にしています。
体験会であなたにお会いできるのを楽しみにしています！`,
  imageUrl: '' // Empty by default
};

// LocalStorage Keys
const KEY_EVENTS = 'theta_events';
const KEY_REGS = 'theta_regs';
const KEY_FEEDBACK = 'theta_feedback';
const KEY_INSTRUCTOR = 'theta_instructor';

// Helper to load data
const loadData = <T>(key: string, initial: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : initial;
};

// Helper to save data
const saveData = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const api = {
  // --- Events ---
  getEvents: async (): Promise<Event[]> => {
    await delay(500);
    return loadData<Event[]>(KEY_EVENTS, INITIAL_EVENTS);
  },

  createEvent: async (event: Omit<Event, 'id'>): Promise<Event> => {
    await delay(500);
    const events = loadData<Event[]>(KEY_EVENTS, INITIAL_EVENTS);
    const newEvent = { ...event, id: `evt-${Date.now()}` };
    saveData(KEY_EVENTS, [...events, newEvent]);

    // Google Calendar Sync via GAS
    const gasUrl = localStorage.getItem('theta_gas_url');
    if (gasUrl) {
      try {
        // Send a "no-cors" request (we won't get a response body, but it triggers the script)
        // or a standard POST if GAS is configured to handle CORS (requires complexity).
        // For simplicity in this demo environment, we use no-cors to fire-and-forget.
        // NOTE: 'no-cors' mode only creates the request if the server allows it (opaque). 
        // GAS Web Apps usually handle simple POST requests well if we send text/plain.

        // We structure the payload to match what GAS expects
        const payload = {
          title: newEvent.title,
          startTime: `${newEvent.date.split('T')[0]}T${newEvent.startTime}:00`,
          endTime: `${newEvent.date.split('T')[0]}T${newEvent.endTime}:00`,
          description: `${newEvent.description}\n\n【お申し込みはこちら】\nhttps://os3-318-48990.vs.sakura.ne.jp/theta-experience/#/schedule`,
          location: newEvent.type === '対面' ? newEvent.location : 'Zoom'
        };

        // We use fetch with 'no-cors' so the browser doesn't block it, 
        // but we need to send data stringified.
        // However, GAS `doPost` handles JSON payload best if header is application/json, 
        // which triggers CORS. 
        // Workaround: Send as text/plain (simple request) and parse in GAS.
        // Use standard fetch with CORS. GAS works best with redirects (302) which fetch follows automatically.
        // But for CORS preflight to work, we need a robust GAS script or use 'no-cors' if script is simple.
        // We are updating GAS to handle JSON response properly.
        fetch(gasUrl, {
          method: 'POST',
          mode: 'cors', // Standard CORS request
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
            // Note: GAS doPost triggers 'Simple Request' CORS logic easily with text/plain.
            // Sending application/json triggers preflight (OPTIONS) which GAS doesn't consistently support 
            // without workarounds. We stick to text/plain but send JSON string body.
            // The updated Code.js parses this correctly.
          },
          body: JSON.stringify(payload)
        })
          .then(res => res.json())
          .then(data => {
            console.log("GAS Response:", data);
            if (data.error) {
              console.error("GAS Error:", data.error);
              alert(`カレンダー連携エラー: ${data.error}`);
            }
          })
          .catch(e => {
            console.error("GAS Sync Error:", e);
            // alert("カレンダー連携に失敗しました (ネットワークエラーなど)");
          });

      } catch (err) {
        console.error("Failed to sync with Google Calendar", err);
      }
    }

    return newEvent;
  },

  importEvents: async (events: Omit<Event, 'id'>[]): Promise<void> => {
    await delay(1000);
    const currentEvents = loadData<Event[]>(KEY_EVENTS, INITIAL_EVENTS);
    const newEvents = events.map((e, index) => ({
      ...e,
      id: `evt-imp-${Date.now()}-${index}`
    }));
    saveData(KEY_EVENTS, [...currentEvents, ...newEvents]);
  },

  updateEventStatus: async (id: string, status: Event['status']): Promise<void> => {
    await delay(300);
    const events = loadData<Event[]>(KEY_EVENTS, INITIAL_EVENTS);
    const updated = events.map(e => e.id === id ? { ...e, status } : e);
    saveData(KEY_EVENTS, updated);
  },

  deleteEvent: async (id: string): Promise<void> => {
    await delay(300);
    const events = loadData<Event[]>(KEY_EVENTS, INITIAL_EVENTS);
    const updated = events.filter(e => e.id !== id);
    saveData(KEY_EVENTS, updated);
  },

  // --- Registrations (Simulating Google Sheets Rows) ---
  getRegistrations: async (): Promise<Registration[]> => {
    await delay(600);
    return loadData<Registration[]>(KEY_REGS, INITIAL_REGS);
  },

  createRegistration: async (reg: Omit<Registration, 'id' | 'registeredAt' | 'surveySent' | 'status'>): Promise<Registration> => {
    await delay(800); // Simulate API call
    const regs = loadData<Registration[]>(KEY_REGS, INITIAL_REGS);
    const newReg: Registration = {
      ...reg,
      id: `reg-${Date.now()}`,
      registeredAt: new Date().toISOString(),
      status: 'confirmed',
      surveySent: false,
      // Ensure optional fields are preserved if passed
      prefecture: reg.prefecture,
      dob: reg.dob,
      paymentMethod: reg.paymentMethod
    };
    saveData(KEY_REGS, [...regs, newReg]);
    return newReg;
  },

  importRegistrations: async (regs: Omit<Registration, 'id' | 'surveySent'>[]): Promise<void> => {
    await delay(1000);
    const currentRegs = loadData<Registration[]>(KEY_REGS, INITIAL_REGS);
    const newRegs = regs.map((r, index) => ({
      ...r,
      id: `reg-imp-${Date.now()}-${index}`,
      surveySent: (r as any).surveySent || false,
      status: (r as any).status || 'confirmed'
    }));
    saveData(KEY_REGS, [...currentRegs, ...newRegs]);
  },

  // --- Emails ---
  sendSurveyEmail: async (eventId: string): Promise<number> => {
    await delay(1500); // Simulate email sending time
    const regs = loadData<Registration[]>(KEY_REGS, INITIAL_REGS);
    let sentCount = 0;
    const updatedRegs = regs.map(r => {
      if (r.eventId === eventId && r.status === 'confirmed' && !r.surveySent) {
        sentCount++;
        return { ...r, surveySent: true };
      }
      return r;
    });
    saveData(KEY_REGS, updatedRegs);
    return sentCount;
  },

  // --- Feedback ---
  getFeedback: async (onlyApproved = false): Promise<Feedback[]> => {
    await delay(400);
    const all = loadData<Feedback[]>(KEY_FEEDBACK, INITIAL_FEEDBACK);
    return onlyApproved ? all.filter(f => f.isApproved) : all;
  },

  submitFeedback: async (feedback: Omit<Feedback, 'id' | 'isApproved' | 'createdAt'>): Promise<Feedback> => {
    await delay(600);
    const all = loadData<Feedback[]>(KEY_FEEDBACK, INITIAL_FEEDBACK);
    const newFeedback: Feedback = {
      ...feedback,
      id: `fb-${Date.now()}`,
      isApproved: false, // Requires admin approval
      createdAt: new Date().toISOString()
    };
    saveData(KEY_FEEDBACK, [...all, newFeedback]);
    return newFeedback;
  },

  importFeedback: async (feedbacks: Omit<Feedback, 'id' | 'isApproved' | 'createdAt'>[]): Promise<void> => {
    await delay(1000);
    const all = loadData<Feedback[]>(KEY_FEEDBACK, INITIAL_FEEDBACK);
    const newItems = feedbacks.map((fb, index) => ({
      ...fb,
      id: `fb-imp-${Date.now()}-${index}`,
      isApproved: true, // Auto-approve admin imports
      // Use provided date or fallback to now if missing (though interface implies it might be separate in UI logic)
      createdAt: (fb as any).date ? new Date((fb as any).date).toISOString() : new Date().toISOString()
    }));
    saveData(KEY_FEEDBACK, [...all, ...newItems]);
  },

  approveFeedback: async (id: string): Promise<void> => {
    await delay(300);
    const all = loadData<Feedback[]>(KEY_FEEDBACK, INITIAL_FEEDBACK);
    const updated = all.map(f => f.id === id ? { ...f, isApproved: true } : f);
    saveData(KEY_FEEDBACK, updated);
  },

  unapproveFeedback: async (id: string): Promise<void> => {
    await delay(300);
    const all = loadData<Feedback[]>(KEY_FEEDBACK, INITIAL_FEEDBACK);
    const updated = all.map(f => f.id === id ? { ...f, isApproved: false } : f);
    saveData(KEY_FEEDBACK, updated);
  },

  deleteFeedback: async (id: string): Promise<void> => {
    await delay(300);
    const all = loadData<Feedback[]>(KEY_FEEDBACK, INITIAL_FEEDBACK);
    const updated = all.filter(f => f.id !== id);
    saveData(KEY_FEEDBACK, updated);
  },

  // --- Instructor Profile ---
  getInstructorProfile: async (): Promise<InstructorProfile> => {
    await delay(300);
    return loadData<InstructorProfile>(KEY_INSTRUCTOR, INITIAL_INSTRUCTOR);
  },

  updateInstructorProfile: async (profile: InstructorProfile): Promise<InstructorProfile> => {
    await delay(500);
    saveData(KEY_INSTRUCTOR, profile);
    return profile;
  },

  // --- Google Calendar (GAS) ---
  getGasUrl: async (): Promise<string> => {
    await delay(200);
    return localStorage.getItem('theta_gas_url') || '';
  },

  saveGasUrl: async (url: string): Promise<void> => {
    await delay(200);
    localStorage.setItem('theta_gas_url', url);
  }
};