import { PageIntro } from "@/components/layout/page-intro";
import { Container } from "@/components/ui/container";

export default function TermsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Terms"
        title="Условия использования."
        description="Коротко о правилах сайта, онлайн-записи и коммуникации перед визитом в SHERLOCK."
      />
      <section className="py-12 sm:py-16">
        <Container>
          <article className="section-frame space-y-5 p-6 text-sm leading-7 text-muted sm:p-8">
            <p>
              Сайт помогает выбрать услугу, мастера, посмотреть реальные работы
              и перейти к записи. Информация о ценах, длительности услуг и
              свободном времени может уточняться в системе записи или при
              подтверждении визита.
            </p>
            <p>
              Если планы изменились, лучше перенести или отменить запись
              заранее: так мастер сохранит рабочий ритм, а вы сможете выбрать
              другое удобное окно без спешки.
            </p>
            <p>
              Спецпредложения действуют в указанные на сайте сроки и могут
              зависеть от выбранной услуги, мастера или свободного времени в
              расписании.
            </p>
          </article>
        </Container>
      </section>
    </>
  );
}
