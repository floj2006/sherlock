import { Container } from "@/components/ui/container";
export function PageIntro({ eyebrow, title, description, caption }: {
  eyebrow: string; title: string; description: string; caption?: string;
}) {
  return <section className="page-intro"><Container>
    <p className="eyebrow">{eyebrow}</p><h1>{title}</h1>
    <p className="intro-description">{description}</p>{caption ? <p className="intro-caption">{caption}</p> : null}
  </Container></section>;
}
