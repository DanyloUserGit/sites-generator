import Layout from '@/components/ui/edit/pages-edit/Layout';
import Typography from '@/components/ui/Typography';
import { useAuth } from '@/hooks/AuthContext';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { IRelumeSite } from '@/types';
import { baseUrl } from '@/utils';
import Head from 'next/head';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Form from '@/components/ui/relume-edit/info-edit/Form';
import Loader from '@/components/ui/loader/Loader';
import LeftNav from '@/components/ui/relume-edit/LeftNav';

export default function RelumeEditSite() {
  const params = useSearchParams();
  const id = params.get('id');
  useAuthRedirect();
  const [site, setSite] = useState<IRelumeSite | null>();
  const token = useAuth();
  useEffect(() => {
    if (!id) return;
    fetch(`${baseUrl}/api/generate-from-relume/${id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token.token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setSite(data);
      });
  }, [id, token]);
  return (
    <>
      <Head>
        <title>CleverSolution Admin | Edit | Info (Relume)</title>
        <meta name="description" content="Edit generated site" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="bg-neutral-900 min-h-screen py-8 px-16">
        <Typography variant="title">Edit Site Info (Relume)</Typography>
        <div className="flex gap-[12px]">
          <LeftNav />
          <Layout>{site ? <Form site={site} /> : <Loader />}</Layout>
        </div>
      </div>
    </>
  );
}
