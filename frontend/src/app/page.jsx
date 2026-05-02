import HeroCarousel from '@/components/sections/HeroCarousel';
import MarqueeStrip  from '@/components/ui/MarqueeStrip';
import ProductGrid   from '@/components/sections/ProductGrid';
import StatsStrip    from '@/components/sections/StatsStrip';

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <MarqueeStrip />
      <ProductGrid />
      <StatsStrip />
    </>
  );
}
