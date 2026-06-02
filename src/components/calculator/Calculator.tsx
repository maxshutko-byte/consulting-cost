import { useEffect, useMemo, useRef, useState } from "react";
import {
  WORK_TYPES,
  CRITERIA,
  UNIVERSAL,
  URGENCY_DATA,
  FORMAT_DATA,
  PRICING_MODELS,
  RESOURCE_ROLES,
  PROJECT_TEMPLATES,
  I18N,
  WORK_TYPE_DETAILS,
  DETAILS_I18N,
  type Lang,
  type Currency,
  type Criterion,
  type PricingModelId,
  type ProjectTemplate,
} from "@/lib/calculator-data";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useServerFn } from "@tanstack/react-start";
import { analyzeEstimate } from "@/lib/ai-analysis.functions";
import jsPDF from "jspdf";

/* ============ Extra i18n (additive) ============ */
const NEW_I18N = {
  ru: {
    templates: "Готовые шаблоны",
    templatesHelp: "Один клик заполнит все шаги типовыми параметрами",
    teamMix: "Состав команды",
    teamMixHelp: "Включите, чтобы рассчитать смету через роли × ставки × доли часов",
    teamEnable: "Использовать состав команды",
    teamRole: "Роль", teamRate: "€/ч", teamShare: "Доля часов",
    teamBlended: "Смешанная ставка",
    teamSumWarn: "Сумма долей должна быть 100%",
    waterfall: "Состав цены",
    waterfallHelp: "Как базовая цена превращается в итоговую",
    budget: "Бюджет",
    budgetTarget: "Целевой бюджет",
    budgetMatches: "Подходящие сценарии",
    budgetNoMatch: "Под этот бюджет — варианты дороже/дешевле:",
    proposalTo: "Кому", proposalFrom: "От",
    proposalValidUntil: "Предложение действует до",
    proposalPaymentTerms: "Условия оплаты",
    proposalPaymentTermsText: "50% предоплата · 50% по факту приёмки. Безналичный расчёт, оплата в течение 5 рабочих дней.",
    proposalSignature: "Подпись",
    proposalCompany: "Компания",
    proposalContractor: "Исполнитель",
    proposalDocTitle: "Коммерческое предложение",
    proposalLoadingFont: "Загрузка шрифта для PDF…",
  },
  en: {
    templates: "Project templates",
    templatesHelp: "One click fills all steps with typical parameters",
    teamMix: "Team composition",
    teamMixHelp: "Enable to estimate via roles × rates × hour shares",
    teamEnable: "Use team composition",
    teamRole: "Role", teamRate: "€/h", teamShare: "Hours share",
    teamBlended: "Blended rate",
    teamSumWarn: "Shares must sum to 100%",
    waterfall: "Price waterfall",
    waterfallHelp: "How the base cost turns into the final price",
    budget: "Budget",
    budgetTarget: "Target budget",
    budgetMatches: "Matching scenarios",
    budgetNoMatch: "No exact match — closest options above/below:",
    proposalTo: "To", proposalFrom: "From",
    proposalValidUntil: "Proposal valid until",
    proposalPaymentTerms: "Payment terms",
    proposalPaymentTermsText: "50% upfront · 50% upon acceptance. Bank transfer, payable within 5 business days.",
    proposalSignature: "Signature",
    proposalCompany: "Company",
    proposalContractor: "Contractor",
    proposalDocTitle: "Commercial Proposal",
    proposalLoadingFont: "Loading PDF font…",
  },
} as const;


function DetailSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.14em] text-primary-glow font-bold mb-1">
        {title}
      </div>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className="text-xs text-foreground/90 leading-snug flex gap-2">
            <span className="text-primary-glow shrink-0">•</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Animated number ---------- */
function AnimNum({ value }: { value: number }) {
  const [d, setD] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const s = prev.current;
    const e = value;
    const dur = 700;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - t0) / dur, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setD(Math.round(s + (e - s) * ease));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    prev.current = e;
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{d.toLocaleString("ru-RU")}</>;
}

/* ---------- Chip ---------- */
function Chip({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-all border whitespace-nowrap",
        selected
          ? "bg-primary/15 border-primary text-foreground shadow-glow"
          : "bg-surface-hi border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/40",
        className,
      )}
    >
      {children}
    </button>
  );
}

/* ---------- Calculator ---------- */
type HistoryEntry = {
  id: number;
  date: string;
  type: string;
  cMin: number;
  cMax: number;
  sym: string;
  lang: Lang;
};

const TOTAL_STEPS = 7;

