export type Lang = "ru" | "en";

export type Option = { id: string; ru: string; en: string; mult: number };
export type Criterion = { id: string; ru: string; en: string; options: Option[] };

export type WorkType = {
  id: string;
  ru: string;
  en: string;
  subRu: string;
  subEn: string;
  icon: string;
  baseHours: { S: number; M: number; L: number; XL: number };
  baseRate: number;
};

export const WORK_TYPES: WorkType[] = [
  { id: "analysis",   ru: "Анализ бизнес-процессов",     en: "Business Process Analysis",   subRu: "AS-IS / TO-BE",                       subEn: "AS-IS / TO-BE mapping",          icon: "◈", baseHours: { S:4,M:10,L:20,XL:40 }, baseRate:55 },
  { id: "docs",       ru: "Регламенты и документация",   en: "Regulations & Documentation", subRu: "Разработка / оформление",             subEn: "Development / formatting",        icon: "◉", baseHours: { S:3,M:8,L:16,XL:30 },  baseRate:50 },
  { id: "consulting", ru: "Консультации и сессии",       en: "Consulting & Sessions",       subRu: "Стратегические / экспертные",         subEn: "Strategic / expert sessions",     icon: "◎", baseHours: { S:1,M:3,L:6,XL:12 },   baseRate:70 },
  { id: "automation", ru: "Автоматизация и ТЗ",          en: "Automation & Specifications", subRu: "Постановка задачи / контроль",        subEn: "Task definition / oversight",     icon: "⬡", baseHours: { S:6,M:14,L:28,XL:50 }, baseRate:65 },
  { id: "audit",      ru: "Аудит и экспертная оценка",   en: "Audit & Expert Assessment",   subRu: "Диагностика / рекомендации",          subEn: "Diagnostics / recommendations",   icon: "◐", baseHours: { S:4,M:10,L:18,XL:35 }, baseRate:75 },
  { id: "training",   ru: "Обучение и воркшопы",         en: "Training & Workshops",        subRu: "Подготовка / проведение",             subEn: "Preparation / delivery",          icon: "◑", baseHours: { S:3,M:6,L:12,XL:24 },  baseRate:60 },
  { id: "market",     ru: "Анализ рынка",                en: "Market Analysis",             subRu: "Сегменты / конкуренты / тренды",      subEn: "Segments / competitors / trends", icon: "◭", baseHours: { S:5,M:12,L:24,XL:45 }, baseRate:65 },
  { id: "forecast",   ru: "Прогноз по рынку",            en: "Market Forecast",             subRu: "Сценарии / объём / динамика",         subEn: "Scenarios / volume / dynamics",   icon: "◬", baseHours: { S:6,M:14,L:28,XL:50 }, baseRate:70 },
  { id: "idea",       ru: "Анализ бизнес-идеи",          en: "Business Idea Analysis",      subRu: "Оценка / риски / потенциал",          subEn: "Assessment / risks / potential",  icon: "◇", baseHours: { S:4,M:10,L:18,XL:32 }, baseRate:70 },
  { id: "tech",       ru: "Анализ сервисов и технологий",en: "Services & Tech Analysis",    subRu: "Стек / инструменты / сравнение",      subEn: "Stack / tools / comparison",      icon: "⬢", baseHours: { S:4,M:10,L:20,XL:38 }, baseRate:65 },
  { id: "bizreq",     ru: "Бизнес-требования",           en: "Business Requirements",       subRu: "Сбор / формализация / согласование",  subEn: "Gathering / formalization",       icon: "⊟", baseHours: { S:5,M:12,L:22,XL:40 }, baseRate:60 },
  { id: "projdoc",    ru: "Документация для проекта",    en: "Project Documentation",       subRu: "Структура / шаблоны / контент",       subEn: "Structure / templates / content", icon: "⊠", baseHours: { S:4,M:10,L:18,XL:35 }, baseRate:55 },
];

