import React, { useState, useEffect, useRef, useCallback } from "react";
import { format, isSameDay, isSameYear } from "date-fns";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Typography from "@material-ui/core/Typography";

const map = (props) => {
  const theme = useTheme();
  const matchesXS = useMediaQuery(theme.breakpoints.down("xs"));
  const matchesSM = useMediaQuery(theme.breakpoints.down("sm"));
  const { events, center, setCenter } = props;
  const [selected, setSelected] = useState(null);

  const containerStyle = {
    width: "100%",
    height: matchesXS ? "calc(100vh - 227px)" : matchesSM ? "calc(100vh - 243px)" : "calc(100vh - 224px)",
  };

  const options = {
    disableDefaultUI: true,
  };

  const mapRef = useRef();
  const handleLoad = useCallback((map) => (mapRef.current = map), []);

  const timeDisplay = (start, end) => {
    if (end) {
      if (isSameDay(start, end)) {
        return `${format(start, "yy/MM/dd HH:mm")} - ${format(end, "HH:mm")}`;
      } else if (isSameYear(start, end)) {
        return `${format(start, "yy/MM/dd HH:mm")} - ${format(end, "MM/dd HH:mm")}`;
      } else {
        return `${format(start, "yy/MM/dd HH:mm")} - ${format(end, "yy/MM/dd HH:mm")}`;
      }
    } else {
      return format(start, "yy/MM/dd HH:mm");
    }
  };

  useEffect(() => {
    const eventsWithAddress = events.filter((event) => {
      if (event.category !== "transportation") {
        return event.location.lat;
      } else {
        return event.origin.lat || event.destination.lat;
      }
    });

    if (eventsWithAddress.length !== 0) {
      setCenter(
        eventsWithAddress[0].category !== "transportation"
          ? {
              lat: eventsWithAddress[0].location.lat,
              lng: eventsWithAddress[0].location.lng,
            }
          : eventsWithAddress[0].origin.lat
          ? {
              lat: eventsWithAddress[0].origin.lat,
              lng: eventsWithAddress[0].origin.lng,
            }
          : {
              lat: eventsWithAddress[0].destination.lat,
              lng: eventsWithAddress[0].destination.lng,
            }
      );
    }
  }, [events]);

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12} onLoad={handleLoad} options={options}>
      {events.map((event, i) => {
        if (event.category !== "transportation") {
          if (event.location.lat) {
            const lat = event.location.lat;
            const lng = event.location.lng;
            return (
              <Marker
                key={i}
                label={String(i + 1)}
                position={{ lat, lng }}
                zIndex={1000 - i}
                onClick={() =>
                  setSelected({
                    name: event.name,
                    time: timeDisplay(event.startTime, event.endTime),
                    lat,
                    lng,
                  })
                }
              />
            );
          }
        } else if (event.origin.lat && event.destination.lat) {
          return (
            <React.Fragment key={i}>
              <Marker
                label={String(i + 1)}
                position={{ lat: event.origin.lat, lng: event.origin.lng }}
                zIndex={1000 - i}
                onClick={() =>
                  setSelected({
                    name: `${event.origin.name} → ${event.destination.name}`,
                    time: timeDisplay(event.startTime, event.endTime),
                    lat: event.origin.lat,
                    lng: event.origin.lng,
                  })
                }
              />
              <Marker
                label={String(i + 1)}
                position={{ lat: event.destination.lat, lng: event.destination.lng }}
                zIndex={1000 - i}
                onClick={() =>
                  setSelected({
                    name: `${event.origin.name} → ${event.destination.name}`,
                    time: timeDisplay(event.startTime, event.endTime),
                    lat: event.destination.lat,
                    lng: event.destination.lng,
                  })
                }
              />
            </React.Fragment>
          );
        } else if (event.origin.lat) {
          const lat = event.origin.lat;
          const lng = event.origin.lng;
          return (
            <Marker
              key={i}
              label={String(i + 1)}
              position={{ lat, lng }}
              zIndex={1000 - i}
              onClick={() =>
                setSelected({
                  name: `${event.origin.name} → ${event.destination.name}`,
                  time: timeDisplay(event.startTime, event.endTime),
                  lat,
                  lng,
                })
              }
            />
          );
        } else if (event.destination.lat) {
          const lat = event.destination.lat;
          const lng = event.destination.lng;
          return (
            <Marker
              key={i}
              label={String(i + 1)}
              position={{ lat, lng }}
              zIndex={1000 - i}
              onClick={() =>
                setSelected({
                  name: `${event.origin.name} → ${event.destination.name}`,
                  time: timeDisplay(event.startTime, event.endTime),
                  lat,
                  lng,
                })
              }
            />
          );
        }
      })}
      {selected ? (
        <InfoWindow position={{ lat: selected.lat, lng: selected.lng }} onCloseClick={() => setSelected(null)}>
          <>
            <Typography variant="body2">{selected.time}</Typography>
            <Typography>{selected.name}</Typography>
          </>
        </InfoWindow>
      ) : null}
    </GoogleMap>
  );
};

export default React.memo(map);
