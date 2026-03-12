import { DevelopmentDetailPage } from '@/components/development-detail-page';

interface PageProps {
 params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
 const resolved = await params;
 return <DevelopmentDetailPage slug={resolved.slug} />;
}
