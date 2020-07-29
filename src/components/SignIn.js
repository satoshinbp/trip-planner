import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Link from '@material-ui/core/Link'
import Grid from '@material-ui/core/Grid'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined'
import Typography from '@material-ui/core/Typography'
import Snackbar from '@material-ui/core/Snackbar'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Backdrop from '@material-ui/core/Backdrop'
import CircularProgress from '@material-ui/core/CircularProgress'
import Alert from '@material-ui/lab/Alert'
import firebase, { googleAuthProvider } from '../lib/firebase'

const useStyles = makeStyles(theme => ({
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    [theme.breakpoints.down("xs")]: {
      margin: theme.spacing(5, 4),
    },
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(1.5, 0),
  },
  or: {
    margin: theme.spacing(1.5, 0),
  },
  googleSignIn: {
    padding: 0,
    width: 191,
    height: 46,
    backgroundImage: 'url(/btn_google_signin_light_normal_web.png)',
    '&:hover': {
      backgroundImage: 'url(/btn_google_signin_light_focus_web.png)',
    },
    '&:active': {
      backgroundImage: 'url(/btn_google_signin_light_pressed_web.png)',
    },
  },
  guestSignIn: {
    width: 186,
    marginTop: theme.spacing(1.5),
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}))

export default props => {
  const classes = useStyles()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [checked, setChecked] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [backdropOpen, setBackdropOpen] = useState(false)
  const [success, setSuccess] = useState(undefined)
  const [message, setMessage] = useState('')

  const handleEmailSignIn = e => {
    e.preventDefault()

    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        if (checked) {
          localStorage.email = email
          localStorage.password = password
          localStorage.checked = checked
        }
      })
      .catch(error => {
        setSuccess(false)
        setMessage(error.message)
        setSnackbarOpen(true)
      })
  }

  const handleGoogleSignIn = e => {
    e.preventDefault()

    firebase.auth().signInWithPopup(googleAuthProvider).catch(error => {
      setSuccess(false)
      setMessage(error.message)
      setSnackbarOpen(true)
    })
  }

  const handleAnonymousSignIn = e => {
    e.preventDefault()

    firebase.auth().signInAnonymously().catch(error => {
      setSuccess(false)
      setMessage(error.message)
      setSnackbarOpen(true)
    })
  }

  const handleClose = (e, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setSuccess(undefined)
    setMessage('')
    setSnackbarOpen(false)
    setDialogOpen(false)
  }

  const resetPassword = () => {
    setBackdropOpen(true)
    setDialogOpen(false)
    firebase.auth().sendPasswordResetEmail(email).then(() => {
      setSuccess(true)
      setMessage('Email sent.')
      setBackdropOpen(false)
      setSnackbarOpen(true)
    }).catch(error => {
      setSuccess(false)
      setMessage(error.message)
      setBackdropOpen(false)
      setSnackbarOpen(true)
    })
  }

  useEffect(() => {
    if (localStorage.checked) {
      setEmail(localStorage.email)
      setPassword(localStorage.password)
      setChecked(true)
    }
  }, [])

  return (
    <div className={classes.paper}>
      <Avatar className={classes.avatar}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">Sign in</Typography>

      <form className={classes.form} noValidate>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          label="Email Address"
          autoComplete="email"
          value={email}
          autoFocus
          onChange={e => setEmail(e.target.value)}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <FormControlLabel
          control={
            <Checkbox
              value="remember"
              color="primary"
              checked={checked}
              onChange={e => setChecked(e.target.checked)}
            />
          }
          label="Remember me"
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={handleEmailSignIn}
        >
          Sign In
        </Button>
        <Grid container>
          <Grid item xs>
            <Link variant="body2" onClick={() => setDialogOpen(true)}>
              Forgot password?
            </Link>
          </Grid>
          <Grid item>
            <Link variant="body2" onClick={() => props.setPage('signUp')}>
              Don't have an account? Sign Up
            </Link>
          </Grid>
        </Grid>
      </form>
      <Typography variant="body1" className={classes.or}>
        Or
      </Typography>
      <Button
        disableElevation
        disableFocusRipple
        disableRipple
        className={classes.googleSignIn}
        onClick={handleGoogleSignIn}
      />
      <Button
        variant="contained"
        color="primary"
        className={classes.guestSignIn}
        onClick={handleAnonymousSignIn}
      >
        Sign in as a Guest
      </Button>

      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Reset Password</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Do you want to reset your password?
          </DialogContentText>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            autoFocus
            onChange={e => setEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">No</Button>
          <Button onClick={resetPassword} color="primary" autoFocus>Yes</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={success ? 'success' : 'error'}>
          {message}
        </Alert>
      </Snackbar>

      <Backdrop className={classes.backdrop} open={backdropOpen}>
        <CircularProgress />
      </Backdrop>
    </div>
  )
}