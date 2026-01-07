"use client";

import { useState, useEffect, useMemo } from "react";
import { calculateRemainingCaffeine, DRINK_PRESETS } from "@/utils/caffeine";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isInputMode, setIsInputMode] = useState(false);
  const [isReportMode, setIsReportMode] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [customName, setCustomName] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const CAFFEINE_LIMIT = 400;

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) fetchHistory(user.id);
    };
    fetchUser();
  }, []);

  const fetchHistory = async (userId: string) => {
    const { data } = await supabase
      .from("caffeine_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (data) setHistory(data);
  };

  const handleDrinkClick = async (name: string, amount: number) => {
    if (!user) return alert("로그인이 필요합니다!");
    const { error } = await supabase.from("caffeine_logs").insert([
      { user_id: user.id, drink_name: name, caffeine_amount: amount },
    ]);
    if (!error) {
      fetchHistory(user.id);
      setCustomName("");
      setCustomAmount("");
      setIsInputMode(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (!confirm("이 기록을 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("caffeine_logs").delete().eq("id", logId);
    if (!error) fetchHistory(user!.id);
  };

  const totalRemaining = history.reduce((acc, log) => {
    const hoursSince = (new Date().getTime() - new Date(log.created_at).getTime()) / (1000 * 60 * 60);
    return acc + calculateRemainingCaffeine(log.caffeine_amount, hoursSince);
  }, 0);

  const getClearanceTime = () => {
    if (totalRemaining < 5) return "지금 바로 숙면 가능";
    const hoursToClear = 5.5 * Math.log2(totalRemaining / 5);
    const clearDate = new Date(new Date().getTime() + hoursToClear * 60 * 60 * 1000);
    return clearDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true }) + " 쯤 배출 완료";
  };

  const weeklyStats = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString();
    const total = history
      .filter(log => new Date(log.created_at).toLocaleDateString() === dateStr)
      .reduce((sum, log) => sum + log.caffeine_amount, 0);
    return { label: i === 0 ? "오늘" : `${d.getDate()}일`, amount: total };
  });

  const monthlyTrend = useMemo(() => {
    const year = new Date().getFullYear();
    return [...Array(12)].map((_, i) => {
      const total = history
        .filter(log => {
          const logDate = new Date(log.created_at);
          return logDate.getMonth() === i && logDate.getFullYear() === year;
        })
        .reduce((sum, log) => sum + log.caffeine_amount, 0);
      return { month: i + 1, rawMonth: i, amount: total };
    });
  }, [history]);

  const selectedMonthWeeklyStats = useMemo(() => {
    return [1, 2, 3, 4].map(week => {
      const total = history
        .filter(log => {
          const logDate = new Date(log.created_at);
          const logWeek = Math.ceil(logDate.getDate() / 7);
          return logDate.getMonth() === selectedMonth && (logWeek === week || (week === 4 && logWeek > 4));
        })
        .reduce((sum, log) => sum + log.caffeine_amount, 0);
      return { label: `${week}주`, amount: total };
    });
  }, [history, selectedMonth]);

  const drinkCounts = history.reduce((acc: any, log) => {
    acc[log.drink_name] = (acc[log.drink_name] || 0) + 1;
    return acc;
  }, {});
  const topDrinks = Object.entries(drinkCounts).sort((a: any, b: any) => b[1] - a[1]).slice(0, 3);

  return (
    <main className="flex justify-center min-h-screen bg-slate-100 sm:p-4">
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="w-full max-w-md bg-white h-screen sm:h-[850px] sm:rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col font-sans text-slate-900">

        <div className="flex justify-between items-center p-6 pb-2">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            {isReportMode ? "Activity Report" : "Caffeine Zero"}
          </span>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsReportMode(!isReportMode)} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
              {isReportMode ? "닫기" : "통계 리포트"}
            </button>
            {user && (
              <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} className="text-[10px] font-bold bg-red-50 text-red-500 px-3 py-1.5 rounded-full border border-red-100">로그아웃</button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-24 hide-scrollbar">
          {!isReportMode ? (
            <div className="space-y-6 pt-4 animate-in fade-in duration-300">
              <section className={`p-8 rounded-[2.5rem] text-center text-white shadow-lg transition-all duration-500 ${totalRemaining >= CAFFEINE_LIMIT ? 'bg-red-500' : 'bg-slate-900'}`}>
                <h1 className="text-xl font-black mb-2 tracking-tighter">카페인 제로</h1>
                <div className="text-6xl font-black mb-1 font-mono tracking-tighter">
                  {Math.round(totalRemaining)}<span className="text-xl ml-1 opacity-50">mg</span>
                </div>
                <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-4">현재 몸속 카페인 잔량</p>
                <div className="inline-block px-4 py-2 bg-white/10 rounded-full backdrop-blur-md border border-white/10">
                  <span className="text-xs font-bold text-white/90">✨ {getClearanceTime()}</span>
                </div>
              </section>

              <section className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <h3 className="text-xs font-black text-slate-500 mb-6 uppercase tracking-wider ml-1">주간 섭취 통계</h3>
                <div className="flex justify-between items-end h-20 px-1">
                  {weeklyStats.reverse().map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1">
                      <div className="relative w-2.5 bg-white rounded-full h-12 overflow-hidden border border-slate-100">
                        <div className={`absolute bottom-0 w-full rounded-full transition-all duration-700 ${day.amount > 400 ? 'bg-red-400' : 'bg-indigo-400'}`} style={{ height: `${Math.min((day.amount / 600) * 100, 100)}%` }}></div>
                      </div>
                      <span className={`text-[9px] font-bold ${day.label === "오늘" ? 'text-indigo-600 font-black' : 'text-slate-300'}`}>{day.label}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="flex flex-col">
                <h3 className="text-xs font-black text-slate-500 mb-4 uppercase tracking-wider ml-1">오늘의 기록</h3>
                <div className="space-y-3 h-[320px] overflow-y-auto pr-1 hide-scrollbar">
                  {history.map((log) => (
                    <div key={log.id} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm transition-transform active:scale-[0.98]">
                      <div>
                        <div className="font-bold text-sm text-slate-700">{log.drink_name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-400 font-bold">
                            {new Date(log.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {/* 🛠 [함량 표시 추가] */}
                          <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                            {log.caffeine_amount}mg
                          </span>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteLog(log.id)} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-200 hover:text-red-500 transition-colors">✕</button>
                    </div>
                  ))}
                  {history.length === 0 && (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-center text-slate-300 text-xs font-bold tracking-widest uppercase">데이터 없음</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          ) : (
            <div className="space-y-8 pt-6 animate-in slide-in-from-right duration-300">
              <section>
                <h3 className="text-sm font-black text-slate-800 mb-4 ml-1">Monthly Trend (1월 - 12월)</h3>
                <div className="bg-slate-900 p-6 rounded-[2.5rem] h-48 flex items-end justify-between gap-[4px] shadow-xl border border-slate-800 relative">
                  {monthlyTrend.map((item, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedMonth(item.rawMonth)}
                      className={`flex-1 rounded-t-sm transition-all cursor-pointer relative group/bar
                        ${selectedMonth === item.rawMonth ? 'bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.5)]' : 'bg-indigo-500/30 hover:bg-indigo-400/80'}
                      `}
                      style={{ height: `${Math.max((item.amount / 3000) * 100, 8)}%` }}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/bar:block z-50 animate-in fade-in zoom-in duration-200">
                        <div className="bg-white text-slate-900 text-[10px] font-black px-2 py-1 rounded-lg shadow-xl whitespace-nowrap">{item.month}월</div>
                        <div className="w-1.5 h-1.5 bg-white rotate-45 mx-auto -mt-1"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
                <h3 className="text-sm font-black text-slate-800 mb-8">{selectedMonth + 1}월 주간 상세 분석</h3>
                <div className="flex items-end justify-between h-32 px-2 relative">
                  {selectedMonthWeeklyStats.map((week, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 flex-1 relative group">
                      <div className="w-full flex justify-center items-end h-28 relative">
                        <div className="absolute bottom-0 w-[1px] h-full bg-slate-50"></div>
                        <div
                          className="w-4 bg-indigo-600 rounded-full transition-all duration-1000 relative z-10 flex items-start justify-center"
                          style={{ height: `${Math.min((week.amount / 1500) * 100, 100)}%` }}
                        >
                          <div className="absolute -top-7 text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{week.amount}</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-black text-slate-400 mt-2">{week.label}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-indigo-600 p-7 rounded-[2.5rem] text-white shadow-xl">
                <h3 className="text-sm font-black mb-5 flex items-center gap-2">🏆 My Caffeine Top 3</h3>
                <div className="space-y-3">
                  {topDrinks.map(([name, count]: any, i) => (
                    <div key={name} className="flex justify-between items-center bg-white/10 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-black opacity-30">{i + 1}</span>
                        <span className="text-sm font-bold tracking-tight">{name}</span>
                      </div>
                      <span className="text-xs font-black bg-white/20 px-3 py-1 rounded-lg">{count}회</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>

        {!isReportMode && (
          <button onClick={() => setIsInputMode(true)} className="absolute bottom-8 right-8 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-[0_10px_30px_rgba(79,70,229,0.4)] flex items-center justify-center text-3xl hover:bg-indigo-700 active:scale-90 transition-all z-40">＋</button>
        )}

        {isInputMode && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex flex-col justify-end">
            <div className="bg-white rounded-t-[3rem] p-8 pb-10 space-y-6 shadow-[0_-20px_40px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-800 tracking-tight">음료 기록하기</h2>
                <button onClick={() => setIsInputMode(false)} className="text-slate-300 hover:text-slate-600 text-2xl p-2">✕</button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {DRINK_PRESETS.map((drink) => (
                  <button key={drink.name} onClick={() => handleDrinkClick(drink.name, drink.caffeine)} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center hover:border-indigo-400 active:scale-95 transition-all">
                    <div className="text-[10px] font-bold text-slate-500 mb-1">{drink.name}</div>
                    <div className="text-xs font-black text-slate-800">{drink.caffeine}mg</div>
                  </button>
                ))}
              </div>
              <div className="space-y-3 pt-2">
                <input type="text" placeholder="음료 이름 직접 입력" value={customName} onChange={(e) => setCustomName(e.target.value)} className="w-full border-2 border-slate-100 bg-slate-50 rounded-2xl px-5 py-4 outline-none focus:bg-white focus:border-indigo-200 transition-all text-sm font-bold text-slate-800 placeholder:text-slate-500" />
                <input type="number" placeholder="카페인 함량 (mg)" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} className="w-full border-2 border-slate-100 bg-slate-50 rounded-2xl px-5 py-4 outline-none focus:bg-white focus:border-indigo-200 transition-all text-sm font-bold text-slate-800 placeholder:text-slate-500" />
                <button onClick={() => handleDrinkClick(customName, Number(customAmount))} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-lg hover:bg-indigo-700 active:scale-[0.98] transition-all">기록 저장하기</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}