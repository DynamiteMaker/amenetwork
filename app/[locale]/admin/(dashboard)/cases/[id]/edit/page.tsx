import { CaseEditor } from "@/components/admin/case-editor";

export default async function EditCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CaseEditor id={id} />;
}
