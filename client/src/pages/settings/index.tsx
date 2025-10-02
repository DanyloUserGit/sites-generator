import Header from '@/components/Header';
import Typography from '@/components/ui/Typography';
import AutoSearch from '@/components/ui/AutoSearch';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { getToken, removeToken } from '@/lib/auth';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { baseUrl } from '@/utils';
import Button from '@/components/ui/Button';

export default function Settings() {
  const router = useRouter();
  useAuthRedirect();

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  const [aiProvider, setAiProvider] = useState('');
  const [translateProvider, setTranslateProvider] = useState('');

  const [aiProviders, setAiProviders] = useState<string[]>([]);
  const [translateProviders, setTranslateProviders] = useState<string[]>([]);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!getToken()) router.push('/login');

    const fetchProviders = async () => {
      try {
        const userRes = await fetch(`${baseUrl}/api/user-settings/`);
        const userData = await userRes.json();
        setTranslateProvider(userData.translateProvider);
        setAiProvider(userData.aiProvider);
        const aiRes = await fetch(`${baseUrl}/api/user-settings/ai-providers`);
        const aiData = await aiRes.json();
        setAiProviders(aiData);

        const trRes = await fetch(
          `${baseUrl}/api/user-settings/translate-providers`,
        );
        const trData = await trRes.json();
        setTranslateProviders(trData);
      } catch (err) {
        console.error('Error fetching providers:', err);
      }
    };

    fetchProviders();
  }, []);

  const handleSave = async () => {
    try {
      await fetch(`${baseUrl}/api/user-settings/ai`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: aiProvider }),
      });

      await fetch(`${baseUrl}/api/user-settings/translate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: translateProvider }),
      });
    } catch (err) {
      console.error('Error saving settings:', err);
    }
  };

  return (
    <>
      <Head>
        <title>CleverSolution Admin | Settings</title>
        <meta name="description" content="Admin settings page" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="w-full  bg-neutral-900 min-h-screen py-8 px-16 flex flex-col gap-7">
        <div className="w-full flex justify-between items-center">
          <Typography variant="title">Settings</Typography>
          <Button onClick={() => setOpen(true)} variant="danger">
            Logout
          </Button>
        </div>

        <div className="flex flex-col gap-6 max-w-md mt-4">
          <AutoSearch
            label="AI Provider"
            list={aiProviders}
            value={aiProvider}
            setValue={setAiProvider}
          />
          <AutoSearch
            label="Translate Provider"
            list={translateProviders}
            value={translateProvider}
            setValue={setTranslateProvider}
          />

          <div className="flex justify-between items-end gap-2">
            {' '}
            <button
              onClick={handleSave}
              className="bg-accent hover:bg-accent-hover text-white font-medium rounded-lg px-4 py-2 mt-4 flex-1"
            >
              Save
            </button>
            <Button
              variant="default"
              className="text-white flex-1"
              onClick={() => router.back()}
            >
              Back
            </Button>
          </div>
        </div>
      </div>
      {open && <Modal setOpen={setOpen} logout={handleLogout} />}
    </>
  );
}
function Modal({
  setOpen,
  logout,
}: {
  setOpen: (s: boolean) => void;
  logout: () => void;
}) {
  return (
    <div className="w-full h-full z-20 bg-black/65 absolute top-0 left-0 flex flex-col items-center">
      <div className="m-auto px-8 py-4 bg-neutral-950 rounded-[8px] border-neutral-800 max-w-fit">
        <Typography variant="title">Logout from this account?</Typography>
        <div className="flex mt-4 gap-2">
          <Button className="flex-1" onClick={logout} variant="danger">
            Logout
          </Button>
          <Button
            className="flex-1 text-white"
            onClick={() => setOpen(false)}
            variant="default"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
