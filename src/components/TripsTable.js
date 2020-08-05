import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { format, isAfter, isBefore, isEqual } from 'date-fns'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Grid from '@material-ui/core/Grid'
import Hidden from '@material-ui/core/Hidden'
import IconButton from '@material-ui/core/IconButton'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import EditIcon from '@material-ui/icons/Edit'
import DeleteIcon from '@material-ui/icons/Delete'
import db from '../lib/db'
import firebase from '../lib/firebase'

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy)
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index])
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0])
    if (order !== 0) return order
    return a[1] - b[1]
  })
  return stabilizedThis.map(el => el[0])
}

const useStyles = makeStyles(theme => ({
  table: {
    [theme.breakpoints.up("md")]: {
      minWidth: 650,
    },
  },
  title: {
    [theme.breakpoints.down("xs")]: {
      fontWeight: 'bold',
    },
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
  actionsCell: {
    width: 120,
  },
  link: {
    cursor: 'pointer',
  },
}))

export default props => {
  const classes = useStyles()
  const router = useRouter()

  const { trips, setTrips, filter, setAction, setNewTrip, setIsLoading } = props

  const [order, setOrder] = useState('asc')
  const [orderBy, setOrderBy] = useState('startDate')
  const [deleteTrip, setDeleteTrip] = useState({ open: false, id: '' })

  const user = firebase.auth().currentUser
  const tripsRef = db.collection('users').doc(user.uid).collection('trips')

  const handleRequestSort = (e, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const createSortHandler = property => e => {
    handleRequestSort(e, property)
  }

  const handleEdit = id => () => {
    const { title, startDate, endDate, location, note } = trips.filter(trip => trip.id === id)[0]
    setAction({ name: 'edit', id })
    setNewTrip({ title, startDate, endDate, location, note })
  }

  const handleDelete = id => () => {
    setIsLoading({ deep: false, shallow: true })
    setDeleteTrip({ open: false, id: '' })

    tripsRef.doc(id).delete().then(() => {
      setTrips(trips.filter(trip => trip.id !== id))
      setIsLoading({ deep: false, shallow: false })
    })
  }

  const handleClose = () => setDeleteTrip({ open: false, id: '' })

  const linkToTripPage = id => () => router.push('/trip/[tid]', `/trip/${id}`)

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell className={classes.actionsCell}>Actions</TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'title'}
                direction={orderBy === 'title' ? order : 'asc'}
                onClick={createSortHandler('title')}
              >
                Title
                {orderBy === 'title' ? (
                  <span className={classes.visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </span>
                ) : null}
              </TableSortLabel>
            </TableCell>
            <Hidden xsDown>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'startDate'}
                  direction={orderBy === 'startDate' ? order : 'asc'}
                  onClick={createSortHandler('startDate')}
                >
                  Start Date
                  {orderBy === 'startDate' ? (
                    <span className={classes.visuallyHidden}>
                      {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    </span>
                  ) : null}
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'endDate'}
                  direction={orderBy === 'endDate' ? order : 'asc'}
                  onClick={createSortHandler('endDate')}
                >
                  End Date
                  {orderBy === 'endDate' ? (
                    <span className={classes.visuallyHidden}>
                      {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    </span>
                  ) : null}
                </TableSortLabel></TableCell>
            </Hidden>
            <Hidden smDown>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'location'}
                  direction={orderBy === 'location' ? order : 'asc'}
                  onClick={createSortHandler('location')}
                >
                  Location
                  {orderBy === 'location' ? (
                    <span className={classes.visuallyHidden}>
                      {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    </span>
                  ) : null}
                </TableSortLabel>
              </TableCell>
            </Hidden>
          </TableRow>
        </TableHead>

        <TableBody>
          {stableSort(trips, getComparator(order, orderBy)).filter(trip => {
            let today = new Date()
            today.setHours(0, 0, 0, 0)
            switch (filter) {
              case 'all':
                return true
              case 'upcoming':
                return isEqual(trip.endDate, today) || isAfter(trip.endDate, today)
              case 'past':
                return isBefore(trip.endDate, today)
              default:
                return true
            }
          }).map(trip => (
            <TableRow key={trip.id}>
              <TableCell component="th" scope="row" className={classes.actionsCell}>
                <IconButton edge="start" onClick={handleEdit(trip.id)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => setDeleteTrip({ open: true, id: trip.id })}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>

              <TableCell onClick={linkToTripPage(trip.id)} className={classes.link}>
                <Grid container direction='column'>
                  <Grid item className={classes.title}>{trip.title}</Grid>
                  {trip.location ? (
                    <Hidden mdUp>
                      <Grid item>&nbsp;@{trip.location}</Grid>
                    </Hidden>
                  ) : null}
                  <Hidden smUp>
                    <Grid item>
                      &nbsp;{format(trip.startDate, 'yyyy/MM/dd')}
                        &nbsp;-&nbsp;{format(trip.endDate, 'yyyy/MM/dd')}
                    </Grid>
                  </Hidden>
                </Grid>
              </TableCell>

              <Hidden xsDown>
                <TableCell onClick={linkToTripPage(trip.id)} className={classes.link}>{format(trip.startDate, 'yyyy/MM/dd')}</TableCell>
                <TableCell onClick={linkToTripPage(trip.id)} className={classes.link}>{format(trip.endDate, 'yyyy/MM/dd')}</TableCell>
              </Hidden>

              <Hidden smDown>
                <TableCell onClick={linkToTripPage(trip.id)} className={classes.link}>{trip.location}</TableCell>
              </Hidden>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={deleteTrip.open} onClose={handleClose}>
        <DialogTitle>Delete Trip</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete this trip?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" color="secondary" onClick={handleDelete(deleteTrip.id)}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </TableContainer>
  )
}
