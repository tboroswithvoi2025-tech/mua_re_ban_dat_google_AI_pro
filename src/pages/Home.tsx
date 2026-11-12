import Hero from '@/components/sections/Hero'
import InfoSection from '@/components/sections/InfoSection'
import PricingSection from '@/components/sections/PricingSection'
import ProductSection from '@/components/sections/ProductSection'
import ContactSection from '@/components/sections/ContactSection'
import type { Product } from '@/types'

interface Props {
  onSelectProduct: (p: Product) => void
  onBuyProduct: (p: Product) => void
}

export default function Home({ onSelectProduct, onBuyProduct }: Props) {
  return (
    <main>
      <Hero />
      <InfoSection />
      <PricingSection />
      <ProductSection onSelectProduct={onSelectProduct} onBuyProduct={onBuyProduct} />
      <ContactSection />
    </main>
  )
}
