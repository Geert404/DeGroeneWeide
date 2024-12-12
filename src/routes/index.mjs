import { Router } from "express";
import usersRouter from "./users.mjs";
import productsRouter from "./products.mjs";
import OrdersRouter from "./orders.mjs";
import bookingsRouter from "./bookings.mjs";
import categoriesRouter from "./categories.mjs";

const router = Router();

router.use(usersRouter);
router.use(productsRouter);
router.use(OrdersRouter);
router.use(bookingsRouter);
router.use(categoriesRouter);

export default router;