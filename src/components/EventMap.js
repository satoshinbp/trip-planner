import React, { useState, useRef, useCallback } from 'react'
import {
  GoogleMap,
  Marker,
  InfoWindow
} from '@react-google-maps/api'

const containerStyle = {
  width: '100%',
  height: '100vh',
}

const map = props => {
  const { events } = props
  const [selected, setSelected] = useState(null)

  const eventsWithLocation = events.filter(event => event.location.lat && event.location.lng)

  const center = eventsWithLocation.length === 0
    ? {
      lat: 35.681236,
      lng: 139.767125,
    } : {
      lat: eventsWithLocation[0].location.lat,
      lng: eventsWithLocation[0].location.lng,
    }

  const mapRef = useRef()
  const handleLoad = useCallback(map => mapRef.current = map, [])

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
      onLoad={handleLoad}
    >
      {events
        .map((event, i) => {
          if (event.location.lat && event.location.lng)
            return (
              <Marker
                key={i}
                label={String(i + 1)}
                position={{ lat: event.location.lat, lng: event.location.lng }}
                zIndex={1000 - i}
                onClick={() => setSelected({ name: event.name, lat: event.location.lat, lng: event.location.lng })}
              />
            )
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