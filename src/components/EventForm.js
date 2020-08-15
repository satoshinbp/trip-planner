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
import InputAdornment from '@material-ui/core/InputAdornment'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import DeleteIcon from '@material-ui/icons/Delete'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
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
  link: {
    color: theme.palette.primary.main,
  },
}))

export default props => {
  const classes = useStyles()
  const theme = useTheme()
  const matchesXS = useMediaQuery(theme.breakpoints.down('xs'))
  const { tid, dates, events, setEvents, action, setAction, setIsLoading } = props

  const def = {
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
    isLoading: { deep: false, shallow: false },
    action: { mode: '', id: '' },
    result: { error: false, message: '' },
  }
  const [newEvent, setNewEvent] = useState(def.event)
  const [result, setResult] = useState(def.result)

  const user = firebase.auth().currentUser
  const eventsRef = db.collection('users').doc(user.uid).collection('trips').doc(tid).collection('events')

  const resultCheck = () => {
    switch (newEvent.category) {
      case 'none':
        if (!newEvent.name) {
          setResult({ error: true, message: 'Title is required.' })
          return false
        } else {
          setResult(def.result)
          return true
        }
      case 'restaurant':
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

  const handleURLChange = e => setNewEvent({ ...newEvent, URL: e.target.value })

  const handleNoteChange = e => setNewEvent({ ...newEvent, note: e.target.value })

  const renderContent = category => {
    switch (category) {
      case 'none':
        return <None newEvent={newEvent} setNewEvent={setNewEvent} result={result} dates={dates} />
      case 'restaurant':
        return <Restaurant newEvent={newEvent} setNewEvent={setNewEvent} result={result} dates={dates} />
      case 'hotel':
        return <Hotel newEvent={newEvent} setNewEvent={setNewEvent} result={result} dates={dates} />
      case 'transportation':
        return <Transportation newEvent={newEvent} setNewEvent={setNewEvent} result={result} dates={dates} />
      default:
        return <None newEvent={newEvent} setNewEvent={setNewEvent} result={result} dates={dates} />
    }
  }

  useEffect(() => {
    setNewEvent(action.mode === 'edit' ? events.filter(event => event.id === action.id)[0] : def.event)
  }, [action.mode])

  useEffect(() => {
    if (result.error) {
      resultCheck()
    }
  }, [newEvent])

  useEffect(() => {
    setResult(def.result)
  }, [newEvent.category])

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Dialog open={Boolean(action.mode)} onClose={() => setAction(def.action)}>
        <DialogTitle>{action.mode === 'edit' ? 'Edit Event' : 'Add Event'}</DialogTitle>

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

          <TextField
            margin={matchesXS ? 'dense' : 'normal'}
            label="URL"
            value={newEvent.URL}
            fullWidth
            InputProps={{
              endAdornment: newEvent.URL ? (
                <InputAdornment position="end" component="a" href={newEvent.URL} className={classes.link}>
                  <OpenInNewIcon />
                </InputAdornment>
              ) : null,
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
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setAction(def.action)} color="primary">Cancel</Button>
          {action.mode === 'add'
            ? (
              <Button variant="contained" color="primary" onClick={handleAction}>
                Add
              </Button>
            ) : action.mode === 'edit'
              ? (
                <>
                  <Button variant="contained" color="primary" startIcon={matchesXS ? null : <SaveIcon />} onClick={handleAction}>
                    Save
                  </Button>
                  <Button variant="contained" color="secondary" startIcon={matchesXS ? null : <DeleteIcon />} onClick={handleDelete}>
                    Delete
                  </Button>
                </>
              ) : null
          }
        </DialogActions>
      </Dialog>
    </MuiPickersUtilsProvider >
  )
}
