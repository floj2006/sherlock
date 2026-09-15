import { BookingForm } from "@/components/booking/booking-form";
import { Container } from "@/components/ui/container";
import { createMetadata } from "@/lib/seo";
import { getServiceBySlug } from "@/lib/site-data";
import { cookies } from "next/headers";
import { SESSION_COOKIE, userFromToken } from "@/lib/account-auth";

export const metadata = createMetadata({ title: "Онлайн-запись", description: "Выберите мастера и время. Подтвердите запись в SHERLOCK прямо на сайте.", path: "/book", noIndex: true });
type Query = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
export default async function BookPage({ searchParams }: { searchParams: Promise<Query> }) {
  const query = await searchParams;
  const slugs = [query.service, query.services].flatMap(value => value ? (Array.isArray(value) ? value : [value]) : []).flatMap(value => value.split(","));
  const serviceIds = [...new Set(slugs.flatMap(slug => { const id = getServiceBySlug(slug)?.yclientsServiceId; return id ? [id] : []; }))];
  const master = first(query.master);
  const staffId = master && /^[1-9]\d*$/.test(master) ? Number(master) : undefined;
  let accountUser = null;
  try { accountUser = userFromToken((await cookies()).get(SESSION_COOKIE)?.value || ""); } catch { /* Guest booking stays available. */ }
  return <section className="native-booking-page"><Container>
    <header className="native-booking-heading"><p className="eyebrow">SHERLOCK / Ваш визит</p><h1>Время для себя.</h1><p>Выберите одну или несколько услуг, мастера и удобное время. Подтверждение появится здесь.</p></header>
    <BookingForm key={`${serviceIds.join(",")}-${staffId}-${accountUser?.id}`} initialServiceIds={serviceIds} initialStaffId={staffId} accountUser={accountUser} />
    <noscript><p>Для онлайн-записи включите JavaScript или позвоните: <a href="tel:+79052224047">+7 (905) 222-40-47</a>.</p></noscript>
  </Container></section>;
}
