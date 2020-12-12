import React, { useState, useEffect } from "react";
import router from "next/router";
import { makeStyles } from "@material-ui/core/styles";
import {
  useScrollTrigger,
  AppBar,
  Toolbar,
  Grid,
  Typography,
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  Tooltip,
} from "@material-ui/core";
import { AccountCircle, Settings, ExitToApp } from "@material-ui/icons";
import Link from "../Link";
import firebase from "../lib/firebase";

const ElevationScroll = (props) => {
  const { children } = props;
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
  });
};

const useStyles = makeStyles((theme) => ({
  container: {
    width: "100%",
    maxWidth: theme.breakpoints.values.lg,
    margin: "auto",
  },
  logo: {
    color: theme.palette.common.white,
    "&:hover": {
      textDecoration: "none",
    },
  },
  icon: {
    color: theme.palette.common.white,
    marginRight: -theme.spacing(1.5),
  },
  listItemIcon: {
    minWidth: 40,
  },
}));

export default (props) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const user = firebase.auth().currentUser;

  const handleSignOut = (e) => {
    e.preventDefault;
    firebase.auth().signOut();
  };

  return (
    <>
      <ElevationScroll {...props}>
        <AppBar>
          <Toolbar className={classes.container}>
            <Grid container direction="row" justify="space-between" alignItems="center">
              <Typography variant="h6" component={Link} href="/" className={classes.logo}>
                Trip Planner
              </Typography>
              <Tooltip title={user.email ? user.email : "Guest"}>
                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} className={classes.icon}>
                  <AccountCircle />
                </IconButton>
              </Tooltip>
            </Grid>
          </Toolbar>
        </AppBar>
      </ElevationScroll>

      <Toolbar />

      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={open}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => router.push("/setting")}>
          <ListItemIcon className={classes.listItemIcon}>
            <Settings />
          </ListItemIcon>
          Setting
        </MenuItem>
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon className={classes.listItemIcon}>
            <ExitToApp />
          </ListItemIcon>
          Sign Out
        </MenuItem>
      </Menu>
    </>
  );
};
