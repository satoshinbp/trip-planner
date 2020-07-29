import React, { useState, useEffect } from 'react'
import { isAfter } from 'date-fns'
import DateFnsUtils from '@date-io/date-fns'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Grid from '@material-ui/core/Grid'
import FormHelperText from '@material-ui/core/FormHelperText'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'
import db from '../lib/db'
import { createTripData } from '../actions/createData'

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(1),
  },
}))

export default props => {
  const classes = useStyles()
  const theme = useTheme()
  const matchesXS = useMediaQuery(theme.breakpoints.down('xs'))

  const {
    user,
    trips,
    setTrips,
    open,
    setOpen,
    title,
    setTitle,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    location,
    setLocation,
    editID,
    setEditID,
  } = props

  const [titleError, setTitleError] = useState(false)
  const [dateError, setDateError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const tripsRef = db.collection('users').doc(user.uid).collection('trips')

  const clearState = () => {
    setOpen(false)
    setTitle('')
    setStartDate(new Date())
    setEndDate(null)
    setLocation('')
    setTitleError(false)
    setDateError(false)
    setErrorMessage('')
    setEditID('')
  }

  const errorCheck = () => {
    if (!title && !startDate) {
      setTitleError(true)
      setDateError(true)
      setErrorMessage('Title and start date are required.')
    } else if (!title) {
      setTitleError(true)
      setDateError(false)
      setErrorMessage('Title is required.')
    } else if (!startDate) {
      setTitleError(false)
      setDateError(true)
      setErrorMessage('Start date is required.')
    } else {
      setTitleError(false)
      setDateError(false)
      setErrorMessage('')
    }
  }

  const handleAddClick = () => {
    errorCheck()

    if (title && startDate) {
      const startDateData = [startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate()]
      const endDateData = endDate ? [endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate()] : startDateData

      const trip = {
        title,
        location,
        startDate: startDateData,
        endDate: endDateData,
      }

      tripsRef.add(trip).then(snapshot => {
        setTrips([...trips, createTripData(snapshot.id, title, startDateData, endDateData, location)])
        clearState()
      })
    }
  }

  const handleSaveClick = () => {
    errorCheck()
    
    if (title && startDate) {
      const startDateData = [startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate()]
      const endDateData = endDate ? [endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate()] : startDateData

      tripsRef.doc(editID).update({
        title,
        location,
        startDate: startDateData,
        endDate: endDateData ? endDateData : startDateData,
      }).then(() => {
        const noUpdateTrips = trips.filter(trip => trip.id !== editID)

        setTrips([...noUpdateTrips, createTripData(editID, title, startDateData, endDateData, location)])
        clearState()
      })
    }
  }

  const handleStartDateChange = date => {
    setStartDate(date)

    if (!endDate || isAfter(date, endDate)) {
      setEndDate(date)
    }
  }

  const handleEndDateChange = date => {
    setEndDate(date)

    if (isAfter(startDate, date)) {
      setStartDate(date)
    }
  }

  useEffect(() => {
    if (titleError || dateError) {
      errorCheck()
    }
  }, [title, startDate])

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Dialog open={Boolean(open)} onClose={clearState} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">New Trip</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            required
            id="title"
            label="Title"
            value={title}
            error={titleError}
            onChange={e => setTitle(e.target.value)}
            fullWidth
          />
          <Grid container direction={matchesXS ? 'column' : 'row'} spacing={matchesXS ? undefined : 2}>
            <Grid item md>
              <KeyboardDatePicker
                margin="dense"
                required
                id="startDate"
                label="Start Date"
                format="yyyy/MM/dd"
                value={startDate}
                autoOk
                error={dateError}
                onChange={handleStartDateChange}
                KeyboardButtonProps={{ 'aria-label': 'change date' }}
                fullWidth={matchesXS ? true : false}
              />
            </Grid>
            <Grid item md>
              <KeyboardDatePicker
                margin="dense"
                required
                id="endDate"
                label="End Date"
                format="yyyy/MM/dd"
                value={endDate}
                autoOk
                onChange={handleEndDateChange}
                KeyboardButtonProps={{ 'aria-label': 'change date' }}
                fullWidth={matchesXS ? true : false}
              />
            </Grid>
          </Grid>
          <TextField
            margin="dense"
            id="location"
            label="Location"
            value={location}
            onChange={e => setLocation(e.target.value)}
            fullWidth
          />
          <FormHelperText error={titleError || dateError}>{errorMessage}</FormHelperText>
        </DialogContent>
        <DialogActions classes={{ root: classes.root }}>
          <Button onClick={clearState} color="primary">
            Cancel
          </Button>
          {
            open === 'add' ? (
              <Button variant="contained" onClick={handleAddClick} color="primary">
                Add
              </Button>
            ) : open === 'edit' ? (
              <Button variant="contained" onClick={handleSaveClick} color="primary">
                Save
              </Button>
            ) : null
          }
        </DialogActions>
      </Dialog>
    </MuiPickersUtilsProvider>
  )
}
