"use client";

import { useState, useEffect } from "react";
import { calculateRemainingCaffeine, DRINK_PRESETS } from "@/utils/caffeine";
import { supabase } from "@/lib/supabase";

export default function Home() {
  // --- 로그인 상태 관리 ---
  const [user, setUser] = useState<any>(null);

  // --- 카페인 계산기 상태 관리 ---
  const [selectedCaffeine, setSelectedCaffeine] = useState<number>(100);
  const [hoursAgo, setHoursAgo] = useState<number>(0);
  const [remaining, setRemaining] = useState<number>(100);

  // 1. 페이지 로드 시 로그인 유저 확인
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  // 2. 카페인 수치 실시간 계산
  useEffect(() => {
    const result = calculateRemainingCaffeine(selectedCaffeine, hoursAgo);
    setRemaining(result);
  }, [selectedCaffeine, hoursAgo]);

  // --- 인증 관련 함수 ---
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <main className="flex flex-col items-center min-h-screen p-4 bg-slate-50 text-slate-900">
      
      {/* 상단 로그인 섹션 */}
      <div className="w-full max-w-md flex justify-end mb-4">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600">{user.email?.split('@')[0]}님</span>
            <button 
              onClick={handleLogout} 
              className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm hover:bg-slate-100 transition-colors"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <button 
            onClick={handleLogin} 
            className="text-sm font-bold bg-slate-900 text-white px-4 py-2 rounded-full shadow-md hover:bg-slate-800 transition-transform active:scale-95"
          >
            GitHub으로 시작하기
          </button>
        )}
      </div>

      {/* 메인 카드 UI */}
      <div className="max-w-md w-full p-8 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50">
        <header className="text-center mb-10">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">
            ☕ CAFFEINE ZERO
          </h1>
          <p className="text-slate-400 font-medium">내 몸에 남은 카페인은 얼마일까?</p>
        </header>

        {/* 결과 디스플레이 */}
        <section className="bg-slate-900 rounded-[2rem] p-8 text-center mb-10 text-white shadow-inner">
          <span className="text-slate-400 text-sm font-bold tracking-widest uppercase">Current Status</span>
          <div className="text-6xl font-black my-3 flex items-center justify-center gap-2">
            {remaining} <span className="text-xl text-slate-500 font-bold uppercase">mg</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            {remaining > 50 ? "😲 아직 카페인 수치가 높아요!" : "✅ 숙면을 취하기 좋은 상태입니다."}
          </p>
        </section>

        {/* 입력 섹션 */}
        <div className="space-y-8">
          {/* 음료 선택 프리셋 */}
          <div>
            <label className="block text-sm font-bold text-slate-500 mb-4 ml-1 uppercase tracking-wider">Quick Select</label>
            <div className="grid grid-cols-2 gap-3">
              {DRINK_PRESETS.map((drink) => (
                <button
                  key={drink.name}
                  onClick={() => setSelectedCaffeine(drink.caffeine)}
                  className={`p-4 rounded-2xl text-left transition-all border-2 ${
                    selectedCaffeine === drink.caffeine
                      ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                      : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200"
                  }`}
                >
                  <div className="text-xs font-bold opacity-60 mb-1">{drink.name}</div>
                  <div className="text-lg font-black">{drink.caffeine}mg</div>
                </button>
              ))}
            </div>
          </div>

          {/* 시간 경과 슬라이더 */}
          <div>
            <div className="flex justify-between items-center mb-4 ml-1">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Time Elapsed</label>
              <span className="bg-slate-100 text-slate-900 px-3 py-1 rounded-full text-sm font-black">{hoursAgo}시간 전</span>
            </div>
            <input
              type="range"
              min="0"
              max="24"
              value={hoursAgo}
              onChange={(e) => setHoursAgo(Number(e.target.value))}
              className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
          </div>
        </div>
      </div>

      <footer className="mt-8 text-slate-400 text-xs font-medium">
        © 2024 Coffeine Zero • Built with Next.js & Supabase
      </footer>
    </main>
  );
}