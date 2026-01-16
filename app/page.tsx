import { redirect } from "next/navigation";
import { todayString } from "@/lib/date";

export default function Home() {
  redirect(`/day/${todayString()}`);
}
