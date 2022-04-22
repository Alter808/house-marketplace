import { getAuth } from 'firebase/auth'
import { collection, query, where, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase.config'
import { useState, useEffect } from 'react'
import ListingItem from './ListingItem'
import { toast } from 'react-toastify'

function ProfileListings() {
  const auth = getAuth()
  const user = auth.currentUser
  const [listings, setListings] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const getListings = async () => {
      try {
        const listingsRef = collection(db, 'listings')
        const q = query(listingsRef, orderBy('timestamp', 'desc'), where('userRef', '==', user.uid))
        const querySnapshot = await getDocs(q)
        let finalListings = []
        querySnapshot.forEach((doc) => {
          finalListings.push({ id: doc.id, data: doc.data() })
        })
        setListings(finalListings)
        setLoading(false)
      } catch (error) {
        toast.error('Some error ocurred retrieving your listings')
      }
    }
    getListings()
  }, [])

  //delete item function will be passed to the listing item it will
  //show the delete icon and execute the function.
  const onDelete = async (listingId) => {
    if (window.confirm('Are you sure you want to delete?')) {
      try {
        await deleteDoc(doc(db, 'listings', listingId))
        const updatedListings = listings.filter((listing) => listing.id !== listingId)
        setListings(updatedListings)
        toast.success('Successfully deleted listing')
      } catch (error) {
        toast.error('Something wennt wrong deleting this Listing')
      }
    }
  }
  return (
    !loading &&
    listings?.length > 0 && (
      <>
        <p className='listingText'>Your Listings</p>
        <ul className='listingsList'>
          {listings.map((listing) => (
            <ListingItem
              key={listing.id}
              listing={listing.data}
              id={listing.id}
              onDelete={() => onDelete(listing.id)}
              // onEdit={() => onEdit(listing.id)}
            />
          ))}
        </ul>
      </>
    )
  )
}

export default ProfileListings
