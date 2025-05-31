import React from 'react'



import ConatactSection from './Section/SectionContact'
import ContactPage from './Section/ContactPage'
import CarPromoSection from '../Home/Section/CarPromoVedio'
import OurClinetSaying from '../Home/Section/OurClinetSaying'
import Footer from '../Home/Section/Footer'
import Partners from '../Home/Section/Partenrs'
import OurTeam from '../Home/Section/OurTeam'

export default function Contact() {
  return (
    <div>
        <ConatactSection />
        <ContactPage />
        <CarPromoSection />
        <OurClinetSaying />
        <OurTeam />
        <Partners />
        <Footer />
    </div>
  )
}
