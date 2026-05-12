import { PostEditor } from "@/components/admin/post-editor";

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PostEditor type="news" id={id} />;
}
