import React, { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { getAllJobs } from 'api/job/job'
import { getAllGallery } from 'api/job/job'
import Paper from '@material-ui/core/Paper'
import SearchBar from 'material-ui-search-bar'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import Modal from '@material-ui/core/Modal'
import Container from '@mui/material/Container'
import ButtonGroup from '@mui/material/ButtonGroup'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import Alert from '@mui/material/Alert'
import { makeStyles } from '@material-ui/core/styles'
import { getUser } from '../../utilities/localStorage'
import { addGallery, addImages } from 'api/job/job'
import { message } from 'antd'
import ReviewCard from './ReviewCard'
import List from '@mui/material/List'
import Divider from '@mui/material/Divider'
import { getAllReviews } from 'api/review/review'
import { getAllDeals } from 'api/job/job'
import JobCard from './JobCard'
import Stack from '@mui/material/Stack'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import Chart from './Chart'

function getBusinessName(params) {
  return `${params.row.business.name || ''}`
}

function getPriceType(params) {
  if (params.row.priceType === 'PER_HOUR') return 'Per hour'
  else if (params.row.priceType === 'PER_DAY') return 'Per day'
  return `${params.row.business.name || ''}`
}

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
    paddingBottom: '20px',
  },
  grid: {
    height: '100vh',
    marginTop: '10px',
  },
  paperLeft: {
    height: '100vh',
  },
  paperTop: {
    height: '20%',
  },
  paperMain: {
    height: '55vh',
  },
  paperRight: {},
  paperBottom: { height: '20%' },
  paper: {
    textAlign: 'center',
    color: theme.palette.text.primary,
    background: theme.palette.grey,
  },
}))

