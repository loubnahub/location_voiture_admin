import React from 'react'
import CarPromoSection from '../Home/Section/CarPromoVedio'
import OurClinetSaying from '../Home/Section/OurClinetSaying'

import OurTeam from '../Home/Section/OurTeam'
import Partners from '../Home/Section/Partenrs'

import TestiominalsSection from './Section/TestiominalsSection'
import AvisPages from './Section/AvisPages'


export default function Testiominals() {
  return (
    <div>
        <TestiominalsSection />
        <AvisPages />
        <CarPromoSection />
        <OurTeam />
        <Partners />
    </div>
  )
}
