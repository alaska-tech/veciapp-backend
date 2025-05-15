import { Response } from 'express';
import { BranchBO } from '../business/branchBO';
import {
    BranchCreateRequestExtended,
    BranchGetRequestExtended,
    BranchPaginationRequestExtended,
    BranchResponse,
    BranchUpdateRequestExtended,
    BranchValidateEmailRequestExtended,
    BranchCreateRequest,
    BranchStatsRequestExtended,
    BranchCreateResponse,
    BranchStats,
    BranchManageStatusRequestExtended, NearbyBranchPaginationRequestExtended
} from '../types/branch';
import {ApiResponse} from '../types/serverResponse';
import {responseError, responseOk} from "../utils/standardResponseServer";

export class OrderUseCases {
    constructor() {
        this.orderBO = new orderBO_1.OrderBO();

        this.createOrder = async (req, res) => {
            try {
                const order = await this.orderBO.createOrder(req.body);
                res.status(201).json((0, standardResponseServer_1.responseOk)({
                    id: order.id,
                    orderNumber: order.orderNumber,
                    message: '¡Se ha creado una nueva orden con éxito!'
                }));
            } catch (error) {
                res.status(400).json((0, standardResponseServer_1.responseError)({ message: error.message }));
            }
        };

        this.getAllOrders = async (req, res) => {
            try {
                const orders = await this.orderBO.getAllOrders(Number(req.query.limit), Number(req.query.page));
                res.status(200).json((0, standardResponseServer_1.responseOk)(orders));
            } catch (error) {
                res.status(500).json((0, standardResponseServer_1.responseError)({ message: error.message }));
            }
        };

        this.getOrderById = async (req, res) => {
            try {
                const order = await this.orderBO.getOrderById(req.params.id);
                if (order) {
                    res.status(200).json((0, standardResponseServer_1.responseOk)(order));
                } else {
                    res.status(404).json((0, standardResponseServer_1.responseError)({ message: 'Orden no encontrada' }));
                }
            } catch (error) {
                res.status(500).json((0, standardResponseServer_1.responseError)({ message: error.message }));
            }
        };

        this.getCustomerOrders = async (req, res) => {
            try {
                const customerId = req.params.customerId;
                const orders = await this.orderBO.getCustomerOrders(
                    customerId,
                    Number(req.query.limit),
                    Number(req.query.page)
                );
                res.status(200).json((0, standardResponseServer_1.responseOk)(orders));
            } catch (error) {
                res.status(500).json((0, standardResponseServer_1.responseError)({ message: error.message }));
            }
        };

        this.getVendorOrders = async (req, res) => {
            try {
                const vendorId = req.params.vendorId;
                const orders = await this.orderBO.getVendorOrders(
                    vendorId,
                    Number(req.query.limit),
                    Number(req.query.page)
                );
                res.status(200).json((0, standardResponseServer_1.responseOk)(orders));
            } catch (error) {
                res.status(500).json((0, standardResponseServer_1.responseError)({ message: error.message }));
            }
        };

        this.getBranchOrders = async (req, res) => {
            try {
                const branchId = req.params.branchId;
                const orders = await this.orderBO.getBranchOrders(
                    branchId,
                    Number(req.query.limit),
                    Number(req.query.page)
                );
                res.status(200).json((0, standardResponseServer_1.responseOk)(orders));
            } catch (error) {
                res.status(500).json((0, standardResponseServer_1.responseError)({ message: error.message }));
            }
        };

        this.updateOrderStatus = async (req, res) => {
            try {
                const order = await this.orderBO.updateOrderStatus(req.params.id, req.body);
                if (order) {
                    res.status(200).json((0, standardResponseServer_1.responseOk)({
                        id: order.id,
                        message: '¡El estado de la orden ha sido actualizado con éxito!'
                    }));
                } else {
                    res.status(404).json((0, standardResponseServer_1.responseError)({ message: 'Orden no encontrada' }));
                }
            } catch (error) {
                res.status(400).json((0, standardResponseServer_1.responseError)({ message: error.message }));
            }
        };

        this.updatePaymentStatus = async (req, res) => {
            try {
                const order = await this.orderBO.updatePaymentStatus(req.params.id, req.body);
                if (order) {
                    res.status(200).json((0, standardResponseServer_1.responseOk)({
                        id: order.id,
                        message: '¡El estado de pago ha sido actualizado con éxito!'
                    }));
                } else {
                    res.status(404).json((0, standardResponseServer_1.responseError)({ message: 'Orden no encontrada' }));
                }
            } catch (error) {
                res.status(400).json((0, standardResponseServer_1.responseError)({ message: error.message }));
            }
        };

        this.rateOrder = async (req, res) => {
            try {
                const order = await this.orderBO.rateOrder(req.params.id, req.body);
                if (order) {
                    res.status(200).json((0, standardResponseServer_1.responseOk)({
                        id: order.id,
                        message: '¡Gracias por calificar su orden!'
                    }));
                } else {
                    res.status(404).json((0, standardResponseServer_1.responseError)({ message: 'Orden no encontrada' }));
                }
            } catch (error) {
                res.status(400).json((0, standardResponseServer_1.responseError)({ message: error.message }));
            }
        };

        this.getStats = async (req, res) => {
            try {
                // Extraemos los parámetros de consulta
                const startStr = req.query.start;
                const endStr = req.query.end;
                let startDate;
                let endDate;

                // Procesamos las fechas solo si están presentes
                if (startStr) {
                    startDate = new Date(startStr);
                    // Validamos que la fecha de inicio sea válida
                    if (isNaN(startDate.getTime())) {
                        res.status(400).json((0, standardResponseServer_1.responseError)({ message: 'Formato de fecha de inicio inválido. Use YYYY-MM-DD' }));
                        return;
                    }
                }

                if (endStr) {
                    endDate = new Date(endStr);
                    // Validamos que la fecha final sea válida
                    if (isNaN(endDate.getTime())) {
                        res.status(400).json((0, standardResponseServer_1.responseError)({ message: 'Formato de fecha final inválido. Use YYYY-MM-DD' }));
                        return;
                    }
                    // Aseguramos que la fecha final sea el último momento del día
                    endDate.setHours(23, 59, 59, 999);
                }

                // Si se proporciona solo una fecha, respondemos con error
                if ((startDate && !endDate) || (!startDate && endDate)) {
                    res.status(400).json((0, standardResponseServer_1.responseError)({ message: 'Debe proporcionar ambas fechas (start y end) o ninguna' }));
                    return;
                }

                const stats = await this.orderBO.getOrderStats(startDate, endDate);
                res.status(200).json((0, standardResponseServer_1.responseOk)(stats));
            } catch (error) {
                res.status(500).json((0, standardResponseServer_1.responseError)({ message: error.message }));
            }
        };
    }
}
