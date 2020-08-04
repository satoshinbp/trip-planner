import React, { useState, useEffect } from 'react'
import { isAfter } from 'date-fns'
import DateFnsUtils from '@date-io/date-fns'
import { MuiPickersUtilsProvider, DateTimePicker } from '@material-ui/pickers'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import Grid from '@material-ui/core/Grid'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListSubheader from '@material-ui/core/ListSubheader'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import DirectionsBikeIcon from '@material-ui/icons/DirectionsBike'
import DirectionsBoatIcon from '@material-ui/icons/DirectionsBoat'
import DirectionsBusIcon from '@material-ui/icons/DirectionsBus'
import DirectionsCarIcon from '@material-ui/icons/DirectionsCar'
import DirectionsTransitIcon from '@material-ui/icons/DirectionsTransit'
import DirectionsWalkIcon from '@material-ui/icons/DirectionsWalk'
import FlightIcon from '@material-ui/icons/Flight'
import HotelIcon from '@material-ui/icons/Hotel'
import LocalTaxiIcon from '@material-ui/icons/LocalTaxi'
import RestaurantIcon from '@material-ui/icons/Restaurant'
import TripOriginIcon from '@material-ui/icons/TripOrigin'
import db from '../lib/db'
import firebase from '../lib/firebase'

const useStyles = makeStyles(theme => ({
  select: {
    minWidth: 120,
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
  },
}))

