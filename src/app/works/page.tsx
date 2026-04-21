import { PageIntro } from "@/components/layout/page-intro";
import { WorksShowcase } from "@/components/sections/works-showcase";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Работы",
  description:
    "Кейсы SHERLOCK: реальные задачи клиентов, аккуратная форма и примеры мужских стрижек без лишнего визуального шума.",
  path: "/works",
});

export default function WorksPage() {
  return (
    <>
      <PageIntro
        eyebrow="Работы"
        title="Каждая работа начинается с задачи, а не с длины."
        description="Здесь собраны реальные кейсы SHERLOCK: форма, цвет, борода и текстура, подобранные под человека, его ритм и то, как результат будет жить после визита."
      />
      <WorksShowcase collapsible={false} limit={null} />
    </>
  );
}
