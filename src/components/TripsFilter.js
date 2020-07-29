import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Fab from '@material-ui/core/Fab'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Hidden from '@material-ui/core/Hidden'
import AddIcon from '@material-ui/icons/Add'

const useStyles = makeStyles(theme => ({
  radio: {
    marginLeft: 0,
    width: 74,
  },
  fab: {
    position: 'fixed',
    bottom: 50,
    right: 30,
  },
}))

export default props => {
  const { filter, setFilter, setOpen } = props
  const classes = useStyles()

  return (
    <Grid
      container
      direction="row"
      justify="space-between"
      alignItems="center"
      style={{ marginBottom: '1em' }}
    >
      <Grid item>
        <RadioGroup
          row
          aria-label="filter"
          name="filter"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <FormControlLabel
            value="upcoming"
            control={<Radio color="primary" />}
            label="Upcoming"
            labelPlacement="top"
            className={classes.radio}
          />
          <FormControlLabel
            value="past"
            control={<Radio color="primary" />}
            label="Past"
            labelPlacement="top"
            className={classes.radio}
          />
          <FormControlLabel
            value="all"
            control={<Radio color="primary" />}
            label="All"
            labelPlacement="top"
            className={classes.radio}
          />
        </RadioGroup>
      </Grid>
      <Grid item>
        <Hidden xsDown>
          <Button variant="contained" color="primary" onClick={() => setOpen('add')}>Add a Trip</Button>
        </Hidden>
        <Hidden smUp>
          <Fab color="primary" aria-label="add" className={classes.fab} onClick={() => setOpen('add')}>
            <AddIcon size="small" />
          </Fab>
        </Hidden>
      </Grid>
    </Grid>
  )
}
