import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProviderEditForm from "./ProviderEditForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditProviderPage({ params }: Props) {
  const { id } = await params;
  const provider = await prisma.provider.findUnique({ where: { id } });
  if (!provider) notFound();
  return <ProviderEditForm provider={provider} />;
}