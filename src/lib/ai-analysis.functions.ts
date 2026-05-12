import { createServerFn } from "@tanstack/react-start";

export type AnalysisInput = {
  lang: "ru" | "en";
  workType: string;
  urgency: string;
  format: string;
  hours: { min: number; max: number };
  rate: { min: number; max: number };
  cost: { min: number; max: number; sym: string };
  multiplier: number;
  riskBuffer: number;
  overhead: number;
  industryExp: string;
  clientType: string;
  pricingModel: string;
  flags: string[];
};

export const analyzeEstimate = createServerFn({ method: "POST" })
  .inputValidator((d: AnalysisInput) => d)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const isRu = data.lang === "ru";
    const system = isRu
      ? "Ты — старший консультант по бизнес-анализу и ценообразованию. Анализируй смету: укажи сильные стороны, риски и 2-3 конкретные рекомендации. Пиши лаконично, профессионально, в 3 коротких абзацах. Без markdown-заголовков, без списков со звёздочками."
      : "You are a senior business analysis and pricing consultant. Analyze the estimate: highlight strengths, risks, and 2-3 concrete recommendations. Be concise and professional, in 3 short paragraphs. No markdown headers, no asterisk lists.";

    const user = isRu
      ? `Тип работы: ${data.workType}
Модель ценообразования: ${data.pricingModel}
Срочность: ${data.urgency} | Формат: ${data.format}
Трудоёмкость: ${data.hours.min}–${data.hours.max} ч
Ставка: ${data.rate.min}–${data.rate.max} €/ч
Итог: ${data.cost.min.toLocaleString()}–${data.cost.max.toLocaleString()} ${data.cost.sym}
Коэффициент: ×${data.multiplier.toFixed(2)}
Риск-буфер: +${data.riskBuffer}% | Накладные: +${data.overhead}%
Клиент: ${data.clientType} | Отрасль: ${data.industryExp}
Сигналы риска: ${data.flags.length ? data.flags.join("; ") : "не выявлены"}`
      : `Work type: ${data.workType}
Pricing model: ${data.pricingModel}
Urgency: ${data.urgency} | Format: ${data.format}
Effort: ${data.hours.min}–${data.hours.max} h
Rate: ${data.rate.min}–${data.rate.max} €/h
Total: ${data.cost.min.toLocaleString()}–${data.cost.max.toLocaleString()} ${data.cost.sym}
Multiplier: ×${data.multiplier.toFixed(2)}
Risk buffer: +${data.riskBuffer}% | Overhead: +${data.overhead}%
Client: ${data.clientType} | Industry: ${data.industryExp}
Risk signals: ${data.flags.length ? data.flags.join("; ") : "none detected"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (response.status === 429) {
      return { text: isRu ? "Превышен лимит запросов. Попробуйте через минуту." : "Rate limit exceeded. Try again in a minute.", error: true };
    }
    if (response.status === 402) {
      return { text: isRu ? "Закончились кредиты Lovable AI. Пополните в Settings → Workspace → Usage." : "Lovable AI credits exhausted. Top up in Settings → Workspace → Usage.", error: true };
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return { text: isRu ? "Ошибка AI-сервиса. Используется локальный анализ." : "AI service error. Falling back to local analysis.", error: true };
    }

    const json = await response.json();
    const text: string = json?.choices?.[0]?.message?.content ?? "";
    return { text, error: false };
  });
