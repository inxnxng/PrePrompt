import { estimateTokens } from "@/store/usePromptStore";

/** Sum of per-round agent *input* tokens: round i uses C0 + (i-1)*delta. */
export function sumNaiveAgentInputTokens(rounds: number, baseContext: number, deltaPerRound: number): number {
    if (rounds < 1) return 0;
    let sum = 0;
    for (let i = 1; i <= rounds; i++) {
        sum += baseContext + (i - 1) * deltaPerRound;
    }
    return Math.round(sum);
}

/** Rough planned path: first round loads user context + structured prompt + spec digest; second round smaller follow-up. */
export function sumPlannedAgentInputTokens(
    baseContext: number,
    structuredPromptTokens: number,
    specDigestTokens: number,
    secondRoundContext: number
): number {
    const first = baseContext + structuredPromptTokens + specDigestTokens;
    return Math.round(first + secondRoundContext);
}

export function specDigestTokensFromStrings(parts: string[]): number {
    return estimateTokens(parts.join("\n"));
}
