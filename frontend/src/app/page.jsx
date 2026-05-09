import { buildMetadata } from '@/lib/seo';
import HeroCarousel        from '@/components/sections/HeroCarousel';
import ScrollSequenceHero  from '@/components/sections/ScrollSequenceHero';
import InfiniteMarquee     from '@/components/ui/InfiniteMarquee';
import ProductGrid         from '@/components/sections/ProductGrid';
import IngredientsSection  from '@/components/sections/IngredientsSection';
import StorySection        from '@/components/sections/StorySection';
import StatsStrip          from '@/components/sections/StatsStrip';

export const metadata = buildMetadata({
  title:       'Thức Uống Thượng Hạng',
  description: 'Trà sữa, cà phê, nước ép tươi — từ nguyên liệu tự nhiên 100%. Giao hàng 30 phút tại TP. HCM.',
  url:         '/',
  keywords:    ['trà sữa trân châu', 'cà phê sữa đá', 'nước ép cam', 'sinh tố bơ', 'giao hàng nhanh'],
});

export default function HomePage() {
  return (
    <>
      <ScrollSequenceHero />
      <InfiniteMarquee />
      <ProductGrid />
      <HeroCarousel />
      <IngredientsSection />
      <StorySection />
      <StatsStrip />
    </>
  );
}
