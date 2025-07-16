import React from 'react'
import YouNeedCar from './Section/YouNeedCar'
import OurServiceSection from './Section/ServiceHome'
import VehicleFleet from './Section/CarsCard'
import CarPromoSection from './Section/CarPromoVedio'
import Header from '../Header/Nav'
import LuxuryTestimonialSlider from './Section/OurClinetSaying'
import ContactPage from '../Contact/Section/ContactPage'
import HowItWorksSection from './Section/HowItsWorks'
import Parterns from './Section/Partenrs'
import '../../index.css'
import WhyChooseUsSection from './Section/WhyChooseUs'
import WriteReviewFormBeautiful from './Section/AvisClinet'
// import Hero from './Section/Hero'
import HeroSection2 from './Section/Hero2'

export default function Home() {
  return (
    <div className="tw-bg-[#1b1b1b]">
    <Header />
    <HeroSection2/>
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
    </div>
  )
  
}
