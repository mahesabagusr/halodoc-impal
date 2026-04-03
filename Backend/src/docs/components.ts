/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterUserRequest:
 *       type: object
 *       required:
 *         - fullName
 *         - email
 *         - password
 *       properties:
 *         fullName:
 *           type: string
 *           minLength: 3
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *         password:
 *           type: string
 *           minLength: 8
 *           example: "password123"
 *         role:
 *           type: string
 *           enum: [PATIENT, DOCTOR, ADMIN]
 *           example: "PATIENT"
 *           description: Optional role override (often handled globally/restricted by routes)
 *
 *     LoginUserRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *         password:
 *           type: string
 *           minLength: 8
 *           example: "password123"
 *
 *     EditUserRequest:
 *       type: object
 *       properties:
 *         fullName:
 *           type: string
 *           minLength: 3
 *           example: "John Doe Edited"
 *
 *     AddCartItemRequest:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *       properties:
 *         productId:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           example: 2
 *
 *     CheckoutRequest:
 *       type: object
 *       required:
 *         - shippingAddress
 *       properties:
 *         shippingAddress:
 *           type: string
 *           minLength: 8
 *           example: "123 Main Street, City"
 *
 *   responses:
 *     BadRequestError:
 *       description: Incomplete or invalid payload / logic failure
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "Bad Request or Validation Error"
 *
 *     ValidationError:
 *       description: Validation Error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "email tidak valid"
 *
 *     UnauthorizedError:
 *       description: Missing or invalid authentication token, or invalid credentials
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "Unauthorized"
 *
 *     ForbiddenError:
 *       description: User does not have the required role privileges
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "Forbidden"
 *
 *     NotFoundError:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "Not Found"
 *
 *     ConflictError:
 *       description: Conflict (e.g. Email already in use)
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "Conflict"
 *
 *     InternalServerError:
 *       description: Unexpected server error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "Internal Server Error"
 *
 *     ServiceUnavailable:
 *       description: Service Unavailable / Feature not implemented
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Service Unavailable"
 */
