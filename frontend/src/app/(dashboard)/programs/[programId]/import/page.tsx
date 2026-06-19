import { ImportPage } from "@/modules/import/components/ImportPage";

export default async function Page({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;
  return <ImportPage programId={programId} />;
}
