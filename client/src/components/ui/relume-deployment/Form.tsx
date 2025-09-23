'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import { baseUrl } from '@/utils';
import { InputField } from '../edit/pages-edit/form/seo/SeoForm';
import Loader from '../loader/Loader';
import RelumePageAutosearch from '../RelumePageAutosearch';
import Spin from '../loader/Spin';
import Typography from '../Typography';

interface Status {
  status: string;
}

export default function Deployment() {
  const searchParams = useSearchParams();
  const siteId = searchParams.get('id');
  const [siteUrl, setSiteUrl] = useState<string | null>(null);
  const [home, setHome] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [logs, setLogs] = useState<Status[]>([]);
  const [pageId, setPageId] = useState<string | null>(null);

  useEffect(() => {
    if (!siteId) return;
    const getSiteUrl = async () => {
      try {
        const res = await fetch(
          `${baseUrl}/api/deployment/relume-url/${siteId}`,
          {
            cache: 'no-store',
          },
        );
        if (!res.ok) throw new Error('Failed to fetch status');

        const data = await res.json();
        setSiteUrl(data.siteUrl);
        setHome(data.home);
        setPageId(data.home);
      } catch (error) {
        console.error('Error getting site url', error);
      }
    };
    getSiteUrl();
  }, [siteId]);

  //   useEffect(() => {
  //     if (!siteId) return;

  //     const checkStatus = async () => {
  //       try {
  //         const res = await fetch(`${baseUrl}/api/template/status/${siteId}`);
  //         if (!res.ok) throw new Error('Failed to fetch status');

  //         const data = await res.json();
  //         if (
  //           data?.status &&
  //           data.status.trim() !== '' &&
  //           data.status.includes('%')
  //         ) {
  //           setIsBuilding(true);
  //         }
  //       } catch (err) {
  //         console.error('Error checking build status', err);
  //       }
  //     };

  //     checkStatus();
  //   }, [siteId]);

  const handleBuildAndDeploy = async () => {
    if (!siteId) return;
    setIsBuilding(true);
    // setLogs([{ status: 'Build started' }]);
    if (!pageId) {
      alert('Set home page to deploy');
      setIsBuilding(false);
      return;
    }
    try {
      const res = await fetch(
        `${baseUrl}/api/deployment/relume/${pageId}?siteId=${siteId}`,
        {
          method: 'POST',
        },
      );
      if (!res.ok) {
        setIsBuilding(false);
        throw new Error('Failed to deploy');
      }
      const data = await res.json();
      if (res.ok) setSiteUrl(data.url);
      setIsBuilding(false);
    } catch (err) {
      setIsBuilding(false);
    }
  };

  return (
    <div className="bg-neutral-900 min-h-screen py-1 px-0">
      {!isBuilding ? (
        <div className="flex flex-col gap-2">
          {typeof siteUrl === 'string' || !siteUrl ? (
            <div>
              {siteUrl ? (
                <InputField
                  label="Site host"
                  name="siteHost"
                  value={siteUrl}
                  disabled
                />
              ) : (
                ''
              )}
              {!home ? (
                <div className="flex flex-col mt-[8px]">
                  <label
                    htmlFor="pages"
                    className="text-neutral-200 text-sm mb-1"
                  >
                    Home Page<span className="text-danger">*</span>
                  </label>
                  <RelumePageAutosearch id={siteId} setPageId={setPageId} />
                </div>
              ) : (
                <InputField
                  label="Home page"
                  name="homepage"
                  value={home}
                  disabled
                />
              )}
            </div>
          ) : (
            <Loader />
          )}
          <Button onClick={handleBuildAndDeploy} variant="action">
            Build & Deploy
          </Button>
        </div>
      ) : (
        <div>
          <Typography variant="text">Processing</Typography>
          <div className="flex justify-center mt-[25vh]">
            <Spin />
          </div>
        </div>
      )}
    </div>
  );
}
