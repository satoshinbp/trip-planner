import React, { useEffect } from "react"
import router from "next/router"
import firebase from "./lib/firebase"
import db from './lib/db'
import LoadingPage from "./components/LoadingPage"

export default Component => props => {
  const { status, setStatus, setUser, setTrips } = props

  useEffect(() => {
    firebase.auth().onAuthStateChanged(authUser => {
      setStatus('loading')

      if (authUser) {
        const tripsRef = db.collection('users').doc(authUser.uid).collection('trips')

        tripsRef.get().then(snapshot => {
          const tripsData = []

          snapshot.forEach(childSnapshot => {
            tripsData.push({
              id: childSnapshot.id,
              ...childSnapshot.data()
            })
          })

          setUser(authUser)
          setTrips(tripsData)
          setStatus('signed in')
        })
      } else {
        setUser(null)
        setTrips([])
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
    } else if (status === 'signed in' || (status === 'signed out' && router.pathname === '/')) {
      return <Component {...props} />
    }
  }

  return <>{renderContent()}</>
}
