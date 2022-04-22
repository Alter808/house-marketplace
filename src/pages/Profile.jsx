import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { getAuth, updateProfile } from 'firebase/auth'
import { db } from '../firebase.config'
import { doc, updateDoc } from 'firebase/firestore'
import { toast } from 'react-toastify'
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg'
import homeIcon from '../assets/svg/homeIcon.svg'
import ProfileListings from '../components/ProfileListings'
function Profile() {
  const navigate = useNavigate()
  const auth = getAuth()

  // formData state and the setter for the state
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email
  })

  //destructure formData fields into variables.
  const { name, email } = formData

  //state to enable form to change detail.
  const [changeDetails, setChangeDetails] = useState(false)

  //logout function.
  const onLogout = () => {
    auth.signOut()
    navigate('/')
  }

  const handleClick = () => {
    changeDetails && onSubmit()
    setChangeDetails((prevState) => !prevState)
  }
  //handle submit function.
  const onSubmit = async () => {
    try {
      if (auth.currentUser.displayName !== name) {
        //update in user profile
        updateProfile(auth.currentUser, {
          displayName: name
        })
        //update in firestore.
        const userRef = doc(db, 'users', auth.currentUser.uid)
        await updateDoc(userRef, {
          name: name
        })
        toast.success('User profile Updated')
      }
    } catch (error) {
      toast.success('something went wrong')
    }
  }
  const handleChange = (e) => {
    setFormData((prevState) => ({ ...prevState, [e.target.id]: e.target.value }))
  }

  //template to return if user is logged in or not.
  let template = (
    <div className='profile'>
      <header className='profileHeader'>
        <p className='pageHeader'>My Profile</p>
        <button type='button' className='logOut' onClick={onLogout}>
          Logout
        </button>
      </header>
      <main>
        <div className='profileDetailsHeader'>
          <p className='profileDetailsText'>Personal Details</p>
          <p className='changePersonalDetails' onClick={handleClick}>
            {changeDetails ? 'done' : 'change'}
          </p>
        </div>
        <div className='profileCard'>
          <form>
            <input
              type='text'
              id='name'
              className={!changeDetails ? 'profileName' : 'profileNameActive'}
              disabled={!changeDetails}
              value={name}
              onChange={handleChange}
            />
            <input
              type='text'
              id='email'
              className={!changeDetails ? 'profileEmail' : 'profileEmailActive'}
              disabled={true}
              value={email}
              onChange={handleChange}
            />
          </form>
        </div>
        <Link to='/create-listing' className='createListing'>
          <img src={homeIcon} alt='home' />
          <p style={{ color: 'white' }}>Sell or Rent a property</p>
          <img src={arrowRight} alt='home' />
        </Link>
      </main>
      <ProfileListings />
    </div>
  )

  return template
}

export default Profile
