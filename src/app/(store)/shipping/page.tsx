import { ManagedInfoPage } from "@/components/info/managed-info-page";
import { pageMetadata } from "@/lib/data/page-content";
export async function generateMetadata() { return pageMetadata("shipping"); }
export default function Page() { return <ManagedInfoPage pageKey="shipping" help={true} />; }
