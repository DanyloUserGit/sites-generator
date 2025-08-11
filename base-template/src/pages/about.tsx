import Hero from '@/components/About/Hero';
import Values from '@/components/About/Values';
import Team from '@/components/About/Team';
import Seo from '@/components/Seo';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PageProps } from '@/types';
import { GetStaticProps } from 'next';
import { getPageByName, getSiteData } from '@/lib/siteData';

export default function AboutPage({ page, site }: PageProps) {
  return (
    <>
      <Seo
        title={page.seo.metaTitle}
        description={page.seo.metaDescription}
        canonicalUrl={`https://${site.slug.replaceAll('/', '')}.com/`}
        businessName={site.companyName}
        city={site.city}
        websiteUrl={`https://${site.slug.replaceAll('/', '')}.com/`}
        schemaOrg={page.seo.schemaOrg}
        favicon={site.favIcon}
      />

      <Header navigation={site.navigation} site={site} />
      {page.sections.map((section) => {
        switch (section) {
          case 'Hero':
            return <Hero key="hero" content={page.content} />;

          case 'Benefits':
            return <Values key="benefits" content={page.content} />;

          case 'CTA':
            return <Team key="cta" site={site} content={page.content} />;

          default:
            return null;
        }
      })}
      <Footer navigation={site.navigation} site={site} />
    </>
  );
}
export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const page = getPageByName('about');
  const site = getSiteData();

  return {
    props: {
      page,
      site,
    },
  };
};
