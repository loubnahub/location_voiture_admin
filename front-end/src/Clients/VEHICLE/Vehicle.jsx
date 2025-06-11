import React from 'react'
import VehileSection from './Section/VehicleSection'
import CarPromoSection from '../Home/Section/CarPromoVedio'
import OurClinetSaying from '../Home/Section/OurClinetSaying'
import Footer from '../Home/Section/Footer'
import VehicleListPage from './Section/VihclePage'
import '../../index.css';



export default function Vehicle() {
  return (
    <div>
        <VehileSection />
        <VehicleListPage />
        <CarPromoSection />
        <OurClinetSaying />
    </div>
  )
}
