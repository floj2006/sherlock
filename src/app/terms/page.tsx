import { PageIntro } from "@/components/layout/page-intro";
import { Container } from "@/components/ui/container";
import { createMetadata } from "@/lib/seo";
import { business } from "@/lib/site-data";

export const metadata = createMetadata({ title: "Условия записи", description: "Выбор услуги, подтверждение, перенос и отмена визита в SHERLOCK.", path: "/terms" });
export default function TermsPage() {
  return <>
    <PageIntro eyebrow="Документы" title="Условия записи" description="Что проверить перед подтверждением и как изменить время визита." />
    <section className="py-12 sm:py-16"><Container><article className="max-w-3xl space-y-8 text-sm leading-7 text-muted">
      <section><h2 className="text-xl text-cream">Подтверждение визита</h2><p className="mt-3">Выбор услуги и времени ещё не означает, что запись оформлена. Проверьте мастера, дату, время и стоимость, заполните контакты и нажмите «Подтвердить запись». Визит оформлен, когда на сайте появится сообщение «Вы записаны» с номером записи. Если подтверждение не получено, проверьте результат кнопкой в форме или позвоните нам перед повторной попыткой.</p></section>
      <section><h2 className="text-xl text-cream">Стоимость и акции</h2><p className="mt-3">Цены и длительность указаны в каталоге. Для позиций со стоимостью «от» итог зависит от объёма работы: уточните его до начала услуги. Предложения для первого визита применяются при первом посещении; возможность применения проверьте при записи.</p></section>
      <section><h2 className="text-xl text-cream">Перенос и отмена</h2><p className="mt-3">Если планы изменились, используйте ссылку из подтверждения записи, если она доступна, или позвоните через нашу карточку: <a className="text-metal-soft underline" href={business.mapUrl}>Контакты на Яндекс Картах</a>. Сообщите об отмене или опоздании заранее.</p></section>
    </article></Container></section>
  </>;
}
