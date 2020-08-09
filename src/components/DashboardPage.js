import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Backdrop from '@material-ui/core/Backdrop'
import Button from '@material-ui/core/Button'
import Container from '@material-ui/core/Container'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import Header from './Header'
import Footer from './Footer'
import LoadingPage from './LoadingPage'
import TripsFilter from './TripsFilter'
import TripsTable from './TripsTable'
import TripForm from './TripForm'
import db from '../lib/db'
import firebase from '../lib/firebase'

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(3),
    paddingBottom: theme.spacing(5.5),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(2),
      paddingBottom: theme.spacing(4.5),
    },
  },
  message: {
    marginBottom: '0.5em',
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}))

export default props => {
  const classes = useStyles()

  const [isLoading, setIsLoading] = useState({ deep: false, shallow: false })
  const [filter, setFilter] = useState('upcoming')
  const [trips, setTrips] = useState([])
  const [newTrip, setNewTrip] = useState({ title: '', startDate: new Date(), endDate: new Date(), location: '', note: '' })
  const [action, setAction] = useState({ name: '', id: '' })

  const handleAddTrip = () => setAction({ name: 'add', id: '' })
  const handleClose = () => setIsLoading({ deep: false, shallow: false })

  useEffect(() => {
    let unmounted = false

    setIsLoading({ deep: true, shallow: false })

    const user = firebase.auth().currentUser
    const tripsRef = db.collection('users').doc(user.uid).collection('trips')

    tripsRef.get().then(snapshot => {
      const tripsData = []
      snapshot.forEach(childSnapshot => {
        tripsData.push({
          id: childSnapshot.id,
          ...childSnapshot.data(),
          startDate: childSnapshot.data().startDate.toDate(),
          endDate: childSnapshot.data().endDate.toDate(),
        })
      })

      if (!unmounted) {
        setTrips(tripsData)
        setIsLoading({ deep: false, shallow: false })
      }
    })

    return () => {
      unmounted = true
    }
  }, [])

  return isLoading.deep ? <LoadingPage /> : (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <Header {...props} />
      <Container classes={{ root: classes.container }}>
        {trips.length === 0 ?
          <>
            <Typography variant="h4" className={classes.message}>
              You have no trips.
            </Typography>
            <Button variant="contained" color="primary" onClick={handleAddTrip}>
              Add a Trip
            </Button>
          </> : <>
            <TripsFilter {...props} filter={filter} setFilter={setFilter} setAction={setAction} />
            <TripsTable
              {...props}
              setIsLoading={setIsLoading}
              filter={filter}
              trips={trips}
              setTrips={setTrips}
              setNewTrip={setNewTrip}
              setAction={setAction}
            />
          </>
        }
      </Container>

      <TripForm
        {...props}
        setIsLoading={setIsLoading}
        trips={trips}
        setTrips={setTrips}
        newTrip={newTrip}
        setNewTrip={setNewTrip}
        action={action}
        setAction={setAction}
      />

      <Backdrop className={classes.backdrop} open={isLoading.shallow} onClick={handleClose}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Footer />
    </div >
  )
}
