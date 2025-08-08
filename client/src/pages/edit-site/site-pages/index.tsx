import LeftNav from '@/components/ui/edit/LeftNav';
import ContentForm from '@/components/ui/edit/pages-edit/form/content/ContentForm';
import SeoForm from '@/components/ui/edit/pages-edit/form/seo/SeoForm';
import StructureFrom from '@/components/ui/edit/pages-edit/form/structure/StructureForm';
import Layout from '@/components/ui/edit/pages-edit/Layout';
import Menu from '@/components/ui/edit/pages-edit/menu/Menu';
import MenuTabs from '@/components/ui/edit/pages-edit/menu/MenuTabs';
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
        <title>CleverSolution Admin | Edit | Pages</title>
        <meta name="description" content="Edit generated site pages" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="bg-neutral-900 min-h-screen py-8 px-16">
        <Typography variant="title">Edit Site Pages</Typography>
        <div className="flex gap-[12px]">
          <LeftNav />
          <Layout>
            <Menu />
            <MenuTabs />
            {tab === 'seo' && <SeoForm />}
            {tab === 'content' && <ContentForm />}
            {tab === 'structure' && <StructureFrom />}
          </Layout>
        </div>
      </div>
    </>
  );
}
