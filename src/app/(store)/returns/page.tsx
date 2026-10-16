import { ManagedInfoPage } from "@/components/info/managed-info-page";
import { pageMetadata } from "@/lib/data/page-content";
export async function generateMetadata() { return pageMetadata("returns"); }
export default function Page() { return <ManagedInfoPage pageKey="returns" help={true} />; }