export const CRITERIA: Record<string, { volume: Criterion[]; complexity: Criterion[] }> = {
  analysis: {
    volume: [
      { id:"proc_count", ru:"Количество процессов", en:"Number of processes", options:[{id:"1-3",ru:"1–3",en:"1–3",mult:1.0},{id:"4-8",ru:"4–8",en:"4–8",mult:1.4},{id:"9+",ru:"9+",en:"9+",mult:1.9}] },
      { id:"viz", ru:"Визуализация (BPMN/схемы)", en:"Visualisation (BPMN/diagrams)", options:[{id:"no",ru:"Не нужна",en:"Not needed",mult:1.0},{id:"yes",ru:"Нужна",en:"Required",mult:1.3}] },
      { id:"interviews", ru:"Интервью со стейкхолдерами", en:"Stakeholder interviews", options:[{id:"none",ru:"Не требуются",en:"Not required",mult:1.0},{id:"few",ru:"2–4 человека",en:"2–4 people",mult:1.2},{id:"many",ru:"5+ человек",en:"5+ people",mult:1.5}] },
    ],
    complexity: [
      { id:"nesting", ru:"Уровни вложенности процессов", en:"Process nesting levels", options:[{id:"flat",ru:"Линейные",en:"Flat",mult:1.0},{id:"med",ru:"2–3 уровня",en:"2–3 levels",mult:1.3},{id:"deep",ru:"4+ уровней",en:"4+ levels",mult:1.7}] },
      { id:"automation_level", ru:"Автоматизация процессов", en:"Process automation", options:[{id:"manual",ru:"Ручные",en:"Manual",mult:1.0},{id:"partial",ru:"Частично",en:"Partial",mult:1.2},{id:"auto",ru:"Полностью",en:"Full",mult:1.4}] },
      { id:"systems", ru:"Количество систем", en:"Systems involved", options:[{id:"1",ru:"1",en:"1",mult:1.0},{id:"2-3",ru:"2–3",en:"2–3",mult:1.3},{id:"4+",ru:"4+",en:"4+",mult:1.6}] },
    ],
  },
  docs: {
    volume: [
      { id:"doc_count", ru:"Количество документов", en:"Number of documents", options:[{id:"1-2",ru:"1–2",en:"1–2",mult:1.0},{id:"3-6",ru:"3–6",en:"3–6",mult:1.5},{id:"7+",ru:"7+",en:"7+",mult:2.1}] },
      { id:"volume_pages", ru:"Объём документа", en:"Document volume", options:[{id:"short",ru:"До 10 стр.",en:"Up to 10p",mult:1.0},{id:"med",ru:"10–30 стр.",en:"10–30p",mult:1.4},{id:"long",ru:"30+ стр.",en:"30+p",mult:2.0}] },
      { id:"approvals", ru:"Согласующие стороны", en:"Approving parties", options:[{id:"1",ru:"1",en:"1",mult:1.0},{id:"2-3",ru:"2–3",en:"2–3",mult:1.3},{id:"4+",ru:"4+",en:"4+",mult:1.6}] },
    ],
    complexity: [
      { id:"standard", ru:"Корпоративный стандарт", en:"Corporate standard", options:[{id:"yes",ru:"Есть шаблон",en:"Template exists",mult:0.8},{id:"no",ru:"С нуля",en:"From scratch",mult:1.3}] },
      { id:"legal", ru:"Юридическая составляющая", en:"Legal component", options:[{id:"none",ru:"Не требуется",en:"Not required",mult:1.0},{id:"yes",ru:"Требует юристов",en:"Legal review",mult:1.4}] },
      { id:"sensitivity", ru:"Конфиденциальность", en:"Confidentiality", options:[{id:"open",ru:"Публичная",en:"Public",mult:1.0},{id:"internal",ru:"Внутренняя",en:"Internal",mult:1.1},{id:"secret",ru:"NDA",en:"NDA",mult:1.25}] },
    ],
  },
  consulting: {
    volume: [
      { id:"participants", ru:"Участники", en:"Participants", options:[{id:"1",ru:"1–2",en:"1–2",mult:1.0},{id:"3-6",ru:"3–6",en:"3–6",mult:1.2},{id:"7+",ru:"7+",en:"7+",mult:1.5}] },
      { id:"prep_materials", ru:"Подготовка материалов", en:"Materials prep", options:[{id:"no",ru:"Нет",en:"No",mult:1.0},{id:"yes",ru:"Да",en:"Yes",mult:1.4}] },
      { id:"report", ru:"Отчёт по итогам", en:"Post-session report", options:[{id:"no",ru:"Не нужен",en:"Not needed",mult:1.0},{id:"short",ru:"Краткий",en:"Brief",mult:1.2},{id:"full",ru:"Полный",en:"Full",mult:1.5}] },
    ],
    complexity: [
      { id:"audience", ru:"Уровень аудитории", en:"Audience level", options:[{id:"expert",ru:"Эксперты",en:"Experts",mult:1.0},{id:"mgmt",ru:"Менеджеры",en:"Managers",mult:1.1},{id:"novice",ru:"Новички",en:"Beginners",mult:1.3}] },
      { id:"conflict", ru:"Конфликтность", en:"Conflict level", options:[{id:"low",ru:"Нет",en:"None",mult:1.0},{id:"med",ru:"Разногласия",en:"Some",mult:1.3},{id:"high",ru:"Высокая",en:"High",mult:1.6}] },
      { id:"decision", ru:"Принятие решений", en:"Decisions required", options:[{id:"no",ru:"Нет",en:"No",mult:1.0},{id:"yes",ru:"Да",en:"Yes",mult:1.25}] },
    ],
  },
  automation: {
    volume: [
      { id:"integrations", ru:"Интеграции / системы", en:"Integrations / systems", options:[{id:"1",ru:"1–2",en:"1–2",mult:1.0},{id:"3-5",ru:"3–5",en:"3–5",mult:1.5},{id:"6+",ru:"6+",en:"6+",mult:2.1}] },
      { id:"prototype", ru:"Прототип / макет", en:"Prototype available", options:[{id:"yes",ru:"Есть",en:"Yes",mult:0.85},{id:"no",ru:"Нет",en:"No",mult:1.0}] },
      { id:"acceptance", ru:"Приёмка и тестирование", en:"Acceptance testing", options:[{id:"no",ru:"Нет",en:"No",mult:1.0},{id:"yes",ru:"Да",en:"Yes",mult:1.35}] },
    ],
    complexity: [
      { id:"legacy", ru:"Legacy-системы", en:"Legacy systems", options:[{id:"no",ru:"Нет",en:"No",mult:1.0},{id:"yes",ru:"Есть",en:"Yes",mult:1.5}] },
      { id:"custom", ru:"Кастомизация", en:"Customisation", options:[{id:"typical",ru:"Типовое",en:"Standard",mult:1.0},{id:"partial",ru:"Частичная",en:"Partial",mult:1.3},{id:"full",ru:"Уникальное",en:"Unique",mult:1.7}] },
      { id:"roles", ru:"Ролевая модель", en:"Role model", options:[{id:"simple",ru:"1–2 роли",en:"1–2 roles",mult:1.0},{id:"med",ru:"3–5 ролей",en:"3–5 roles",mult:1.2},{id:"complex",ru:"6+",en:"6+",mult:1.5}] },
    ],
  },
  audit: {
    volume: [
      { id:"audit_scope", ru:"Объект аудита", en:"Audit scope", options:[{id:"process",ru:"Процесс",en:"Process",mult:1.0},{id:"dept",ru:"Отдел",en:"Department",mult:1.5},{id:"company",ru:"Компания",en:"Company",mult:2.2}] },
      { id:"benchmark", ru:"Бенчмарк", en:"Benchmarking", options:[{id:"no",ru:"Нет",en:"No",mult:1.0},{id:"yes",ru:"Да",en:"Yes",mult:1.4}] },
      { id:"result_format", ru:"Формат результата", en:"Result format", options:[{id:"verbal",ru:"Устно",en:"Verbal",mult:0.8},{id:"pres",ru:"Презентация",en:"Deck",mult:1.1},{id:"report",ru:"Отчёт",en:"Report",mult:1.5}] },
    ],
    complexity: [
      { id:"data_access", ru:"Доступность данных", en:"Data access", options:[{id:"open",ru:"Открыты",en:"Open",mult:1.0},{id:"partial",ru:"Частично",en:"Partial",mult:1.3},{id:"closed",ru:"Закрыты",en:"Closed",mult:1.7}] },
      { id:"conflict_interest", ru:"Конфликт интересов", en:"Conflict of interest", options:[{id:"no",ru:"Нет",en:"No",mult:1.0},{id:"yes",ru:"Есть",en:"Yes",mult:1.35}] },
      { id:"field_obs", ru:"Полевые интервью", en:"Field interviews", options:[{id:"no",ru:"Нет",en:"No",mult:1.0},{id:"yes",ru:"Да",en:"Yes",mult:1.4}] },
    ],
  },
  training: {
    volume: [
      { id:"participants_t", ru:"Участники", en:"Participants", options:[{id:"1-5",ru:"1–5",en:"1–5",mult:1.0},{id:"6-15",ru:"6–15",en:"6–15",mult:1.3},{id:"16+",ru:"16+",en:"16+",mult:1.6}] },
      { id:"modules", ru:"Модули / сессии", en:"Modules / sessions", options:[{id:"1",ru:"1",en:"1",mult:1.0},{id:"2-3",ru:"2–3",en:"2–3",mult:1.8},{id:"4+",ru:"4+",en:"4+",mult:2.8}] },
      { id:"assessment", ru:"Оценка знаний", en:"Assessment", options:[{id:"no",ru:"Нет",en:"No",mult:1.0},{id:"yes",ru:"Да",en:"Yes",mult:1.3}] },
    ],
    complexity: [
      { id:"audience_level", ru:"Уровень знаний", en:"Knowledge level", options:[{id:"advanced",ru:"Продвинутый",en:"Advanced",mult:1.0},{id:"med",ru:"Средний",en:"Intermediate",mult:1.1},{id:"zero",ru:"С нуля",en:"Beginner",mult:1.3}] },
      { id:"interactivity", ru:"Формат", en:"Format", options:[{id:"lecture",ru:"Лекция",en:"Lecture",mult:1.0},{id:"workshop",ru:"Воркшоп",en:"Workshop",mult:1.4},{id:"simulation",ru:"Симуляция",en:"Simulation",mult:1.7}] },
      { id:"corp_adapt", ru:"Корп. адаптация", en:"Corp. customisation", options:[{id:"no",ru:"Типовой",en:"Standard",mult:1.0},{id:"yes",ru:"Под клиента",en:"Custom",mult:1.4}] },
    ],
  },
  market: {
    volume: [
      { id:"geo", ru:"Географический охват", en:"Geographic scope", options:[{id:"local",ru:"Регион",en:"Region",mult:1.0},{id:"national",ru:"Страна",en:"National",mult:1.5},{id:"global",ru:"Глобально",en:"Global",mult:2.2}] },
      { id:"competitors", ru:"Конкуренты", en:"Competitors", options:[{id:"3",ru:"До 3",en:"Up to 3",mult:1.0},{id:"4-8",ru:"4–8",en:"4–8",mult:1.4},{id:"9+",ru:"9+",en:"9+",mult:1.9}] },
      { id:"viz_market", ru:"Визуализация", en:"Visualisation", options:[{id:"no",ru:"Нет",en:"No",mult:1.0},{id:"yes",ru:"Да",en:"Yes",mult:1.25}] },
    ],
    complexity: [
      { id:"data_sources", ru:"Источники данных", en:"Data sources", options:[{id:"open",ru:"Открытые",en:"Open",mult:1.0},{id:"paid",ru:"Платные базы",en:"Paid DB",mult:1.3},{id:"primary",ru:"Первичные",en:"Primary",mult:1.8}] },
      { id:"market_maturity", ru:"Зрелость рынка", en:"Market maturity", options:[{id:"stable",ru:"Устоявшийся",en:"Established",mult:1.0},{id:"forming",ru:"Формирующийся",en:"Emerging",mult:1.3},{id:"new",ru:"Новый",en:"New",mult:1.7}] },
      { id:"segments", ru:"Сегменты", en:"Segments", options:[{id:"1-2",ru:"1–2",en:"1–2",mult:1.0},{id:"3-4",ru:"3–4",en:"3–4",mult:1.3},{id:"5+",ru:"5+",en:"5+",mult:1.6}] },
    ],
  },
  forecast: {
    volume: [
      { id:"horizon", ru:"Горизонт прогноза", en:"Forecast horizon", options:[{id:"1y",ru:"1 год",en:"1 year",mult:1.0},{id:"3y",ru:"3 года",en:"3 years",mult:1.4},{id:"5y",ru:"5+ лет",en:"5+ years",mult:1.8}] },
      { id:"scenarios", ru:"Сценарии", en:"Scenarios", options:[{id:"1",ru:"1 (базовый)",en:"1 (base)",mult:1.0},{id:"2",ru:"2",en:"2",mult:1.4},{id:"3",ru:"3",en:"3",mult:1.8}] },
      { id:"fin_model", ru:"Финансовая модель", en:"Financial model", options:[{id:"no",ru:"Нет",en:"No",mult:1.0},{id:"yes",ru:"Да",en:"Yes",mult:1.6}] },
    ],
    complexity: [
      { id:"volatility", ru:"Волатильность рынка", en:"Market volatility", options:[{id:"low",ru:"Стабильный",en:"Stable",mult:1.0},{id:"med",ru:"Умеренная",en:"Moderate",mult:1.3},{id:"high",ru:"Высокая",en:"High",mult:1.7}] },
      { id:"variables", ru:"Факторы влияния", en:"Influencing factors", options:[{id:"few",ru:"До 5",en:"Up to 5",mult:1.0},{id:"med",ru:"5–15",en:"5–15",mult:1.3},{id:"many",ru:"15+",en:"15+",mult:1.6}] },
      { id:"methodology", ru:"Методология", en:"Methodology", options:[{id:"expert",ru:"Экспертная",en:"Expert",mult:1.0},{id:"quant",ru:"Эконометрика",en:"Econometrics",mult:1.5}] },
    ],
  },
  idea: {
    volume: [
      { id:"concepts", ru:"Концепции", en:"Concepts", options:[{id:"1",ru:"1",en:"1",mult:1.0},{id:"2-3",ru:"2–3",en:"2–3",mult:1.5},{id:"4+",ru:"4+",en:"4+",mult:2.0}] },
      { id:"tam", ru:"TAM/SAM/SOM", en:"TAM/SAM/SOM", options:[{id:"no",ru:"Нет",en:"No",mult:1.0},{id:"yes",ru:"Да",en:"Yes",mult:1.4}] },
      { id:"unit_econ", ru:"Юнит-экономика", en:"Unit economics", options:[{id:"no",ru:"Нет",en:"No",mult:1.0},{id:"yes",ru:"Да",en:"Yes",mult:1.4}] },
    ],
    complexity: [
      { id:"innovation", ru:"Инновационность", en:"Innovation level", options:[{id:"analog",ru:"Аналоги есть",en:"Analogues exist",mult:1.0},{id:"new",ru:"Рынок формируется",en:"Emerging",mult:1.4},{id:"disrupt",ru:"Новый рынок",en:"New market",mult:1.8}] },
      { id:"custdev", ru:"CustDev / первичное исследование", en:"CustDev / primary research", options:[{id:"no",ru:"Нет",en:"No",mult:1.0},{id:"yes",ru:"Да",en:"Yes",mult:1.5}] },
      { id:"regulatory", ru:"Регуляторные риски", en:"Regulatory risks", options:[{id:"none",ru:"Нет",en:"None",mult:1.0},{id:"yes",ru:"Есть",en:"Present",mult:1.3}] },
    ],
  },
  tech: {
    volume: [
      { id:"tools_count", ru:"Инструменты / платформы", en:"Tools / platforms", options:[{id:"1-3",ru:"1–3",en:"1–3",mult:1.0},{id:"4-7",ru:"4–7",en:"4–7",mult:1.5},{id:"8+",ru:"8+",en:"8+",mult:2.0}] },
      { id:"comparison_matrix", ru:"Матрица сравнения", en:"Comparison matrix", options:[{id:"no",ru:"Нет",en:"No",mult:1.0},{id:"yes",ru:"Да",en:"Yes",mult:1.25}] },
      { id:"impl_rec", ru:"Рекомендации по внедрению", en:"Implementation recs", options:[{id:"no",ru:"Нет",en:"No",mult:1.0},{id:"yes",ru:"Да",en:"Yes",mult:1.35}] },
    ],
    complexity: [
      { id:"tech_depth", ru:"Глубина анализа", en:"Analysis depth", options:[{id:"surface",ru:"Поверхностный",en:"Surface",mult:1.0},{id:"med",ru:"Функциональный",en:"Functional",mult:1.3},{id:"deep",ru:"Глубокий",en:"Deep",mult:1.7}] },
      { id:"poc", ru:"PoC / тестирование", en:"PoC / testing", options:[{id:"no",ru:"Нет",en:"No",mult:1.0},{id:"yes",ru:"Да",en:"Yes",mult:1.6}] },
      { id:"niche_tools", ru:"Нишевые решения", en:"Niche tools", options:[{id:"no",ru:"Известные",en:"Well-known",mult:1.0},{id:"yes",ru:"Нишевые",en:"Niche",mult:1.3}] },
    ],
  },
  bizreq: {
    volume: [
      { id:"func_blocks", ru:"Функциональные блоки", en:"Functional blocks", options:[{id:"1-3",ru:"1–3",en:"1–3",mult:1.0},{id:"4-8",ru:"4–8",en:"4–8",mult:1.5},{id:"9+",ru:"9+",en:"9+",mult:2.1}] },
      { id:"req_format", ru:"Формат требований", en:"Requirements format", options:[{id:"brd",ru:"BRD",en:"BRD",mult:1.0},{id:"stories",ru:"User Stories",en:"User Stories",mult:1.1},{id:"usecases",ru:"Use Cases",en:"Use Cases",mult:1.25}] },
      { id:"stakeholders_br", ru:"Интервью", en:"Interviews", options:[{id:"none",ru:"Не нужны",en:"Not needed",mult:1.0},{id:"few",ru:"2–4",en:"2–4",mult:1.2},{id:"many",ru:"5+",en:"5+",mult:1.5}] },
    ],
    complexity: [
      { id:"req_clarity", ru:"Определённость требований", en:"Requirements clarity", options:[{id:"clear",ru:"Чёткое ТЗ",en:"Clear",mult:1.0},{id:"partial",ru:"Частичное",en:"Partial",mult:1.3},{id:"vague",ru:"Размытое",en:"Vague",mult:1.7}] },
      { id:"priorities", ru:"Приоритизация (MoSCoW)", en:"Prioritisation (MoSCoW)", options:[{id:"no",ru:"Нет",en:"No",mult:1.0},{id:"yes",ru:"Да",en:"Yes",mult:1.2}] },
      { id:"compliance_br", ru:"Комплаенс", en:"Compliance", options:[{id:"none",ru:"Нет",en:"None",mult:1.0},{id:"yes",ru:"Есть",en:"Present",mult:1.35}] },
    ],
  },
  projdoc: {
    volume: [
      { id:"doc_type", ru:"Тип документации", en:"Doc type", options:[{id:"user",ru:"Пользовательская",en:"User",mult:1.0},{id:"tech",ru:"Техническая",en:"Technical",mult:1.2},{id:"mgmt",ru:"Управленческая",en:"Management",mult:1.1}] },
      { id:"sections", ru:"Объём", en:"Volume", options:[{id:"small",ru:"До 15 стр.",en:"Up to 15p",mult:1.0},{id:"med",ru:"15–40 стр.",en:"15–40p",mult:1.5},{id:"large",ru:"40+",en:"40+",mult:2.1}] },
      { id:"support", ru:"Поддержка после сдачи", en:"Post-delivery support", options:[{id:"no",ru:"Нет",en:"No",mult:1.0},{id:"yes",ru:"Да",en:"Yes",mult:1.3}] },
    ],
    complexity: [
      { id:"domain_depth", ru:"Погружение в тему", en:"Domain immersion", options:[{id:"known",ru:"Знакомая",en:"Known",mult:1.0},{id:"partial",ru:"Частичное",en:"Partial",mult:1.2},{id:"deep",ru:"С нуля",en:"From scratch",mult:1.6}] },
      { id:"diagrams", ru:"Схемы и диаграммы", en:"Diagrams", options:[{id:"no",ru:"Нет",en:"No",mult:1.0},{id:"yes",ru:"Да",en:"Yes",mult:1.3}] },
      { id:"formats_count", ru:"Форматы публикации", en:"Publication formats", options:[{id:"1",ru:"1 (Word/PDF)",en:"1 (Word/PDF)",mult:1.0},{id:"2",ru:"2",en:"2",mult:1.2},{id:"3+",ru:"3+ (Confluence и др.)",en:"3+ (Confluence etc.)",mult:1.4}] },
    ],
  },
};

