import React, { useState, useEffect } from 'react'
import { isAfter, setHours, addDays } from 'date-fns'
import DateFnsUtils from '@date-io/date-fns'
import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import {
  useMediaQuery,
  Grid,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  MenuItem,
  ListItemIcon,
  InputAdornment,
  Button,
  Typography,
} from '@material-ui/core'
import { Delete, OpenInNew, Save } from '@material-ui/icons'
import EventFormBasic from './EventFormBasic'
import EventFormHotel from './EventFormHotel'
import EventFormTransport from './EventFormTransport'
import db from '../lib/db'
import categories from '../lib/eventCategories'
import firebase from '../lib/firebase'

const useStyles = makeStyles((theme) => ({
  select: {
    [theme.breakpoints.up('sm')]: {
      minWidth: 200,
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

export default (props) => {
  const classes = useStyles()
  const theme = useTheme()
  const matchesXS = useMediaQuery(theme.breakpoints.down('xs'))
  const { tid, dates, setIsLoading, events, setEvents, action, setAction } =
    props

  const eventBase = {
    name: '',
    startTime: action.date,
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
      startTime: setHours(action.date, 15),
      endTime: setHours(addDays(action.date, 1), 10),
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
      origin: { name: '', address: '' },
      destination: { name: '', address: '' },
      startTime: action.date,
      endTime: null,
      reservation: false,
      URL: '',
      note: '',
    },
    isLoading: { deep: false, shallow: false },
    action: { mode: '', id: '', date: '' },
    result: { error: false, message: '' },
  }
  const [newEvent, setNewEvent] = useState(def.none)
  const [result, setResult] = useState(def.result)
  const [deleteEvent, setDeleteEvent] = useState(false)

  const user = firebase.auth().currentUser
  const eventsRef = db
    .collection('users')
    .doc(user.uid)
    .collection('trips')
    .doc(tid)
    .collection('events')

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
          setResult({
            error: true,
            message: 'Origin and destination are required.',
          })
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

          eventsRef.add(newEvent).then((snapshot) => {
            setEvents(
              [...events, { id: snapshot.id, ...newEvent }].sort((a, b) => {
                if (isAfter(b.startTime, a.startTime)) return -1
                if (isAfter(a.startTime, b.startTime)) return 1
                return 0
              })
            )
            setIsLoading(def.isLoading)
          })
          break
        case 'edit':
          setAction(def.action)

          eventsRef
            .doc(action.id)
            .update(newEvent)
            .then(() => {
              const untouchedEvents = events.filter(
                (trip) => trip.id !== action.id
              )
              setEvents(
                [...untouchedEvents, { id: action.id, ...newEvent }].sort(
                  (a, b) => {
                    if (isAfter(b.startTime, a.startTime)) return -1
                    if (isAfter(a.startTime, b.startTime)) return 1
                    return 0
                  }
                )
              )
              setIsLoading(def.isLoading)
            })
          break
      }
    }
  }

  const handleDelete = () => {
    setIsLoading({ deep: false, shallow: true })
    setAction({ ...action, mode: '' })
    handleSubClose()

    eventsRef
      .doc(action.id)
      .delete()
      .then(() => {
        setEvents(events.filter((event) => event.id !== action.id))
        setAction(def.action)
        setIsLoading(def.isLoading)
      })
  }

  const handleMainClose = () => setAction(def.action)
  const handleSubClose = () => setDeleteEvent(false)

  const handleCategoryChange = (e) => setNewEvent(def[e.target.value])

  const handleURLChange = (e) =>
    setNewEvent({ ...newEvent, URL: e.target.value })

  const handleNoteChange = (e) =>
    setNewEvent({ ...newEvent, note: e.target.value })

  const renderContent = (category) => {
    switch (category) {
      case 'tour':
      case 'cinema':
      case 'restaurant':
      case 'shopping':
        return (
          <EventFormBasic
            newEvent={newEvent}
            setNewEvent={setNewEvent}
            result={result}
            dates={dates}
          />
        )
      case 'hotel':
        return (
          <EventFormHotel
            newEvent={newEvent}
            setNewEvent={setNewEvent}
            result={result}
            dates={dates}
          />
        )
      case 'transportation':
        return (
          <EventFormTransport
            newEvent={newEvent}
            setNewEvent={setNewEvent}
            result={result}
            dates={dates}
          />
        )
      default:
        break
    }
  }

  useEffect(
    () =>
      setNewEvent(
        action.mode === 'edit'
          ? events.filter((event) => event.id === action.id)[0]
          : def.none
      ),
    [action.mode]
  )

  useEffect(() => {
    if (result.error) resultCheck()
  }, [newEvent])

  useEffect(() => setResult(def.result), [newEvent.category])

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Dialog
        open={Boolean(action.mode)}
        onClose={handleMainClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {action.mode === 'edit' ? 'Edit Event' : 'Add Event'}
        </DialogTitle>

        <DialogContent>
          <FormControl
            margin={matchesXS ? 'dense' : 'normal'}
            fullWidth={matchesXS}
            className={classes.select}
          >
            <TextField
              select
              label="Category"
              value={newEvent.category}
              inputProps={{ readOnly: action.mode === 'edit' }}
              onChange={handleCategoryChange}
            >
              {categories.map((category) => (
                <MenuItem value={category.value} key={category.value}>
                  <Grid container>
                    <Grid item>
                      <ListItemIcon className={classes.icon}>
                        {category.icon}
                      </ListItemIcon>
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
          {newEvent.category ? (
            <>
              <TextField
                margin={matchesXS ? 'dense' : 'normal'}
                label="URL"
                value={newEvent.URL}
                fullWidth
                InputProps={{
                  endAdornment: newEvent.URL && (
                    <InputAdornment
                      position="end"
                      component="a"
                      href={newEvent.URL}
                      className={classes.link}
                    >
                      <OpenInNew />
                    </InputAdornment>
                  ),
                }}
                onChange={handleURLChange}
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
            </>
          ) : null}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleMainClose} color="primary">
            Cancel
          </Button>
          {action.mode === 'add' ? (
            <Button
              variant="contained"
              color="primary"
              disabled={newEvent.category === 'none'}
              onClick={handleAction}
            >
              Add
            </Button>
          ) : action.mode === 'edit' ? (
            <>
              <Button
                variant="contained"
                color="primary"
                startIcon={!matchesXS && <Save />}
                onClick={handleAction}
              >
                Save
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={!matchesXS && <Delete />}
                onClick={() => setDeleteEvent(true)}
              >
                Delete
              </Button>
            </>
          ) : null}
        </DialogActions>
      </Dialog>

      <Dialog open={deleteEvent} onClose={handleSubClose}>
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete this event?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={handleSubClose}>
            Cancel
          </Button>
          <Button variant="contained" color="secondary" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </MuiPickersUtilsProvider>
  )
}
