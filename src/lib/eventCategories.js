import DirectionsBikeIcon from '@material-ui/icons/DirectionsBike'
import DirectionsBoatIcon from '@material-ui/icons/DirectionsBoat'
import DirectionsBusIcon from '@material-ui/icons/DirectionsBus'
import DirectionsCarIcon from '@material-ui/icons/DirectionsCar'
import DirectionsTransitIcon from '@material-ui/icons/DirectionsTransit'
import DirectionsWalkIcon from '@material-ui/icons/DirectionsWalk'
import FlightIcon from '@material-ui/icons/Flight'
import HotelIcon from '@material-ui/icons/Hotel'
import RestaurantIcon from '@material-ui/icons/Restaurant'
import TripOriginIcon from '@material-ui/icons/TripOrigin'

export default [
  { name: 'None', value: 'none', icon: <TripOriginIcon color="primary" /> },
  { name: 'Restaurant', value: 'restaurant', icon: <RestaurantIcon color="primary" /> },
  { name: 'Hotel', value: 'hotel', icon: <HotelIcon color="primary" /> },
  { name: 'Transportation', value: 'transportation', icon: <DirectionsTransitIcon color="primary" /> },
]

export const transportationSubCategories = [
  { name: 'Walk', value: 'walk', icon: <DirectionsWalkIcon color="primary" /> },
  { name: 'Bike', value: 'bike', icon: <DirectionsBikeIcon color="primary" /> },
  { name: 'Car', value: 'car', icon: <DirectionsCarIcon color="primary" /> },
  { name: 'Bus', value: 'bus', icon: <DirectionsBusIcon color="primary" /> },
  { name: 'Train', value: 'train', icon: <DirectionsTransitIcon color="primary" /> },
  { name: 'Ferry', value: 'ferry', icon: <DirectionsBoatIcon color="primary" /> },
  { name: 'Flight', value: 'flight', icon: <FlightIcon color="primary" /> },
]