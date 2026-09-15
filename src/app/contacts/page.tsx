import { PageIntro } from "@/components/layout/page-intro";
import { ContactsMap } from "@/components/sections/contacts-map";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Контакты",
  description:
    "Контакты SHERLOCK в Мурино: адрес, телефон, Telegram, карта и быстрый переход к записи.",
  path: "/contacts",
});

export default function ContactsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Контакты"
        title="До визита осталось выбрать маршрут."
        description="Адрес, карта, звонок, Telegram и онлайн-запись — всё рядом, без лишних переходов и ожидания."
      />
      <ContactsMap />
    </>
  );
}
