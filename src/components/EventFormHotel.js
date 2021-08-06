import React from 'react'
import { isAfter, addDays, subDays, setHours } from 'date-fns'
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from 'react-places-autocomplete'
import { DateTimePicker } from '@material-ui/pickers'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Grid from '@material-ui/core/Grid'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormHelperText from '@material-ui/core/FormHelperText'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Hidden from '@material-ui/core/Hidden'
import Switch from '@material-ui/core/Switch'
import TextField from '@material-ui/core/TextField'

const useStyle = makeStyles((theme) => ({
  formControlLabel: {
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(0.75),
    marginLeft: 0,
    [theme.breakpoints.up('sm')]: {
      marginTop: theme.spacing(3.5),
    },
  },
}))

export default (props) => {
  const classes = useStyle()
  const theme = useTheme()
  const matchesXS = useMediaQuery(theme.breakpoints.down('xs'))
  const { newEvent, setNewEvent, result, dates } = props

  const handleNameChange = (e) =>
    setNewEvent({ ...newEvent, name: e.target.value })

  const handleStartTimeChange = (time) => {
    if (isAfter(time, newEvent.endTime)) {
      setNewEvent({
        ...newEvent,
        startTime: time,
        endTime: setHours(addDays(time, 1), 10),
      })
    } else {
      setNewEvent({ ...newEvent, startTime: time })
    }
  }

  const handleEndTimeChange = (time) => {
    if (isAfter(newEvent.startTime, time)) {
      setNewEvent({
        ...newEvent,
        startTime: setHours(subDays(time, 1), 15),
        endTime: time,
      })
    } else {
      setNewEvent({ ...newEvent, endTime: time })
    }
  }

  const handleCheckInTimeChange = (time) => {
    if (isAfter(time, newEvent.checkOutTime)) {
      setNewEvent({
        ...newEvent,
        checkInTime: time,
        checkOutTime: setHours(addDays(time, 1), 10),
      })
    } else {
      setNewEvent({ ...newEvent, checkInTime: time })
    }
  }

  const handleCheckOutTimeChange = (time) => {
    if (isAfter(newEvent.checkInTime, time)) {
      setNewEvent({
        ...newEvent,
        checkInTime: setHours(subDays(time, 1), 15),
        checkOutTime: time,
      })
    } else {
      setNewEvent({ ...newEvent, checkOutTime: time })
    }
  }

  const handleAddressChange = (address) =>
    setNewEvent({ ...newEvent, location: { address, lat: null, lng: null } })

  const handleAddressSelect = (address) => {
    geocodeByAddress(address)
      .then((results) => getLatLng(results[0]))
      .then((latLng) => {
        console.log(latLng)
        setNewEvent({
          ...newEvent,
          location: { address, lat: latLng.lat, lng: latLng.lng },
        })
      })
  }

  const handleReservationChange = (e) =>
    setNewEvent({ ...newEvent, reservation: e.target.checked })

  return (
    <>
      <TextField
        autoFocus
        margin={matchesXS ? 'dense' : 'normal'}
        required
        label="Name"
        value={newEvent.name}
        error={!newEvent.name && result.error}
        fullWidth
        onChange={handleNameChange}
      />
      <FormHelperText error={result.error}>{result.message}</FormHelperText>

      <Grid
        container
        direction={matchesXS ? 'column' : 'row'}
        alignItems={matchesXS ? undefined : 'flex-start'}
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
            minDate={dates[0]}
            maxDate={dates[dates.length - 1]}
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
            value={newEvent.endTime}
            minDate={dates[0]}
            maxDate={dates[dates.length - 1]}
            autoOk
            fullWidth={matchesXS ? true : false}
            onChange={handleEndTimeChange}
          />
        </Grid>

        <Hidden xsDown>
          <Grid item md>
            <FormControlLabel
              control={
                <Switch
                  checked={newEvent.reservation}
                  onChange={handleReservationChange}
                />
              }
              label="Reserved"
              labelPlacement="start"
              className={classes.formControlLabel}
            />
          </Grid>
        </Hidden>
      </Grid>

      <Grid
        container
        direction={matchesXS ? 'column' : 'row'}
        alignItems={matchesXS ? undefined : 'flex-start'}
        spacing={matchesXS ? undefined : 2}
      >
        <Grid item md={4}>
          <DateTimePicker
            margin={matchesXS ? 'dense' : 'normal'}
            label="Check-in Time"
            ampm={false}
            format="yyyy/MM/dd HH:mm"
            clearable={true}
            initialFocusedDate={newEvent.startTime}
            value={newEvent.checkInTime}
            minDate={dates[0]}
            maxDate={dates[dates.length - 1]}
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
            minDate={dates[0]}
            maxDate={dates[dates.length - 1]}
            autoOk
            fullWidth={matchesXS ? true : false}
            onChange={handleCheckOutTimeChange}
          />
        </Grid>
      </Grid>

      <Hidden smUp>
        <FormControlLabel
          control={
            <Switch
              checked={newEvent.reservation}
              onChange={handleReservationChange}
            />
          }
          label="Reserved"
          labelPlacement="start"
          className={classes.formControlLabel}
        />
      </Hidden>

      <PlacesAutocomplete
        value={newEvent.location.address}
        onChange={handleAddressChange}
        onSelect={handleAddressSelect}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div>
            <TextField
              margin={matchesXS ? 'dense' : 'normal'}
              label="Address"
              fullWidth
              {...getInputProps({ placeholder: 'Search Places ...' })}
            />
            {loading && <div>Loading...</div>}
            {suggestions.map((suggestion) => (
              <List
                key={suggestion.placeId}
                component="nav"
                dense
                disablePadding
              >
                <ListItem {...getSuggestionItemProps(suggestion, {})}>
                  <ListItemText primary={suggestion.description} />
                </ListItem>
              </List>
            ))}
          </div>
        )}
      </PlacesAutocomplete>
    </>
  )
}
