import { ManagedInfoPage } from "@/components/info/managed-info-page";
import { pageMetadata } from "@/lib/data/page-content";
export async function generateMetadata() { return pageMetadata("privacy"); }
export default function Page() { return <ManagedInfoPage pageKey="privacy" help={false} />; }
