import { useState, useEffect } from 'react'
import Spinner from '../components/Spinner'
import ShareIcon from '../assets/svg/shareIcon.svg'
import formatMoney from '../utils/formatMoney'
import { toast } from 'react-toastify'
import { Link, useParams } from 'react-router-dom'
import { getDoc, doc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '../firebase.config'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
//swiper
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper'
//swiper css
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const getListing = async (id) => {
  try {
    const docRef = doc(db, 'listings', id)
    const docSnap = await getDoc(docRef)
    return docSnap.data()
  } catch (e) {
    toast.error('something went wrong')
  }
}

function Listing() {
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [shareLinkCopied, setShareLinkCopied] = useState(null)
  const params = useParams()
  const auth = getAuth()
  useEffect(() => {
    const response = async () => {
      const listing = await getListing(params.listingId)
      setListing(listing)
      setLoading(false)
    }
    response()
  }, [])

  const shareLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setShareLinkCopied(true)
    setTimeout(() => {
      setShareLinkCopied(false)
    }, 2000)
  }
  const template = loading ? (
    <Spinner />
  ) : (
    <main>
      <Swiper
        spaceBetween={30}
        navigation={true}
        pagination={{
          clickable: true
        }}
        modules={[Navigation, Pagination]}
        className='mySwiper'>
        {listing.imageUrls.map((url, index) => (
          <SwiperSlide key={index}>
            <div
              style={{
                background: `url(${listing.imageUrls[index]}) center no-repeat`,
                backgroundSize: 'cover',
                height: '250px'
              }}
              className='swiperSlideDiv'></div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className='shareIconDiv' onClick={shareLink}>
        <img src={ShareIcon} alt='' srcSet='' />
      </div>
      {shareLinkCopied && <p className='linkCopied'>Link Copied</p>}
      <div className='listingDetails'>
        <p className='listingName'>
          {listing.name}
          {', '}
          {listing.offer ? formatMoney(listing.discountedPrice) : formatMoney(listing.regularPrice)}
        </p>
        <p className='listingLocation'>{listing.location}</p>
        <p className='listingType'>For {listing.type === 'rent' ? 'Rent' : 'Sale'}</p>
        {listing.offer && (
          <p className='discountPrice'>
            {formatMoney(listing.regularPrice - listing.discountedPrice)} discount
          </p>
        )}
        <ul className='listingDetailsList'>
          <li>{listing.bedrooms > 1 ? `${listing.bedrooms} Bedrooms` : '1 Bedroom'}</li>
          <li>{listing.bathrooms > 1 ? `${listing.bathrooms} Bathrooms` : '1 Bathroom'}</li>
          <li>{listing.parking && 'Parking Spot'}</li>
          <li>{listing.furnished && 'Furnished'}</li>
        </ul>
        <p className='listingLocationTitle'>Location</p>
        <div className='leafletContainer'>
          <MapContainer
            style={{ height: '100%', width: '100%' }}
            center={[listing.geolocation.lat, listing.geolocation.lng]}
            zoom={13}
            scrollWheelZoom={false}>
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png'
            />

            <Marker position={[listing.geolocation.lat, listing.geolocation.lng]}>
              <Popup>{listing.location}</Popup>
            </Marker>
          </MapContainer>
        </div>

        {auth.currentUser?.uid !== listing.userRef && (
          <Link
            to={`/contact/${listing.userRef}?listingName=${listing.name}`}
            className='primaryButton'>
            Contact Owner
          </Link>
        )}
      </div>
    </main>
  )
  return template
}

export default Listing
