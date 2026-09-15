import { MastersRoster } from "@/components/sections/masters-roster";
import { createMetadata } from "@/lib/seo";
export const metadata = createMetadata({ title: "Мастера", description: "Команда барбершопа SHERLOCK. Выбор мастера и времени визита.", path: "/masters" });
export const revalidate = 300;
export default function MastersPage() {
  return <div className="pt-20"><MastersRoster /></div>;
}
