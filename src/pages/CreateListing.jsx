import { useState, useEffect } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getStorage, ref, getDownloadURL, uploadBytes } from 'firebase/storage'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.config'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import Spinner from '../components/Spinner'

const uploadImages = async (images, user) => {
  const filesArray = Array.from(images)
  const storage = getStorage()
  try {
    let result = Promise.all(
      filesArray.map(async (file) => {
        const storageRef = ref(storage, `${uuidv4()}_${user}_${file.name}`)
        const res = await uploadBytes(storageRef, file)
        return getDownloadURL(res.ref)
      })
    )

    return result
  } catch (error) {
    return error
  }
}

const saveDocument = async (document) => {
  try {
    const docRef = await addDoc(collection(db, 'listings'), document)
    toast.success('Document Created')
    return docRef
  } catch (error) {
    toast.error('something went wrong')
  }
}

function CreateListing() {
  const [geolocationEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: 'rent',
    name: '',
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: '',
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: {},
    latitude: 0,
    longitude: 0
  })
  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    offer,
    regularPrice,
    discountedPrice,
    images,
    latitude,
    longitude
  } = formData

  const auth = getAuth()
  const navigate = useNavigate()

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setFormData({ ...formData, userRef: user.uid })
      } else {
        navigate('/sign-in')
      }
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    if (parseFloat(discountedPrice) >= parseFloat(regularPrice)) {
      setLoading(false)
      toast.error('Discounted price should be less than regular price')
      return
    }
    if (images.length > 6) {
      setLoading(false)
      toast.error('Max 6 images')
      return
    }

    try {
      // upload images to firebase storage
      let imgs = await uploadImages(images, formData.userRef)
      //save the document to firestore.
      let doc = {
        bathrooms: bathrooms,
        bedrooms: bedrooms,
        discountedPrice: parseFloat(discountedPrice),
        furnished: furnished,
        geolocation: {
          lat: latitude,
          lng: longitude
        },
        imageUrls: imgs,
        location: address,
        name: name,
        offer: offer,
        parking: parking,
        regularPrice: parseFloat(regularPrice),
        timestamp: serverTimestamp(),
        type: type,
        userRef: formData.userRef
      }
      const docRef = await saveDocument(doc)
      navigate(`/category/${formData.type}/${docRef.id}`)
    } catch (error) {
      toast.error('Error trying to save to database try again later')
    }

    setLoading(false)
  }

  const onMutate = (e) => {
    let boolean = null

    if (e.target.value === 'true') {
      boolean = true
    }
    if (e.target.value === 'false') {
      boolean = false
    }

    // Files
    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files
      }))
    }

    // Text/Booleans/Numbers
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value
      }))
    }
  }

  const template = (
    <div className='profile'>
      <header>
        <p className='pageHeader'>Create a Listing</p>
      </header>

      <main>
        <form onSubmit={handleSubmit}>
          <label className='formLabel'>Sell / Rent</label>
          <div className='formButtons'>
            <button
              type='button'
              className={type === 'sale' ? 'formButtonActive' : 'formButton'}
              id='type'
              value='sale'
              onClick={onMutate}>
              Sell
            </button>
            <button
              type='button'
              className={type === 'rent' ? 'formButtonActive' : 'formButton'}
              id='type'
              value='rent'
              onClick={onMutate}>
              Rent
            </button>
          </div>

          <label className='formLabel'>Name</label>
          <input
            className='formInputName'
            type='text'
            id='name'
            value={name}
            onChange={onMutate}
            maxLength='32'
            minLength='10'
            required
          />

          <div className='formRooms flex'>
            <div>
              <label className='formLabel'>Bedrooms</label>
              <input
                className='formInputSmall'
                type='number'
                id='bedrooms'
                value={bedrooms}
                onChange={onMutate}
                min='1'
                max='50'
                required
              />
            </div>
            <div>
              <label className='formLabel'>Bathrooms</label>
              <input
                className='formInputSmall'
                type='number'
                id='bathrooms'
                value={bathrooms}
                onChange={onMutate}
                min='1'
                max='50'
                required
              />
            </div>
          </div>

          <label className='formLabel'>Parking spot</label>
          <div className='formButtons'>
            <button
              className={parking ? 'formButtonActive' : 'formButton'}
              type='button'
              id='parking'
              value={true}
              onClick={onMutate}
              min='1'
              max='50'>
              Yes
            </button>
            <button
              className={!parking && parking !== null ? 'formButtonActive' : 'formButton'}
              type='button'
              id='parking'
              value={false}
              onClick={onMutate}>
              No
            </button>
          </div>

          <label className='formLabel'>Furnished</label>
          <div className='formButtons'>
            <button
              className={furnished ? 'formButtonActive' : 'formButton'}
              type='button'
              id='furnished'
              value={true}
              onClick={onMutate}>
              Yes
            </button>
            <button
              className={!furnished && furnished !== null ? 'formButtonActive' : 'formButton'}
              type='button'
              id='furnished'
              value={false}
              onClick={onMutate}>
              No
            </button>
          </div>

          <label className='formLabel'>Address</label>
          <textarea
            className='formInputAddress'
            type='text'
            id='address'
            value={address}
            onChange={onMutate}
            required
          />

          {!geolocationEnabled && (
            <div className='formLatLng flex'>
              <div>
                <label className='formLabel'>Latitude</label>
                <input
                  className='formInputSmall'
                  type='number'
                  id='latitude'
                  value={latitude}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label className='formLabel'>Longitude</label>
                <input
                  className='formInputSmall'
                  type='number'
                  id='longitude'
                  value={longitude}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}

          <label className='formLabel'>Offer</label>
          <div className='formButtons'>
            <button
              className={offer ? 'formButtonActive' : 'formButton'}
              type='button'
              id='offer'
              value={true}
              onClick={onMutate}>
              Yes
            </button>
            <button
              className={!offer && offer !== null ? 'formButtonActive' : 'formButton'}
              type='button'
              id='offer'
              value={false}
              onClick={onMutate}>
              No
            </button>
          </div>

          <label className='formLabel'>Regular Price</label>
          <div className='formPriceDiv'>
            <input
              className='formInputSmall'
              type='number'
              id='regularPrice'
              value={regularPrice}
              onChange={onMutate}
              min='50'
              max='750000000'
              required
            />
            {type === 'rent' && <p className='formPriceText'>$ / Month</p>}
          </div>

          {offer && (
            <>
              <label className='formLabel'>Discounted Price</label>
              <input
                className='formInputSmall'
                type='number'
                id='discountedPrice'
                value={discountedPrice}
                onChange={onMutate}
                min='50'
                max='750000000'
                required={offer}
              />
            </>
          )}

          <label className='formLabel'>Images</label>
          <p className='imagesInfo'>The first image will be the cover (max 6).</p>
          <input
            className='formInputFile'
            type='file'
            id='images'
            onChange={onMutate}
            max='6'
            accept='.jpg,.png,.jpeg'
            multiple
            required
          />
          <button type='submit' className='primaryButton createListingButton'>
            Create Listing
          </button>
        </form>
      </main>
    </div>
  )

  if (loading) {
    return <Spinner />
  }
  return template
}

export default CreateListing
