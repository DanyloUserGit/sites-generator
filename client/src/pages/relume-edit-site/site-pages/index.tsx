import SeoForm from '@/components/ui/edit/pages-edit/form/seo/SeoForm';
import Layout from '@/components/ui/edit/pages-edit/Layout';
import LeftNav from '@/components/ui/relume-edit/LeftNav';
import ContentForm from '@/components/ui/relume-edit/pages-edit/form/ContentForm';
import Menu from '@/components/ui/relume-edit/pages-edit/menu/Menu';
import MenuTabs from '@/components/ui/relume-edit/pages-edit/menu/MenuTabs';
import Typography from '@/components/ui/Typography';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import Head from 'next/head';
import { useSearchParams } from 'next/navigation';

export default function SitePagesPage() {
  const searchParams = useSearchParams();

  const tab = searchParams.get('tab');
  useAuthRedirect();
  return (
    <>
      <Head>
        <title>CleverSolution Admin | Edit | Pages (Relume)</title>
        <meta name="description" content="Edit generated site pages" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="bg-neutral-900 min-h-screen py-8 px-16">
        <Typography variant="title">Edit Site Pages (Relume)</Typography>
        <div className="flex gap-[12px]">
          <LeftNav />
          <Layout>
            <Menu />
            <MenuTabs />
            {tab === 'seo' && <SeoForm relume={true} />}
            {tab === 'content' && <ContentForm />}
          </Layout>
        </div>
      </div>
    </>
  );
}
