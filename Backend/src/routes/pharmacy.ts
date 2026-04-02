import { Router } from "express";
import { verifyToken } from "@/middlewares/jwt";
import { authorize } from "@/middlewares/authorization";
import {
  addItemToCart,
  checkoutCart,
  getMyCart,
  removeCartItem,
} from "@/modules/Pharmacy/controllers/cart";

const router = Router();

router.get("/cart", verifyToken, authorize(["PATIENT"]), getMyCart);
router.post("/cart/items", verifyToken, authorize(["PATIENT"]), addItemToCart);
router.delete(
  "/cart/items/:cartItemId",
  verifyToken,
  authorize(["PATIENT"]),
  removeCartItem,
);
router.post(
  "/cart/checkout",
  verifyToken,
  authorize(["PATIENT"]),
  checkoutCart,
);

export default router;
