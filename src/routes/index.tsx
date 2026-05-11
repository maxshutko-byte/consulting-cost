import { createFileRoute } from "@tanstack/react-router";
import Calculator from "@/components/calculator/Calculator";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Калькулятор консультанта — оценка стоимости работ" },
      {
        name: "description",
        content:
          "Профессиональный калькулятор для оценки бизнес-анализа, консалтинга и экспертизы. 7 шагов, разбивка по фазам, сценарии и КП в один клик.",
      },
      { property: "og:title", content: "Калькулятор консультанта" },
      { property: "og:description", content: "Оценка стоимости консалтинговых работ за 7 шагов." },
    ],
  }),
  component: IndexPage,
});

function IndexPage() {
  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-60" aria-hidden />
      <div className="pointer-events-none fixed inset-x-0 top-[-30%] h-[800px] bg-radial-glow" aria-hidden />
      <div className="relative z-10 px-4 py-6 sm:py-12 sm:px-6">
        <Calculator />
      </div>
    </main>
  );
}
