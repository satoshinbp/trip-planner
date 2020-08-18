import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { format, isAfter, addDays, isSameDay, startOfDay, isWithinInterval } from 'date-fns'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Accordion from '@material-ui/core/Accordion'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import Backdrop from '@material-ui/core/Backdrop'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Container from '@material-ui/core/Container'
import Divider from '@material-ui/core/Divider'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Fab from '@material-ui/core/Fab'
import Grid from '@material-ui/core/Grid'
import Hidden from '@material-ui/core/Hidden'
import IconButton from '@material-ui/core/IconButton'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer'
import Typography from '@material-ui/core/Typography'
import AddIcon from '@material-ui/icons/Add'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import MapIcon from '@material-ui/icons/Map'
import RoomIcon from '@material-ui/icons/Room'
import withAuth from '../../../src/withAuth'
import LoadingPage from '../../../src/components/LoadingPage'
import Header from '../../../src/components/Header'
import Footer from '../../../src/components/Footer'
import EventMap from '../../../src/components/EventMap'
import EventForm from '../../../src/components/EventForm'
import firebase from '../../../src/lib/firebase'
import db from '../../../src/lib/db'
import categories, { transCategories } from '../../../src/lib/eventCategories'

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(3),
    paddingBottom: theme.spacing(5.5),
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(2),
      paddingBottom: theme.spacing(11.5),
    },
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  dates: {
    [theme.breakpoints.down('xs')]: {
      fontSize: theme.typography.pxToRem(18),
    },
  },
  btn: {
    marginTop: theme.spacing(1),
  },
  fab: {
    position: 'fixed',
    bottom: 28,
    right: 20,
    zIndex: theme.zIndex.appBar,
  },
  iconBtn: {
    color: 'white',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  link: {
    cursor: 'pointer',
  },
  time: {
    width: 120,
    [theme.breakpoints.down("xs")]: {
      width: 72,
    },
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    minWidth: 32,
  },
  mapIcon: {
    marginTop: - theme.spacing(2),
    marginBottom: - theme.spacing(2),
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  dividerTop: {
    marginBottom: theme.spacing(1),
  },
  btnBar: {
    borderRadius: 0,
    [theme.breakpoints.up('md')]: {
      height: 20,
    },
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
    }
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}))

