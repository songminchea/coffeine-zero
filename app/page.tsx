// src/app/page.tsx
"use client"; // 버튼 클릭 등 상호작용을 위해 추가

import { calculateRemainingCaffeine } from "@/utils/caffeine";

export default function Home() {
  // 예시 데이터: 아메리카노(150mg)를 3시간 전에 마셨을 때
  const remaining = calculateRemainingCaffeine(150, 3);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-slate-50">
      <div className="max-w-md w-full p-6 bg-white rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-6">☕ 카페인 제로</h1>

        <div className="bg-indigo-50 p-4 rounded-lg text-center">
          <p className="text-sm text-indigo-600 font-semibold">현재 내 몸에 남은 카페인</p>
          <p className="text-5xl font-black text-indigo-700 mt-2">{remaining} <span className="text-2xl">mg</span></p>
        </div>

        <div className="mt-8 space-y-4">
          <p className="text-gray-500 text-sm text-center">
            (테스트 데이터: 아메리카노 150mg 섭취 3시간 후)
          </p>
          <button
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
            onClick={() => alert('입력 기능은 다음 단계에서 만들게요!')}
          >
            카페인 섭취 기록하기
          </button>
        </div>
      </div>
    </div>
  );
}