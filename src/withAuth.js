import React, { useEffect } from 'react'
import router from 'next/router'
import firebase from './lib/firebase'
import LoadingPage from './components/LoadingPage'

export default (Component) => (props) => {
  const { status, setStatus } = props

  useEffect(() => {
    firebase.auth().onAuthStateChanged((authUser) => {
      setStatus('loading')

      if (authUser) {
        setStatus('signed in')
      } else {
        setStatus('signed out')

        if (router.pathname !== '/') {
          router.push('/')
        }
      }
    })
  }, [])

  const renderContent = () => {
    if (status === 'loading') {
      return <LoadingPage />
    } else if (
      status === 'signed in' ||
      (status === 'signed out' && router.pathname === '/')
    ) {
      return <Component {...props} />
    }
  }

  return <>{renderContent()}</>
}
