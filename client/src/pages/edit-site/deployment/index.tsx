import LeftNav from '@/components/ui/edit/LeftNav';
import Typography from '@/components/ui/Typography';
import Head from 'next/head';

export default function DeploymentPage() {
  return (
    <>
      <Head>
        <title>CleverSolution Admin | Deployment</title>
        <meta name="description" content="Edit generated site pages" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="bg-neutral-900 min-h-screen py-8 px-16">
        <Typography variant="title">Deployment</Typography>
        <LeftNav />
      </div>
    </>
  );
}
