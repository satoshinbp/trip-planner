import React, { useState } from 'react'
import router from 'next/router'
import { makeStyles } from '@material-ui/core/styles'
import Box from '@material-ui/core/Box'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Hidden from '@material-ui/core/Hidden'
import Button from '@material-ui/core/Button'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import TextField from '@material-ui/core/TextField'
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import Link from '@material-ui/core/Link'
import Toolbar from '@material-ui/core/Toolbar'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import AccordionActions from '@material-ui/core/AccordionActions'
import Divider from '@material-ui/core/Divider'
import Typography from '@material-ui/core/Typography'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Snackbar from '@material-ui/core/Snackbar'
import Backdrop from '@material-ui/core/Backdrop'
import CircularProgress from '@material-ui/core/CircularProgress'
import Alert from '@material-ui/lab/Alert'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import EmailIcon from '@material-ui/icons/Email'
import LockIcon from '@material-ui/icons/Lock'
import ClearIcon from '@material-ui/icons/Clear'
import AddIcon from '@material-ui/icons/Add'
import withAuth from '../src/withAuth'
import Header from '../src/components/Header'
import Footer from '../src/components/Footer'
import firebase, { emailAuthProvider, googleAuthProvider } from '../src/lib/firebase'

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(0, 3),
    paddingBottom: theme.spacing(5.5),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(0, 2),
      paddingBottom: theme.spacing(4.5),
    },
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  signUp: {
    justifyContent: 'center',
  },
}))

