import React from "react";
import { isAfter } from "date-fns";
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from "react-places-autocomplete";
import { DateTimePicker } from "@material-ui/pickers";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Grid from "@material-ui/core/Grid";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Switch from "@material-ui/core/Switch";
import TextField from "@material-ui/core/TextField";

const useStyle = makeStyles((theme) => ({
  formControlLabel: {
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(0.75),
    marginLeft: 0,
    [theme.breakpoints.up("sm")]: {
      marginTop: theme.spacing(3.5),
    },
  },
}));

export default (props) => {
  const classes = useStyle();
  const theme = useTheme();
  const matchesXS = useMediaQuery(theme.breakpoints.down("xs"));
  const { newEvent, setNewEvent, result, dates } = props;

  const handleNameChange = (e) => setNewEvent({ ...newEvent, name: e.target.value });

  const handleStartTimeChange = (time) => {
    if (isAfter(time, newEvent.endTime)) {
      setNewEvent({ ...newEvent, startTime: time, endTime: time });
    } else {
      setNewEvent({ ...newEvent, startTime: time });
    }
  };

  const handleEndTimeChange = (time) => {
    if (isAfter(newEvent.startTime, time)) {
      setNewEvent({ ...newEvent, startTime: time, endTime: time });
    } else {
      setNewEvent({ ...newEvent, endTime: time });
    }
  };

  const handleAddressChange = (address) => setNewEvent({ ...newEvent, location: { address, lat: null, lng: null } });

  const handleAddressSelect = (address) => {
    geocodeByAddress(address)
      .then((results) => getLatLng(results[0]))
      .then((latLng) => {
        setNewEvent({ ...newEvent, location: { address, lat: latLng.lat, lng: latLng.lng } });
      });
  };

  const handleReservationChange = (e) => setNewEvent({ ...newEvent, reservation: e.target.checked });

  return (
    <>
      <TextField
        autoFocus
        margin={matchesXS ? "dense" : "normal"}
        required
        label={newEvent.category === "none" || newEvent.category === "tour" ? "title" : "name"}
        value={newEvent.name}
        error={!newEvent.name && result.error}
        fullWidth
        onChange={handleNameChange}
      />
      <FormHelperText error={result.error}>{result.message}</FormHelperText>

      <Grid
        container
        direction={matchesXS ? "column" : "row"}
        alignItems={matchesXS ? undefined : "flex-start"}
        spacing={matchesXS ? undefined : 2}
      >
        <Grid item md>
          <DateTimePicker
            margin={matchesXS ? "dense" : "normal"}
            required
            label="Start Time"
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
            margin={matchesXS ? "dense" : "normal"}
            label="End Time"
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
            control={<Switch checked={newEvent.reservation} onChange={handleReservationChange} />}
            label="Reserved"
            labelPlacement="start"
            className={classes.formControlLabel}
          />
        </Grid>
      </Grid>

      <PlacesAutocomplete
        value={newEvent.location.address}
        onChange={handleAddressChange}
        onSelect={handleAddressSelect}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div>
            <TextField
              margin={matchesXS ? "dense" : "normal"}
              label="Address"
              fullWidth
              {...getInputProps({ placeholder: "Search Places ..." })}
            />
            {loading && <div>Loading...</div>}
            {suggestions.map((suggestion) => (
              <List key={suggestion.placeId} component="nav" dense disablePadding>
                <ListItem {...getSuggestionItemProps(suggestion, {})}>
                  <ListItemText primary={suggestion.description} />
                </ListItem>
              </List>
            ))}
          </div>
        )}
      </PlacesAutocomplete>
    </>
  );
};
