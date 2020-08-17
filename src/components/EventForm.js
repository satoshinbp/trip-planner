import React, { useState, useEffect } from 'react'
import { isAfter, setHours } from 'date-fns'
import DateFnsUtils from '@date-io/date-fns'
import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import FormControl from '@material-ui/core/FormControl'
import Grid from '@material-ui/core/Grid'
import InputAdornment from '@material-ui/core/InputAdornment'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import DeleteIcon from '@material-ui/icons/Delete'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import SaveIcon from '@material-ui/icons/Save'
import EventFormBasic from './EventFormBasic'
import EventFormHotel from './EventFormHotel'
import EventFormTransport from './EventFormTransport'
import db from '../lib/db'
import categories from '../lib/eventCategories'
import firebase from '../lib/firebase'

const useStyles = makeStyles(theme => ({
  select: {
    [theme.breakpoints.up('sm')]: {
      width: 250,
    },
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
  },
  link: {
    color: theme.palette.primary.main,
  },
}))

export default props => {
  const classes = useStyles()
  const theme = useTheme()
  const matchesXS = useMediaQuery(theme.breakpoints.down('xs'))
  const { tid, dates, setIsLoading, events, setEvents, action, setAction } = props

  const eventBase = {
    name: '',
    startTime: dates[0],
    endTime: null,
    location: { address: '' },
    reservation: false,
    URL: '',
    note: '',
  }

  const def = {
    none: { category: '' },
    tour: { category: 'tour', ...eventBase },
    cinema: { category: 'cinema', ...eventBase },
    restaurant: { category: 'restaurant', ...eventBase },
    shopping: { category: 'shopping', ...eventBase },
    hotel: {
      category: 'hotel',
      name: '',
      startTime: setHours(dates[0], 15),
      endTime: dates.length !== 1 ? setHours(dates[1], 10) : null,
      checkInTime: null,
      checkOutTime: null,
      location: { address: '' },
      reservation: false,
      URL: '',
      note: '',
    },
    transportation: {
      category: 'transportation',
      subCategory: 'walk',
      origin: { address: '', lat: undefined, lng: undefined },
      destination: { address: '', lat: undefined, lng: undefined },
      startTime: dates[0],
      endTime: null,
      reservation: false,
      URL: '',
      note: '',
    },
    isLoading: { deep: false, shallow: false },
    action: { mode: '', id: '' },
    result: { error: false, message: '' },
  }
  const [newEvent, setNewEvent] = useState(def.none)
  const [result, setResult] = useState(def.result)
  const [hotelError, setHotelError] = useState(false)

  const user = firebase.auth().currentUser
  const eventsRef = db.collection('users').doc(user.uid).collection('trips').doc(tid).collection('events')

  const resultCheck = () => {
    switch (newEvent.category) {
      case 'tour':
      case 'cinema':
        if (!newEvent.name) {
          setResult({ error: true, message: 'Title is required.' })
          return false
        } else {
          setResult(def.result)
          return true
        }
      case 'restaurant':
      case 'shopping':
        if (!newEvent.name) {
          setResult({ error: true, message: 'Name is required.' })
          return false
        } else {
          setResult(def.result)
          return true
        }
      case 'hotel':
        if (!newEvent.name) {
          setResult({ error: true, message: 'Name is required.' })
          return false
        } else {
          setResult(def.result)
          return true
        }
      case 'transportation':
        if (!newEvent.origin && !newEvent.destination) {
          setResult({ error: true, message: 'Origin and destination are required.' })
          return false
        } else if (!newEvent.origin) {
          setResult({ error: true, message: 'Origin is required.' })
          return false
        } else if (!newEvent.destination) {
          setResult({ error: true, message: 'Destination is required.' })
          return false
        } else {
          setResult(def.result)
          return true
        }
      default:
        setResult({ error: true, message: 'Category is required.' })
        return false
    }
  }

  const handleAction = () => {
    if (resultCheck()) {
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
            setIsLoading(def.isLoading)
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
            setIsLoading(def.isLoading)
          })
          break
      }
    }
  }

  const handleDelete = () => {
    setIsLoading({ deep: false, shallow: true })
    setAction({ ...action, mode: '' })

    eventsRef.doc(action.id).delete().then(() => {
      setEvents(events.filter(event => event.id !== action.id))
      setAction(def.action)
      setIsLoading(def.isLoading)
    })
  }

  const handleCategoryChange = e => {
    if (e.target.value === 'hotel' && dates.length === 1) {
      setNewEvent(def.none)
      setHotelError(true)
    } else {
      setNewEvent(def[e.target.value])
      setHotelError(false)
    }
  }

  const handleURLChange = e => setNewEvent({ ...newEvent, URL: e.target.value })

  const handleNoteChange = e => setNewEvent({ ...newEvent, note: e.target.value })

  const URL = () => (
    <TextField
      margin={matchesXS ? 'dense' : 'normal'}
      label="URL"
      value={newEvent.URL}
      fullWidth
      InputProps={{
        endAdornment: newEvent.URL && (
          <InputAdornment position="end" component="a" href={newEvent.URL} className={classes.link}>
            <OpenInNewIcon />
          </InputAdornment>
        ),
      }}
      onChange={handleURLChange}
    />
  )

  const Note = () => (
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
  )

  const renderContent = category => {
    switch (category) {
      case 'tour':
      case 'cinema':
      case 'restaurant':
      case 'shopping':
        return (
          <>
            <EventFormBasic newEvent={newEvent} setNewEvent={setNewEvent} result={result} dates={dates} />
            <URL />
            <Note />
          </>
        )
      case 'hotel':
        return (
          <>
            <EventFormHotel newEvent={newEvent} setNewEvent={setNewEvent} result={result} dates={dates} />
            <URL />
            <Note />
          </>
        )
      case 'transportation':
        return (
          <>
            <EventFormTransport newEvent={newEvent} setNewEvent={setNewEvent} result={result} dates={dates} />
            <URL />
            <Note />
          </>
        )
      default:
        break
    }
  }

  useEffect(() => setNewEvent(action.mode === 'edit' ? events.filter(event => event.id === action.id)[0] : def.none), [action.mode])

  useEffect(() => { if (result.error) resultCheck() }, [newEvent])

  useEffect(() => setResult(def.result), [newEvent.category])

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Dialog open={Boolean(action.mode)} onClose={() => setAction(def.action)} maxWidth="sm" fullWidth>
        <DialogTitle>{action.mode === 'edit' ? 'Edit Event' : 'Add Event'}</DialogTitle>

        <DialogContent>
          <FormControl margin={matchesXS ? 'dense' : 'normal'} fullWidth={matchesXS ? true : false} className={classes.select}>
            <TextField
              select
              label="Category"
              value={newEvent.category}
              error={hotelError}
              helperText={hotelError && 'Cannot select hotel for one day trip.'}
              inputProps={{ readOnly: action.mode === 'edit' }}
              onChange={handleCategoryChange}
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
          <Button onClick={() => setAction(def.action)} color="primary">Cancel</Button>
          {action.mode === 'add' ? (
            <Button variant="contained" color="primary" disabled={newEvent.category === 'none'} onClick={handleAction}>
              Add
            </Button>
          ) : action.mode === 'edit' ? (
            <>
              <Button variant="contained" color="primary" startIcon={!matchesXS && <SaveIcon />} onClick={handleAction}>
                Save
              </Button>
              <Button variant="contained" color="secondary" startIcon={!matchesXS && <DeleteIcon />} onClick={handleDelete}>
                Delete
              </Button>
            </>
          ) : null}
        </DialogActions>
      </Dialog>
    </MuiPickersUtilsProvider >
  )
}
