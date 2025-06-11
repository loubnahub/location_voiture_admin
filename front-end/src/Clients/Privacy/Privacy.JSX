import React from 'react'
import CarPromoSection from '../Home/Section/CarPromoVedio'
import OurClinetSaying from '../Home/Section/OurClinetSaying'
import OurTeam from '../Home/Section/OurTeam'
import Partners from '../Home/Section/Partenrs'
import PrivacySection from './Section/PrivacySection'
import PrivacyPolicyPage from './Section/PrivacyPage'


export default function Privacy() {
  return (
    <div>
        <PrivacySection />
        <PrivacyPolicyPage/>
        <CarPromoSection />
        <OurClinetSaying />
        <OurTeam />
        <Partners />
    </div>
  )
}
