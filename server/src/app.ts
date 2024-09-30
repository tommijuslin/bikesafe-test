import 'express-async-errors'
import express from 'express'
import { errorHandler } from './util/middleware'
import cors from 'cors'

import coordinatesRouter from './routes/coordinatesRoute'
import bikeTheftRouter from './routes/bikeTheftRoute'
import lockStationRouter from './routes/lockStationRoute'
import testingRouter from './routes/testingRoute'

export const app = express()

app.use(express.json())
app.use(cors())

app.use('/api/coordinates', coordinatesRouter)
app.use('/api/bike_thefts', bikeTheftRouter)
app.use('/api/lock_stations', lockStationRouter)

app.use('/testing', testingRouter)

app.use(errorHandler)