export const UNIVERSAL: Criterion[] = [
  { id:"client_type", ru:"Масштаб компании", en:"Company scale", options:[{id:"startup",ru:"Стартап",en:"Startup",mult:1.1},{id:"smb",ru:"МСБ",en:"SMB",mult:1.0},{id:"corp",ru:"Корпорация",en:"Enterprise",mult:1.3}] },
  { id:"data_clarity", ru:"Прозрачность данных", en:"Data transparency", options:[{id:"clear",ru:"Открыты / структурированы",en:"Open / structured",mult:1.0},{id:"messy",ru:"Закрыты / хаотичны",en:"Closed / chaotic",mult:1.4}] },
  { id:"lpr_count", ru:"Количество ЛПР", en:"Decision-makers", options:[{id:"1",ru:"1",en:"1",mult:1.0},{id:"2-3",ru:"2–3",en:"2–3",mult:1.2},{id:"4+",ru:"4+",en:"4+",mult:1.4}] },
  { id:"task_clarity", ru:"Определённость задачи", en:"Task clarity", options:[{id:"clear",ru:"Чёткое ТЗ",en:"Clear brief",mult:1.0},{id:"partial",ru:"Частичное",en:"Partial",mult:1.2},{id:"vague",ru:"Размытый запрос",en:"Vague",mult:1.5}] },
  { id:"lang_out", ru:"Язык результата", en:"Output language", options:[{id:"one",ru:"Один язык",en:"Single",mult:1.0},{id:"bilingual",ru:"Двуязычный RU+EN",en:"Bilingual RU+EN",mult:1.3}] },
  { id:"revisions", ru:"Итерации правок", en:"Revision rounds", options:[{id:"1",ru:"1",en:"1",mult:1.0},{id:"2",ru:"2",en:"2",mult:1.2},{id:"3+",ru:"3+",en:"3+",mult:1.45}] },
];

