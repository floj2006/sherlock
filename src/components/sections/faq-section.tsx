import { Container } from "@/components/ui/container";
import { faq } from "@/lib/faq";
export function FaqSection() {
  return <section className="py-12 sm:py-20"><Container>
    <h2 className="font-display text-3xl text-cream sm:text-4xl">Перед визитом</h2>
    <div className="mt-8 divide-y divide-line border-y border-line">
      {faq.map((item) => <details key={item.question} className="group py-5">
        <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-5 text-base font-medium text-cream">
          {item.question}<span aria-hidden="true" className="text-xl text-metal group-open:rotate-45">+</span>
        </summary>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{item.answer}</p>
      </details>)}
    </div>
  </Container></section>;
}
