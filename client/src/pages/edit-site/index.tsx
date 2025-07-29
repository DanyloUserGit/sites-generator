import From from '@/components/ui/edit/info-edit/Form';
import LeftNav from '@/components/ui/edit/LeftNav';
import Typography from '@/components/ui/Typography';
import { useAuth } from '@/hooks/AuthContext';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { SiteExtended } from '@/types';
import { baseUrl } from '@/utils';
import Head from 'next/head';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditSite() {
  const params = useSearchParams();
  const id = params.get('id');
  useAuthRedirect();
  const [site, setSite] = useState<SiteExtended | null>();
  const token = useAuth();
  useEffect(() => {
    if (!id) return;
    fetch(`${baseUrl}/api/sites/site/${id}`, {
      headers: { Authorization: `Bearer ${token.token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setSite(data);
        console.log(data);
      });
  }, [id, token]);
  return (
    <>
      <Head>
        <title>CleverSolution Admin | Edit | Info</title>
        <meta name="description" content="Edit generated site" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="bg-neutral-900 min-h-screen py-8 px-16">
        <Typography variant="title">Edit Site Info</Typography>
        <div className="flex gap-[12px]">
          <LeftNav />
          {site ? <From site={site} /> : ''}
        </div>
      </div>
    </>
  );
}