export const URGENCY_DATA = [
  { id:"normal",  ru:"Стандартная", en:"Standard",    descRu:"3–7 рабочих дней", descEn:"3–7 business days", mult:1.0, tone:"info" as const },
  { id:"fast",    ru:"Ускоренная",  en:"Accelerated", descRu:"1–3 рабочих дня",  descEn:"1–3 business days", mult:1.3, tone:"warning" as const },
  { id:"express", ru:"Экспресс",    en:"Express",     descRu:"До 24 часов",       descEn:"Within 24 hours",   mult:1.7, tone:"destructive" as const },
];

export type PricingModelId = "tm" | "fixed" | "value" | "retainer";

export const PRICING_MODELS: {
  id: PricingModelId;
  ru: string; en: string;
  descRu: string; descEn: string;
  icon: string;
  /** multiplier applied to final cost range */
  mult: number;
}[] = [
  { id:"tm",       ru:"Time & Materials", en:"Time & Materials", descRu:"Почасовая оплата фактического времени", descEn:"Hourly billing of actual time",       icon:"⏱", mult:1.0 },
  { id:"fixed",    ru:"Fixed Price",      en:"Fixed Price",      descRu:"Фикс с риск-коэффициентом +15%",        descEn:"Fixed with +15% risk premium",         icon:"⊞", mult:1.15 },
  { id:"value",    ru:"Value-Based",      en:"Value-Based",      descRu:"Привязка к результату клиента (+25%)",  descEn:"Linked to client outcome (+25%)",      icon:"◆", mult:1.25 },
  { id:"retainer", ru:"Retainer",         en:"Retainer",         descRu:"Ежемесячный абонемент (-10%)",          descEn:"Monthly retainer (-10%)",              icon:"↻", mult:0.9 },
];

