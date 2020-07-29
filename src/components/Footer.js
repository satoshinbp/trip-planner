import React from 'react'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import MuiLink from '@material-ui/core/Link'

const useStyles = makeStyles(theme => ({
  footer: {
    backgroundColor: theme.palette.primary.main,
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
}))

export default props => {
  const classes = useStyles()
  const theme = useTheme()

  return (
    <footer className={classes.footer}>
      <Typography variant="body2" align="center" style={{ color: theme.palette.common.white }}>
        {'Copyright © '}
        <MuiLink color="inherit" href="/">
          Trip Planner
        </MuiLink>{' '}
        {new Date().getFullYear()}
        {'.'}
      </Typography>
    </footer>
  )
}
