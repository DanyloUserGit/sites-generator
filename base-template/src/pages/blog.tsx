import Team from '@/components/About/Team';
import ArticleHero from '@/components/Blog/ArticleHero';
import BenefitsSection from '@/components/Blog/BenefitsSection';
import TipsSection from '@/components/Blog/TipsSection';
import ContactForm from '@/components/Contact/ContactForm';
import Map from '@/components/Contact/Map';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Seo from '@/components/Seo';
import { getPageByName, getSiteData } from '@/lib/siteData';
import { PageProps } from '@/types';
import { GetStaticProps } from 'next';

export default function BlogPage({ page, site }: PageProps) {
  return (
    <>
      <Seo
        title={page.seo.metaTitle}
        description={page.seo.metaDescription}
        canonicalUrl={`https://${site.domain}/`}
        businessName={site.companyName}
        city={site.city}
        websiteUrl={`https://${site.domain}/`}
        schemaOrg={page.seo.schemaOrg}
        favicon={site.favIcon}
      />

      <Header navigation={site.navigation} site={site} />

      <main className="max-w-5xl mx-auto px-6 py-16 space-y-20">
        {page.sections.map((section) => {
          switch (section) {
            case 'Hero':
              return <ArticleHero key="hero" content={page.content} />;

            case 'Services':
              return <TipsSection key="services" content={page.content} />;

            case 'Benefits':
              return <BenefitsSection key="benefits" content={page.content} />;

            case 'CTA':
              return <Team key="cta" site={site} content={page.content} />;

            case 'Contact':
              return <ContactForm key="contact" content={page.content} />;

            case 'Map':
              return <Map key="map" site={site} content={page.content} />;

            default:
              return null;
          }
        })}
        {/* <TypesSection /> */}
      </main>

      <Footer navigation={site.navigation} site={site} />
    </>
  );
}
export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const page = getPageByName('blog');
  const site = getSiteData();

  return {
    props: {
      page,
      site,
    },
  };
};