export const FORMAT_DATA = [
  { id:"online",   ru:"Онлайн",            en:"Online",            icon:"⊙", mult:1.0 },
  { id:"offline",  ru:"Офлайн / выезд",    en:"Offline / On-site", icon:"⊕", mult:1.2 },
  { id:"document", ru:"Документ / отчёт",  en:"Document / Report", icon:"⊞", mult:0.9 },
];

export const I18N = {
  ru: {
    badge: "Калькулятор консультанта",
    title: "Оценка стоимости работ",
    subtitle: "Бизнес-анализ · Консалтинг · Экспертиза",
    step: (n: number, tot: number) => `Шаг ${n} из ${tot}`,
    next: "Далее", back: "Назад", calculate: "Рассчитать", recalculate: "← Новый расчёт",
    resultBadge: "Результат оценки", resultTitle: "Смета готова",
    estimatedCost: "Итоговая стоимость", hours: "Часов", ratePerHour: "Ставка / час", multiplier: "Коэф.",
    disclaimer: "⚑ Оценка является ориентировочной. Итоговая стоимость фиксируется в договоре. НДС не включён.",
    stepLabels: ["Тип","Объём","Сложность","Параметры","Срочность","Формат","Риски"],
    stepTitles: [
      "Какой тип работы вас интересует?",
      "Критерии объёма работ",
      "Критерии сложности",
      "Общие параметры проекта",
      "Срочность выполнения",
      "Формат выполнения работ",
      "Дополнительные параметры и риски",
    ],
    volumeSection: "Объём работ", complexitySection: "Сложность", universalSection: "Параметры",
    modTitle: "Настройки расчёта",
    riskBuf: "Риск-буфер", overhead: "Накладные расходы",
    minThreshold: "Минимальный порог (€)",
    clientProfile: "Профиль клиента", industry: "Отрасль клиента",
    currency: "Валюта", rateRange: "Ставка (€/час)",
    phaseBreakdown: "Разбивка по фазам",
    phases: ["Анализ / погружение","Разработка / выполнение","Презентация / сдача","Правки / итерации"],
    phasesPct: [20,55,15,10],
    scenarioCompare: "Сравнение сценариев",
    scenario1: "Текущий расчёт", scenario2: "Без срочности", scenario3: "Минимальный",
    history: "История расчётов", clearHistory: "Очистить", historyEmpty: "История пуста",
    clientCard: "Карточка для клиента", copyCard: "Скопировать КП", copied: "Скопировано!",
    aiComment: "Анализ сметы",
    pricingModel: "Модель ценообразования",
    pricingModelHelp: "Выберите, как будете тарифицировать проект",
    exportPdf: "Экспорт в PDF",
    aiLoading: "Анализирую смету…",
    aiRefresh: "Обновить анализ",
    aiPoweredBy: "Анализ выполнен Lovable AI",
    perMonth: "/мес",
    riskLevels: [
      { id:"0",  label:"Без буфера", pct:0 },
      { id:"10", label:"+10% буфер", pct:10 },
      { id:"20", label:"+20% буфер", pct:20 },
      { id:"30", label:"+30% буфер", pct:30 },
    ],
    overheadLevels: [
      { id:"0",  label:"Без накладных", pct:0 },
      { id:"15", label:"+15% (стандарт)", pct:15 },
      { id:"20", label:"+20% (сложный клиент)", pct:20 },
    ],
    clientTypes: [
      { id:"new",       label:"Новый клиент",       mult:1.0 },
      { id:"returning", label:"Постоянный (-10%)",  mult:0.9 },
    ],
    industries: [
      { id:"known",   label:"Знакомая отрасль",   mult:1.0 },
      { id:"partial", label:"Частично знакома",   mult:1.15 },
      { id:"new",     label:"Новая отрасль",      mult:1.3 },
    ],
    currencies: [
      { id:"EUR", sym:"€", rate:1 },
      { id:"USD", sym:"$", rate:1.08 },
      { id:"RUB", sym:"₽", rate:100 },
    ],
  },
  en: {
    badge: "Consultant Calculator",
    title: "Project Cost Estimator",
    subtitle: "Business Analysis · Consulting · Expertise",
    step: (n: number, tot: number) => `Step ${n} of ${tot}`,
    next: "Next", back: "Back", calculate: "Calculate", recalculate: "← New estimate",
    resultBadge: "Estimation Result", resultTitle: "Your Quote is Ready",
    estimatedCost: "Total cost", hours: "Hours", ratePerHour: "Rate / hr", multiplier: "Coeff.",
    disclaimer: "⚑ This estimate is indicative. The final price is fixed in the contract. VAT not included.",
    stepLabels: ["Type","Scope","Complexity","Params","Urgency","Format","Risks"],
    stepTitles: [
      "What type of work do you need?",
      "Scope criteria",
      "Complexity criteria",
      "General project parameters",
      "How urgent is the request?",
      "Preferred work format",
      "Additional parameters & risks",
    ],
    volumeSection: "Scope", complexitySection: "Complexity", universalSection: "Parameters",
    modTitle: "Calculation settings",
    riskBuf: "Risk buffer", overhead: "Overhead costs",
    minThreshold: "Minimum threshold (€)",
    clientProfile: "Client profile", industry: "Client industry",
    currency: "Currency", rateRange: "Rate (€/hr)",
    phaseBreakdown: "Phase breakdown",
    phases: ["Analysis / discovery","Development / delivery","Presentation / handover","Revisions"],
    phasesPct: [20,55,15,10],
    scenarioCompare: "Scenario comparison",
    scenario1: "Current estimate", scenario2: "Without urgency", scenario3: "Minimum",
    history: "Calculation history", clearHistory: "Clear", historyEmpty: "No history yet",
    clientCard: "Client proposal card", copyCard: "Copy proposal", copied: "Copied!",
    aiComment: "Estimate analysis",
    pricingModel: "Pricing model",
    pricingModelHelp: "Choose how the project will be billed",
    exportPdf: "Export as PDF",
    aiLoading: "Analyzing the estimate…",
    aiRefresh: "Refresh analysis",
    aiPoweredBy: "Analysis powered by Lovable AI",
    perMonth: "/mo",
    riskLevels: [
      { id:"0",  label:"No buffer", pct:0 },
      { id:"10", label:"+10% buffer", pct:10 },
      { id:"20", label:"+20% buffer", pct:20 },
      { id:"30", label:"+30% buffer", pct:30 },
    ],
    overheadLevels: [
      { id:"0",  label:"No overhead", pct:0 },
      { id:"15", label:"+15% (standard)", pct:15 },
      { id:"20", label:"+20% (complex client)", pct:20 },
    ],
    clientTypes: [
      { id:"new",       label:"New client",            mult:1.0 },
      { id:"returning", label:"Returning (-10%)",      mult:0.9 },
    ],
    industries: [
      { id:"known",   label:"Known industry",     mult:1.0 },
      { id:"partial", label:"Partially known",    mult:1.15 },
      { id:"new",     label:"New industry",       mult:1.3 },
    ],
    currencies: [
      { id:"EUR", sym:"€", rate:1 },
      { id:"USD", sym:"$", rate:1.08 },
      { id:"RUB", sym:"₽", rate:100 },
    ],
  },
} as const;

