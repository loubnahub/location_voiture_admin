import React from 'react'
import CarPromoSection from '../Home/Section/CarPromoVedio'
import OurClinetSaying from '../Home/Section/OurClinetSaying'

import OurTeam from '../Home/Section/OurTeam'
import Partners from '../Home/Section/Partenrs'
import FAQsSection from './section/FaqsSection'
import CarInfoSection from './section/CarInfoFaqs'


export default function FAQs() {
  return (
    <div>
        <FAQsSection />
        <CarInfoSection />
        <CarPromoSection />
        <OurClinetSaying />
        <OurTeam />
        <Partners />
    </div>
  )
}
