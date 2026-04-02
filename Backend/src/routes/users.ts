import { Request, Response, Router } from "express";
import {
  adminCreateDoctor,
  getAllUsers,
  userEdit,
  userLogin,
  userRegister,
} from "@/modules/Users/controllers/users";
import { verifyToken } from "@/middlewares/jwt";
import { authorize } from "@/middlewares/authorization";

const router = Router();

router.get("/health", (req: Request, res: Response) => {
  const tes = req.body;
  console.log(tes);
  res.status(200).json({ message: "Hello, world!" });
});

router.post("/register", userRegister);
router.post("/login", userLogin);
router.post(
  "/admin/doctors",
  verifyToken,
  authorize(["ADMIN"]),
  adminCreateDoctor,
);
router.post("/edit", verifyToken, userEdit);

router.get("/", verifyToken, authorize(["ADMIN"]), getAllUsers);

export default router;