export type Currency = "EUR" | "USD" | "RUB";

export type WorkTypeDetails = {
  process: string[];
  deliverables: string[];
  resources: string[];
  notes?: string;
};

export const WORK_TYPE_DETAILS: Record<string, { ru: WorkTypeDetails; en: WorkTypeDetails }> = {
  analysis: {
    ru: {
      process: [
        "Сбор вводных и интервью со стейкхолдерами",
        "Описание AS-IS: схемы, роли, метрики, узкие места",
        "Проектирование TO-BE и плана перехода",
        "Презентация результатов и согласование",
      ],
      deliverables: ["BPMN/диаграммы процессов", "Карта узких мест и рисков", "Рекомендации TO-BE"],
      resources: ["Бизнес-аналитик", "Доступ к стейкхолдерам (2–6 ч интервью)", "Miro / Visio / Bizagi"],
      notes: "Глубина зависит от количества процессов, систем и уровня вложенности.",
    },
    en: {
      process: [
        "Kick-off and stakeholder interviews",
        "AS-IS mapping: flows, roles, KPIs, bottlenecks",
        "TO-BE design and transition plan",
        "Presentation and sign-off",
      ],
      deliverables: ["BPMN/process diagrams", "Bottleneck & risk map", "TO-BE recommendations"],
      resources: ["Business analyst", "Stakeholder access (2–6h interviews)", "Miro / Visio / Bizagi"],
      notes: "Depth scales with process count, systems and nesting level.",
    },
  },
  docs: {
    ru: {
      process: [
        "Анализ исходных материалов и шаблонов",
        "Структурирование и написание разделов",
        "Сбор обратной связи и итерации",
        "Финальное оформление и сдача",
      ],
      deliverables: ["Готовый регламент / политика / СОП", "Шаблоны и приложения", "Журнал версий"],
      resources: ["Бизнес-аналитик / технический писатель", "Эксперт предметной области для ревью", "Корпоративные шаблоны"],
      notes: "При юридическом ревью добавляется время юриста и согласующих сторон.",
    },
    en: {
      process: [
        "Review of source materials and templates",
        "Outlining and drafting sections",
        "Feedback rounds and iterations",
        "Final formatting and delivery",
      ],
      deliverables: ["Ready regulation / policy / SOP", "Templates and appendices", "Version log"],
      resources: ["Business analyst / tech writer", "Subject matter expert for review", "Corporate templates"],
      notes: "Legal review adds lawyer and approver time.",
    },
  },
  consulting: {
    ru: {
      process: [
        "Подготовка повестки и материалов",
        "Проведение сессии / консультации",
        "Фасилитация решений",
        "Краткий или полный отчёт по итогам",
      ],
      deliverables: ["Протокол решений", "Презентация / слайды", "Чек-лист следующих шагов"],
      resources: ["Эксперт-консультант", "Фасилитатор (для групп 5+)", "Miro / Zoom / переговорная"],
      notes: "Стоимость растёт с числом участников, форматом и уровнем конфликта интересов.",
    },
    en: {
      process: [
        "Agenda and materials prep",
        "Run the session / consultation",
        "Decision facilitation",
        "Brief or full follow-up report",
      ],
      deliverables: ["Decisions log", "Slide deck", "Next-steps checklist"],
      resources: ["Expert consultant", "Facilitator (for 5+ groups)", "Miro / Zoom / meeting room"],
      notes: "Cost scales with participants, format and conflict level.",
    },
  },
  automation: {
    ru: {
      process: [
        "Сбор требований и описание сценариев",
        "Постановка задачи: ТЗ, прототипы, ролевая модель",
        "Контроль реализации подрядчиком",
        "Приёмка, тестирование и сдача",
      ],
      deliverables: ["Техническое задание", "Схемы интеграций", "Чек-лист приёмки"],
      resources: ["Бизнес-аналитик / системный аналитик", "Доступ к смежным системам и владельцам", "Figma / Draw.io / Jira"],
      notes: "Legacy-системы и кастомизация существенно увеличивают трудоёмкость.",
    },
    en: {
      process: [
        "Requirements gathering and scenarios",
        "Task definition: spec, prototypes, role model",
        "Vendor delivery oversight",
        "Acceptance, testing and handover",
      ],
      deliverables: ["Technical specification", "Integration diagrams", "Acceptance checklist"],
      resources: ["Business / systems analyst", "Access to adjacent systems and owners", "Figma / Draw.io / Jira"],
      notes: "Legacy systems and customisation significantly increase effort.",
    },
  },
  audit: {
    ru: {
      process: [
        "Запрос и анализ документации и данных",
        "Полевые интервью и наблюдение",
        "Бенчмарк и оценка по критериям",
        "Отчёт с выводами и рекомендациями",
      ],
      deliverables: ["Отчёт аудита", "Карта рисков и несоответствий", "План корректирующих действий"],
      resources: ["Эксперт-аудитор", "Доступ к данным и сотрудникам", "Чек-листы / методология"],
      notes: "Закрытые данные и конфликт интересов увеличивают сроки.",
    },
    en: {
      process: [
        "Document and data request & review",
        "Field interviews and observation",
        "Benchmark and scoring",
        "Findings and recommendations report",
      ],
      deliverables: ["Audit report", "Risk & gap map", "Remediation plan"],
      resources: ["Expert auditor", "Access to data and staff", "Checklists / methodology"],
      notes: "Closed data and conflicts of interest extend timelines.",
    },
  },
  training: {
    ru: {
      process: [
        "Анализ уровня аудитории и целей обучения",
        "Подготовка программы и материалов",
        "Проведение модулей / воркшопов",
        "Оценка знаний и обратная связь",
      ],
      deliverables: ["Программа курса", "Слайды и раздаточные материалы", "Тесты / сертификаты"],
      resources: ["Тренер-эксперт", "Платформа (Zoom / LMS) или аудитория", "Кейсы и упражнения"],
      notes: "Корпоративная адаптация и симуляции повышают стоимость.",
    },
    en: {
      process: [
        "Audience level and learning goals analysis",
        "Program and materials prep",
        "Module / workshop delivery",
        "Assessment and feedback",
      ],
      deliverables: ["Course program", "Slides and handouts", "Tests / certificates"],
      resources: ["Expert trainer", "Platform (Zoom / LMS) or venue", "Cases and exercises"],
      notes: "Corporate customisation and simulations raise the cost.",
    },
  },
  market: {
    ru: {
      process: [
        "Сегментирование и описание рынка",
        "Анализ конкурентов и трендов",
        "Сбор данных (open / paid / first-party)",
        "Визуализация выводов и презентация",
      ],
      deliverables: ["Аналитический отчёт", "Карта конкурентов", "Дашборд / графики"],
      resources: ["Маркет-аналитик", "Подписки на базы данных (Statista, SimilarWeb и т.п.)", "Tableau / Power BI"],
      notes: "Первичные исследования и глобальный охват существенно увеличивают сроки.",
    },
    en: {
      process: [
        "Market segmentation and definition",
        "Competitor and trend analysis",
        "Data collection (open / paid / first-party)",
        "Visualisation and presentation",
      ],
      deliverables: ["Analytical report", "Competitor map", "Dashboard / charts"],
      resources: ["Market analyst", "Database subscriptions (Statista, SimilarWeb, etc.)", "Tableau / Power BI"],
      notes: "Primary research and global scope significantly extend timelines.",
    },
  },
  forecast: {
    ru: {
      process: [
        "Сбор исторических данных и драйверов",
        "Выбор методологии (экспертная / эконометрика)",
        "Построение сценариев и финансовой модели",
        "Стресс-тест и презентация",
      ],
      deliverables: ["Финансовая модель в Excel/Sheets", "Сценарии (базовый, оптимист, пессимист)", "Отчёт с допущениями"],
      resources: ["Аналитик / финансовый моделист", "Доступ к историческим данным", "Excel / Python / R"],
      notes: "Длинный горизонт и высокая волатильность увеличивают сложность.",
    },
    en: {
      process: [
        "Historical data and drivers collection",
        "Methodology selection (expert / econometrics)",
        "Scenarios and financial model build",
        "Stress test and presentation",
      ],
      deliverables: ["Excel/Sheets financial model", "Scenarios (base, upside, downside)", "Report with assumptions"],
      resources: ["Analyst / financial modeler", "Access to historical data", "Excel / Python / R"],
      notes: "Long horizon and high volatility raise complexity.",
    },
  },
  idea: {
    ru: {
      process: [
        "Структурирование концепции и гипотез",
        "Оценка рынка (TAM/SAM/SOM) и юнит-экономики",
        "CustDev / первичные интервью",
        "Финальная оценка рисков и потенциала",
      ],
      deliverables: ["Бизнес-кейс / one-pager", "Карта рисков", "Рекомендация go / no-go"],
      resources: ["Бизнес-аналитик / продуктовый эксперт", "Респонденты для CustDev", "Источники рынка"],
      notes: "Новые рынки и регуляторные риски требуют дополнительной экспертизы.",
    },
    en: {
      process: [
        "Concept and hypotheses structuring",
        "Market sizing (TAM/SAM/SOM) and unit economics",
        "CustDev / primary interviews",
        "Final risk and potential assessment",
      ],
      deliverables: ["Business case / one-pager", "Risk map", "Go / no-go recommendation"],
      resources: ["Business / product analyst", "CustDev respondents", "Market data sources"],
      notes: "New markets and regulatory risks require extra expertise.",
    },
  },
  tech: {
    ru: {
      process: [
        "Определение критериев выбора",
        "Long-list инструментов и платформ",
        "Матрица сравнения и short-list",
        "PoC и рекомендации по внедрению",
      ],
      deliverables: ["Сравнительная матрица", "Отчёт с обоснованием", "Roadmap внедрения"],
      resources: ["Технологический аналитик", "Демо-доступы / триалы", "Эксперт по предметной области"],
      notes: "PoC и нишевые решения добавляют значительное время.",
    },
    en: {
      process: [
        "Selection criteria definition",
        "Long-list of tools and platforms",
        "Comparison matrix and short-list",
        "PoC and implementation recommendations",
      ],
      deliverables: ["Comparison matrix", "Justification report", "Implementation roadmap"],
      resources: ["Tech analyst", "Demo access / trials", "Domain expert"],
      notes: "PoC and niche tools add significant time.",
    },
  },
  bizreq: {
    ru: {
      process: [
        "Интервью с заказчиками и пользователями",
        "Формализация требований (BRD / User Stories / Use Cases)",
        "Приоритизация (MoSCoW) и согласование",
        "Поддержка изменений и трассировка",
      ],
      deliverables: ["Документ требований", "Матрица трассировки", "Backlog с приоритетами"],
      resources: ["Бизнес-аналитик", "Доступ к ЛПР и пользователям", "Jira / Confluence"],
      notes: "Размытые требования и комплаенс увеличивают трудоёмкость.",
    },
    en: {
      process: [
        "Stakeholder and user interviews",
        "Requirements formalisation (BRD / User Stories / Use Cases)",
        "Prioritisation (MoSCoW) and sign-off",
        "Change support and traceability",
      ],
      deliverables: ["Requirements document", "Traceability matrix", "Prioritised backlog"],
      resources: ["Business analyst", "Access to decision-makers and users", "Jira / Confluence"],
      notes: "Vague requirements and compliance increase effort.",
    },
  },
  projdoc: {
    ru: {
      process: [
        "Определение типа и аудитории документа",
        "Структура и шаблоны",
        "Написание разделов и схем",
        "Публикация в нужных форматах",
      ],
      deliverables: ["Готовая документация (PDF/Word/Confluence)", "Диаграммы и схемы", "Гайды для пользователей"],
      resources: ["Технический писатель / аналитик", "Доступ к экспертам и системам", "Confluence / Notion / Word"],
      notes: "Несколько форматов публикации и поддержка после сдачи учитываются отдельно.",
    },
    en: {
      process: [
        "Document type and audience definition",
        "Structure and templates",
        "Sections and diagrams authoring",
        "Publishing in required formats",
      ],
      deliverables: ["Ready documentation (PDF/Word/Confluence)", "Diagrams and schemes", "User guides"],
      resources: ["Tech writer / analyst", "Access to experts and systems", "Confluence / Notion / Word"],
      notes: "Multiple publication formats and post-delivery support are billed separately.",
    },
  },
};

