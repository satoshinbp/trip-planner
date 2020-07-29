import React, { useState } from 'react'
import router from 'next/router'
import { makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import useScrollTrigger from '@material-ui/core/useScrollTrigger'
import Grid from '@material-ui/core/Grid'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import IconButton from '@material-ui/core/IconButton'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import SettingsIcon from '@material-ui/icons/Settings'
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import Link from '../Link'
import firebase from '../lib/firebase'

const ElevationScroll = props => {
  const { children } = props
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  })

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
  })
}

const useStyles = makeStyles(theme => ({
  logoText: {
    color: theme.palette.common.white,
    '&:hover': {
      textDecoration: 'none',
    },
  },
  icon: {
    color: theme.palette.common.white,
  },
  listItemIcon: {
    minWidth: 40,
  },
}))

export default props => {
  const classes = useStyles()
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleSignOut = e => {
    e.preventDefault
    firebase.auth().signOut()
  }

  return (
    <React.Fragment>
      <ElevationScroll {...props}>
        <AppBar>
          <Toolbar>
            <Grid container direction="row" justify="space-between" alignItems="center">
              <Typography
                variant="h6"
                component={Link}
                href="/"
                className={classes.logoText}
              >
                Trip Planner
              </Typography>
              <div>
                <IconButton onClick={e => setAnchorEl(e.currentTarget)} className={classes.icon}>
                  <AccountCircleIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={open}
                  onClose={() => setAnchorEl(null)}
                >
                  <MenuItem onClick={() => router.push('/setting')}>
                    <ListItemIcon classes={{ root: classes.listItemIcon }}>
                      <SettingsIcon />
                    </ListItemIcon>
                    Setting
                  </MenuItem>
                  <MenuItem onClick={handleSignOut}>
                    <ListItemIcon classes={{ root: classes.listItemIcon }}>
                      <ExitToAppIcon />
                    </ListItemIcon>
                    Sign Out
                  </MenuItem>
                </Menu>
              </div>
            </Grid>
          </Toolbar>
        </AppBar>
      </ElevationScroll>
      <Toolbar />
    </React.Fragment >
  )
}
