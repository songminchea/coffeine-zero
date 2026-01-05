// src/utils/caffeine.ts

/**
 * 카페인 반감기 계산 로직
 * @param initialAmount 초기 섭취량 (mg)
 * @param hoursAfter 섭취 후 경과 시간 (시간)
 * @param halfLife 반감기 (기본값 5시간)
 */
export const calculateRemainingCaffeine = (
    initialAmount: number,
    hoursAfter: number,
    halfLife: number = 5
): number => {
    // 공식: C = C0 * (0.5)^(t/h)
    const remaining = initialAmount * Math.pow(0.5, hoursAfter / halfLife);
    return parseFloat(remaining.toFixed(2)); // 소수점 2자리까지 반환
};

/**
 * 수면 가능한 수준(보통 50mg 미만)까지 남은 시간 계산
 */
export const getTimeUntilSleepReady = (
    currentAmount: number,
    targetAmount: number = 50,
    halfLife: number = 5
): number => {
    if (currentAmount <= targetAmount) return 0;

    // 공식 역산: t = h * log2(C0/C)
    const hours = halfLife * Math.log2(currentAmount / targetAmount);
    return parseFloat(hours.toFixed(1));
};

export interface Drink {
    name: string;
    caffeine: number; // mg 기준
    icon: string;
}

export const DRINK_PRESETS: Drink[] = [
    { name: "아메리카노", caffeine: 150, icon: "☕" },
    { name: "카페라떼", caffeine: 75, icon: "🥛" },
    { name: "에너지드링크", caffeine: 100, icon: "⚡" },
    { name: "콜라", caffeine: 35, icon: "🥤" },
    { name: "녹차", caffeine: 30, icon: "🍃" },
];