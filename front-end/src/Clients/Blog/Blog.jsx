import React from 'react'
import CarPromoSection from '../Home/Section/CarPromoVedio'
import OurClinetSaying from '../Home/Section/OurClinetSaying'
import OurTeam from '../Home/Section/OurTeam'
import Partners from '../Home/Section/Partenrs'
import BlogSection from './Section/BlogSection'
import BlogPage from './Section/BlogPage'


export default function Blog() {
  return (
    <div>
        <BlogSection />
        <BlogPage />
       
        <CarPromoSection />
        <OurClinetSaying />
        <OurTeam />
        <Partners />
    </div>
  )
}