export const DETAILS_I18N = {
  ru: {
    moreInfo: "Подробнее",
    process: "Процесс работы",
    deliverables: "Что получите",
    resources: "Ресурсы",
    notes: "Важно",
  },
  en: {
    moreInfo: "Details",
    process: "Process",
    deliverables: "Deliverables",
    resources: "Resources",
    notes: "Note",
  },
} as const;

/* ============ RESOURCE ROLES (team mix) ============ */
export type Role = {
  id: string;
  ru: string;
  en: string;
  /** default hourly rate, €/h */
  rate: number;
  /** default share of project hours, % (sums ≈ 100) */
  defaultShare: number;
  icon: string;
};

export const RESOURCE_ROLES: Role[] = [
  { id: "analyst", ru: "Бизнес-аналитик",   en: "Business analyst",  rate: 55, defaultShare: 40, icon: "◈" },
  { id: "senior",  ru: "Senior эксперт",    en: "Senior expert",     rate: 95, defaultShare: 20, icon: "◆" },
  { id: "pm",      ru: "Project Manager",   en: "Project Manager",   rate: 65, defaultShare: 15, icon: "◎" },
  { id: "writer",  ru: "Тех. писатель",     en: "Tech writer",       rate: 45, defaultShare: 15, icon: "⊟" },
  { id: "junior",  ru: "Junior / стажёр",   en: "Junior / intern",   rate: 30, defaultShare: 10, icon: "◯" },
];

