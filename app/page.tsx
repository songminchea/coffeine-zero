// src/app/page.tsx
"use client";

import { useState } from "react";
import { calculateRemainingCaffeine, DRINK_PRESETS } from "@/utils/caffeine";

export default function Home() {
  // 상태 관리 (사용자가 입력한 값들을 저장)
  const [selectedCaffeine, setSelectedCaffeine] = useState(150);
  const [hoursAgo, setHoursAgo] = useState(0);

  // 계산 결과
  const remaining = calculateRemainingCaffeine(selectedCaffeine, hoursAgo);

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-slate-50 text-slate-900">
      <div className="max-w-md w-full mt-10 p-6 bg-white rounded-3xl shadow-lg">
        <h1 className="text-2xl font-black text-center mb-8">☕ 카페인 제로</h1>

        {/* 결과창 */}
        <div className="bg-indigo-600 p-8 rounded-2xl text-center text-white mb-8">
          <p className="text-indigo-100 text-sm font-medium">현재 내 몸속 카페인</p>
          <p className="text-6xl font-black mt-2">{remaining} <span className="text-2xl font-normal text-indigo-200">mg</span></p>
        </div>

        {/* 음료 선택 섹션 */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-3">어떤 음료를 마셨나요?</label>
          <div className="grid grid-cols-3 gap-2">
            {DRINK_PRESETS.map((drink) => (
              <button
                key={drink.name}
                onClick={() => setSelectedCaffeine(drink.caffeine)}
                className={`p-3 rounded-xl border-2 transition-all text-sm ${selectedCaffeine === drink.caffeine
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-bold"
                    : "border-gray-100 hover:border-gray-200"
                  }`}
              >
                <div className="text-xl mb-1">{drink.icon}</div>
                {drink.name}
              </button>
            ))}
          </div>
        </div>

        {/* 시간 입력 섹션 */}
        <div className="mb-8">
          <label className="block text-sm font-bold text-gray-700 mb-3">언제 마셨나요? ({hoursAgo}시간 전)</label>
          <input
            type="range"
            min="0"
            max="24"
            value={hoursAgo}
            onChange={(e) => setHoursAgo(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>방금</span>
            <span>12시간 전</span>
            <span>24시간 전</span>
          </div>
        </div>

        <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition">
          기록 완료
        </button>
      </div>
    </div>
  );
}