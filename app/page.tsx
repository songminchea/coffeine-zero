"use client";

import { useState, useEffect } from "react";
import { calculateRemainingCaffeine, DRINK_PRESETS } from "@/utils/caffeine";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  // 1. 페이지 접속 시 유저 정보 및 기록 불러오기
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) fetchHistory(user.id);
    };
    fetchUser();
  }, []);

  // 2. DB에서 마신 기록 가져오기
  const fetchHistory = async (userId: string) => {
    const { data, error } = await supabase
      .from("caffeine_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data) setHistory(data);
    if (error) console.error("데이터 불러오기 실패:", error.message);
  };

  // 3. 음료 클릭 시 DB에 저장
  const handleDrinkClick = async (drink: typeof DRINK_PRESETS[0]) => {
    if (!user) {
      alert("로그인이 필요합니다!");
      return;
    }

    const { error } = await supabase.from("caffeine_logs").insert([
      {
        user_id: user.id,
        drink_name: drink.name,
        caffeine_amount: drink.caffeine,
      },
    ]);

    if (error) {
      alert("저장 실패: " + error.message);
    } else {
      fetchHistory(user.id); // 저장 후 목록 새로고침
    }
  };

  // 4. 기록 삭제 기능 (이 부분이 핵심!)
  const handleDeleteLog = async (logId: string) => {
    if (!confirm("이 기록을 삭제하시겠습니까?")) return;

    const { error } = await supabase
      .from("caffeine_logs")
      .delete()
      .eq("id", logId);

    if (error) {
      alert("DB 삭제 실패: " + error.message);
      console.error("삭제 에러 상세:", error);
    } else {
      alert("성공적으로 삭제되었습니다.");
      fetchHistory(user.id); // 삭제 후 목록 다시 불러오기
    }
  };

  // 5. 몸에 남은 총 카페인 계산
  const totalRemaining = history.reduce((acc, log) => {
    const hoursSince = (new Date().getTime() - new Date(log.created_at).getTime()) / (1000 * 60 * 60);
    return acc + calculateRemainingCaffeine(log.caffeine_amount, hoursSince);
  }, 0);

  return (
    <main className="flex flex-col items-center min-h-screen p-4 bg-slate-50 text-slate-900">
      {/* 상단 유저 정보 */}
      <div className="w-full max-w-md flex justify-end mb-4">
        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">{user.email}</span>
            <button
              onClick={() => supabase.auth.signOut().then(() => window.location.reload())}
              className="text-xs bg-white border border-slate-200 px-3 py-1 rounded-full hover:bg-slate-50"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <button
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'github' })}
            className="text-sm font-bold bg-black text-white px-4 py-2 rounded-full hover:bg-slate-800"
          >
            GitHub으로 시작하기
          </button>
        )}
      </div>

      <div className="max-w-md w-full p-8 bg-white rounded-[2.5rem] shadow-xl border border-slate-100">
        <h1 className="text-2xl font-black text-center mb-6 tracking-tight">☕ CAFFEINE ZERO</h1>

        {/* 카페인 수치 카드 */}
        <div className="bg-slate-900 rounded-3xl p-6 text-center text-white mb-8 shadow-inner">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">현재 몸속 카페인</span>
          <div className="text-5xl font-black my-2 font-mono">
            {Math.round(totalRemaining)} <span className="text-lg">mg</span>
          </div>
        </div>

        {/* 음료 선택 버튼 */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {DRINK_PRESETS.map((drink) => (
            <button
              key={drink.name}
              onClick={() => handleDrinkClick(drink)}
              className="p-4 rounded-2xl border-2 border-slate-100 hover:border-black hover:bg-slate-50 transition-all text-left"
            >
              <div className="text-xs font-bold text-slate-400">{drink.name}</div>
              <div className="text-lg font-black">{drink.caffeine}mg</div>
            </button>
          ))}
        </div>

        {/* 섭취 기록 리스트 */}
        <div className="border-t border-slate-100 pt-6">
          <h3 className="font-bold text-slate-800 mb-4 ml-1">오늘의 기록</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {history.map((log) => (
              <div key={log.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-700">{log.drink_name}</span>
                  <span className="text-slate-400 text-[10px]">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteLog(log.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-300 hover:text-red-500 hover:border-red-200 transition-all"
                >
                  ✕
                </button>
              </div>
            ))}
            {history.length === 0 && (
              <p className="text-center text-slate-300 py-8 text-sm italic">아직 기록이 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}