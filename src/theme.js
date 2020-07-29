import { createMuiTheme } from '@material-ui/core/styles'

const baseColor = '#fff'
const mainColor = '#ffaa00'
const accentColor = '#e6a117'

export default createMuiTheme({
  palette: {
    primary: {
      main: mainColor,
    },
    secondary: {
      main: accentColor,
    },
  },
  overrides: {
    MuiButton:
    {
      containedPrimary: {
        color: baseColor,
      },
    },
  },
})
