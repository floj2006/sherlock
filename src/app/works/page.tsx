import { PageIntro } from "@/components/layout/page-intro";
import { WorksShowcase } from "@/components/sections/works-showcase";
import { createMetadata } from "@/lib/seo";
export const metadata = createMetadata({title:"Работы",description:"Кейсы SHERLOCK: мужские стрижки, окрашивание и текстура. Фото до и после, ракурсы и подробный разбор работы.",path:"/works"});
export default function WorksPage() {
  return <><PageIntro eyebrow="SHERLOCK / Портфолио" title="Характер. В каждой работе." description="Реальные образы наших гостей. Рассмотрите результат в деталях: фотографии можно открыть в полном размере." /><WorksShowcase limit={null} /></>;
}
