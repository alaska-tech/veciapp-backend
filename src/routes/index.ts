import express from 'express'
const router = express.Router()

import auth from './auth'
import vendors from './vendors'
import customers from './customers'
import branches from './branches'
import productservice from "./productservice";
/*import orders from './orders'
import categories from './categories'*/
import parameters from './parameters'

router.use('/auth', auth)
router.use('/vendors', vendors)
router.use('/customers', customers)
router.use('/branches', branches)
router.use('/productservice', productservice)
/*router.use('/orders', orders)
router.use('/categories', categories)*/
router.use('/parameters', parameters)

export default router

