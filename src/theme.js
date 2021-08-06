import { createMuiTheme } from '@material-ui/core/styles'

const baseColor = '#fff'
const mainColor = '#23B223'

export default createMuiTheme({
  palette: {
    primary: {
      main: mainColor,
    },
  },
  overrides: {
    MuiButton: {
      containedPrimary: {
        color: baseColor,
      },
    },
  },
})