export default withAuth(props => {
  const classes = useStyles()
  const theme = useTheme()
  const matchesXS = useMediaQuery(theme.breakpoints.down('xs'))
  const matchesMD = useMediaQuery(theme.breakpoints.down('md'))
  const router = useRouter()
  const { tid } = router.query

  const def = { center: { lat: 35.681236, lng: 139.767125 } }

  const [isLoading, setIsLoading] = useState({ deep: false, shallow: false })
  const [trip, setTrip] = useState({ title: '', startDate: new Date(), endDate: new Date(), location: '', note: '' })
  const [dates, setDates] = useState([])
  const [events, setEvents] = useState([])
  const [sortedEvents, setSortedEvents] = useState([])
  const [action, setAction] = useState({ mode: '', id: '' })
  const [mapOpen, setMapOpen] = useState(false)
  const [mapCenter, setMapCenter] = useState(def.center)

  const handleAddEvent = () => setAction({ mode: 'add', id: '' })
  const handleEditEvent = id => () => setAction({ mode: 'edit', id })

  const handleMapOpen = () => setMapOpen(true)
  const handleMapClose = () => setMapOpen(false)

  const toggleDrawer = open => e => {
    if (e && e.type === 'keydown' && (e.key === 'Tab' || e.key === 'Shift')) {
      return
    }
    if (!open) {
      setMapCenter(def.center)
    }
    setMapOpen(open)
  }

  const handleLoadingClose = () => setIsLoading({ deep: false, shallow: false })

  const TripSummary = () => (
    <Grid container justify="space-between" alignItems="flex-end" className={classes.title}>
      <Grid item>
        <Typography variant="h4" component="span">
          {trip.title}
        </Typography>
        {trip.location && !matchesXS && (
          <Typography variant="h6" component="span">
            &nbsp;@{trip.location}
          </Typography>
        )}
        <Typography variant="h6" className={classes.dates}>
          {format(trip.startDate, 'yyyy/MM/dd')} - {format(trip.endDate, 'yyyy/MM/dd')}
        </Typography>
      </Grid>
      <Grid item>
        <Grid container direction="column" alignItems="flex-end">
          {matchesMD && (
            <Grid item>
              <Button variant="outlined" color="primary" startIcon={<MapIcon />} onClick={handleMapOpen}>
                Map
              </Button>
            </Grid>
          )}
          <Grid item>
            <Hidden xsDown>
              <Button variant="contained" color="primary" className={classes.btn} onClick={handleAddEvent}>
                Add a Event
              </Button>
            </Hidden>
            <Hidden smUp>
              <Fab color="primary" className={classes.fab} onClick={handleAddEvent}>
                <AddIcon size="small" className={classes.iconBtn} />
              </Fab>
            </Hidden>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )

  const EventRow = props => {
    const { event, i, inTripDates } = props
    return (
      <>
        {i !== 0 && <Divider className={classes.divider} />}
        <Grid item container className={classes.link} alignItems="center">
          {inTripDates
            ? (
              <Grid item className={classes.time} onClick={handleEditEvent(event.id)}>
                {event.sortTime === event.endTime
                  ? (
                    <Typography variant="body1">
                      &nbsp;- {format(event.endTime, 'HH:mm')}
                    </Typography>
                  ) : !isSameDay(event.startTime, event.endTime)
                    ? (
                      <Typography variant="body1">
                        {format(event.startTime, 'HH:mm')} -
                      </Typography>
                    ) : !matchesXS
                      ? (
                        <Typography variant="body1">
                          {format(event.startTime, 'HH:mm')} - {format(event.endTime, 'HH:mm')}
                        </Typography>
                      ) : <>
                        <Typography variant="body1">
                          {format(event.startTime, 'HH:mm')}
                        </Typography>
                        <Typography variant="body2">
                          &nbsp;- {format(event.endTime, 'HH:mm')}
                        </Typography>
                      </>
                }
              </Grid>
            ) : (
              <Grid item className={classes.time} onClick={handleEditEvent(event.id)}>
                {matchesXS
                  ? (
                    <>
                      <Typography variant="body1">
                        {format(event.startTime, 'MM/dd')}
                      </Typography>
                      {event.endTime && !isSameDay(event.startTime, event.endTime) && (
                        <Typography variant="body2">
                          &nbsp;- {format(event.endTime, 'MM/dd')}
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Typography variant="body1">
                      {format(event.startTime, 'MM/dd')}
                      {event.endTime && !isSameDay(event.startTime, event.endTime) && (
                        ` - ${format(event.endTime, 'MM/dd')}`
                      )}
                    </Typography>
                  )
                }
              </Grid>
            )}
          <ListItemIcon className={classes.icon} onClick={handleEditEvent(event.id)}>
            {event.category !== 'transportation'
              ? categories.map(category => category.value === event.category && category.icon)
              : transCategories.map(category => category.value === event.subCategory && category.icon)
            }
          </ListItemIcon>
          <Grid item xs onClick={handleEditEvent(event.id)}>
            {event.category === 'transportation'
              ? (
                <Typography variant="body1">
                  {event.origin.name} → {event.destination.name}
                </Typography>
              ) : (
                event.category === 'hotel'
                  ? (
                    <Typography variant="body1">
                      {event.name}
                      {!matchesXS && (
                        event.sortTime === event.startTime
                          ? ` (check-in: ${format(event.checkInTime, 'HH:mm')} -)`
                          : ` (check-out: - ${format(event.checkOutTime, 'HH:mm')})`
                      )}
                    </Typography>
                  ) : (
                    <Typography variant="body1">
                      {event.name}
                    </Typography>
                  )
              )}
          </Grid>
          <IconButton
            edge="end"
            color='secondary'
            disabled={
              event.location
                ? !event.location.lat
                : !event.origin.lat && !event.destination.lat
            }
            onClick={() => {
              if (event.category !== 'transportation') {
                setMapCenter({ lat: event.location.lat, lng: event.location.lng })
              } else {
                setMapCenter({ lat: event.origin.lat, lng: event.origin.lng })
              }
              setMapOpen(true)
            }}
            className={classes.mapIcon}
          >
            <RoomIcon />
            <Typography>
              {event.order + 1}
            </Typography>
          </IconButton>
        </Grid>
      </>
    )
  }

  const EventAccordions = () => {
    const datesStart = dates[0]
    const datesEnd = addDays(dates[dates.length - 1], 1)
    const outOfDatesEvents = sortedEvents.filter(event =>
      !isWithinInterval(event.startTime, { start: datesStart, end: datesEnd })
      && !isWithinInterval(event.endTime, { start: datesStart, end: datesEnd })
    )

    return (
      <>
        {dates.map(date => {
          const thisDateEvents = sortedEvents.filter(event => isSameDay(event.sortTime, date))

          return (
            <Accordion key={date} defaultExpanded={thisDateEvents.length !== 0}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography className={classes.heading}>
                  {format(date, 'yyyy/MM/dd')}
                </Typography>
              </AccordionSummary>
              <Divider className={classes.dividerTop} />
              <AccordionDetails>
                <Grid container direction="column">
                  {thisDateEvents.map((event, i) => (
                    <EventRow key={event.id} event={event} i={i} inTripDates />
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          )
        })}

        {outOfDatesEvents.length !== 0 && (
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className={classes.heading}>Out of Range</Typography>
            </AccordionSummary>
            <Divider className={classes.dividerTop} />
            <AccordionDetails>
              <Grid container direction="column">
                {outOfDatesEvents.map((event, i) => (
                  <EventRow key={event.id} event={event} i={i} />
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        )
        }
      </>
    )
  }

  useEffect(() => {
    let unmounted = false

    setIsLoading({ deep: true, shallow: false })

    const user = firebase.auth().currentUser
    const tripRef = db.collection('users').doc(user.uid).collection('trips').doc(tid)
    const eventsRef = db.collection('users').doc(user.uid).collection('trips').doc(tid).collection('events')

    tripRef.get().then(snapshot => {
      const tripData = {
        ...snapshot.data(),
        startDate: snapshot.data().startDate.toDate(),
        endDate: snapshot.data().endDate.toDate(),
      }

      const datesData = []
      for (let date = startOfDay(tripData.startDate); !isAfter(date, tripData.endDate); date = addDays(date, 1)) {
        datesData.push(date)
      }

      eventsRef.orderBy('startTime').get().then(snapshot => {
        const eventsData = []
        snapshot.forEach(childSnapshot => {
          eventsData.push({
            id: childSnapshot.id,
            ...childSnapshot.data(),
            startTime: childSnapshot.data().startTime.toDate(),
            endTime: childSnapshot.data().endTime ? childSnapshot.data().endTime.toDate() : null,
            checkInTime: childSnapshot.data().checkInTime ? childSnapshot.data().checkInTime.toDate() : null,
            checkOutTime: childSnapshot.data().checkOutTime ? childSnapshot.data().checkOutTime.toDate() : null,
          })
        })

        if (!unmounted) {
          setDates(datesData)
          setTrip(tripData)
          setEvents(eventsData)
          setIsLoading({ deep: false, shallow: false })
        }
      })
    })

    return () => {
      unmounted = true
    }
  }, [])

  useEffect(() => {
    const eventsWithOrder = events.map((event, i) => ({ ...event, order: i }))
    const eventToBeSortedByStartTime = eventsWithOrder.map(event => (
      { ...event, sortTime: event.startTime }
    ))
    const eventToBeSortedByEndTime = eventsWithOrder.filter(event =>
      event.endTime && !isSameDay(event.startTime, event.endTime)
    ).map(event => (
      { ...event, sortTime: event.endTime }
    ))
    const eventsData = eventToBeSortedByStartTime.concat(eventToBeSortedByEndTime)
    setSortedEvents(eventsData.sort((a, b) => {
      if (isAfter(b.sortTime, a.sortTime)) return -1
      if (isAfter(a.sortTime, b.sortTime)) return 1
      return 0
    }))
  }, [events])

  return isLoading.deep ? <LoadingPage /> : (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <Header {...props} />

      <Container className={classes.container}>
        <TripSummary />
        {matchesMD
          ? (
            <>
              <EventAccordions />
              <SwipeableDrawer
                anchor="bottom"
                open={mapOpen}
                onClose={toggleDrawer(false)}
                onOpen={toggleDrawer(true)}
                variant="persistent"
              >
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="small"
                  disableRipple={true}
                  onClick={handleMapClose}
                  className={classes.btnBar}
                >
                  <ArrowDropDownIcon size="large" className={classes.iconBtn} />
                </Button>
                <EventMap {...props} tid={tid} events={events} center={mapCenter} setCenter={setMapCenter} />
              </SwipeableDrawer>
            </>
          ) : (
            <Grid container spacing={2}>
              <Grid item lg>
                <EventAccordions />
              </Grid>
              <Grid item lg>
                <EventMap {...props} tid={tid} events={events} center={mapCenter} setCenter={setMapCenter} />
              </Grid>
            </Grid>
          )
        }
      </Container>

      <EventForm
        {...props}
        tid={tid}
        dates={dates}
        setIsLoading={setIsLoading}
        events={events}
        setEvents={setEvents}
        action={action}
        setAction={setAction}
      />

      <Backdrop className={classes.backdrop} open={isLoading.shallow} onClick={handleLoadingClose}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Footer />
    </div >
  )
})
