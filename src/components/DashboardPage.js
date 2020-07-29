import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Header from './Header'
import Footer from './Footer'
import TripsFilter from './TripsFilter'
import TripsTable from './TripsTable'
import TripForm from './TripForm'

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
}))

export default props => {
  const classes = useStyles()
  const { trips } = props
  const [filter, setFilter] = useState('upcoming')
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(null)
  const [location, setLocation] = useState('')
  const [editID, setEditID] = useState('')

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <Header {...props} />
      <Container className={classes.container}>
        {trips.length === 0 ?
          (
            <React.Fragment>
              <Typography variant="h4" className={classes.message}>You have no trips.</Typography>
              <Button variant="contained" color="primary" onClick={() => setOpen('add')}>Add a Trip</Button>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <TripsFilter {...props} filter={filter} setFilter={setFilter} setOpen={setOpen} />
              <TripsTable
                {...props}
                filter={filter}
                setOpen={setOpen}
                setTitle={setTitle}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                setLocation={setLocation}
                editID={editID}
                setEditID={setEditID}
              />
            </React.Fragment>
          )
        }
        <TripForm
          {...props}
          open={open}
          setOpen={setOpen}
          title={title}
          setTitle={setTitle}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          location={location}
          setLocation={setLocation}
          editID={editID}
          setEditID={setEditID}
        />
      </Container>
      <Footer />
    </div >
  )
}
