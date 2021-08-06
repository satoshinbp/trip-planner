import React from 'react'
import { isAfter } from 'date-fns'
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from 'react-places-autocomplete'
import { DateTimePicker } from '@material-ui/pickers'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormHelperText from '@material-ui/core/FormHelperText'
import Grid from '@material-ui/core/Grid'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import MenuItem from '@material-ui/core/MenuItem'
import Switch from '@material-ui/core/Switch'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import { transCategories } from '../lib/eventCategories'

const useStyle = makeStyles((theme) => ({
  formControlLabel: {
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(0.75),
    marginLeft: 0,
    [theme.breakpoints.up('sm')]: {
      marginTop: theme.spacing(3.5),
    },
  },
  select: {
    [theme.breakpoints.up('sm')]: {
      minWidth: 200,
      marginLeft: theme.spacing(2),
    },
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
  },
}))

export default (props) => {
  const classes = useStyle()
  const theme = useTheme()
  const matchesXS = useMediaQuery(theme.breakpoints.down('xs'))
  const { newEvent, setNewEvent, result, dates } = props

  const handleSubCategoryChange = (e) =>
    setNewEvent({ ...newEvent, subCategory: e.target.value })

  const handleOriginChange = (e) =>
    setNewEvent({
      ...newEvent,
      origin: { ...newEvent.origin, name: e.target.value },
    })

  const handleDestinationChange = (e) =>
    setNewEvent({
      ...newEvent,
      destination: { ...newEvent.destination, name: e.target.value },
    })

  const handleOriginAddressChange = (address) =>
    setNewEvent({
      ...newEvent,
      origin: { ...newEvent.origin, address, lat: null, lng: null },
    })

  const handleDestinationAddressChange = (address) =>
    setNewEvent({
      ...newEvent,
      destination: { ...newEvent.destination, address, lat: null, lng: null },
    })

  const handleOriginAddressSelect = (address) => {
    geocodeByAddress(address)
      .then((results) => getLatLng(results[0]))
      .then((latLng) => {
        setNewEvent({
          ...newEvent,
          origin: {
            ...newEvent.origin,
            address,
            lat: latLng.lat,
            lng: latLng.lng,
          },
        })
      })
  }

  const handleDestinationAddressSelect = (address) => {
    geocodeByAddress(address)
      .then((results) => getLatLng(results[0]))
      .then((latLng) => {
        setNewEvent({
          ...newEvent,
          destination: {
            ...newEvent.destination,
            address,
            lat: latLng.lat,
            lng: latLng.lng,
          },
        })
      })
  }

  const handleStartTimeChange = (time) => {
    if (isAfter(time, newEvent.endTime)) {
      setNewEvent({ ...newEvent, startTime: time, endTime: time })
    } else {
      setNewEvent({ ...newEvent, startTime: time })
    }
  }

  const handleEndTimeChange = (time) => {
    if (isAfter(newEvent.startTime, time)) {
      setNewEvent({ ...newEvent, startTime: time, endTime: time })
    } else {
      setNewEvent({ ...newEvent, endTime: time })
    }
  }

  const handleReservationChange = (e) =>
    setNewEvent({ ...newEvent, reservation: e.target.checked })

  return (
    <>
      <FormControl
        margin={matchesXS ? 'dense' : 'normal'}
        fullWidth={matchesXS}
        className={classes.select}
      >
        <TextField
          select
          label="Sub Category"
          value={newEvent.subCategory}
          onChange={handleSubCategoryChange}
        >
          {transCategories.map((category) => (
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

      <Grid
        container
        direction={matchesXS ? 'column' : 'row'}
        alignItems={matchesXS ? undefined : 'flex-start'}
        spacing={matchesXS ? undefined : 2}
      >
        <Grid item md>
          <TextField
            margin={matchesXS ? 'dense' : 'normal'}
            required
            label="Origin"
            value={newEvent.origin.name}
            error={!newEvent.origin.name && result.error}
            fullWidth
            onChange={handleOriginChange}
          />
        </Grid>
        <Grid item md>
          <TextField
            margin={matchesXS ? 'dense' : 'normal'}
            required
            label="Destination"
            value={newEvent.destination.name}
            error={!newEvent.destination.name && result.error}
            fullWidth
            onChange={handleDestinationChange}
          />
        </Grid>
      </Grid>

      <Grid
        container
        direction={matchesXS ? 'column' : 'row'}
        alignItems={matchesXS ? undefined : 'flex-start'}
        spacing={matchesXS ? undefined : 2}
      >
        <Grid item md>
          <PlacesAutocomplete
            value={newEvent.origin.address}
            onChange={handleOriginAddressChange}
            onSelect={handleOriginAddressSelect}
          >
            {({
              getInputProps,
              suggestions,
              getSuggestionItemProps,
              loading,
            }) => (
              <div>
                <TextField
                  margin={matchesXS ? 'dense' : 'normal'}
                  label="Origin Address"
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
        </Grid>
        <Grid item md>
          <PlacesAutocomplete
            value={newEvent.destination.address}
            onChange={handleDestinationAddressChange}
            onSelect={handleDestinationAddressSelect}
          >
            {({
              getInputProps,
              suggestions,
              getSuggestionItemProps,
              loading,
            }) => (
              <div>
                <TextField
                  margin={matchesXS ? 'dense' : 'normal'}
                  label="Destination Address"
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
        </Grid>
      </Grid>
      <FormHelperText error={result.error}>{result.message}</FormHelperText>

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
            label="Departure Time"
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
            label="Arrival Time"
            ampm={false}
            format="yyyy/MM/dd HH:mm"
            clearable={true}
            initialFocusedDate={newEvent.startTime}
            value={newEvent.endTime}
            minDate={dates[0]}
            maxDate={dates[dates.length - 1]}
            autoOk
            fullWidth={matchesXS ? true : false}
            onChange={handleEndTimeChange}
          />
        </Grid>

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
      </Grid>
    </>
  )
}
