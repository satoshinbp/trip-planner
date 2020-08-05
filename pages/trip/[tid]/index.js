import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { format, isAfter, addDays, isSameDay, startOfDay } from 'date-fns'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Accordion from '@material-ui/core/Accordion'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import Backdrop from '@material-ui/core/Backdrop'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Container from '@material-ui/core/Container'
import Divider from '@material-ui/core/Divider'
import EventIcon from '@material-ui/icons/Event'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Fab from '@material-ui/core/Fab'
import Grid from '@material-ui/core/Grid'
import Hidden from '@material-ui/core/Hidden'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import Typography from '@material-ui/core/Typography'
import AddIcon from '@material-ui/icons/Add'
import withAuth from '../../../src/withAuth'
import EventForm from '../../../src/components/EventForm'
import Footer from '../../../src/components/Footer'
import Header from '../../../src/components/Header'
import LoadingPage from '../../../src/components/LoadingPage'
import db from '../../../src/lib/db'
import categories from '../../../src/lib/eventCategories'
import firebase from '../../../src/lib/firebase'

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(3),
    paddingBottom: theme.spacing(5.5),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(2),
      paddingBottom: theme.spacing(4.5),
    },
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    minWidth: 32,
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  dividerTop: {
    marginBottom: theme.spacing(1),
  },
  fab: {
    position: 'fixed',
    bottom: 50,
    right: 30,
  },
  time: {
    width: 120,
    [theme.breakpoints.down("xs")]: {
      width: 72,
    },
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  link: {
    cursor: 'pointer',
  },
}))

export default withAuth(props => {
  const classes = useStyles()
  const theme = useTheme()
  const matchesXS = useMediaQuery(theme.breakpoints.down('xs'))
  const router = useRouter()
  const { tid } = router.query

  const [isLoading, setIsLoading] = useState({ deep: false, shallow: false })
  const [trip, setTrip] = useState({ title: '', startDate: new Date(), endDate: new Date(), location: '', note: '' })
  const [dates, setDates] = useState([])
  const [events, setEvents] = useState([])
  const [action, setAction] = useState({ name: '', id: '' })

  const handleAddEvent = () => setAction({ name: 'add', id: '' })
  const handleEditEvent = id => () => setAction({ name: 'edit', id })
  const handleClose = () => setIsLoading({ deep: false, shallow: false })

  useEffect(() => {
    let unmounted = false

    setIsLoading({ deep: true, shallow: false })

    const user = firebase.auth().currentUser
    const tripRef = db.collection('users').doc(user.uid).collection('trips').doc(tid)
    const eventsRef = db.collection('users').doc(user.uid).collection('trips').doc(tid).collection('events')
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

  return isLoading.deep ? <LoadingPage /> : (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <Header {...props} />

      <Container className={classes.container}>
        <Grid
          container
          justify="space-between"
          alignItems="flex-end"
          className={classes.title}
        >
          <Grid item>
            <Typography variant="h4" component="span">{trip.title}</Typography>
            {trip.location && !matchesXS ? (
              <Typography variant="h6" component="span">&nbsp;@{trip.location}</Typography>
            ) : null}
            <Typography variant="h6">
              {format(trip.startDate, 'yyyy/MM/dd')} - {format(trip.endDate, 'yyyy/MM/dd')}
            </Typography>
          </Grid>
          <Grid item>
            <Hidden xsDown>
              <Button variant="contained" color="primary" onClick={handleAddEvent}>Add a Event</Button>
            </Hidden>
            <Hidden smUp>
              <Fab color="primary" className={classes.fab} onClick={handleAddEvent}>
                <AddIcon size="small" />
              </Fab>
            </Hidden>
          </Grid>
        </Grid>

        {dates.map(date => (
          <Accordion key={date}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className={classes.heading}>{format(date, 'yyyy/MM/dd')}</Typography>
            </AccordionSummary>

            <Divider className={classes.dividerTop} />

            <AccordionDetails>
              <Grid container direction="column">
                {events.filter(event => isSameDay(event.startTime, date)).map((event, i) => (
                  <React.Fragment key={event.id}>
                    {i === 0 ? null : <Divider className={classes.divider} />}
                    <Grid item container className={classes.link} onClick={handleEditEvent(event.id)}>
                      <Grid item className={classes.time}>
                        {matchesXS
                          ? (
                            <>
                              <Typography variant="body1">
                                {format(event.startTime, 'HH:mm')}
                              </Typography>
                              <Typography variant="body2">
                                &nbsp;-&nbsp;
                                {event.endTime && isSameDay(event.startTime, event.endTime)
                                  ? format(event.endTime, 'HH:mm')
                                  : null}
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="body1">
                              {format(event.startTime, 'HH:mm')}&nbsp;-&nbsp;
                              {event.endTime && isSameDay(event.startTime, event.endTime)
                                ? format(event.endTime, 'HH:mm')
                                : null}
                            </Typography>
                          )
                        }
                      </Grid>
                      <ListItemIcon className={classes.icon}>
                        {categories.map(category =>
                          category.subCategories
                            ? (
                              category.subCategories.map(subCategory =>
                                subCategory.value === event.category ? subCategory.icon : null
                              )
                            ) : category.value === event.category ? category.icon : null
                        )}
                      </ListItemIcon>
                      {matchesXS
                        ? (
                          <Box>
                            <Typography variant="body1">{event.name}</Typography>
                            {event.location
                              ? <Typography variant="body2">&nbsp;@{event.location}</Typography>
                              : null}
                          </Box>
                        ) : (
                          <>
                            <Typography variant="body1">{event.name}</Typography>
                            {event.location
                              ? <Typography variant="body1">&nbsp;@{event.location}</Typography>
                              : null}
                          </>
                        )
                      }
                    </Grid>
                  </React.Fragment>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
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

      <Backdrop className={classes.backdrop} open={isLoading.shallow} onClick={handleClose}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Footer />
    </div >
  )
})
