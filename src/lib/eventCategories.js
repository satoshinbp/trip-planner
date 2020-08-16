import DirectionsBikeIcon from '@material-ui/icons/DirectionsBike'
import DirectionsBoatIcon from '@material-ui/icons/DirectionsBoat'
import DirectionsBusIcon from '@material-ui/icons/DirectionsBus'
import DirectionsCarIcon from '@material-ui/icons/DirectionsCar'
import DirectionsTransitIcon from '@material-ui/icons/DirectionsTransit'
import DirectionsWalkIcon from '@material-ui/icons/DirectionsWalk'
import FlagIcon from '@material-ui/icons/Flag'
import FlightIcon from '@material-ui/icons/Flight'
import HotelIcon from '@material-ui/icons/Hotel'
import RestaurantIcon from '@material-ui/icons/Restaurant'
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart'
import TheatersIcon from '@material-ui/icons/Theaters'
import TripOriginIcon from '@material-ui/icons/TripOrigin'

export default [
  { name: 'None', value: 'none', icon: <TripOriginIcon color="primary" key="none" /> },
  { name: 'Tour', value: 'tour', icon: <FlagIcon color="primary" key="tour" /> },
  { name: 'Restaurant', value: 'restaurant', icon: <RestaurantIcon color="primary" key="restaurant" /> },
  { name: 'Shopping', value: 'shopping', icon: <ShoppingCartIcon color="primary" key="shopping" /> },
  { name: 'Cinema', value: 'cinema', icon: <TheatersIcon color="primary" key="cinema" /> },
  { name: 'Hotel', value: 'hotel', icon: <HotelIcon color="primary" key="hotel" /> },
  { name: 'Transportation', value: 'transportation', icon: <DirectionsTransitIcon color="primary" key="transportation" /> },
]

export const transCategories = [
  { name: 'Walk', value: 'walk', icon: <DirectionsWalkIcon color="primary" key="walk" /> },
  { name: 'Bike', value: 'bike', icon: <DirectionsBikeIcon color="primary" key="bike" /> },
  { name: 'Car', value: 'car', icon: <DirectionsCarIcon color="primary" key="car" /> },
  { name: 'Bus', value: 'bus', icon: <DirectionsBusIcon color="primary" key="bus" /> },
  { name: 'Train', value: 'train', icon: <DirectionsTransitIcon color="primary" key="train" /> },
  { name: 'Ferry', value: 'ferry', icon: <DirectionsBoatIcon color="primary" key="ferry" /> },
  { name: 'Flight', value: 'flight', icon: <FlightIcon color="primary" key="flight" /> },
]