export default props => {
  const classes = useStyles()
  const theme = useTheme()
  const matchesXS = useMediaQuery(theme.breakpoints.down('xs'))
  const { tid, dates, events, setEvents, action, setAction, setIsLoading } = props

  const def = {
    isLoading: { deep: false, shallow: false },
    newEvent: { category: 'none', title: '', startTime: dates[0], endTime: null, location: '', note: '' },
    action: { name: '', id: '' },
    error: { title: false, message: '' },
  }
  const [newEvent, setNewEvent] = useState(def.newEvent)
  const [error, setError] = useState(def.error)

  const user = firebase.auth().currentUser
  const eventsRef = db.collection('users').doc(user.uid).collection('trips').doc(tid).collection('events')
  const categories = [
    { name: 'None', value: 'none', icon: <TripOriginIcon color="secondary" /> },
    { name: 'Meal', value: 'meal', icon: <RestaurantIcon color="secondary" /> },
    { name: 'Hotel', value: 'hotel', icon: <HotelIcon color="secondary" /> },
    {
      name: 'Transit',
      subCategories: [
        { name: 'Walk', value: 'walk', icon: <DirectionsWalkIcon color="secondary" /> },
        { name: 'Bike', value: 'bike', icon: <DirectionsBikeIcon color="secondary" /> },
        { name: 'Car', value: 'car', icon: <DirectionsCarIcon color="secondary" /> },
        { name: 'Taxi', value: 'taxi', icon: <LocalTaxiIcon color="secondary" /> },
        { name: 'Bus', value: 'bus', icon: <DirectionsBusIcon color="secondary" /> },
        { name: 'Train', value: 'train', icon: <DirectionsTransitIcon color="secondary" /> },
        { name: 'Flight', value: 'flight', icon: <FlightIcon color="secondary" /> },
        { name: 'Ferry', value: 'ferry', icon: <DirectionsBoatIcon color="secondary" /> },
      ]
    },
  ]

  const clearState = () => {
    setAction(def.action)
    setNewEvent(def.newEvent)
    setError(def.error)
  }

  const errorCheck = () => {
    if (!newEvent.title) {
      setError({ title: true, message: 'Title is required.' })
    } else {
      setError(def.error)
    }
  }

  const closeOutAction = () => {
    setIsLoading(def.isLoading)
    setNewEvent(def.newEvent)
    setError(def.error)
  }

  const handleAction = () => {
    errorCheck()

    const { category, title, startTime, endTime, location, note } = newEvent

    if (title && startTime) {
      setIsLoading({ deep: false, shallow: true })

      const eventData = { category, title, startTime, endTime, location, note }

      switch (action.name) {
        case 'add':
          setAction(def.action)

          eventsRef.add(eventData).then(snapshot => {
            setEvents([...events, { id: snapshot.id, ...eventData }])
            closeOutAction()
          })
          break
        case 'edit':
          setAction(def.action)

          eventsRef.doc(action.id).update(eventData).then(() => {
            const untouchedEvents = events.filter(trip => trip.id !== action.id)
            setEvents([...untouchedEvents, { id: action.id, ...tripData }])
            closeOutAction()
          })
          break
      }
    }
  }

  const handleCategoryChange = e => setNewEvent({ ...newEvent, category: e.target.value })
  const handleTitleChange = e => setNewEvent({ ...newEvent, title: e.target.value })
  const handleStartTimeChange = time => {
    if (isAfter(time, newEvent.endTime)) {
      setNewEvent({ ...newEvent, startTime: time, endTime: time })
    } else {
      setNewEvent({ ...newEvent, startTime: time })
    }
  }
  const handleEndTimeChange = time => {
    if (isAfter(newEvent.startTime, time)) {
      setNewEvent({ ...newEvent, startTime: time, endTime: time })
    } else {
      setNewEvent({ ...newEvent, endTime: time })
    }
  }
  const handleLocationChange = e => setNewEvent({ ...newEvent, location: e.target.value })
  const handleNoteChange = e => setNewEvent({ ...newEvent, note: e.target.value })

  useEffect(() => {
    if (error.title) {
      errorCheck()
    }
  }, [newEvent.title])

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Dialog open={Boolean(action.name)} onClose={clearState}>
        <DialogTitle>New Event</DialogTitle>

        <DialogContent>
          <FormControl margin={matchesXS ? 'dense' : 'normal'}>
            <TextField
              select
              label="Category"
              value={newEvent.category}
              onChange={handleCategoryChange}
              variant="outlined"
              className={classes.select}
            >
              {categories.map(category => (
                category.subCategories ? [
                  <ListSubheader>{category.name}</ListSubheader>,
                  category.subCategories.map((subCategory => (
                    <MenuItem value={subCategory.value} key={subCategory.value}>
                      <Grid container>
                        <Grid item>
                          <ListItemIcon className={classes.icon}>{subCategory.icon}</ListItemIcon>
                        </Grid>
                        <Grid item>
                          <Typography>{subCategory.name}</Typography>
                        </Grid>
                      </Grid>
                    </MenuItem>
                  )))
                ] : (
                    <MenuItem value={category.value} key={category.value}>
                      <Grid container>
                        <Grid item>
                          <ListItemIcon className={classes.icon}>{category.icon}</ListItemIcon>
                        </Grid>
                        <Grid item>
                          <Typography>{category.name}</Typography>
                        </Grid>
                      </Grid>
                    </MenuItem>
                  )
              ))}
            </TextField>
          </FormControl>
          <TextField
            autoFocus
            margin={matchesXS ? 'dense' : 'normal'}
            required
            label="Title"
            variant="outlined"
            value={newEvent.title}
            error={error.title}
            fullWidth
            onChange={handleTitleChange}
          />
          <Grid container direction={matchesXS ? 'column' : 'row'} spacing={matchesXS ? undefined : 2}>
            <Grid item md>
              <DateTimePicker
                margin={matchesXS ? 'dense' : 'normal'}
                required
                label="Start Time"
                inputVariant="outlined"
                ampm={false}
                format="yyyy/MM/dd HH:mm"
                value={newEvent.startTime}
                autoOk
                fullWidth={matchesXS ? true : false}
                onChange={handleStartTimeChange}
              />
            </Grid>
            <Grid item md>
              <DateTimePicker
                margin={matchesXS ? 'dense' : 'normal'}
                label="End Time"
                inputVariant="outlined"
                ampm={false}
                format="yyyy/MM/dd HH:mm"
                initialFocusedDate={newEvent.startTime}
                value={newEvent.endTime}
                autoOk
                fullWidth={matchesXS ? true : false}
                onChange={handleEndTimeChange}
              />
            </Grid>
          </Grid>
          <TextField
            margin={matchesXS ? 'dense' : 'normal'}
            id="location"
            label="Location"
            variant="outlined"
            value={newEvent.location}
            fullWidth
            onChange={handleLocationChange}
          />
          <TextField
            margin={matchesXS ? 'dense' : 'normal'}
            label="Note"
            variant="outlined"
            value={newEvent.note}
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
