'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Typography from '@/components/ui/Typography';
import Head from 'next/head';
import { baseUrl } from '@/utils';
import StatusBlock from '@/components/ui/status/StatusBlock';
import { Status } from '@/types';
import Spin from '@/components/ui/loader/Spin';

export default function GenerateSitePage() {
  const searchParams = useSearchParams();
  const siteId = searchParams.get('siteId');
  const [logs, setLogs] = useState<Status[]>([]);
  const router = useRouter();
  useEffect(() => {
    if (!siteId) return;
    const startGeneration = async () => {
      try {
        setLogs((prev) => [
          {
            status: 'Generation started',
            isError: false,
            isCompleted: true,
          },
          ...prev,
        ]);

        const res = await fetch(
          `${baseUrl}/api/generate-content/generate-site`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ siteId }),
          },
        );

        if (!res.ok) throw new Error('Failed to start generation');
      } catch (error) {
        setLogs((prev) => [
          {
            status: 'Generation failed to start',
            isError: true,
            isCompleted: false,
          },
          ...prev,
        ]);
      }
    };

    startGeneration();
  }, [siteId]);
  useEffect(() => {
    if (!siteId) return;

    const fetchStatus = async () => {
      try {
        const res = await fetch(
          `${baseUrl}/api/generate-content/site-status/${siteId}`,
        );
        if (!res.ok) throw new Error('Failed to fetch status');

        const data = await res.json();

        setLogs((prev) => {
          const alreadyExists = prev.some((log) => log.status === data.status);
          if (alreadyExists) return prev;
          return [data, ...prev];
        });
        if (data.isCompleted && !data.isError) {
          setTimeout(() => {
            router.replace('/');
          }, 1500);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 7000);

    return () => clearInterval(interval);
  }, [siteId]);

  return (
    <>
      <Head>
        <title>CleverSolution Admin | Generate</title>
        <meta name="description" content="Generate site" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="bg-neutral-900 min-h-screen py-8 px-16">
        <div className="flex gap-2">
          <Typography variant="title">Generating</Typography>
        </div>

        <div className="mt-[24px] w-full px-[16px] py-[8px] bg-neutral-700">
          <Typography variant="text">Status Logs: </Typography>

          <div className="mt-4 flex flex-col gap-2">
            {logs.map((status, idx) => (
              <StatusBlock key={idx} status={status} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
