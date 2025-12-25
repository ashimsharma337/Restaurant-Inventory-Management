import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/landing/HeroSection';
import Features from '@/components/landing/Features';

export default function Home() {
  return (
    <Layout>
      <HeroSection />
      <Features />
    </Layout>
  );
}
