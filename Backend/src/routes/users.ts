import { Request, Response, Router } from "express";
import {
  getAllUsers,
  userEdit,
  userLogin,
  userRegister,
  refreshToken,
} from "@/modules/Users/controllers/users";
import { verifyToken } from "@/middlewares/jwt";
import { authorize } from "@/middlewares/authorization";

const router = Router();

/**
 * @swagger
 * /api/v1/users/health:
 *   get:
 *     summary: Users route health check
 *     tags: [Users]
 *     responses:
 *       "200":
 *         description: Health check success
 */
router.get("/health", (req: Request, res: Response) => {
  const tes = req.body;
  console.log(tes);
  res.status(200).json({ message: "Hello, world!" });
});

/**
 * @swagger
 * /api/v1/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUserRequest'
 *     responses:
 *       "201":
 *         description: User created successfully
 *       "400":
 *         $ref: '#/components/responses/ValidationError'
 *       "409":
 *         $ref: '#/components/responses/ConflictError'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/register", userRegister);

/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginUserRequest'
 *     responses:
 *       "200":
 *         description: Login successful
 *       "400":
 *         $ref: '#/components/responses/ValidationError'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/login", userLogin);

/**
 * @swagger
 * /api/v1/users/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       "200":
 *         description: Token refreshed successfully
 *       "400":
 *         $ref: '#/components/responses/ValidationError'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/refresh", refreshToken);

/**
 * @swagger
 * /api/v1/users/admin/doctors:
 *   post:
 *     summary: Admin creates a doctor account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUserRequest'
 *     responses:
 *       "201":
 *         description: Doctor account created
 *       "400":
 *         $ref: '#/components/responses/ValidationError'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 *       "409":
 *         $ref: '#/components/responses/ConflictError'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/admin/doctors", verifyToken, authorize(["ADMIN"]), userRegister);

/**
 * @swagger
 * /api/v1/users/admin/admins:
 *   post:
 *     summary: Admin creates another admin account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUserRequest'
 *     responses:
 *       "201":
 *         description: Admin account created
 *       "400":
 *         $ref: '#/components/responses/ValidationError'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 *       "409":
 *         $ref: '#/components/responses/ConflictError'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/admin/admins", verifyToken, authorize(["ADMIN"]), userRegister);

/**
 * @swagger
 * /api/v1/users/edit:
 *   post:
 *     summary: Edit current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EditUserRequest'
 *     responses:
 *       "200":
 *         description: User updated
 *       "400":
 *         $ref: '#/components/responses/ValidationError'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *       "503":
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
router.post("/edit", verifyToken, userEdit);

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Users fetched
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/", verifyToken, authorize(["ADMIN"]), getAllUsers);

export default router;