export default function Calculator() {
  const [lang, setLang] = useState<Lang>("ru");
  const tr = I18N[lang];

  const [step, setStep] = useState(0);
  const [wtId, setWtId] = useState<string | null>(null);
  const [volumeAns, setVolumeAns] = useState<Record<string, string>>({});
  const [complexAns, setComplexAns] = useState<Record<string, string>>({});
  const [univAns, setUnivAns] = useState<Record<string, string>>({});
  const [urgency, setUrgency] = useState<string | null>(null);
  const [format, setFormat] = useState<string | null>(null);

  const [riskBuf, setRiskBuf] = useState("10");
  const [overhead, setOverhead] = useState("15");
  const [minThreshold, setMinThreshold] = useState(150);
  const [clientNew, setClientNew] = useState("new");
  const [industryExp, setIndustryExp] = useState("known");
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [customRateMin, setCustomRateMin] = useState(40);
  const [customRateMax, setCustomRateMax] = useState(95);
  const [pricingModel, setPricingModel] = useState<PricingModelId>("tm");

  // Team mix (roles × rates × shares)
  const [teamEnabled, setTeamEnabled] = useState(false);
  const [teamRates, setTeamRates] = useState<Record<string, number>>(
    () => Object.fromEntries(RESOURCE_ROLES.map((r) => [r.id, r.rate])),
  );
  const [teamShares, setTeamShares] = useState<Record<string, number>>(
    () => Object.fromEntries(RESOURCE_ROLES.map((r) => [r.id, r.defaultShare])),
  );

  // Budget slider (target, in selected currency)
  const [budgetTarget, setBudgetTarget] = useState(3000);
  // PDF font loading state
  const [pdfBusy, setPdfBusy] = useState(false);


  const [done, setDone] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const [aiText, setAiText] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);
  const runAnalyze = useServerFn(analyzeEstimate);

  // Load history on client only (avoid SSR localStorage)
  useEffect(() => {
    try {
      const h = window.localStorage.getItem("calc_history");
      if (h) setHistory(JSON.parse(h));
    } catch {}
  }, []);

  // Risk flags (computed always; used in result view & AI request)
  const flags = useMemo(() => {
    const f: string[] = [];
    if (urgency === "express") f.push(lang === "ru" ? "высокая срочность увеличивает риск ошибок и требует доступа к ЛПР 24/7" : "express urgency raises error risk and demands 24/7 stakeholder access");
    if (industryExp === "new") f.push(lang === "ru" ? "новая отрасль — заложите время на погружение" : "new industry — budget time for domain immersion");
    if (univAns.task_clarity === "vague") f.push(lang === "ru" ? "размытое ТЗ: рекомендуется отдельная фаза скоупинга" : "vague brief: a dedicated scoping phase is recommended");
    if (univAns.data_clarity === "messy") f.push(lang === "ru" ? "данные хаотичны — добавьте этап подготовки" : "data is chaotic — add a data-prep stage");
    if (parseInt(riskBuf) === 0) f.push(lang === "ru" ? "буфер не заложен — любое отклонение ударит по марже" : "no risk buffer — any deviation will hit your margin");
    return f;
  }, [urgency, industryExp, univAns, riskBuf, lang]);

  const wtCrit = wtId ? CRITERIA[wtId] : null;

  const stepValid = [
    !!wtId,
    !!wtCrit && wtCrit.volume.every((c) => volumeAns[c.id]),
    !!wtCrit && wtCrit.complexity.every((c) => complexAns[c.id]),
    UNIVERSAL.every((c) => univAns[c.id]),
    !!urgency,
    !!format,
    true,
  ][step];

  function setAns(
    setter: React.Dispatch<React.SetStateAction<Record<string, string>>>,
    id: string,
    val: string,
  ) {
    setter((prev) => ({ ...prev, [id]: val }));
  }

  // Blended rate from team mix (when enabled)
  const blendedRate = useMemo(() => {
    const sumShare = RESOURCE_ROLES.reduce((s, r) => s + (teamShares[r.id] || 0), 0) || 1;
    return RESOURCE_ROLES.reduce(
      (acc, r) => acc + ((teamShares[r.id] || 0) / sumShare) * (teamRates[r.id] || 0),
      0,
    );
  }, [teamRates, teamShares]);
  const teamSharesSum = useMemo(
    () => RESOURCE_ROLES.reduce((s, r) => s + (teamShares[r.id] || 0), 0),
    [teamShares],
  );

  const calcCore = useMemo(
    () => (urgMultOverride: number | null = null, opts: { overhead?: number; risk?: number } = {}) => {
      if (!wtId || !wtCrit || !urgency || !format) return null;
      const wt = WORK_TYPES.find((x) => x.id === wtId)!;
      const urgEntry = URGENCY_DATA.find((x) => x.id === urgency)!;
      const fmtEntry = FORMAT_DATA.find((x) => x.id === format)!;
      const uMult = urgMultOverride ?? urgEntry.mult;
      const baseH = (wt.baseHours.S + wt.baseHours.M + wt.baseHours.L + wt.baseHours.XL) / 4;
      let m = 1;
      [...wtCrit.volume, ...wtCrit.complexity, ...UNIVERSAL].forEach((c: Criterion) => {
        const ans = volumeAns[c.id] || complexAns[c.id] || univAns[c.id];
        const opt = c.options.find((o) => o.id === ans);
        if (opt) m *= opt.mult;
      });
      m *= uMult * fmtEntry.mult;
      const clientM = clientNew === "returning" ? 0.9 : 1.0;
      const indM = industryExp === "known" ? 1.0 : industryExp === "partial" ? 1.15 : 1.3;
      m *= clientM * indM;
      const ovPct = (opts.overhead ?? parseInt(overhead)) / 100;
      const riskPct = (opts.risk ?? parseInt(riskBuf)) / 100;
      m *= (1 + ovPct) * (1 + riskPct);
      const pm = PRICING_MODELS.find((p) => p.id === pricingModel)!;
      m *= pm.mult;
      const hours = Math.max(1, Math.round(baseH * m));
      // Rate: team blended (if enabled) overrides custom rate range
      let rMin: number, rMax: number;
      if (teamEnabled && blendedRate > 0) {
        rMin = Math.round(blendedRate * 0.95);
        rMax = Math.round(blendedRate * 1.05);
      } else {
        const rateBase = wt.baseRate * uMult;
        rMin = Math.max(customRateMin, Math.round(rateBase - 5));
        rMax = Math.min(customRateMax, Math.round(rateBase + 5));
      }
      const cur = tr.currencies.find((c) => c.id === currency)!;
      const exch = cur.rate;
      const hMin = Math.max(1, Math.round(hours * 0.85));
      const hMax = Math.round(hours * 1.15);
      let cMin = Math.round(hours * rMin * 0.9 * exch);
      let cMax = Math.round(hours * rMax * 1.1 * exch);
      const minLocal = minThreshold * exch;
      if (cMin < minLocal) {
        cMin = Math.round(minLocal);
        cMax = Math.round(minLocal * 1.2);
      }
      return { wt, urgEntry, fmtEntry, hours, hMin, hMax, rMin, rMax, cMin, cMax, m, sym: cur.sym, pm, baseH };
    },
    [
      wtId, wtCrit, urgency, format, volumeAns, complexAns, univAns,
      clientNew, industryExp, overhead, riskBuf, customRateMin, customRateMax,
      currency, minThreshold, tr, pricingModel, teamEnabled, blendedRate,
    ],
  );


  const R = calcCore();

  const finalize = () => {
    setDone(true);
    if (R) {
      const entry: HistoryEntry = {
        id: Date.now(),
        date: new Date().toLocaleDateString(lang === "ru" ? "ru-RU" : "en-GB"),
        type: lang === "ru" ? R.wt.ru : R.wt.en,
        cMin: R.cMin, cMax: R.cMax, sym: R.sym, lang,
      };
      const next = [entry, ...history].slice(0, 8);
      setHistory(next);
      try { window.localStorage.setItem("calc_history", JSON.stringify(next)); } catch {}
    }
  };

  const next = () => (step < TOTAL_STEPS - 1 ? setStep((s) => s + 1) : finalize());
  const back = () => step > 0 && setStep((s) => s - 1);

  const reset = () => {
    setStep(0); setWtId(null); setVolumeAns({}); setComplexAns({}); setUnivAns({});
    setUrgency(null); setFormat(null); setDone(false); setActiveTab("summary"); setCopied(false);
    setAiText(""); setAiError(false); setAiLoading(false);
    setTeamEnabled(false);
  };

  const applyTemplate = (t: ProjectTemplate) => {
    setWtId(t.wtId);
    setVolumeAns(t.volumeAns);
    setComplexAns(t.complexAns);
    setUnivAns(t.univAns);
    setUrgency(t.urgency);
    setFormat(t.format);
    if (t.pricingModel) setPricingModel(t.pricingModel);
    if (t.riskBuf) setRiskBuf(t.riskBuf);
    if (t.overhead) setOverhead(t.overhead);
    setStep(3); // jump to universal — user can verify and continue
  };


  const clearHistory = () => {
    setHistory([]);
    try { window.localStorage.removeItem("calc_history"); } catch {}
  };

  const copyClientCard = () => {
    if (!R) return;
    const wt = lang === "ru" ? R.wt.ru : R.wt.en;
    const urg = lang === "ru" ? R.urgEntry.ru : R.urgEntry.en;
    const fmt = lang === "ru" ? R.fmtEntry.ru : R.fmtEntry.en;
    const text = lang === "ru"
      ? `КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ\n\nТип работы: ${wt}\nФормат: ${fmt} · Срочность: ${urg}\n\nОценка трудоёмкости: ${R.hMin}–${R.hMax} часов\nСтавка: ${R.rMin}–${R.rMax} €/час\n\nИТОГОВАЯ СТОИМОСТЬ: ${R.cMin.toLocaleString()} – ${R.cMax.toLocaleString()} ${R.sym}\n\nДата: ${new Date().toLocaleDateString("ru-RU")}\n\n⚑ Оценка ориентировочная. Итоговая стоимость фиксируется в договоре.`
      : `COMMERCIAL PROPOSAL\n\nWork type: ${wt}\nFormat: ${fmt} · Urgency: ${urg}\n\nEstimated effort: ${R.hMin}–${R.hMax} hours\nRate: ${R.rMin}–${R.rMax} €/hr\n\nTOTAL COST: ${R.cMin.toLocaleString()} – ${R.cMax.toLocaleString()} ${R.sym}\n\nDate: ${new Date().toLocaleDateString("en-GB")}\n\n⚑ This estimate is indicative. The final price is fixed in the contract.`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  /* ---------- RESULT VIEW ---------- */
  if (done && R) {
    const totalMid = Math.round((R.cMin + R.cMax) / 2);
    const phasesPct = tr.phasesPct;
    const scenarios = [
      { label: tr.scenario1, sc: calcCore(), tone: "primary" },
      { label: tr.scenario2, sc: calcCore(1.0), tone: "warning" },
      { label: tr.scenario3, sc: calcCore(1.0, { overhead: 0, risk: 0 }), tone: "success" },
    ];

    // (flags computed at top-level)

    const buildLocalAnalysis = (): string => {
      const headline = lang === "ru"
        ? `Расчёт выглядит сбалансированным: ${R.hMin}–${R.hMax} ч при ставке ${R.rMin}–${R.rMax} €/час даёт коридор ${R.cMin.toLocaleString()}–${R.cMax.toLocaleString()} ${R.sym}.`
        : `The estimate looks balanced: ${R.hMin}–${R.hMax} h at ${R.rMin}–${R.rMax} €/hr gives a range of ${R.cMin.toLocaleString()}–${R.cMax.toLocaleString()} ${R.sym}.`;
      const risks = flags.length
        ? (lang === "ru" ? "На что обратить внимание: " : "Watch out for: ") + flags.join("; ") + "."
        : (lang === "ru" ? "Существенных рисков не выявлено." : "No material risks detected.");
      const advice = lang === "ru"
        ? "Перед отправкой клиенту уточните состав ЛПР, формат приёмки и ожидания по правкам."
        : "Before sending to the client, confirm decision-makers, acceptance format and revision expectations.";
      return `${headline}\n\n${risks}\n\n${advice}`;
    };

    const fetchAi = async () => {
      setAiLoading(true);
      setAiError(false);
      try {
        const res = await runAnalyze({
          data: {
            lang,
            workType: lang === "ru" ? R.wt.ru : R.wt.en,
            urgency: lang === "ru" ? R.urgEntry.ru : R.urgEntry.en,
            format: lang === "ru" ? R.fmtEntry.ru : R.fmtEntry.en,
            hours: { min: R.hMin, max: R.hMax },
            rate: { min: R.rMin, max: R.rMax },
            cost: { min: R.cMin, max: R.cMax, sym: R.sym },
            multiplier: R.m,
            riskBuffer: parseInt(riskBuf),
            overhead: parseInt(overhead),
            industryExp,
            clientType: clientNew,
            pricingModel: lang === "ru" ? R.pm.ru : R.pm.en,
            flags,
          },
        });
        if (res.error) {
          setAiError(true);
          setAiText(res.text + "\n\n" + buildLocalAnalysis());
        } else {
          setAiText(res.text || buildLocalAnalysis());
        }
      } catch (e) {
        console.error(e);
        setAiError(true);
        setAiText(buildLocalAnalysis());
      } finally {
        setAiLoading(false);
      }
    };

    // Auto-fetch handled by Tabs onValueChange below

    // Cached Cyrillic font (PT Sans) for jsPDF
    const ensureCyrFont = async (doc: jsPDF): Promise<string> => {
      const FONT_NAME = "PTSans";
      const w = window as unknown as { __ptsans_b64?: string };
      try {
        if (!w.__ptsans_b64) {
          const res = await fetch(
            "https://fonts.gstatic.com/s/ptsans/v17/jizaRExUiTo99u79D0KExQ.ttf",
          );
          const buf = await res.arrayBuffer();
          let bin = "";
          const bytes = new Uint8Array(buf);
          for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
          w.__ptsans_b64 = btoa(bin);
        }
        doc.addFileToVFS(`${FONT_NAME}.ttf`, w.__ptsans_b64);
        doc.addFont(`${FONT_NAME}.ttf`, FONT_NAME, "normal");
        doc.addFont(`${FONT_NAME}.ttf`, FONT_NAME, "bold");
        return FONT_NAME;
      } catch (e) {
        console.warn("Failed to load Cyrillic font, falling back to helvetica", e);
        return "helvetica";
      }
    };

    const exportPdf = async () => {
      setPdfBusy(true);
      try {
        const doc = new jsPDF({ unit: "pt", format: "a4" });
        const isRu = lang === "ru";
        const FONT = isRu ? await ensureCyrFont(doc) : "helvetica";
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        const margin = 48;
        let y = margin;
        const NI = NEW_I18N[lang];

        const ensure = (need: number) => {
          if (y + need > pageH - margin) { doc.addPage(); y = margin; }
        };
        const h1 = (t: string) => {
          ensure(28);
          doc.setFont(FONT, "bold"); doc.setFontSize(20); doc.setTextColor(20, 30, 60);
          doc.text(t, margin, y); y += 26;
        };
        const h2 = (t: string) => {
          ensure(22);
          doc.setFont(FONT, "bold"); doc.setFontSize(12); doc.setTextColor(40, 60, 110);
          doc.text(t, margin, y); y += 16;
        };
        const p = (t: string, color: [number, number, number] = [40, 40, 40]) => {
          doc.setFont(FONT, "normal"); doc.setFontSize(10); doc.setTextColor(color[0], color[1], color[2]);
          const lines = doc.splitTextToSize(t, pageW - margin * 2);
          for (const ln of lines) { ensure(14); doc.text(ln, margin, y); y += 14; }
        };
        const kv = (k: string, v: string) => {
          ensure(14);
          doc.setFont(FONT, "normal"); doc.setFontSize(10); doc.setTextColor(110, 110, 120);
          doc.text(k, margin, y);
          doc.setFont(FONT, "bold"); doc.setTextColor(20, 30, 60);
          doc.text(v, pageW - margin, y, { align: "right" });
          y += 14;
        };

        // ===== Branded header band =====
        doc.setFillColor(15, 25, 55); doc.rect(0, 0, pageW, 86, "F");
        doc.setFillColor(80, 130, 240); doc.rect(0, 86, pageW, 3, "F");
        // Mark / logo
        doc.setFillColor(80, 130, 240); doc.circle(margin + 12, 38, 12, "F");
        doc.setFont(FONT, "bold"); doc.setFontSize(14); doc.setTextColor(255, 255, 255);
        doc.text("CONSULT.CO", margin + 32, 42);
        doc.setFont(FONT, "normal"); doc.setFontSize(9); doc.setTextColor(180, 200, 240);
        doc.text(isRu ? "Бизнес-анализ · Консалтинг · Экспертиза" : "Business Analysis · Consulting · Expertise", margin + 32, 56);
        // Right side: doc no + date
        const docNo = `№ EST-${Date.now().toString().slice(-6)}`;
        doc.setFont(FONT, "bold"); doc.setFontSize(10); doc.setTextColor(255, 255, 255);
        doc.text(docNo, pageW - margin, 36, { align: "right" });
        doc.setFont(FONT, "normal"); doc.setFontSize(9); doc.setTextColor(180, 200, 240);
        doc.text(new Date().toLocaleDateString(isRu ? "ru-RU" : "en-GB"), pageW - margin, 52, { align: "right" });
        y = 110;

        // ===== Title =====
        h1(NI.proposalDocTitle);

        // ===== Parties =====
        doc.setFont(FONT, "normal"); doc.setFontSize(9); doc.setTextColor(110, 110, 120);
        const colW = (pageW - margin * 2 - 16) / 2;
        doc.text(`${NI.proposalFrom}:`, margin, y);
        doc.text(`${NI.proposalTo}:`, margin + colW + 16, y);
        doc.setFont(FONT, "bold"); doc.setFontSize(11); doc.setTextColor(20, 30, 60);
        doc.text("CONSULT.CO", margin, y + 14);
        doc.text("__________________________", margin + colW + 16, y + 14);
        doc.setFont(FONT, "normal"); doc.setFontSize(9); doc.setTextColor(110, 110, 120);
        doc.text(isRu ? "ИП / ООО · contact@consult.co" : "Sole prop. / LLC · contact@consult.co", margin, y + 28);
        doc.text(isRu ? "Заполняется заказчиком" : "To be filled by client", margin + colW + 16, y + 28);
        y += 46;

        // ===== Hero price =====
        doc.setFillColor(245, 247, 252); doc.rect(margin, y, pageW - margin*2, 70, "F");
        doc.setDrawColor(80, 130, 240); doc.setLineWidth(2);
        doc.line(margin, y, margin, y + 70);
        doc.setLineWidth(0.2);
        doc.setFont(FONT,"bold"); doc.setFontSize(9); doc.setTextColor(80,90,120);
        doc.text((isRu ? "ИТОГОВАЯ СТОИМОСТЬ" : "TOTAL COST"), margin + 18, y + 22);
        doc.setFontSize(22); doc.setTextColor(30, 60, 200);
        const totalLine = `${R.cMin.toLocaleString()} – ${R.cMax.toLocaleString()} ${R.sym}${pricingModel === "retainer" ? " /" + (isRu ? "мес" : "mo") : ""}`;
        doc.text(totalLine, margin + 18, y + 50);
        y += 86;

        // ===== Parameters =====
        h2(isRu ? "Параметры" : "Parameters");
        kv(isRu ? "Тип работы" : "Work type", isRu ? R.wt.ru : R.wt.en);
        kv(isRu ? "Модель ценообразования" : "Pricing model", isRu ? R.pm.ru : R.pm.en);
        kv(isRu ? "Срочность" : "Urgency", `${isRu ? R.urgEntry.ru : R.urgEntry.en} (×${R.urgEntry.mult})`);
        kv(isRu ? "Формат" : "Format", isRu ? R.fmtEntry.ru : R.fmtEntry.en);
        kv(isRu ? "Трудоёмкость" : "Effort", `${R.hMin}–${R.hMax} ${isRu ? "ч" : "h"}`);
        kv(isRu ? "Ставка" : "Rate", `${R.rMin}–${R.rMax} €/${isRu ? "час" : "hr"}`);
        kv(isRu ? "Коэффициент" : "Multiplier", `×${R.m.toFixed(2)}`);
        kv(isRu ? "Риск-буфер" : "Risk buffer", `+${riskBuf}%`);
        kv(isRu ? "Накладные" : "Overhead", `+${overhead}%`);
        kv(isRu ? "Клиент" : "Client", clientNew === "returning" ? (isRu ? "Постоянный (-10%)" : "Returning (-10%)") : (isRu ? "Новый" : "New"));
        kv(isRu ? "Отрасль" : "Industry", industryExp === "known" ? (isRu ? "Знакомая" : "Known") : industryExp === "partial" ? (isRu ? "Частично" : "Partial") : (isRu ? "Новая (+30%)" : "New (+30%)"));
        y += 8;

        // ===== Team mix (if used) =====
        if (teamEnabled) {
          h2(NEW_I18N[lang].teamMix);
          RESOURCE_ROLES.forEach((role) => {
            if ((teamShares[role.id] || 0) > 0) {
              kv(isRu ? role.ru : role.en, `${teamShares[role.id]}% · ${teamRates[role.id]} €/${isRu ? "ч" : "h"}`);
            }
          });
          kv(NEW_I18N[lang].teamBlended, `${Math.round(blendedRate)} €/${isRu ? "ч" : "h"}`);
          y += 8;
        }

        // ===== Phase breakdown =====
        h2(isRu ? "Разбивка по фазам" : "Phase breakdown");
        tr.phases.forEach((ph, i) => {
          const amt = Math.round(((R.cMin + R.cMax) / 2) * phasesPct[i] / 100);
          const hrs = Math.round(R.hours * phasesPct[i] / 100);
          kv(`${ph}`, `${hrs}${isRu ? "ч" : "h"} · ~${amt.toLocaleString()} ${R.sym} (${phasesPct[i]}%)`);
        });
        y += 8;

        // ===== Scenarios =====
        h2(isRu ? "Сравнение сценариев" : "Scenario comparison");
        scenarios.forEach(({ label, sc }) => {
          if (sc) kv(label, `${sc.cMin.toLocaleString()}–${sc.cMax.toLocaleString()} ${sc.sym}`);
        });
        y += 8;

        // ===== Payment terms =====
        h2(NI.proposalPaymentTerms);
        p(NI.proposalPaymentTermsText);
        y += 4;

        // ===== Validity =====
        const validDate = new Date(Date.now() + 30 * 24 * 3600 * 1000)
          .toLocaleDateString(isRu ? "ru-RU" : "en-GB");
        kv(NI.proposalValidUntil, validDate);
        y += 8;

        // ===== AI analysis =====
        if (aiText) {
          h2(isRu ? "Анализ сметы" : "Estimate analysis");
          p(aiText);
          y += 4;
        }

        // ===== Disclaimer =====
        ensure(40);
        doc.setDrawColor(220,220,230); doc.line(margin, y, pageW - margin, y); y += 12;
        doc.setFont(FONT,"normal"); doc.setFontSize(9); doc.setTextColor(120,120,130);
        const disc = doc.splitTextToSize(tr.disclaimer, pageW - margin * 2);
        for (const ln of disc) { ensure(12); doc.text(ln, margin, y); y += 12; }
        y += 16;

        // ===== Signature lines =====
        ensure(70);
        const sigW = (pageW - margin * 2 - 24) / 2;
        doc.setDrawColor(160, 160, 170); doc.setLineWidth(0.5);
        doc.line(margin, y + 30, margin + sigW, y + 30);
        doc.line(margin + sigW + 24, y + 30, pageW - margin, y + 30);
        doc.setFont(FONT, "normal"); doc.setFontSize(9); doc.setTextColor(110, 110, 120);
        doc.text(`${NI.proposalSignature} — ${NI.proposalContractor}`, margin, y + 44);
        doc.text(`${NI.proposalSignature} — ${NI.proposalCompany}`, margin + sigW + 24, y + 44);

        // ===== Footer on each page =====
        const total = doc.getNumberOfPages();
        for (let i = 1; i <= total; i++) {
          doc.setPage(i);
          doc.setFont(FONT, "normal"); doc.setFontSize(8); doc.setTextColor(150, 150, 160);
          doc.text(`${docNo} · ${isRu ? "стр." : "page"} ${i}/${total}`, pageW / 2, pageH - 20, { align: "center" });
        }

        doc.save(`proposal-${docNo.replace(/[^\w-]/g, "")}.pdf`);
      } finally {
        setPdfBusy(false);
      }
    };


    const analysis = aiText || buildLocalAnalysis();

    return (
      <div className="w-full max-w-4xl mx-auto">
        <ResultHeader lang={lang} setLang={setLang} tr={tr} />

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-elev animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Hero price */}
          <div className="px-6 py-8 sm:px-10 sm:py-12 text-center bg-radial-glow border-b border-border">
            <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-primary-glow font-bold mb-3">
              {tr.resultBadge}
            </div>
            <div className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-none">
              <span className="text-gradient">
                <AnimNum value={R.cMin} /> – <AnimNum value={R.cMax} />
              </span>{" "}
              <span className="text-foreground">{R.sym}</span>
              {pricingModel === "retainer" && (
                <span className="text-base sm:text-xl text-muted-foreground font-semibold">{tr.perMonth}</span>
              )}
            </div>
            <div className="mt-4 text-xs sm:text-sm text-muted-foreground">
              {(lang === "ru" ? R.wt.ru : R.wt.en)} ·{" "}
              {(lang === "ru" ? R.pm.ru : R.pm.en)} ·{" "}
              {(lang === "ru" ? R.urgEntry.ru : R.urgEntry.en)} ·{" "}
              {(lang === "ru" ? R.fmtEntry.ru : R.fmtEntry.en)}
            </div>
            <div className="mt-5 mx-auto h-[2px] w-10 rounded-full bg-primary-glow" />
          </div>

          {/* Meta strip */}
          <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
            {[
              [`${R.hMin}–${R.hMax}`, tr.hours],
              [`${R.rMin}–${R.rMax}€`, tr.ratePerHour],
              [`×${R.m.toFixed(2)}`, tr.multiplier],
            ].map(([v, k]) => (
              <div key={k} className="text-center py-4 px-2">
                <div className="text-base sm:text-lg font-bold text-foreground">{v}</div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mt-1">{k}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              setActiveTab(v);
              if (v === "ai" && !aiText && !aiLoading) fetchAi();
            }}
            className="w-full"
          >
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-auto p-0 overflow-x-auto">
              {[
                { id: "summary", label: lang === "ru" ? "Итог" : "Summary" },
                { id: "phases", label: lang === "ru" ? "Фазы" : "Phases" },
                { id: "waterfall", label: NEW_I18N[lang].waterfall },
                { id: "scenarios", label: lang === "ru" ? "Сценарии" : "Scenarios" },
                { id: "budget", label: NEW_I18N[lang].budget },
                { id: "history", label: lang === "ru" ? "История" : "History" },
                { id: "card", label: lang === "ru" ? "КП" : "Proposal" },
                { id: "ai", label: lang === "ru" ? "Анализ" : "Analysis" },
              ].map((t) => (

                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary-foreground data-[state=active]:shadow-none px-4 py-3 text-xs sm:text-sm whitespace-nowrap"
                >
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* SUMMARY */}
            <TabsContent value="summary" className="p-5 sm:p-8 mt-0">
              <SectionTitle>{lang === "ru" ? "Параметры расчёта" : "Calculation params"}</SectionTitle>
              <dl className="space-y-1">
                {[
                  [lang === "ru" ? "Тип работы" : "Work type", lang === "ru" ? R.wt.ru : R.wt.en],
                  [tr.pricingModel, `${lang === "ru" ? R.pm.ru : R.pm.en}${R.pm.mult !== 1 ? ` (×${R.pm.mult})` : ""}`],
                  [lang === "ru" ? "Срочность" : "Urgency", `${lang === "ru" ? R.urgEntry.ru : R.urgEntry.en} (×${R.urgEntry.mult})`],
                  [lang === "ru" ? "Формат" : "Format", lang === "ru" ? R.fmtEntry.ru : R.fmtEntry.en],
                  [lang === "ru" ? "Риск-буфер" : "Risk buffer", `+${riskBuf}%`],
                  [lang === "ru" ? "Накладные" : "Overhead", `+${overhead}%`],
                  [lang === "ru" ? "Клиент" : "Client", clientNew === "returning" ? (lang === "ru" ? "Постоянный (-10%)" : "Returning (-10%)") : (lang === "ru" ? "Новый" : "New")],
                  [lang === "ru" ? "Отрасль" : "Industry", industryExp === "known" ? (lang === "ru" ? "Знакомая" : "Known") : industryExp === "partial" ? (lang === "ru" ? "Частично" : "Partial") : (lang === "ru" ? "Новая (+30%)" : "New (+30%)")],
                  [lang === "ru" ? "Мин. порог" : "Min threshold", `${minThreshold} €`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 py-2 border-b border-border/40 text-sm">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-semibold text-foreground text-right">{v}</dd>
                  </div>
                ))}
              </dl>
              <Disclaimer text={tr.disclaimer} />
            </TabsContent>

            {/* PHASES */}
            <TabsContent value="phases" className="p-5 sm:p-8 mt-0">
              <SectionTitle>{tr.phaseBreakdown}</SectionTitle>
              <div className="flex h-2 rounded-full overflow-hidden gap-[2px] mb-5">
                {phasesPct.map((p, i) => (
                  <div
                    key={i}
                    style={{ width: `${p}%` }}
                    className={cn(
                      i === 0 && "bg-primary",
                      i === 1 && "bg-primary-glow",
                      i === 2 && "bg-info",
                      i === 3 && "bg-warning",
                    )}
                  />
                ))}
              </div>
              <div className="space-y-3">
                {tr.phases.map((ph, i) => {
                  const amt = Math.round(totalMid * phasesPct[i] / 100);
                  const hrs = Math.round(R.hours * phasesPct[i] / 100);
                  return (
                    <div key={i} className="flex items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          i === 0 && "bg-primary",
                          i === 1 && "bg-primary-glow",
                          i === 2 && "bg-info",
                          i === 3 && "bg-warning",
                        )} />
                        <span className="text-foreground">{ph}</span>
                      </div>
                      <span className="text-muted-foreground tabular-nums text-xs sm:text-sm">
                        {hrs}{lang === "ru" ? "ч" : "h"} · ~{amt.toLocaleString()} {R.sym} ({phasesPct[i]}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* SCENARIOS */}
            <TabsContent value="scenarios" className="p-5 sm:p-8 mt-0">
              <SectionTitle>{tr.scenarioCompare}</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {scenarios.map(({ label, sc, tone }) => sc && (
                  <div
                    key={label}
                    className={cn(
                      "rounded-xl p-4 border bg-surface-hi",
                      tone === "primary" && "border-primary/40",
                      tone === "warning" && "border-warning/40",
                      tone === "success" && "border-success/40",
                    )}
                  >
                    <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-2">{label}</div>
                    <div className="text-base sm:text-lg font-extrabold text-foreground tabular-nums">
                      {sc.cMin.toLocaleString()}–{sc.cMax.toLocaleString()} {sc.sym}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {sc.hMin}–{sc.hMax} {lang === "ru" ? "ч" : "h"} · ×{sc.m.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* WATERFALL — price composition */}
            <TabsContent value="waterfall" className="p-5 sm:p-8 mt-0">
              <SectionTitle>{NEW_I18N[lang].waterfall}</SectionTitle>
              <div className="text-xs text-muted-foreground mb-4">{NEW_I18N[lang].waterfallHelp}</div>
              {(() => {
                const cur = tr.currencies.find((c) => c.id === currency)!;
                const exch = cur.rate;
                const baseRateMid = (R.rMin + R.rMax) / 2;
                const base = Math.round(R.baseH * baseRateMid * exch);
                const finalMid = Math.round((R.cMin + R.cMax) / 2);
                const fmt = FORMAT_DATA.find((f) => f.id === format)!;
                let scopeM = 1;
                [...wtCrit!.volume, ...wtCrit!.complexity, ...UNIVERSAL].forEach((c: Criterion) => {
                  const ans = volumeAns[c.id] || complexAns[c.id] || univAns[c.id];
                  const opt = c.options.find((o) => o.id === ans);
                  if (opt) scopeM *= opt.mult;
                });
                const indM = industryExp === "known" ? 1.0 : industryExp === "partial" ? 1.15 : 1.3;
                const clientM = clientNew === "returning" ? 0.9 : 1.0;
                const steps = [
                  { label: lang === "ru" ? "Базовая трудоёмкость × ставка" : "Base hours × rate", val: base, delta: base, tone: "primary" },
                  { label: lang === "ru" ? `Объём + сложность (×${scopeM.toFixed(2)})` : `Scope + complexity (×${scopeM.toFixed(2)})`, val: Math.round(base * scopeM), delta: Math.round(base * scopeM - base), tone: "info" },
                  { label: lang === "ru" ? `Срочность (×${R.urgEntry.mult})` : `Urgency (×${R.urgEntry.mult})`, val: Math.round(base * scopeM * R.urgEntry.mult), delta: Math.round(base * scopeM * (R.urgEntry.mult - 1)), tone: R.urgEntry.mult > 1 ? "warning" : "info" },
                  { label: lang === "ru" ? `Формат (×${fmt.mult})` : `Format (×${fmt.mult})`, val: Math.round(base * scopeM * R.urgEntry.mult * fmt.mult), delta: Math.round(base * scopeM * R.urgEntry.mult * (fmt.mult - 1)), tone: fmt.mult >= 1 ? "info" : "success" },
                  { label: lang === "ru" ? `Клиент × отрасль (×${(clientM * indM).toFixed(2)})` : `Client × industry (×${(clientM * indM).toFixed(2)})`, val: Math.round(base * scopeM * R.urgEntry.mult * fmt.mult * clientM * indM), delta: Math.round(base * scopeM * R.urgEntry.mult * fmt.mult * (clientM * indM - 1)), tone: "info" },
                  { label: lang === "ru" ? `Накладные +${overhead}%` : `Overhead +${overhead}%`, val: Math.round(base * scopeM * R.urgEntry.mult * fmt.mult * clientM * indM * (1 + parseInt(overhead) / 100)), delta: Math.round(base * scopeM * R.urgEntry.mult * fmt.mult * clientM * indM * (parseInt(overhead) / 100)), tone: "warning" },
                  { label: lang === "ru" ? `Риск-буфер +${riskBuf}%` : `Risk buffer +${riskBuf}%`, val: Math.round(base * scopeM * R.urgEntry.mult * fmt.mult * clientM * indM * (1 + parseInt(overhead) / 100) * (1 + parseInt(riskBuf) / 100)), delta: Math.round(base * scopeM * R.urgEntry.mult * fmt.mult * clientM * indM * (1 + parseInt(overhead) / 100) * (parseInt(riskBuf) / 100)), tone: "warning" },
                  { label: lang === "ru" ? `Модель: ${R.pm.ru} (×${R.pm.mult})` : `Model: ${R.pm.en} (×${R.pm.mult})`, val: finalMid, delta: Math.round(finalMid - base * scopeM * R.urgEntry.mult * fmt.mult * clientM * indM * (1 + parseInt(overhead) / 100) * (1 + parseInt(riskBuf) / 100)), tone: R.pm.mult >= 1 ? "warning" : "success" },
                ];
                const maxVal = Math.max(...steps.map((s) => s.val));
                return (
                  <div className="space-y-2">
                    {steps.map((s, i) => (
                      <div key={i} className="grid grid-cols-[1fr_auto] gap-3 items-center">
                        <div>
                          <div className="text-xs text-foreground mb-1">{s.label}</div>
                          <div className="h-2 bg-surface-hi rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                s.tone === "primary" && "bg-primary",
                                s.tone === "info" && "bg-info",
                                s.tone === "warning" && "bg-warning",
                                s.tone === "success" && "bg-success",
                              )}
                              style={{ width: `${(s.val / maxVal) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-right tabular-nums text-xs">
                          <div className="font-bold text-foreground">{s.val.toLocaleString()} {R.sym}</div>
                          {i > 0 && (
                            <div className={cn(
                              "text-[10px]",
                              s.delta > 0 ? "text-warning" : s.delta < 0 ? "text-success" : "text-muted-foreground",
                            )}>
                              {s.delta > 0 ? "+" : ""}{s.delta.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </TabsContent>

            {/* BUDGET — target slider + matching scenarios */}
            <TabsContent value="budget" className="p-5 sm:p-8 mt-0">
              <SectionTitle>{NEW_I18N[lang].budget}</SectionTitle>
              <div className="mb-5">
                <label className="text-xs sm:text-sm font-semibold text-foreground mb-2 block">
                  {NEW_I18N[lang].budgetTarget}:{" "}
                  <span className="text-primary-glow">{budgetTarget.toLocaleString()} {R.sym}</span>
                </label>
                <Slider
                  value={[budgetTarget]}
                  min={500}
                  max={Math.max(50000, R.cMax * 2)}
                  step={250}
                  onValueChange={(v) => setBudgetTarget(v[0])}
                />
              </div>
              {(() => {
                // Generate combinations
                const combos: { label: string; mid: number; cMin: number; cMax: number; meta: string }[] = [];
                URGENCY_DATA.forEach((u) => {
                  FORMAT_DATA.forEach((f) => {
                    PRICING_MODELS.forEach((pm) => {
                      // Manual recompute (lightweight, mirror calcCore essentials)
                      const wt = WORK_TYPES.find((x) => x.id === wtId!)!;
                      const baseH = (wt.baseHours.S + wt.baseHours.M + wt.baseHours.L + wt.baseHours.XL) / 4;
                      let m = 1;
                      [...wtCrit!.volume, ...wtCrit!.complexity, ...UNIVERSAL].forEach((c: Criterion) => {
                        const ans = volumeAns[c.id] || complexAns[c.id] || univAns[c.id];
                        const opt = c.options.find((o) => o.id === ans);
                        if (opt) m *= opt.mult;
                      });
                      m *= u.mult * f.mult;
                      const clientM = clientNew === "returning" ? 0.9 : 1.0;
                      const indM = industryExp === "known" ? 1.0 : industryExp === "partial" ? 1.15 : 1.3;
                      m *= clientM * indM * (1 + parseInt(overhead) / 100) * (1 + parseInt(riskBuf) / 100) * pm.mult;
                      const hours = Math.max(1, Math.round(baseH * m));
                      const rateBase = wt.baseRate * u.mult;
                      const rMin = Math.max(customRateMin, Math.round(rateBase - 5));
                      const rMax = Math.min(customRateMax, Math.round(rateBase + 5));
                      const exch = R.sym === "€" ? 1 : tr.currencies.find((c) => c.sym === R.sym)!.rate;
                      const cMin = Math.round(hours * rMin * 0.9 * exch);
                      const cMax = Math.round(hours * rMax * 1.1 * exch);
                      combos.push({
                        label: `${lang === "ru" ? u.ru : u.en} · ${lang === "ru" ? f.ru : f.en} · ${lang === "ru" ? pm.ru : pm.en}`,
                        mid: Math.round((cMin + cMax) / 2),
                        cMin, cMax,
                        meta: `${hours}${lang === "ru" ? "ч" : "h"} · ×${m.toFixed(2)}`,
                      });
                    });
                  });
                });
                // Sort by distance to target
                const sorted = combos
                  .map((c) => ({ ...c, dist: Math.abs(c.mid - budgetTarget) }))
                  .sort((a, b) => a.dist - b.dist)
                  .slice(0, 6);
                const inRange = sorted.filter((c) => c.cMin <= budgetTarget && c.cMax >= budgetTarget);
                const list = inRange.length > 0 ? inRange : sorted;
                return (
                  <>
                    <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-3">
                      {inRange.length > 0 ? NEW_I18N[lang].budgetMatches : NEW_I18N[lang].budgetNoMatch}
                    </div>
                    <ul className="space-y-2">
                      {list.map((c, i) => {
                        const inside = c.cMin <= budgetTarget && c.cMax >= budgetTarget;
                        return (
                          <li
                            key={i}
                            className={cn(
                              "p-3 rounded-xl border bg-surface-hi flex justify-between items-center gap-3 text-xs sm:text-sm",
                              inside ? "border-success/50" : "border-border/50",
                            )}
                          >
                            <div className="min-w-0">
                              <div className="font-semibold text-foreground truncate">{c.label}</div>
                              <div className="text-[10px] text-muted-foreground">{c.meta}</div>
                            </div>
                            <div className="text-right tabular-nums whitespace-nowrap">
                              <div className={cn("font-bold", inside ? "text-success" : "text-foreground")}>
                                {c.cMin.toLocaleString()}–{c.cMax.toLocaleString()} {R.sym}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                );
              })()}
            </TabsContent>


            <TabsContent value="history" className="p-5 sm:p-8 mt-0">
              <div className="flex items-center justify-between mb-4">
                <SectionTitle className="mb-0">{tr.history}</SectionTitle>
                {history.length > 0 && (
                  <button onClick={clearHistory} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                    {tr.clearHistory}
                  </button>
                )}
              </div>
              {history.length === 0 ? (
                <div className="text-sm text-muted-foreground italic">{tr.historyEmpty}</div>
              ) : (
                <ul className="divide-y divide-border/40">
                  {history.map((h) => (
                    <li key={h.id} className="flex justify-between items-center py-3 text-sm gap-3">
                      <div className="min-w-0">
                        <div className="text-foreground font-medium truncate">{h.type}</div>
                        <div className="text-xs text-muted-foreground">{h.date}</div>
                      </div>
                      <div className="text-foreground font-bold tabular-nums whitespace-nowrap">
                        {h.cMin.toLocaleString()}–{h.cMax.toLocaleString()} {h.sym}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            {/* CARD */}
            <TabsContent value="card" className="p-5 sm:p-8 mt-0">
              <div className="flex items-center justify-between mb-4">
                <SectionTitle className="mb-0">{tr.clientCard}</SectionTitle>
                <Button
                  size="sm"
                  variant={copied ? "secondary" : "default"}
                  onClick={copyClientCard}
                  className={cn(copied && "bg-success/20 text-success hover:bg-success/30")}
                >
                  {copied ? tr.copied : tr.copyCard}
                </Button>
              </div>
              <pre className="bg-surface-hi border border-border rounded-xl p-4 text-xs sm:text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">
{lang === "ru"
  ? `КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ

Тип работы: ${R.wt.ru}
Формат: ${R.fmtEntry.ru} · Срочность: ${R.urgEntry.ru}

Оценка трудоёмкости: ${R.hMin}–${R.hMax} часов
Ставка: ${R.rMin}–${R.rMax} €/час

ИТОГОВАЯ СТОИМОСТЬ: ${R.cMin.toLocaleString()} – ${R.cMax.toLocaleString()} ${R.sym}

Дата: ${new Date().toLocaleDateString("ru-RU")}`
  : `COMMERCIAL PROPOSAL

Work type: ${R.wt.en}
Format: ${R.fmtEntry.en} · Urgency: ${R.urgEntry.en}

Estimated effort: ${R.hMin}–${R.hMax} hours
Rate: ${R.rMin}–${R.rMax} €/hr

TOTAL COST: ${R.cMin.toLocaleString()} – ${R.cMax.toLocaleString()} ${R.sym}

Date: ${new Date().toLocaleDateString("en-GB")}`}
              </pre>
            </TabsContent>

            {/* AI / Analysis */}
            <TabsContent value="ai" className="p-5 sm:p-8 mt-0">
              <div className="flex items-center justify-between mb-4 gap-3">
                <SectionTitle className="mb-0">{tr.aiComment}</SectionTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchAi}
                  disabled={aiLoading}
                >
                  {aiLoading ? "…" : tr.aiRefresh}
                </Button>
              </div>
              {aiLoading ? (
                <div className="bg-surface-el border border-info/30 rounded-xl p-6 text-sm text-muted-foreground flex items-center gap-3">
                  <span className="inline-block w-3 h-3 rounded-full bg-primary-glow animate-pulse" />
                  {tr.aiLoading}
                </div>
              ) : (
                <>
                  <div
                    className={cn(
                      "border rounded-xl p-4 text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap",
                      aiError ? "bg-warning/10 border-warning/40" : "bg-surface-el border-info/30",
                    )}
                  >
                    {analysis}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mt-3">
                    {aiError ? (lang === "ru" ? "Локальный анализ (AI недоступен)" : "Local analysis (AI unavailable)") : tr.aiPoweredBy}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>

          <div className="px-5 sm:px-8 pb-6 space-y-2">
            <Button onClick={exportPdf} className="w-full mt-2 shadow-glow">
              ⬇ {tr.exportPdf}
            </Button>
            <Button onClick={reset} variant="outline" className="w-full">
              {tr.recalculate}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- WIZARD VIEW ---------- */
  return (
    <div className="w-full max-w-3xl mx-auto">
      <ResultHeader lang={lang} setLang={setLang} tr={tr} />

      {/* Progress */}
      <div className="mb-5">
        <div className="flex gap-1 mb-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-[3px] flex-1 rounded-full transition-colors",
                i < step && "bg-primary",
                i === step && "bg-primary-glow shadow-glow",
                i > step && "bg-border/60",
              )}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] sm:text-xs uppercase tracking-[0.1em] text-muted-foreground">
          <span>{tr.step(step + 1, TOTAL_STEPS)}</span>
          <span className="text-primary-glow font-semibold">{tr.stepLabels[step]}</span>
        </div>
      </div>

      {/* Card */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-8 shadow-elev">
        <div className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-primary-glow font-bold mb-2">
          {tr.step(step + 1, TOTAL_STEPS)}
        </div>
        <h2 className="text-base sm:text-xl font-bold text-foreground mb-5 sm:mb-7 leading-tight">
          {tr.stepTitles[step]}
        </h2>

        {/* STEP 0 — work type */}
        {step === 0 && (
          <div className="space-y-5">
            {/* Templates */}
            <div>
              <div className="text-xs sm:text-sm font-semibold text-foreground mb-1">
                {NEW_I18N[lang].templates}
              </div>
              <div className="text-[11px] text-muted-foreground mb-3">{NEW_I18N[lang].templatesHelp}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PROJECT_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => applyTemplate(t)}
                    className="text-left p-3 rounded-xl border bg-surface-hi border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base text-primary-glow">{t.icon}</span>
                      <span className="text-xs sm:text-sm font-bold text-foreground">
                        {lang === "ru" ? t.ru : t.en}
                      </span>
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground leading-snug">
                      {lang === "ru" ? t.descRu : t.descEn}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Work types */}
            <div>
              <div className="text-xs sm:text-sm font-semibold text-foreground mb-3">
                {lang === "ru" ? "Или выберите тип работы вручную" : "Or pick a work type manually"}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">

            {WORK_TYPES.map((wt) => {
              const sel = wtId === wt.id;
              const det = WORK_TYPE_DETAILS[wt.id]?.[lang];
              const dt = DETAILS_I18N[lang];
              return (
                <div
                  key={wt.id}
                  className={cn(
                    "relative text-left rounded-xl border transition-all",
                    sel
                      ? "bg-primary/15 border-primary shadow-glow"
                      : "bg-surface-hi border-border/50 hover:border-primary/40",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setWtId(wt.id);
                      setVolumeAns({});
                      setComplexAns({});
                    }}
                    className="block w-full text-left p-3 sm:p-4 pr-8 sm:pr-9"
                  >
                    <span className="text-lg sm:text-xl text-primary-glow block mb-1">{wt.icon}</span>
                    <span className="block text-xs sm:text-sm font-bold text-foreground leading-snug">
                      {lang === "ru" ? wt.ru : wt.en}
                    </span>
                    <span className="block text-[10px] sm:text-xs text-muted-foreground mt-1">
                      {lang === "ru" ? wt.subRu : wt.subEn}
                    </span>
                  </button>
                  {det && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          aria-label={dt.moreInfo}
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-2 right-2 p-1.5 rounded-md text-muted-foreground hover:text-primary-glow hover:bg-primary/10 transition-colors"
                        >
                          <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        side="top"
                        align="end"
                        className="w-80 max-w-[90vw] bg-surface-hi border-border text-foreground p-4 space-y-3"
                      >
                        <div>
                          <div className="text-sm font-bold text-foreground flex items-center gap-2">
                            <span className="text-primary-glow">{wt.icon}</span>
                            {lang === "ru" ? wt.ru : wt.en}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {lang === "ru" ? wt.subRu : wt.subEn}
                          </div>
                        </div>
                        <DetailSection title={dt.process} items={det.process} />
                        <DetailSection title={dt.deliverables} items={det.deliverables} />
                        <DetailSection title={dt.resources} items={det.resources} />
                        {det.notes && (
                          <div className="pt-2 border-t border-border/50">
                            <div className="text-[10px] uppercase tracking-[0.14em] text-primary-glow font-bold mb-1">
                              {dt.notes}
                            </div>
                            <div className="text-xs text-muted-foreground leading-snug">{det.notes}</div>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              );
            })}
              </div>
            </div>
          </div>
        )}


        {/* STEP 1 — volume criteria */}
        {step === 1 && wtCrit && (
          <CriteriaBlock
            lang={lang}
            criteria={wtCrit.volume}
            answers={volumeAns}
            onPick={(id, val) => setAns(setVolumeAns, id, val)}
            sectionLabel={tr.volumeSection}
          />
        )}

        {/* STEP 2 — complexity */}
        {step === 2 && wtCrit && (
          <CriteriaBlock
            lang={lang}
            criteria={wtCrit.complexity}
            answers={complexAns}
            onPick={(id, val) => setAns(setComplexAns, id, val)}
            sectionLabel={tr.complexitySection}
          />
        )}

        {/* STEP 3 — universal */}
        {step === 3 && (
          <CriteriaBlock
            lang={lang}
            criteria={UNIVERSAL}
            answers={univAns}
            onPick={(id, val) => setAns(setUnivAns, id, val)}
            sectionLabel={tr.universalSection}
          />
        )}

        {/* STEP 4 — urgency */}
        {step === 4 && (
          <div className="space-y-2">
            {URGENCY_DATA.map((u) => {
              const sel = urgency === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => setUrgency(u.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between gap-3",
                    sel
                      ? u.tone === "info" ? "bg-info/15 border-info shadow-glow"
                      : u.tone === "warning" ? "bg-warning/15 border-warning"
                      : "bg-destructive/15 border-destructive"
                      : "bg-surface-hi border-border/50 hover:border-primary/40",
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      u.tone === "info" && "bg-info",
                      u.tone === "warning" && "bg-warning",
                      u.tone === "destructive" && "bg-destructive",
                    )} />
                    <div className="min-w-0">
                      <div className="font-bold text-foreground text-sm sm:text-base">
                        {lang === "ru" ? u.ru : u.en}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {lang === "ru" ? u.descRu : u.descEn}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground tabular-nums">×{u.mult}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* STEP 5 — format */}
        {step === 5 && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {FORMAT_DATA.map((f) => {
              const sel = format === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={cn(
                    "p-4 sm:p-5 rounded-xl border transition-all text-center",
                    sel
                      ? "bg-primary/15 border-primary shadow-glow"
                      : "bg-surface-hi border-border/50 hover:border-primary/40",
                  )}
                >
                  <div className="text-2xl text-primary-glow mb-2">{f.icon}</div>
                  <div className="text-xs sm:text-sm font-bold text-foreground">
                    {lang === "ru" ? f.ru : f.en}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">×{f.mult}</div>
                </button>
              );
            })}
          </div>
        )}

        {/* STEP 6 — modifiers */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <div className="text-xs sm:text-sm font-semibold text-foreground mb-1">
                {tr.pricingModel}
              </div>
              <div className="text-[11px] text-muted-foreground mb-3">{tr.pricingModelHelp}</div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {PRICING_MODELS.map((pm) => {
                  const sel = pricingModel === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPricingModel(pm.id)}
                      className={cn(
                        "text-left p-3 rounded-xl border transition-all",
                        sel
                          ? "bg-primary/15 border-primary shadow-glow"
                          : "bg-surface-hi border-border/50 hover:border-primary/40",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-base text-primary-glow">{pm.icon}</span>
                        <span className="text-[10px] tabular-nums text-muted-foreground">
                          {pm.mult === 1 ? "×1.0" : pm.mult > 1 ? `+${Math.round((pm.mult - 1) * 100)}%` : `−${Math.round((1 - pm.mult) * 100)}%`}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-foreground leading-snug">
                        {lang === "ru" ? pm.ru : pm.en}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1 leading-snug">
                        {lang === "ru" ? pm.descRu : pm.descEn}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Team mix */}
            <div className="rounded-xl border border-border/60 bg-surface-hi p-3 sm:p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-foreground">{NEW_I18N[lang].teamMix}</div>
                  <div className="text-[11px] text-muted-foreground">{NEW_I18N[lang].teamMixHelp}</div>
                </div>
                <Switch checked={teamEnabled} onCheckedChange={setTeamEnabled} />
              </div>
              {teamEnabled && (
                <>
                  <div className="space-y-2">
                    {RESOURCE_ROLES.map((role) => (
                      <div key={role.id} className="grid grid-cols-[1.4fr_auto_1fr] gap-2 items-center">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-primary-glow">{role.icon}</span>
                          <span className="text-xs sm:text-sm font-medium text-foreground truncate">
                            {lang === "ru" ? role.ru : role.en}
                          </span>
                        </div>
                        <input
                          type="number"
                          value={teamRates[role.id]}
                          onChange={(e) =>
                            setTeamRates((prev) => ({ ...prev, [role.id]: Math.max(0, parseInt(e.target.value) || 0) }))
                          }
                          className="w-16 px-2 py-1 rounded-md bg-surface border border-border text-xs text-foreground tabular-nums text-right"
                        />
                        <div className="flex items-center gap-2">
                          <Slider
                            value={[teamShares[role.id]]}
                            min={0} max={100} step={5}
                            onValueChange={(v) =>
                              setTeamShares((prev) => ({ ...prev, [role.id]: v[0] }))
                            }
                          />
                          <span className="text-[10px] tabular-nums text-muted-foreground w-8 text-right">
                            {teamShares[role.id]}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                    <span className="text-muted-foreground">
                      {NEW_I18N[lang].teamBlended}:{" "}
                      <span className="text-foreground font-bold tabular-nums">{Math.round(blendedRate)} €/{lang === "ru" ? "ч" : "h"}</span>
                    </span>
                    <span className={cn("tabular-nums", teamSharesSum === 100 ? "text-success" : "text-warning")}>
                      Σ {teamSharesSum}%
                    </span>
                  </div>
                  {teamSharesSum !== 100 && (
                    <div className="text-[10px] text-warning">{NEW_I18N[lang].teamSumWarn}</div>
                  )}
                </>
              )}
            </div>


            <ModRow label={tr.riskBuf}>
              {tr.riskLevels.map((r) => (
                <Chip key={r.id} selected={riskBuf === r.id} onClick={() => setRiskBuf(r.id)}>
                  {r.label}
                </Chip>
              ))}
            </ModRow>
            <ModRow label={tr.overhead}>
              {tr.overheadLevels.map((o) => (
                <Chip key={o.id} selected={overhead === o.id} onClick={() => setOverhead(o.id)}>
                  {o.label}
                </Chip>
              ))}
            </ModRow>
            <ModRow label={tr.clientProfile}>
              {tr.clientTypes.map((c) => (
                <Chip key={c.id} selected={clientNew === c.id} onClick={() => setClientNew(c.id)}>
                  {c.label}
                </Chip>
              ))}
            </ModRow>
            <ModRow label={tr.industry}>
              {tr.industries.map((i) => (
                <Chip key={i.id} selected={industryExp === i.id} onClick={() => setIndustryExp(i.id)}>
                  {i.label}
                </Chip>
              ))}
            </ModRow>
            <ModRow label={tr.currency}>
              {tr.currencies.map((c) => (
                <Chip key={c.id} selected={currency === c.id} onClick={() => setCurrency(c.id as Currency)}>
                  {c.id} {c.sym}
                </Chip>
              ))}
            </ModRow>
            <div>
              <label className="text-xs sm:text-sm font-semibold text-foreground mb-2 block">
                {tr.minThreshold}: <span className="text-primary-glow">{minThreshold} €</span>
              </label>
              <Slider
                value={[minThreshold]}
                min={50} max={1000} step={50}
                onValueChange={(v) => setMinThreshold(v[0])}
              />
            </div>
            <div>
              <label className="text-xs sm:text-sm font-semibold text-foreground mb-2 block">
                {tr.rateRange}: <span className="text-primary-glow">{customRateMin}–{customRateMax} €</span>
              </label>
              <Slider
                value={[customRateMin, customRateMax]}
                min={20} max={200} step={5}
                onValueChange={(v) => { setCustomRateMin(v[0]); setCustomRateMax(v[1]); }}
              />
            </div>
          </div>
        )}

        {/* Nav */}
        <div className="flex justify-between items-center mt-6 sm:mt-8">
          <Button variant="ghost" onClick={back} disabled={step === 0}>
            ← {tr.back}
          </Button>
          <Button onClick={next} disabled={!stepValid} className="shadow-glow">
            {step === TOTAL_STEPS - 1 ? tr.calculate : tr.next} →
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Sub-components ---------- */
function ResultHeader({
  lang, setLang, tr,
}: { lang: Lang; setLang: (l: Lang) => void; tr: (typeof I18N)[Lang] }) {
  return (
    <>
      <div className="flex justify-between items-center mb-5 sm:mb-7">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary-glow shadow-glow" />
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">
            {tr.badge}
          </span>
        </div>
        <div className="flex gap-[2px] bg-surface border border-border rounded-lg p-[3px]">
          {(["ru", "en"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-bold tracking-wider transition-colors",
                lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <header className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-[1.1] mb-2 text-foreground">
          {tr.title}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">{tr.subtitle}</p>
      </header>
    </>
  );
}

function CriteriaBlock({
  lang, criteria, answers, onPick, sectionLabel,
}: {
  lang: Lang;
  criteria: Criterion[];
  answers: Record<string, string>;
  onPick: (id: string, val: string) => void;
  sectionLabel: string;
}) {
  return (
    <div>
      <SectionTitle>{sectionLabel}</SectionTitle>
      <div className="space-y-5">
        {criteria.map((c) => (
          <div key={c.id}>
            <div className="text-sm font-semibold text-foreground mb-2">
              {lang === "ru" ? c.ru : c.en}
            </div>
            <div className="flex flex-wrap gap-2">
              {c.options.map((o) => {
                const sel = answers[c.id] === o.id;
                const delta = o.mult > 1 ? `+${Math.round((o.mult - 1) * 100)}%` : o.mult < 1 ? `−${Math.round((1 - o.mult) * 100)}%` : "";
                return (
                  <Chip key={o.id} selected={sel} onClick={() => onPick(c.id, o.id)}>
                    {lang === "ru" ? o.ru : o.en}
                    {delta && (
                      <span className={cn(
                        "ml-1 text-[10px] font-bold",
                        o.mult > 1.2 && "text-warning",
                        o.mult < 1 && "text-success",
                      )}>
                        {delta}
                      </span>
                    )}
                  </Chip>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("text-[10px] sm:text-xs uppercase tracking-[0.18em] text-primary-glow font-bold mb-4 pb-2 border-b border-primary/15", className)}>
      {children}
    </div>
  );
}

function ModRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs sm:text-sm font-semibold text-foreground mb-2 block">{label}</label>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Disclaimer({ text }: { text: string }) {
  return (
    <div className="mt-5 p-3 sm:p-4 rounded-xl bg-primary/8 border border-primary/20 text-xs text-muted-foreground leading-relaxed">
      {text}
    </div>
  );
}
