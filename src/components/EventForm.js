import React, { useState, useEffect } from 'react'
import { isAfter, setHours } from 'date-fns'
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
import Grid from '@material-ui/core/Grid'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import DeleteIcon from '@material-ui/icons/Delete'
import SaveIcon from '@material-ui/icons/Save'
import None from './None'
import Restaurant from './Restaurant'
import Hotel from './Hotel'
import Transportation from './Transportation'
import db from '../lib/db'
import categories from '../lib/eventCategories'
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
    event: {
      category: 'none',
      name: '',
      startTime: dates[0],
      endTime: null,
      address: '',
      reservation: false,
      URL: '',
      note: '',
    },
    restaurant: {
      category: 'restaurant',
      name: '',
      startTime: dates[0],
      endTime: null,
      address: '',
      reservation: false,
      URL: '',
      note: '',
    },
    hotel: {
      category: 'hotel',
      name: '',
      startTime: setHours(dates[0], 15),
      endTime: setHours(dates[1], 10),
      checkInTime: null,
      checkOutTime: null,
      address: '',
      reservation: false,
      URL: '',
      note: '',
    },
    transportation: {
      category: 'transportation',
      subCategory: 'walk',
      origin: '',
      destination: '',
      startTime: dates[0],
      endTime: null,
      reservation: false,
      URL: '',
      note: '',
    },
    action: { mode: '', id: '' },
  }
  const [newEvent, setNewEvent] = useState(def.event)

  const user = firebase.auth().currentUser
  const eventsRef = db.collection('users').doc(user.uid).collection('trips').doc(tid).collection('events')

  const clearState = () => {
    setAction(def.action)
    setNewEvent(def.event)
  }
  const closeOutAction = () => {
    setIsLoading(def.isLoading)
    setNewEvent(def.event)
  }
  const handleAction = () => {
    setIsLoading({ deep: false, shallow: true })

    switch (action.mode) {
      case 'add':
        setAction(def.action)

        eventsRef.add(newEvent).then(snapshot => {
          setEvents([...events, { id: snapshot.id, ...newEvent }].sort((a, b) => {
            if (isAfter(b.startTime, a.startTime)) return -1
            if (isAfter(a.startTime, b.startTime)) return 1
            return 0
          }))
          closeOutAction()
        })
        break
      case 'edit':
        setAction(def.action)

        eventsRef.doc(action.id).update(newEvent).then(() => {
          const untouchedEvents = events.filter(trip => trip.id !== action.id)
          setEvents([...untouchedEvents, { id: action.id, ...newEvent }].sort((a, b) => {
            if (isAfter(b.startTime, a.startTime)) return -1
            if (isAfter(a.startTime, b.startTime)) return 1
            return 0
          }))
          closeOutAction()
        })
        break
    }
  }
  const handleDelete = () => {
    setIsLoading({ deep: false, shallow: true })
    setAction({ ...action, mode: '' })

    eventsRef.doc(action.id).delete().then(() => {
      setEvents(events.filter(event => event.id !== action.id))
      setAction(def.action)
      closeOutAction()
    })
  }
  const handleCategoryChange = e => {
    switch (e.target.value) {
      case 'none':
        setNewEvent(def.event)
        break
      case 'restaurant':
        setNewEvent(def.restaurant)
        break
      case 'hotel':
        setNewEvent(def.hotel)
        break
      case 'transportation':
        setNewEvent(def.transportation)
        break
    }
  }
  const renderContent = category => {
    switch (category) {
      case 'none':
        return <None newEvent={newEvent} setNewEvent={setNewEvent} />
      case 'restaurant':
        return <Restaurant newEvent={newEvent} setNewEvent={setNewEvent} />
      case 'hotel':
        return <Hotel newEvent={newEvent} setNewEvent={setNewEvent} />
      case 'transportation':
        return <Transportation newEvent={newEvent} setNewEvent={setNewEvent} />
      default:
        return <None newEvent={newEvent} setNewEvent={setNewEvent} />
    }
  }

  useEffect(() => {
    setNewEvent(action.mode === 'edit' ? events.filter(event => event.id === action.id)[0] : def.event)
  }, [action.mode])

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Dialog open={Boolean(action.mode)} onClose={clearState}>
        <DialogTitle>New Event</DialogTitle>

        <DialogContent>
          <FormControl margin={matchesXS ? 'dense' : 'normal'}>
            <TextField
              select
              label="Category"
              value={newEvent.category}
              onChange={handleCategoryChange}
              className={classes.select}
            >
              {categories.map(category => (
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
              ))}
            </TextField>
          </FormControl>
        {renderContent(newEvent.category)}
        </DialogContent>

      <DialogActions>
        <Button onClick={clearState} color="primary">Cancel</Button>
        {action.mode === 'add' ?
          <Button variant="contained" color="primary" onClick={handleAction}>
            Add
            </Button>
          : action.mode === 'edit' ?
            <>
              <Button variant="contained" color="primary" startIcon={matchesXS ? null : <SaveIcon />} onClick={handleAction}>
                Save
                </Button>
              <Button variant="contained" color="secondary" startIcon={matchesXS ? null : <DeleteIcon />} onClick={handleDelete}>
                Delete
                </Button>
            </>
            : null
        }
      </DialogActions>
      </Dialog>
    </MuiPickersUtilsProvider >
  )
}
