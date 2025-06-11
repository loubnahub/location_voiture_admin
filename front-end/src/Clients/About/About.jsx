import React from 'react'
import CarPromoSection from '../Home/Section/CarPromoVedio'
import OurClinetSaying from '../Home/Section/OurClinetSaying'
import Footer from '../Home/Section/Footer'
import AboutSection from './Section/AboutSection'
import CarRentalSection from './Section/AboutCarRental'
import OurTeam from '../Home/Section/OurTeam'
import Partners from '../Home/Section/Partenrs'


export default function About() {
  return (
    <div>
        <AboutSection />
        <CarRentalSection />
        <CarPromoSection />
        <OurClinetSaying />
        <OurTeam />
        <Partners />
    </div>
  )
}