/* ============ PROJECT TEMPLATES (presets) ============ */
export type ProjectTemplate = {
  id: string;
  ru: string; en: string;
  descRu: string; descEn: string;
  icon: string;
  wtId: string;
  volumeAns: Record<string, string>;
  complexAns: Record<string, string>;
  univAns: Record<string, string>;
  urgency: string;
  format: string;
  pricingModel?: PricingModelId;
  riskBuf?: string;
  overhead?: string;
};

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "startup_idea",
    ru: "Стартап: оценка бизнес-идеи", en: "Startup: idea check",
    descRu: "Концепция + TAM/SAM + unit-эк.", descEn: "Concept + TAM/SAM + unit econ",
    icon: "◇",
    wtId: "idea",
    volumeAns: { concepts: "1", tam: "yes", unit_econ: "yes" },
    complexAns: { innovation: "new", custdev: "no", regulatory: "none" },
    univAns: { client_type: "startup", data_clarity: "messy", lpr_count: "1", task_clarity: "partial", lang_out: "one", revisions: "2" },
    urgency: "fast", format: "document",
    pricingModel: "fixed", riskBuf: "20", overhead: "15",
  },
  {
    id: "smb_processes",
    ru: "МСБ: описание процессов AS-IS/TO-BE", en: "SMB: AS-IS/TO-BE mapping",
    descRu: "4–8 процессов, BPMN, интервью", descEn: "4–8 processes, BPMN, interviews",
    icon: "◈",
    wtId: "analysis",
    volumeAns: { proc_count: "4-8", viz: "yes", interviews: "few" },
    complexAns: { nesting: "med", automation_level: "partial", systems: "2-3" },
    univAns: { client_type: "smb", data_clarity: "clear", lpr_count: "2-3", task_clarity: "clear", lang_out: "one", revisions: "2" },
    urgency: "normal", format: "document",
    pricingModel: "fixed", riskBuf: "10", overhead: "15",
  },
  {
    id: "corp_regulations",
    ru: "Корпорация: регламенты", en: "Enterprise: regulations",
    descRu: "3–6 документов, 30+ стр., NDA", descEn: "3–6 docs, 30+ pages, NDA",
    icon: "◉",
    wtId: "docs",
    volumeAns: { doc_count: "3-6", volume_pages: "long", approvals: "4+" },
    complexAns: { standard: "no", legal: "yes", sensitivity: "secret" },
    univAns: { client_type: "corp", data_clarity: "clear", lpr_count: "4+", task_clarity: "clear", lang_out: "one", revisions: "3+" },
    urgency: "normal", format: "document",
    pricingModel: "tm", riskBuf: "20", overhead: "20",
  },
  {
    id: "automation_spec",
    ru: "Автоматизация: ТЗ + интеграции", en: "Automation: spec + integrations",
    descRu: "3–5 систем, ролевая модель, приёмка", descEn: "3–5 systems, roles, acceptance",
    icon: "⬡",
    wtId: "automation",
    volumeAns: { integrations: "3-5", prototype: "no", acceptance: "yes" },
    complexAns: { legacy: "yes", custom: "partial", roles: "med" },
    univAns: { client_type: "corp", data_clarity: "messy", lpr_count: "2-3", task_clarity: "partial", lang_out: "one", revisions: "2" },
    urgency: "normal", format: "document",
    pricingModel: "tm", riskBuf: "30", overhead: "15",
  },
  {
    id: "market_research",
    ru: "Исследование рынка", en: "Market research",
    descRu: "Страна, 4–8 конкурентов, отчёт", descEn: "National, 4–8 competitors, report",
    icon: "◭",
    wtId: "market",
    volumeAns: { geo: "national", competitors: "4-8", viz_market: "yes" },
    complexAns: { data_sources: "paid", market_maturity: "forming", segments: "3-4" },
    univAns: { client_type: "smb", data_clarity: "clear", lpr_count: "1", task_clarity: "clear", lang_out: "bilingual", revisions: "2" },
    urgency: "normal", format: "document",
    pricingModel: "fixed", riskBuf: "10", overhead: "15",
  },
  {
    id: "retainer_consulting",
    ru: "Консалтинг по подписке", en: "Retainer consulting",
    descRu: "Регулярные сессии, отчёты, поддержка", descEn: "Regular sessions, reports, support",
    icon: "↻",
    wtId: "consulting",
    volumeAns: { participants: "3-6", prep_materials: "yes", report: "short" },
    complexAns: { audience: "mgmt", conflict: "low", decision: "yes" },
    univAns: { client_type: "smb", data_clarity: "clear", lpr_count: "2-3", task_clarity: "clear", lang_out: "one", revisions: "1" },
    urgency: "normal", format: "online",
    pricingModel: "retainer", riskBuf: "10", overhead: "15",
  },
];

