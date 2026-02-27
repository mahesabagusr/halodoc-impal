import { Request, Response, Router } from "express";
import {
  userEdit,
  userLogin,
  userRegister,
} from "@/modules/Users/controllers/users";
import { verifyToken } from "@/middlewares/jwt";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  const tes = req.body;
  console.log(tes);
  res.status(200).json({ message: "Hello, world!" });
});

router.post("/register", userRegister);
router.post("/login", userLogin);
router.post("/edit", verifyToken, userEdit);

export default router;
