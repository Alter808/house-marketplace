import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg'
import visibilityIcon from '../assets/svg/visibilityIcon.svg'
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { db } from '../firebase.config'
import { setDoc, doc, serverTimestamp } from 'firebase/firestore'
import { toast } from 'react-toastify'
import OAuth from '../components/OAuth'

function SignUp() {
  //create the show password state to make the password input content visible or not
  const [showPassword, setShowPassword] = useState(false)
  //create form data state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  //destruct formData object into email, password single variables
  const { name, email, password } = formData

  const navigate = useNavigate()

  //handles the change of form input fields.
  const handleChange = (e) => {
    setFormData((prevState) => ({ ...prevState, [e.target.id]: e.target.value }))
  }

  /*handles form submit event here is where user is created 
  in firebase auth and in the user collection in firebase DB.*/
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const auth = getAuth()
      const userCredentials = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredentials.user
      await updateProfile(auth.currentUser, { displayName: name })
      let formDataCopy = formData
      delete formDataCopy.password
      formDataCopy.timestamp = serverTimestamp()
      const docRef = doc(db, 'users', user.uid)
      await setDoc(docRef, formDataCopy)
      toast.success('Successfuly registered', {
        theme: 'colored'
      })
      navigate('/')
    } catch (error) {
      toast.error('Something went wrong', {
        theme: 'colored'
      })
    }
  }

  //html template
  const template = (
    <>
      <div className='pageContainer'>
        <header>
          <p className='pageHeader'>Create your Account</p>
        </header>

        <form onSubmit={handleSubmit}>
          <input
            type='text'
            className='nameInput'
            placeholder='Name'
            id='name'
            value={name}
            onChange={handleChange}
          />
          <input
            type='email'
            className='emailInput'
            placeholder='Email'
            id='email'
            value={email}
            onChange={handleChange}
          />
          <div className='passwordInputDiv'>
            <input
              type={showPassword ? 'text' : 'password'}
              className='passwordInput'
              placeholder='password'
              id='password'
              value={password}
              onChange={handleChange}
            />
            <img
              src={visibilityIcon}
              alt='show password'
              className='showPassword'
              onClick={() => setShowPassword((prevState) => !prevState)}
            />
          </div>
          <Link to='/forgot-password' className='forgotPasswordLink'>
            Forgot Password
          </Link>
          <div className='signUpBar'>
            <p className='signUpText'>Sign Up</p>
            <button className='signUpButton'>
              <ArrowRightIcon fill='#ffffff' width='34px' height='34px' />
            </button>
          </div>
        </form>
        <OAuth />
        <Link to='/sign-in' className='registerLink'>
          Sign In Instead
        </Link>
      </div>
    </>
  )
  return template
}

export default SignUp
