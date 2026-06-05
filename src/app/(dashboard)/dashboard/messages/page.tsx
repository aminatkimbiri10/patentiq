import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { MessageSquare } from "lucide-react";

export const metadata = { title: "Messages" };

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Messages" description="Conversations directes et fils projet." />
      <EmptyState icon={MessageSquare} title="Boîte de réception vide" description="Les messages apparaîtront ici." />
    </div>
  );
}
