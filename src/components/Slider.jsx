import { collection, query, limit, orderBy, getDocs } from 'firebase/firestore'
import { useState, useEffect } from 'react'
import { db } from '../firebase.config'
//swiper
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper'
import { toast } from 'react-toastify'
//swiper css
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import Spinner from './Spinner'
import formatMoney from '../utils/formatMoney'
function Slider() {
  const [listings, setListings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getListings = async () => {
      try {
        const listingsRef = collection(db, 'listings')
        const q = query(listingsRef, orderBy('timestamp', 'desc'), limit(5))
        const querySnapshot = await getDocs(q)
        let finalListings = []
        querySnapshot.forEach((doc) => {
          finalListings.push({ id: doc.id, data: doc.data() })
        })
        setListings(finalListings)
        setLoading(false)
      } catch (error) {
        toast.error('Error retrieving slider listings')
      }
    }
    getListings()
  }, [])
  if (loading) {
    return <Spinner />
  }
  if (listings.length === 0) {
    return <></>
  }
  return (
    listings && (
      <>
        <p className='exploreHeading'>Recomended</p>
        <Swiper
          spaceBetween={30}
          navigation={true}
          pagination={{
            clickable: true
          }}
          modules={[Navigation, Pagination]}
          className='mySwiper'>
          {listings.map(({ data, id }) => (
            <SwiperSlide key={id}>
              <div
                style={{
                  background: `url(${data.imageUrls[0]}) center no-repeat`,
                  backgroundSize: 'cover',
                  height: '200px'
                }}
                className='swiperSlideDiv'>
                <p className='swiperSlideText'>{data.name}</p>
                <p className='swiperSlidePrice'>
                  {data.offer ? formatMoney(data.discountedPrice) : formatMoney(data.regularPrice)}
                  {data.type === 'rent' && '/Month'}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </>
    )
  )
}

export default Slider
