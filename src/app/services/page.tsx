import { PageIntro } from "@/components/layout/page-intro";
import { Container } from "@/components/ui/container";
import { ServiceCatalog } from "@/components/services/service-catalog";
import { createMetadata } from "@/lib/seo";
export const metadata = createMetadata({ title:"Услуги и цены", description:"Мужские стрижки, борода, уход и окрашивание в SHERLOCK. Стоимость, продолжительность и онлайн-запись.", path:"/services" });
export default function ServicesPage() {
  return <><PageIntro eyebrow="SHERLOCK / Услуги" title="Искусство быть собой." description="Стрижка, борода, уход и цвет. Выберите то, что нужно вашему образу — мы позаботимся о деталях." /><section className="catalog-section"><Container><ServiceCatalog /></Container></section></>;
}
