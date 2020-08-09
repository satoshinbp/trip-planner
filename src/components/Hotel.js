import React from 'react'
import { isAfter, addDays, subDays, setHours } from 'date-fns'
import { DateTimePicker } from '@material-ui/pickers'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Grid from '@material-ui/core/Grid'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Hidden from '@material-ui/core/Hidden'
import Switch from '@material-ui/core/Switch'
import TextField from '@material-ui/core/TextField'

const useStyle = makeStyles(theme => ({
  formControlLabel: {
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(0.75),
    marginLeft: 0,
  },
}))

export default props => {
  const classes = useStyle()
  const theme = useTheme()
  const matchesXS = useMediaQuery(theme.breakpoints.down('xs'))
  const { newEvent, setNewEvent } = props

  const handleNameChange = e => setNewEvent({ ...newEvent, name: e.target.value })
  const handleStartTimeChange = time => {
    if (isAfter(time, newEvent.endTime)) {
      setNewEvent({ ...newEvent, startTime: time, endTime: setHours(addDays(time, 1), 10) })
    } else {
      setNewEvent({ ...newEvent, startTime: time })
    }
  }
  const handleEndTimeChange = time => {
    if (isAfter(newEvent.startTime, time)) {
      setNewEvent({ ...newEvent, startTime: setHours(subDays(time, 1), 15), endTime: time })
    } else {
      setNewEvent({ ...newEvent, endTime: time })
    }
  }
  const handleCheckInTimeChange = time => {
    if (isAfter(time, newEvent.checkOutTime)) {
      setNewEvent({ ...newEvent, checkInTime: time, checkOutTime: setHours(addDays(time, 1), 10) })
    } else {
      setNewEvent({ ...newEvent, checkInTime: time })
    }
  }
  const handleCheckOutTimeChange = time => {
    if (isAfter(newEvent.checkInTime, time)) {
      setNewEvent({ ...newEvent, checkInTime: setHours(subDays(time, 1), 15), checkOutTime: time })
    } else {
      setNewEvent({ ...newEvent, checkOutTime: time })
    }
  }
  const handleAddressChange = e => setNewEvent({ ...newEvent, address: e.target.value })
  const handleReservationChange = e => setNewEvent({ ...newEvent, reservation: e.target.checked })
  const handleURLChange = e => setNewEvent({ ...newEvent, URL: e.target.value })
  const handleNoteChange = e => setNewEvent({ ...newEvent, note: e.target.value })

  return (
    <>
      <TextField
        autoFocus
        margin={matchesXS ? 'dense' : 'normal'}
        required
        label="Name"
        value={newEvent.name}
        fullWidth
        onChange={handleNameChange}
      />

      <Grid
        container
        direction={matchesXS ? 'column' : 'row'}
        alignItems={matchesXS ? undefined : 'flex-end'}
        spacing={matchesXS ? undefined : 2}
      >
        <Grid item md>
          <DateTimePicker
            margin={matchesXS ? 'dense' : 'normal'}
            required
            label="ETA"
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
            required
            label="ETD"
            ampm={false}
            format="yyyy/MM/dd HH:mm"
            initialFocusedDate={newEvent.startTime}
            value={newEvent.endTime}
            autoOk
            fullWidth={matchesXS ? true : false}
            onChange={handleEndTimeChange}
          />
        </Grid>

        <Hidden xsDown>
          <Grid item md>
            <FormControlLabel
              control={<Switch checked={newEvent.reservation} onChange={handleReservationChange} />}
              label="Reserved"
              labelPlacement="start"
              className={classes.formControlLabel}
            />
          </Grid>
        </Hidden>
      </Grid>

      <Grid container direction={matchesXS ? 'column' : 'row'} spacing={matchesXS ? undefined : 2}>
        <Grid item md={4}>
          <DateTimePicker
            margin={matchesXS ? 'dense' : 'normal'}
            label="Check-in Time"
            ampm={false}
            format="yyyy/MM/dd HH:mm"
            clearable={true}
            initialFocusedDate={newEvent.startTime}
            value={newEvent.checkInTime}
            autoOk
            fullWidth={matchesXS ? true : false}
            onChange={handleCheckInTimeChange}
          />
        </Grid>

        <Grid item md={4}>
          <DateTimePicker
            margin={matchesXS ? 'dense' : 'normal'}
            label="Check-out Time"
            ampm={false}
            format="yyyy/MM/dd HH:mm"
            clearable={true}
            initialFocusedDate={newEvent.endTime}
            value={newEvent.checkOutTime}
            autoOk
            fullWidth={matchesXS ? true : false}
            onChange={handleCheckOutTimeChange}
          />
        </Grid>
      </Grid>

      <Hidden smUp>
        <FormControlLabel
          control={<Switch checked={newEvent.reservation} onChange={handleReservationChange} />}
          label="Reserved"
          labelPlacement="start"
          className={classes.formControlLabel}
        />
      </Hidden>

      <TextField
        margin={matchesXS ? 'dense' : 'normal'}
        label="Address"
        value={newEvent.address}
        fullWidth
        onChange={handleAddressChange}
      />

      <TextField
        margin={matchesXS ? 'dense' : 'normal'}
        label="URL"
        value={newEvent.URL}
        fullWidth
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
  )
}
