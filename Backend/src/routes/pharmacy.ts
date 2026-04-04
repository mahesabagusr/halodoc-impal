import { Router } from "express";
import { verifyToken } from "@/middlewares/jwt";
import { authorize } from "@/middlewares/authorization";
import {
  addItemToCart,
  checkoutCart,
  getMyCart,
  removeCartItem,
} from "@/modules/Pharmacy/controllers/cart-controllers";

const router = Router();

/**
 * @swagger
 * /api/v1/pharmacy/cart:
 *   get:
 *     summary: Get patient cart
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Cart fetched
 *       "400":
 *         $ref: '#/components/responses/BadRequestError'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/cart", verifyToken, authorize(["PATIENT"]), getMyCart);

/**
 * @swagger
 * /api/v1/pharmacy/cart/items:
 *   post:
 *     summary: Add item to cart
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddCartItemRequest'
 *     responses:
 *       "201":
 *         description: Item added to cart
 *       "400":
 *         $ref: '#/components/responses/ValidationError'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/cart/items", verifyToken, authorize(["PATIENT"]), addItemToCart);

/**
 * @swagger
 * /api/v1/pharmacy/cart/items/{cartItemId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Cart item id
 *     responses:
 *       "200":
 *         description: Item removed
 *       "400":
 *         $ref: '#/components/responses/ValidationError'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete(
  "/cart/items/:cartItemId",
  verifyToken,
  authorize(["PATIENT"]),
  removeCartItem,
);

/**
 * @swagger
 * /api/v1/pharmacy/cart/checkout:
 *   post:
 *     summary: Checkout patient cart
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckoutRequest'
 *     responses:
 *       "201":
 *         description: Checkout successful
 *       "400":
 *         $ref: '#/components/responses/ValidationError'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/cart/checkout",
  verifyToken,
  authorize(["PATIENT"]),
  checkoutCart,
);

export default router;
