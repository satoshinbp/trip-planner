import React, { useState } from 'react'
import { format, isAfter, isBefore, isEqual } from 'date-fns'
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import Paper from '@material-ui/core/Paper'
import Hidden from '@material-ui/core/Hidden'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import EditIcon from '@material-ui/icons/Edit'
import DeleteIcon from '@material-ui/icons/Delete'
import db from '../lib/db'

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
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
  editIconBtn: {
    [theme.breakpoints.down("xs")]: {
      marginLeft: -8,
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
}))

export default props => {
  const classes = useStyles()
  const { user, filter, trips, setTrips, setOpen, setTitle, setStartDate, setEndDate, setLocation, editID, setEditID } = props
  const [order, setOrder] = useState('asc')
  const [orderBy, setOrderBy] = useState('startDate')

  const handleRequestSort = (e, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const createSortHandler = property => e => {
    handleRequestSort(e, property)
  }

  const handleEdit = id => {
    const trip = trips.filter(trip => trip.id === id)[0]
    setEditID(id)
    setOpen('edit')
    setTitle(trip.title)
    setStartDate(new Date(trip.startDate))
    setEndDate(new Date(trip.endDate))
    setLocation(trip.location)
  }

  const handleDelete = id => {
    const tripsRef = db.collection('users').doc(user.uid).collection('trips')
    tripsRef.doc(id).delete().then(snapshot => {
      setTrips(trips.filter(trip => trip.id !== id))
    })
  }

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="table">
        <TableHead>
          <TableRow>
            <TableCell>Actions</TableCell>
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
                </TableSortLabel></TableCell>
            </Hidden>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            stableSort(trips, getComparator(order, orderBy)).filter(trip => {
              let today = new Date()
              today.setHours(0, 0, 0, 0)
              switch (filter) {
                case 'all':
                  return true
                case 'upcoming':
                  return isEqual(new Date(trip.endDate), today) || isAfter(new Date(trip.endDate), today)
                case 'past':
                  return isBefore(new Date(trip.endDate), today)
                default:
                  return true
              }
            }).map(trip => (
              <TableRow key={trip.id}>
                <TableCell component="th" scope="row">
                  <IconButton aria-label="edit" edge="start" classes={{ root: classes.editIconBtn }} onClick={() => handleEdit(trip.id)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton aria-label="delete" onClick={() => handleDelete(trip.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
                <TableCell>
                  <Grid container direction='column'>
                    <Grid item className={classes.title}>
                      {trip.title}
                    </Grid>
                    {
                      trip.location ? (
                        <Hidden mdUp>
                          <Grid item>
                            @{trip.location}
                          </Grid>
                        </Hidden>
                      ) : null
                    }
                    <Hidden smUp>
                      <Grid item>
                        {format(new Date(trip.startDate), 'yyyy/MM/dd')}
                      &nbsp;-&nbsp;
                      {format(new Date(trip.endDate), 'yyyy/MM/dd')}
                      </Grid>
                    </Hidden>
                  </Grid>
                </TableCell>
                <Hidden xsDown>
                  <TableCell>{format(new Date(trip.startDate), 'yyyy/MM/dd')}</TableCell>
                  <TableCell>{format(new Date(trip.endDate), 'yyyy/MM/dd')}</TableCell>
                </Hidden>
                <Hidden smDown>
                  <TableCell>{trip.location}</TableCell>
                </Hidden>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
