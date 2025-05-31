import React from 'react'
import CarRentalHero from './Section/FindCarsRental'
import YouNeedCar from './Section/YouNeedCar'
import OurServiceSection from './Section/ServiceHome'
import VehicleFleet from './Section/CarsCard'
import CarPromoSection from './Section/CarPromoVedio'
import Header from '../Header/Nav'
import LuxuryTestimonialSlider from './Section/OurClinetSaying'
import Footer from './Section/Footer'
import ContactPage from '../Contact/Section/ContactPage'
import HowItWorksSection from './Section/HowItsWorks'
import Parterns from './Section/Partenrs'
import '../../index.css'

import WhyChooseUsSection from './Section/WhyChooseUs'
import WriteReviewFormBeautiful from './Section/AvisClinet'

export default function Home() {
  return (
    <div className="bg-[#1b1b1b]">
    <Header />
    <CarRentalHero />
    <YouNeedCar />
    <OurServiceSection />
    <VehicleFleet />
    <CarPromoSection />
    <HowItWorksSection />
    <WhyChooseUsSection />
    <LuxuryTestimonialSlider />
    <ContactPage />
    <WriteReviewFormBeautiful />
    <Parterns />
    <Footer />
    </div>
  )
  
}
