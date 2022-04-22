import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase.config'
import { toast } from 'react-toastify'
import Spinner from '../components/Spinner'
import ListingItem from '../components/ListingItem'

const getListings = async (catName) => {
  try {
    //create a reference on the listings collection
    const listingsRef = collection(db, 'listings')
    //create a query against the collection.
    const q = query(listingsRef, where('type', '==', catName))
    //execute the query and get the docs from firebase
    const querySnapshot = await getDocs(q)
    //empty array to push on it the docs returned from firebase
    const listings = []
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      listings.push({ id: doc.id, data: doc.data() })
    })
    return listings
  } catch (error) {
    toast.error('Could not fetch docs')
    return error
  }
}

function Categories() {
  const params = useParams()
  const [listings, setListings] = useState()
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const response = async () => {
      try {
        const listings = await getListings(params.categoryName)
        setListings(listings)
        setLoading(false)
      } catch (error) {
        toast.error('Could Not fetch docs')
      }
    }
    response()
  }, [])

  //Main template.
  const mainTemplate = loading ? (
    <Spinner />
  ) : listings && listings.length > 0 ? (
    <>
      <main>
        <ul className='categoryListings'>
          {listings.map((listing) => (
            <ListingItem key={listing.id} listing={listing.data} id={listing.id} />
          ))}
        </ul>
      </main>
    </>
  ) : (
    <p>No Listings for {params.categoryName} </p>
  )
  //final template.
  const template = (
    <div className='category'>
      <header>
        <p className='pageHeader'>
          {params.categoryName === 'rent' ? 'Places for Rent' : 'Places for Sale'}
        </p>
      </header>
      {mainTemplate}
    </div>
  )
  return template
}

export default Categories
