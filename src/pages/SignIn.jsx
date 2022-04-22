import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg'
import visibilityIcon from '../assets/svg/visibilityIcon.svg'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import OAuth from '../components/OAuth'
import { toast } from 'react-toastify'

function SignIn() {
  // create the show password state to make the password input content visible or not
  const [showPassword, setShowPassword] = useState(false)
  //create form data state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  //destruct formData object into email, password single variables
  const { email, password } = formData

  const navigate = useNavigate()

  //handles the change of form input fields.
  function handleChange(e) {
    setFormData((prevState) => ({ ...prevState, [e.target.id]: e.target.value }))
  }

  //handles form submit event here is where the firebase sign in happens.
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const auth = getAuth()
      const userCredentials = await signInWithEmailAndPassword(auth, email, password)
      if (userCredentials.user) {
        navigate('/')
      }
    } catch (error) {
      toast.error('Wrong credentials', {
        theme: 'colored'
      })
    }
  }

  //html template to render.
  const template = (
    <>
      <div className='pageContainer'>
        <header>
          <p className='pageHeader'>Welcome Back!</p>
        </header>
        <main>
          <form onSubmit={handleSubmit}>
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
            <div className='signInBar'>
              <p className='signInText'>Sign In</p>
              <button className='signInButton'>
                <ArrowRightIcon fill='#ffffff' width='34px' height='34px' />
              </button>
            </div>
          </form>
          <OAuth />
          <Link to='/sign-up' className='registerLink'>
            Sign Up Instead
          </Link>
        </main>
      </div>
    </>
  )
  return template
}

export default SignIn
