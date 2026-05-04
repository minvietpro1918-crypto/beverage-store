import ScrollSequenceHero  from '@/components/sections/ScrollSequenceHero';
import InfiniteMarquee     from '@/components/ui/InfiniteMarquee';
import ProductGrid         from '@/components/sections/ProductGrid';
import IngredientsSection  from '@/components/sections/IngredientsSection';
import StorySection        from '@/components/sections/StorySection';
import StatsStrip          from '@/components/sections/StatsStrip';
import HeroCarousel        from '@/components/sections/HeroCarousel';

export default function HomePage() {
  return (
    <>
      {/* Hero 3D tương tác xoay 360 */}

      {/* Nếu bạn vẫn muốn dùng Carousel cũ, bạn có thể bỏ comment dòng dưới */}
      <HeroCarousel />

      {/* Slide 3: Wild Garden Bloom — scroll-driven canvas animation */}
      <ScrollSequenceHero />

      {/* Thanh Marquee tương tác đà cuộn đặt ngay trước danh sách sản phẩm */}
      <InfiniteMarquee />
      
      <ProductGrid />
      <IngredientsSection />
      <StorySection />
      <StatsStrip />
    </>
  );
}
