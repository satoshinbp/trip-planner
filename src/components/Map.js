import React, { useState, useRef, useCallback } from 'react'
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow
} from '@react-google-maps/api'
import { makeStyles } from '@material-ui/core/styles'
import LoadingPage from './LoadingPage'

const markers = [
  { id: 'a', lat: 35.681236, lng: 139.767125 },
  { id: 'b', lat: 35.731236, lng: 139.817125 },
  { id: 'c', lat: 35.781236, lng: 139.867125 },
]

const containerStyle = {
  width: '100%',
  height: '100vh',
}

const center = {
  lat: 35.681236,
  lng: 139.767125,
}

const useStyles = makeStyles(theme => ({
}))

const map = props => {
  const classes = useStyles()
  const [selected, setSelected] = useState(null)
  const { events } = props

  const mapRef = useRef()
  const handleLoad = useCallback(map => mapRef.current = map, [])

  const { isLoaded, loadError } = useLoadScript({ googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY })

  if (loadError) return <div>Map cannot be loaded right now, sorry.</div>
  if (!isLoaded) return <LoadingPage />

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={10}
      onLoad={handleLoad}
    >
      {markers.map(marker => (
        <Marker
          key={marker.id}
          position={{ lat: marker.lat, lng: marker.lng }}
          onClick={() => setSelected(marker)}
        />
      ))}
      {selected ? <InfoWindow position={{ lat: selected.lat, lng: selected.lng }} onCloseClick={() => setSelected(null)}>
        <div>
          {selected.id}
        </div>
      </InfoWindow> : null}
    </GoogleMap >
  )
}

export default React.memo(map)