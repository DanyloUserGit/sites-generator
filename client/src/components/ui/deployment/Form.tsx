'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import { baseUrl } from '@/utils';
import { InputField } from '../edit/pages-edit/form/seo/SeoForm';

interface Status {
  status: string;
}

export default function Deployment() {
  const searchParams = useSearchParams();
  const siteId = searchParams.get('id');
  const [siteUrl, setSiteUrl] = useState<string | null>(null);

  const [isBuilding, setIsBuilding] = useState(false);
  const [logs, setLogs] = useState<Status[]>([]);

  useEffect(() => {
    if (!siteId) return;
    const getSiteUrl = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/deployment/url/${siteId}`, {
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('Failed to fetch status');

        const data = await res.json();
        setSiteUrl(data.siteUrl);
      } catch (error) {
        console.error('Error getting site url', error);
      }
    };
    getSiteUrl();
  }, [siteId]);

  useEffect(() => {
    if (!siteId) return;

    const checkStatus = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/template/status/${siteId}`);
        if (!res.ok) throw new Error('Failed to fetch status');

        const data = await res.json();
        if (
          data?.status &&
          data.status.trim() !== '' &&
          data.status.includes('%')
        ) {
          setIsBuilding(true);
        }
      } catch (err) {
        console.error('Error checking build status', err);
      }
    };

    checkStatus();
  }, [siteId]);

  const handleBuildAndDeploy = async () => {
    if (!siteId) return;
    setIsBuilding(true);
    setLogs([{ status: 'Build started' }]);

    try {
      const res = await fetch(`${baseUrl}/api/template/${siteId}`);
      if (!res.ok) {
        setIsBuilding(false);
        throw new Error('Failed to start build');
      }
      const data = await res.json();
      if (res.ok) setSiteUrl(data.siteUrl);
    } catch (err) {
      setLogs([{ status: 'Failed to start build' }]);
      setIsBuilding(false);
    }
  };

  useEffect(() => {
    if (!isBuilding || !siteId) return;

    const fetchStatus = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/template/status/${siteId}`);
        if (!res.ok) throw new Error('Failed to fetch status');

        const data = await res.json();
        if (!data?.status) return;

        setLogs((prev) => {
          if (prev.some((log) => log.status === data.status)) return prev;
          return [...prev, { status: data.status }];
        });

        if (data.status.includes('100%')) {
          setIsBuilding(false);
        }
      } catch (err) {
        console.error(err);
        setIsBuilding(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [isBuilding, siteId]);

  return (
    <div className="bg-neutral-900 min-h-screen py-1 px-0">
      {!isBuilding && (
        <div className="flex flex-col gap-2">
          {typeof siteUrl === 'string' ? (
            <InputField
              label="Site host"
              name="siteHost"
              value={siteUrl}
              disabled
            />
          ) : (
            ''
          )}
          <Button onClick={handleBuildAndDeploy} variant="action">
            Build & Deploy
          </Button>
        </div>
      )}

      {isBuilding && (
        <div className="bg-neutral-700 rounded-lg p-4 mt-1">
          <h2 className="text-neutral-200 text-lg mb-4">Status Logs:</h2>
          <div className="flex flex-col gap-2">
            {logs.map((log, idx) => (
              <div
                key={idx}
                className={`p-2 rounded ${
                  log.status.toLowerCase().includes('failed')
                    ? 'bg-danger text-neutral-50'
                    : log.status.includes('100%')
                      ? 'bg-success text-neutral-50'
                      : 'bg-neutral-600 text-neutral-100'
                }`}
              >
                {log.status}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