export default function WorkerPage() {
  const columns = [
    {
      field: 'name',
      headerName: 'Bussines',
      width: 120,
      sortable: true,
      valueGetter: getBusinessName,
    },
    { field: 'price', width: 100, headerName: 'Price', sortable: true },
    {
      field: 'priceType',
      headerName: 'Price Type',
      width: 150,

      sortable: true,
      valueGetter: getPriceType,
    },
    { field: 'userName', headerName: 'Worker', width: 150, sortable: true },
    {
      field: 'gallery',
      headerName: 'Gallery',
      renderCell: (params) => (
        <Button
          spacing={1}
          variant='contained'
          onClick={() => handleOpen(params.row)}
        >
          View gallery
        </Button>
      ),
      sortable: false,
      width: 200,
      valueGetter: (params) =>
        `${params.row.price || ''} ${params.row.userName || ''}`,
    },
    {
      field: 'image',
      headerName: 'Upload Image',
      renderCell: (params) => (
        <input
          id={params.row.id}
          style={{ padding: '2px' }}
          type='file'
          className='form-control'
          name='file'
          onChange={(event) => onFileChangeHandler(event, params.row)}
        />
      ),

      sortable: false,
      width: 250,
    },
  ]
  const [rows, setRows] = useState([])
  const [jobs, setJobs] = useState([])
  const [searched, setSearched] = useState('')
  const [open, setOpen] = useState(false)
  const [images, setImages] = useState([])
  const [currentImg, setCurrentImg] = useState()
  const [position, setPosition] = useState(0)
  const [reviews, setReviews] = useState([])
  const [deals, setDeals] = useState([])

  const classes = useStyles()

  const onFileChangeHandler = async (e, row) => {
    e.preventDefault()
    const formData = new FormData()

    formData.append('file', e.target.files[0])
    const response = await addImages(formData)
    const gallery = {
      fileEntity: response,
      jobId: row.id,
    }
    await addGallery(gallery)
    message.success('Successfully added image!')
    const firstNameInput = document.getElementById(row.id)
    firstNameInput.value = ''
  }

  const handlePrevious = () => {
    let value = position - 1
    if (value < 0) {
      value = images.length - 1
    }
    setCurrentImg(images[value]?.fileEntity?.data)
    setPosition(value)
  }

  const handleNext = () => {
    let value = position + 1

    if (value > images.length - 1) {
      value = 0
    }

    setCurrentImg(images[value]?.fileEntity?.data)
    setPosition(value)
  }

  async function fetchData(jobId) {
    try {
      const response = await getAllGallery()
      const imgs = response.filter((data) => data.jobId === jobId)
      setImages(imgs)
      setCurrentImg(imgs[position]?.fileEntity?.data)
      setOpen(true)
    } catch (e) {
      console.error(e)
    }
  }

  const handleOpen = (row) => {
    fetchData(row.id)
  }
  const handleClose = () => setOpen(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const user = getUser()
        const response = await getAllJobs()
        const data = response.filter((row) => row.user === user.id)
        setJobs(data)
        setRows(data)
        const res = await getAllReviews()
        const arr = res.filter((row) => row.worker === user.id)
        setReviews(arr)
        const resArr = await getAllDeals()
        const newRess = resArr.filter((row) => row.job.user === user.id)
        setDeals(newRess)
      } catch (e) {
        console.error(e)
      }
    }
    fetchData()
  }, [])

  const requestSearch = (searchedVal) => {
    const filteredRows = jobs.filter((row) => {
      return row.business.name.toLowerCase().includes(searchedVal.toLowerCase())
    })
    setRows(filteredRows)
  }

  const cancelSearch = () => {
    setSearched('')
    requestSearch(searched)
  }

  return (
    <div className={classes.root} style={{ paddingBottom: '10px' }}>
      <Grid container spacing={1} className={classes.grid}>
        <Grid item container xs={12} spacing={1}>
          <Grid item xs={2}>
            <Paper className={`${classes.paperLeft} ${classes.paper}`}>
              <h3 style={{ marginBottom: '10px' }}>Reviews</h3>

              <List
                sx={{
                  padding: '2px',
                  width: '100%',
                  maxWidth: 360,
                  bgcolor: 'background.paper',
                  position: 'relative',
                  overflow: 'auto',
                  maxHeight: '95vh',
                  '& ul': { padding: 0 },
                }}
                subheader={<li />}
              >
                {reviews.map((review) => (
                  <>
                    <Divider variant='inset' component='li' />
                    <ReviewCard
                      key={review.id}
                      value={review.numStars}
                      text={review.comment}
                    />
                    <Divider variant='inset' component='li' />
                  </>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid item xs={8}>
            <Paper className={`${classes.paperMain} ${classes.paper}`}>
              <Stack
                direction='row'
                spacing={2}
                style={{ marginBottom: '10px' }}
              >
                <SearchBar
                  style={{ width: '80%' }}
                  value={searched}
                  onChange={(searchVal) => requestSearch(searchVal)}
                  onCancelSearch={() => cancelSearch()}
                />
                <Button
                  variant='outlined'
                  style={{
                    width: '20%',
                  }}
                  startIcon={<AddCircleIcon />}
                >
                  Add new job
                </Button>
              </Stack>

              <div
                style={{
                  margin: '0 auto',
                  height: '90%',
                  width: '100%',
                  fontSize: '20px',
                  paddingBottom: '18px',
                }}
              >
                <DataGrid
                  rows={rows}
                  columns={columns}
                  pageSize={5}
                  rowsPerPageOptions={[20]}
                  disableSelectionOnClick
                />
                <Chart />
              </div>
              <Modal
                style={{
                  marginTop: '40px',
                }}
                open={open}
                onClose={handleClose}
                aria-labelledby='modal-modal-title'
                aria-describedby='modal-modal-description'
                disableEscapeKeyDown
                disableEnforceFocus
              >
                <Container component='main' maxWidth='lg'>
                  <Box
                    sx={{
                      borderRadius: '5px',
                      backgroundColor: '#FFFAFA',

                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '25px',
                    }}
                  >
                    <Grid item xs={12}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        {images.length === 0 ? (
                          <Alert severity='error'>
                            There is no images for this job!
                          </Alert>
                        ) : (
                          <Box
                            component='img'
                            style={{
                              maxWidth: '90%',
                              height: '600px',
                              borderWidth: 1,
                              borderColor: 'red',
                            }}
                            src={`data:image/jpeg;base64,${currentImg}`}
                          />
                        )}
                      </div>
                    </Grid>

                    <ButtonGroup
                      style={{
                        width: '90%',
                        displey: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      {images.length !== 0 && (
                        <ArrowBackIosNewIcon onClick={handlePrevious} />
                      )}
                      <Button
                        onClick={handleClose}
                        variant='contained'
                        style={{
                          backgroundColor: 'red',
                          width: '20%',
                          color: '#ffff',
                          borderRadius: '10',
                        }}
                        sx={{ mt: 3, mb: 2 }}
                      >
                        Close
                      </Button>
                      {images.length !== 0 && (
                        <ArrowForwardIosIcon onClick={handleNext} />
                      )}
                    </ButtonGroup>
                  </Box>
                </Container>
              </Modal>
            </Paper>
          </Grid>
          <Grid item xs={2}>
            <Paper className={`${classes.paperLeft} ${classes.paper}`}>
              <h3 style={{ marginBottom: '10px' }}>Jobs</h3>

              <List
                sx={{
                  padding: '2px',
                  width: '100%',
                  maxWidth: 360,
                  bgcolor: 'background.paper',
                  position: 'relative',
                  overflow: 'auto',
                  maxHeight: '95vh',
                  '& ul': { padding: 0 },
                }}
                subheader={<li />}
              >
                {deals.map((deal) => (
                  <>
                    <Divider variant='inset' component='li' />
                    <JobCard key={deal.id} deal={deal} />
                    <Divider variant='inset' component='li' />
                  </>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </div>
  )
}