import { NavLink, Site } from '@/types';
import Link from 'next/link';

export default function Footer({
  site,
  navigation,
}: {
  site: Pick<Site, 'companyName' | 'city' | 'slug' | 'favIcon'>;
  navigation: NavLink[];
}) {
  return (
    <footer className="bg-navy text-gray-light pt-12 pb-4 text-center">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between">
        <Link href="/" className="text-primary font-bold text-2xl">
          {site.companyName}
        </Link>
        <nav>
          {' '}
          <ul className="flex flex-col space-y-4 text-white font-semibold px-6 text-left">
            {navigation.map((nav, index) => (
              <li key={index}>
                <Link
                  href={nav.slug === '/home' ? '/' : nav.slug}
                  className="hover:text-accent transition capitalize"
                >
                  {nav.linkName.replaceAll('.', '')}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p>
        © {new Date().getFullYear()} {site.companyName}. All rights reserved.
      </p>
    </footer>
  );
}
