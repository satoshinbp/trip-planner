import React from 'react'
import { isAfter } from 'date-fns'
import { DateTimePicker } from '@material-ui/pickers'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Grid from '@material-ui/core/Grid'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormHelperText from '@material-ui/core/FormHelperText'
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
  const { newEvent, setNewEvent, result } = props

  const handleNameChange = e => setNewEvent({ ...newEvent, name: e.target.value })
  const handleStartTimeChange = time => {
    if (isAfter(time, newEvent.endTime)) {
      setNewEvent({ ...newEvent, startTime: time, endTime: time })
    } else {
      setNewEvent({ ...newEvent, startTime: time })
    }
  }
  const handleEndTimeChange = time => {
    if (isAfter(newEvent.startTime, time)) {
      setNewEvent({ ...newEvent, startTime: time, endTime: time })
    } else {
      setNewEvent({ ...newEvent, endTime: time })
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
        label="Title"
        value={newEvent.name}
        error={!newEvent.name && result.error}
        fullWidth
        onChange={handleNameChange}
      />
      <FormHelperText error={result.error}>
        {result.message}
      </FormHelperText>

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
            label="Start Time"
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
            label="End Time"
            ampm={false}
            format="yyyy/MM/dd HH:mm"
            clearable={true}
            initialFocusedDate={newEvent.startTime}
            value={newEvent.endTime}
            autoOk
            fullWidth={matchesXS ? true : false}
            onChange={handleEndTimeChange}
          />
        </Grid>

        <Grid item md>
          <FormControlLabel
            control={<Switch checked={newEvent.reservation} onChange={handleReservationChange} />}
            label="Reserved"
            labelPlacement="start"
            className={classes.formControlLabel}
          />
        </Grid>
      </Grid>

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
