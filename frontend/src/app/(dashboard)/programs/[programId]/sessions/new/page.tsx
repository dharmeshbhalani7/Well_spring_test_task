import { SessionCreatePage } from "@/modules/sessions/components/SessionCreatePage";

export default async function Page({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;
  return <SessionCreatePage programId={programId} />;
}
