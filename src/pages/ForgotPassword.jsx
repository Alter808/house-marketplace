import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'
import { toast } from 'react-toastify'
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg'

function ForgotPassword() {
  //email state
  const [email, setEmail] = useState('')

  //Handle change of email input field and sets the email state.
  const handleChange = (e) => {
    setEmail(e.target.value)
  }

  //handles form submit event here is where the reset email is sent
  const handleSubmit = async (e) => {
    e.preventDefault()
    const auth = getAuth()
    try {
      await sendPasswordResetEmail(auth, email)
      toast.success('Reset passord email sent')
    } catch (error) {
      toast.error('Could not send reset email')
    }
  }

  const template = (
    <div className='pageContainer'>
      <header>
        <p className='pageHeader'>Forgot Password</p>
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
          <Link className='forgotPasswordLink' to='/sign-in'>
            Sign in
          </Link>
          <div className='signInBar'>
            <div className='signInText'>Send Reset Link</div>
            <button className='signInButton'>
              <ArrowRightIcon fill='#ffffff' width='34px' height='34px' />
            </button>
          </div>
        </form>
      </main>
    </div>
  )
  return template
}

export default ForgotPassword
