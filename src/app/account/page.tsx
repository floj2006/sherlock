import Link from "next/link";
import { cookies } from "next/headers";
import { AccountPanel } from "@/components/account/account-panel";
import { Container } from "@/components/ui/container";
import { accountVisits, SESSION_COOKIE, userFromToken } from "@/lib/account-auth";
import { safeReturnPath, yandexConfig } from "@/lib/yandex-auth";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "Личный кабинет", description: "Ваш профиль и записи в SHERLOCK.", path: "/account", noIndex: true });
export const dynamic = "force-dynamic";
const errors: Record<string, string> = {
  cancelled: "Вы отменили вход. Можно попробовать снова.", expired: "Время для входа истекло. Нажмите кнопку ещё раз.",
  unavailable: "Не удалось завершить вход. Попробуйте ещё раз позже.", not_configured: "Вход через Яндекс скоро появится. Пока можно записаться без аккаунта.",
  wrong_domain: "Вход доступен на основном адресе сайта.", rate_limit: "Слишком много попыток входа. Попробуйте через 15 минут.",
};
export default async function AccountPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const next = safeReturnPath(typeof query.next === "string" ? query.next : null);
  const error = typeof query.error === "string" ? errors[query.error] : undefined;
  const configured = !!yandexConfig();
  const token = (await cookies()).get(SESSION_COOKIE)?.value || "";
  let user = null;
  let visits: ReturnType<typeof accountVisits> = [];
  let storageError = false;
  try { user = userFromToken(token); if (user) visits = accountVisits(user.id); }
  catch { storageError = true; }
  return <section className="account-page"><Container>
    {user && !storageError ? <AccountPanel user={user} visits={visits} /> : <div className="account-entry">
      <div className="account-login"><p className="eyebrow">SHERLOCK / Личный кабинет</p><h1>Войдите через Яндекс.</h1><p>При первом входе мы создадим ваш аккаунт. Придумывать пароль не нужно.</p>
        {configured && !storageError ? <a href={"/api/auth/yandex?next=" + encodeURIComponent(next)} className="yandex-login-button"><span aria-hidden="true">Я</span>Войти с Яндекс ID</a> : <><button type="button" className="yandex-login-button" disabled><span aria-hidden="true">Я</span>Войти с Яндекс ID</button><p className="account-message" role="status">{storageError ? "Личный кабинет временно недоступен. Попробуйте позже." : errors.not_configured}</p></>}
        {error ? <p className="account-message" role="alert">{error}</p> : null}
        <p className="account-privacy">При входе используем имя и контакты из Яндекса для вашего профиля. <Link href="/privacy">Как обрабатываются данные</Link></p>
        <Link href={next.startsWith("/book") ? next : "/book"} className="text-link">Записаться без аккаунта ↗</Link>
      </div>
      <div className="account-entry-summary"><h2>Ваше время.<br />Ваш SHERLOCK.</h2><p className="account-intro">Ваши записи и контакты — под рукой.</p><div className="account-entry-benefits"><p><span>01</span> Записывайтесь быстрее</p><p><span>02</span> Возвращайтесь к выбранным услугам</p><p><span>03</span> Сохраняйте историю визитов</p></div></div>
    </div>}
  </Container></section>;
}