export default withAuth(props => {
  const classes = useStyles()
  
  const [signUp, setSignUp] = useState({ method: '', email: '', pass: '' })
  const [changeEmail, setChangeEmail] = useState({ address: '', pass: '' })
  const [changePass, setChangePass] = useState({ current: '', new: '', retype: '' })
  const [deleteAccount, setDeleteAccount] = useState({ open: false, pass: '' })
  const [result, setResult] = useState({ open: false, error: false, message: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const user = firebase.auth().currentUser
  const provider = user.providerData.map(profile => profile.providerId)

  const handleChangeEmail = () => {
    setIsLoading(true)

    const credential = emailAuthProvider.credential(user.email, changeEmail.pass)

    user.reauthenticateWithCredential(credential).then(result => {
      user.updateEmail(changeEmail.address).then(() => {
        setIsLoading(false)
        setIsExpanded(false)
        setResult({ open: true, error: false, message: 'E-mail updated successfully' })
      }).catch(error => {
        setIsLoading(false)
        setResult({ open: true, error: true, message: error.message })
      })
    }).catch(error => {
      setIsLoading(false)
      setResult({ open: true, error: true, message: error.message })
    })
  }

  const handleChangePass = () => {
    if (changePass.new === changePass.retype) {
      setIsLoading(true)

      const credential = emailAuthProvider.credential(user.email, changePass.current)

      user.reauthenticateWithCredential(credential).then(() =>
        user.updatePassword(changePass.new).then(() => {
          setIsLoading(false)
          setIsExpanded(false)
          setResult({ open: true, error: false, message: 'Password updated successfully' })
        }).catch(error => {
          setIsLoading(false)
          setResult({ open: true, error: true, message: error.message })
        })
      ).catch(error => {
        setIsLoading(false)
        setResult({ open: true, error: true, message: error.message })
      })
    } else {
      setResult({ open: true, error: true, message: 'Password mismatch.' })
    }
  }

  const handleDeleteAccount = () => {
    setDeleteAccount({ ...deleteAccount, open: false })
    setIsLoading(true)

    if (provider.includes('password')) {
      const credential = emailAuthProvider.credential(user.email, deleteAccount.pass)

      user.reauthenticateWithCredential(credential).then(() =>
        user.delete().catch(error => {
          setIsLoading(false)
          setResult({ open: true, error: true, message: error.message })
        })
      ).catch(error => {
        setIsLoading(false)
        setResult({ open: true, error: true, message: error.message })
      })
    } else if (provider.includes('google.com')) {
      user.reauthenticateWithPopup(googleAuthProvider).then(() =>
        user.delete().catch(error => {
          setIsLoading(false)
          setResult({ open: true, error: true, message: error.message })
        })
      ).catch(error => {
        setIsLoading(false)
        setResult({ open: true, error: true, message: error.message })
      })
    }
  }

  const handleSignUp = () => {
    switch (signUp.method) {
      case 'google':
        setIsLoading(true)
        user.linkWithPopup(googleAuthProvider).then(() => {
          router.push('/')
        }).catch(error => {
          setIsLoading(false)
          setResult({ open: true, error: true, message: error.message })
        })
        break
      case 'email':
        setIsLoading(true)
        const credential = emailAuthProvider.credential(signUp.email, signUp.pass)
        user.linkWithCredential(credential).then(() => {
          router.push('/')
        }).catch(error => {
          setIsLoading(false)
          setResult({ open: true, error: true, message: error.message })
        })
        break
      default:
        setResult({ open: true, error: true, message: 'Select sign up method' })
        break
    }
  }

  const handleCloseResult = () => setResult({ open: false, error: false, message: '' })

  const handleChangePanel = panel => (e, expanded) => setIsExpanded(expanded ? panel : false)

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <Header {...props} />

      <Toolbar>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="/">Home</Link>
          <Typography color="textPrimary">Setting</Typography>
        </Breadcrumbs>
      </Toolbar>

      <Container className={classes.container}>
        <Typography variant="h4" className={classes.title}>Setting</Typography>

        {user.isAnonymous ? (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <ListItemIcon className={classes.icon}>
                <AddIcon color="secondary" />
              </ListItemIcon>
              <Box>
                <Typography className={classes.heading}>Create Account</Typography>
                <Hidden xsDown>
                  <Typography className={classes.secondaryHeading}>
                    Your trips will be saved in a new account.
                  </Typography>
                </Hidden>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <ListItemIcon />
              <Grid container direction="column">
                <Typography variant="body1">
                  You are currently signed in as a guest. If you sign up a new account, you can save your trips permanently.
                </Typography>
                <Typography variant="body1">Sign up with...</Typography>
                <RadioGroup onChange={e => setSignUp({ ...signUp, method: e.target.value })}>
                  <FormControlLabel
                    value="google"
                    control={<Radio color="primary" />}
                    label="Google"
                  />
                  <FormControlLabel
                    value="email"
                    control={<Radio color="primary" />}
                    label="E-mail and Password"
                  />
                </RadioGroup>
                {signUp.method === 'email' ? (
                  <React.Fragment>
                    <Grid item>
                      <TextField
                        variant="outlined"
                        margin="normal"
                        label="E-mail address"
                        onChange={e => setSignUp({ ...signUp, email: e.target.value })}
                      />
                    </Grid>
                    <Grid item>
                      <TextField
                        variant="outlined"
                        margin="normal"
                        label="Password"
                        type="password"
                        onChange={e => setSignUp({ ...signUp, pass: e.target.value })}
                      />
                    </Grid>
                  </React.Fragment>
                ) : null}
              </Grid>
            </AccordionDetails>
            <AccordionActions>
              <Button size="small" color="primary" onClick={handleSignUp}>
                Sign Up
              </Button>
            </AccordionActions>
          </Accordion>
        ) : (
            <React.Fragment>
              {provider.includes('password') ? (
                <React.Fragment>
                  <Accordion expanded={isExpanded === 'email'} onChange={handleChangePanel('email')}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <ListItemIcon className={classes.icon}>
                        <EmailIcon color="secondary" />
                      </ListItemIcon>
                      <Box>
                        <Typography className={classes.heading}>Change E-mail</Typography>
                        <Hidden xsDown>
                          <Typography className={classes.secondaryHeading}>{user.email}</Typography>
                        </Hidden>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <ListItemIcon />
                      <Grid container direction="column">
                        <Grid item>
                          <TextField
                            variant="outlined"
                            margin="normal"
                            label="New e-mail address"
                            onChange={e => setChangeEmail({ ...changeEmail, address: e.target.value })}
                          />
                        </Grid>
                        <Grid item>
                          <TextField
                            variant="outlined"
                            margin="normal"
                            label="Password"
                            type="password"
                            onChange={e => setChangeEmail({ ...changeEmail, pass: e.target.value })}
                          />
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                    <Divider />
                    <AccordionActions>
                      <Button size="small" color="primary" onClick={handleChangeEmail}>Save</Button>
                    </AccordionActions>
                  </Accordion>

                  <Accordion expanded={isExpanded === 'password'} onChange={handleChangePanel('password')}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <ListItemIcon className={classes.icon}>
                        <LockIcon color="secondary" />
                      </ListItemIcon>
                      <Box>
                        <Typography className={classes.heading}>Change Password</Typography>
                        <Hidden xsDown>
                          <Typography className={classes.secondaryHeading}>
                            It's a good idea to use a strong password that you're not using elsewhere
                          </Typography>
                        </Hidden>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <ListItemIcon />
                      <Grid container direction="column">
                        <Grid item>
                          <TextField
                            variant="outlined"
                            margin="normal"
                            label="Current Password"
                            type="password"
                            onChange={e => setChangePass({ ...changePass, current: e.target.value })}
                          />
                        </Grid>
                        <Grid item>
                          <TextField
                            variant="outlined"
                            margin="normal"
                            label="New Password"
                            type="password"
                            onChange={e => setChangePass({ ...changePass, new: e.target.value })}
                          />
                        </Grid>
                        <Grid item>
                          <TextField
                            variant="outlined"
                            margin="normal"
                            label="Re-type New Password"
                            type="password"
                            onChange={e => setChangePass({ ...changePass, retype: e.target.value })}
                          />
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                    <Divider />
                    <AccordionActions>
                      <Button size="small" color="primary" onClick={handleChangePass}>
                        Save
                      </Button>
                    </AccordionActions>
                  </Accordion>
                </React.Fragment>
              ) : null}

              <Accordion expanded={isExpanded === 'delete'} onChange={handleChangePanel('delete')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <ListItemIcon className={classes.icon}>
                    <ClearIcon color="secondary" />
                  </ListItemIcon>
                  <Box>
                    <Typography className={classes.heading}>Delete Account</Typography>
                    <Hidden xsDown>
                      <Typography className={classes.secondaryHeading}>
                        Deleting your account is permanent.
                      </Typography>
                    </Hidden>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <ListItemIcon />
                  <Typography variant="body2">
                    When you delete your Trip Planner account, you won't be able to retrieve the content or information
                    you've shared on Trip Planner.
                  </Typography>
                </AccordionDetails>
                <Divider />
                <AccordionActions>
                  <Button size="small" color="primary" onClick={() => setDeleteAccount({ ...deleteAccount, open: true })}>
                    Delete
                  </Button>
                </AccordionActions>
              </Accordion>
            </React.Fragment>
          )}

        <Dialog open={deleteAccount.open} onClose={() => setDeleteAccount({ ...deleteAccount, open: false })}>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to permanently delete this accout?
              </DialogContentText>
            {provider.includes('password') ? (
              <TextField
                variant="outlined"
                margin="normal"
                label="Password"
                type="password"
                onChange={e => setDeleteAccount({ ...deleteAccount, pass: e.target.value })}
              />
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={() => setDeleteAccount({ ...deleteAccount, open: false })}>
              Cancel
              </Button>
            <Button variant="contained" color="primary" onClick={handleDeleteAccount}>
              Delete
              </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={result.open} autoHideDuration={6000} onClose={handleCloseResult}>
          <Alert onClose={handleCloseResult} severity={result.error ? 'error' : 'success'}>
            {result.message}
          </Alert>
        </Snackbar>

        <Backdrop className={classes.backdrop} open={isLoading} onClick={() => setIsLoading(false)}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </Container>
      <Footer />
    </div >
  )
})
