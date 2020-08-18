import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  GoogleMap,
  Marker,
  InfoWindow
} from '@react-google-maps/api'
import { useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'

const map = props => {
  const theme = useTheme()
  const matchesMD = useMediaQuery(theme.breakpoints.down('md'))
  const { events, center, setCenter } = props
  const [selected, setSelected] = useState(null)

  const containerStyle = {
    width: '100%',
    height: matchesMD ? '100vh' : '70vh',
  }
  const mapRef = useRef()
  const handleLoad = useCallback(map => mapRef.current = map, [])

  useEffect(() => {
    const eventsWithAddress = events.filter(event => {
      if (event.category !== 'transportation') {
        return event.location.lat
      } else {
        return event.origin.lat || event.destination.lat
      }
    })

    if (eventsWithAddress.length !== 0) {
      setCenter(eventsWithAddress[0].category !== 'transportation'
        ? {
          lat: eventsWithAddress[0].location.lat,
          lng: eventsWithAddress[0].location.lng,
        } : eventsWithAddress[0].origin.lat
          ? {
            lat: eventsWithAddress[0].origin.lat,
            lng: eventsWithAddress[0].origin.lng,
          } : {
            lat: eventsWithAddress[0].destination.lat,
            lng: eventsWithAddress[0].destination.lng,
          })
    }

  }, [events])

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
      onLoad={handleLoad}
    >
      {events
        .map((event, i) => {
          if (event.category !== 'transportation') {
            if (event.location.lat) {
              const lat = event.location.lat
              const lng = event.location.lng
              return (
                <Marker
                  key={i}
                  label={String(i + 1)}
                  position={{ lat, lng }}
                  zIndex={1000 - i}
                  onClick={() => setSelected({ name: event.name, lat, lng })}
                />
              )
            }
          } else if (event.origin.lat && event.destination.lat) {
            return (
              <React.Fragment key={i}>
                <Marker
                  label={String(i + 1)}
                  position={{ lat: event.origin.lat, lng: event.origin.lng }}
                  zIndex={1000 - i}
                  onClick={() => setSelected({
                    name: `${event.origin.name} - ${event.destination.name}`,
                    lat: event.origin.lat,
                    lng: event.origin.lng,
                  })}
                />
                <Marker
                  label={String(i + 1)}
                  position={{ lat: event.destination.lat, lng: event.destination.lng }}
                  zIndex={1000 - i}
                  onClick={() => setSelected({
                    name: `${event.origin.name} - ${event.destination.name}`,
                    lat: event.destination.lat,
                    lng: event.destination.lng,
                  })}
                />
              </React.Fragment>
            )
          } else if (event.origin.lat) {
            const lat = event.origin.lat
            const lng = event.origin.lng
            return (
              <Marker
                key={i}
                label={String(i + 1)}
                position={{ lat, lng }}
                zIndex={1000 - i}
                onClick={() => setSelected({ name: `${event.origin.name} - ${event.destination.name}`, lat, lng })}
              />
            )
          } else if (event.destination.lat) {
            const lat = event.destination.lat
            const lng = event.destination.lng
            return (
              <Marker
                key={i}
                label={String(i + 1)}
                position={{ lat, lng }}
                zIndex={1000 - i}
                onClick={() => setSelected({ name: `${event.origin.name} - ${event.destination.name}`, lat, lng })}
              />
            )
          }
        })}
      {selected ? <InfoWindow position={{ lat: selected.lat, lng: selected.lng }} onCloseClick={() => setSelected(null)}>
        <div>
          {selected.name}
        </div>
      </InfoWindow> : null}
    </GoogleMap >
  )
}

export default React.memo(map)