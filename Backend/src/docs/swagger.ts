import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "IMPAL Backend API",
    version: "1.0.0",
    description: "REST API documentation for IMPAL Backend routes.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development server",
    },
  ],
  tags: [
    { name: "Users", description: "User and admin management" },
    { name: "Pharmacy", description: "Patient cart and checkout" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      RegisterUserRequest: {
        type: "object",
        required: ["fullName", "email", "password"],
        properties: {
          fullName: { type: "string", minLength: 3, example: "Mahesa Pratama" },
          email: {
            type: "string",
            format: "email",
            example: "mahesa@example.com",
          },
          password: { type: "string", minLength: 8, example: "Secret123" },
          role: {
            type: "string",
            enum: ["PATIENT", "DOCTOR", "ADMIN"],
            example: "PATIENT",
          },
        },
      },
      LoginUserRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "mahesa@example.com",
          },
          password: { type: "string", minLength: 8, example: "Secret123" },
        },
      },
      EditUserRequest: {
        type: "object",
        properties: {
          fullName: { type: "string", minLength: 3, example: "Mahesa Updated" },
        },
      },
      AddCartItemRequest: {
        type: "object",
        required: ["productId", "quantity"],
        properties: {
          productId: { type: "integer", minimum: 1, example: 12 },
          quantity: { type: "integer", minimum: 1, example: 2 },
        },
      },
      CheckoutRequest: {
        type: "object",
        required: ["shippingAddress"],
        properties: {
          shippingAddress: {
            type: "string",
            minLength: 8,
            example: "Jl. Sudirman No. 10, Jakarta",
          },
        },
      },
      GenericSuccess: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          message: { type: "string", example: "Operation successful" },
          data: { type: "object", nullable: true },
        },
      },
      GenericError: {
        type: "object",
        properties: {
          status: { type: "string", example: "fail" },
          message: { type: "string", example: "Validation error" },
          error: { type: "object", nullable: true },
        },
      },
    },
  },
  paths: {
    "/api/v1/users/health": {
      get: {
        tags: ["Users"],
        summary: "Users route health check",
        responses: {
          "200": {
            description: "Health check success",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/GenericSuccess" },
              },
            },
          },
        },
      },
    },
    "/api/v1/users/register": {
      post: {
        tags: ["Users"],
        summary: "Register a user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterUserRequest" },
            },
          },
        },
        responses: {
          "201": { description: "User created" },
          "400": {
            description: "Invalid input",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/GenericError" },
              },
            },
          },
        },
      },
    },
    "/api/v1/users/login": {
      post: {
        tags: ["Users"],
        summary: "Login user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginUserRequest" },
            },
          },
        },
        responses: {
          "200": { description: "Login success" },
          "400": {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/GenericError" },
              },
            },
          },
        },
      },
    },
    "/api/v1/users/admin/doctors": {
      post: {
        tags: ["Users"],
        summary: "Admin creates a doctor account",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterUserRequest" },
            },
          },
        },
        responses: {
          "201": { description: "Doctor account created" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
    },
    "/api/v1/users/admin/admins": {
      post: {
        tags: ["Users"],
        summary: "Admin creates another admin account",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterUserRequest" },
            },
          },
        },
        responses: {
          "201": { description: "Admin account created" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
    },
    "/api/v1/users/edit": {
      post: {
        tags: ["Users"],
        summary: "Edit current user profile",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/EditUserRequest" },
            },
          },
        },
        responses: {
          "200": { description: "User updated" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/v1/users": {
      get: {
        tags: ["Users"],
        summary: "Get all users (Admin only)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Users fetched" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
    },
    "/api/v1/pharmacy/cart": {
      get: {
        tags: ["Pharmacy"],
        summary: "Get patient cart",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Cart fetched" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
    },
    "/api/v1/pharmacy/cart/items": {
      post: {
        tags: ["Pharmacy"],
        summary: "Add item to cart",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AddCartItemRequest" },
            },
          },
        },
        responses: {
          "201": { description: "Item added to cart" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
    },
    "/api/v1/pharmacy/cart/items/{cartItemId}": {
      delete: {
        tags: ["Pharmacy"],
        summary: "Remove item from cart",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "cartItemId",
            required: true,
            schema: { type: "integer", minimum: 1 },
            description: "Cart item id",
          },
        ],
        responses: {
          "200": { description: "Item removed" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
    },
    "/api/v1/pharmacy/cart/checkout": {
      post: {
        tags: ["Pharmacy"],
        summary: "Checkout patient cart",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CheckoutRequest" },
            },
          },
        },
        responses: {
          "200": { description: "Checkout successful" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: [],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
