import express, { Express, Request, Response, NextFunction } from 'express';

import cors from 'cors'
import router from "./routes"
import  {error404Handler, errorHandler} from "./middlewares/errors"



const app: Express = express()

// Middleware
app.use(cors({origin: '*'}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/v1', router)
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the VeciApp API' })
})

// Error handling middleware
app.use(error404Handler)
app.use(errorHandler)

export default app