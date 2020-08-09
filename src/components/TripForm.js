import React, { useState, useEffect } from 'react'
import { isAfter } from 'date-fns'
import DateFnsUtils from '@date-io/date-fns'
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers'
import { useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import FormHelperText from '@material-ui/core/FormHelperText'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import db from '../lib/db'
import firebase from '../lib/firebase'

export default props => {
  const theme = useTheme()
  const matchesXS = useMediaQuery(theme.breakpoints.down('xs'))
  const {
    setIsLoading,
    trips,
    setTrips,
    newTrip,
    setNewTrip,
    action,
    setAction,
  } = props

  const def = {
    newTrip: { title: '', startDate: new Date(), endDate: null, location: '', note: '' },
    action: { name: '', id: '' },
    error: { title: false, message: '' },
  }
  const [error, setError] = useState(def.error)

  const user = firebase.auth().currentUser
  const tripsRef = db.collection('users').doc(user.uid).collection('trips')

  const clearState = () => {
    setAction(def.action)
    setNewTrip(def.newTrip)
    setError(def.error)
  }

  const errorCheck = () => {
    if (!newTrip.title) {
      setError({ title: true, message: 'Title is required.' })
    } else {
      setError(def.error)
    }
  }

  const closeOutAction = () => {
    setIsLoading({ deep: false, shallow: false })
    setNewTrip(def.newTrip)
    setError(def.error)
  }

  const handleAction = () => {
    errorCheck()

    const { title, startDate, endDate, location, note } = newTrip

    if (title && startDate) {
      setIsLoading({ deep: false, shallow: true })

      const tripData = { title, startDate, endDate: endDate ? endDate : startDate, location, note }

      switch (action.name) {
        case 'add':
          setAction(def.action)

          tripsRef.add(tripData).then(snapshot => {
            setTrips([...trips, { id: snapshot.id, ...tripData }])
            closeOutAction()
          })
          break
        case 'edit':
          setAction(def.action)
          tripsRef.doc(action.id).update(tripData).then(() => {
            const untouchedTrips = trips.filter(trip => trip.id !== action.id)
            setTrips([...untouchedTrips, { id: action.id, ...tripData }])
            closeOutAction()
          })
          break
      }
    }
  }

  const handleTitleChange = e => setNewTrip({ ...newTrip, title: e.target.value })
  const handleStartDateChange = date => {
    if (!newTrip.endDate || isAfter(date, newTrip.endDate)) {
      setNewTrip({ ...newTrip, startDate: date, endDate: date })
    } else {
      setNewTrip({ ...newTrip, startDate: date })
    }
  }
  const handleEndDateChange = date => {
    if (isAfter(newTrip.startDate, date)) {
      setNewTrip({ ...newTrip, startDate: date, endDate: date })
    } else {
      setNewTrip({ ...newTrip, endDate: date })
    }
  }
  const handleLocationChange = e => setNewTrip({ ...newTrip, location: e.target.value })
  const handleNoteChange = e => setNewTrip({ ...newTrip, note: e.target.value })

  useEffect(() => {
    if (error.title) {
      errorCheck()
    }
  }, [newTrip.title])

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Dialog open={Boolean(action.name)} onClose={clearState}>
        <DialogTitle>New Trip</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin={matchesXS ? 'dense' : 'normal'}
            required
            label="Title"
            value={newTrip.title}
            error={error.title}
            fullWidth
            onChange={handleTitleChange}
          />
          <Grid container direction={matchesXS ? 'column' : 'row'} spacing={matchesXS ? undefined : 2}>
            <Grid item md>
              <DatePicker
                margin={matchesXS ? 'dense' : 'normal'}
                required
                label="Start Date"
                format="yyyy/MM/dd"
                value={newTrip.startDate}
                autoOk
                fullWidth={matchesXS ? true : false}
                onChange={handleStartDateChange}
              />
            </Grid>
            <Grid item md>
              <DatePicker
                margin={matchesXS ? 'dense' : 'normal'}
                id="endDate"
                label="End Date"
                format="yyyy/MM/dd"
                value={newTrip.endDate}
                autoOk
                fullWidth={matchesXS ? true : false}
                onChange={handleEndDateChange}
              />
            </Grid>
          </Grid>
          <TextField
            margin={matchesXS ? 'dense' : 'normal'}
            id="location"
            label="Location"
            value={newTrip.location}
            fullWidth
            onChange={handleLocationChange}
          />
          <TextField
            margin={matchesXS ? 'dense' : 'normal'}
            label="Note"
            variant="outlined"
            value={newTrip.note}
            fullWidth
            multiline
            rows={3}
            onChange={handleNoteChange}
          />
          <FormHelperText error={error.title || error.date}>{error.message}</FormHelperText>
        </DialogContent>
        <DialogActions>
          <Button onClick={clearState} color="primary">Cancel</Button>
          <Button variant="contained" onClick={handleAction} color="primary">
            {action.name === 'add' ? 'Add'
              : action.name === 'edit' ? 'Save'
                : null}
          </Button>
        </DialogActions>
      </Dialog>
    </MuiPickersUtilsProvider>
  )
}
