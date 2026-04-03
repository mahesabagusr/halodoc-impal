import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Application, Request, Response } from "express";
import { config } from "@/helpers/infra/global-config";

const port = config.express.port ?? "3000";
const host = config.express.host ?? "localhost";

const options: any = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MediConnect API Docs",
      version: "1.0.0",
      description: "API Documentation for MediConnect Backend",
    },
    servers: [
      {
        url: `http://${host}:${port}`,
        description: "Local Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/docs/**/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Application) => {
  app.use("/api-docs", ...swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get("/api-docs.json", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log(`Swagger docs available at http://${host}:${port}/api-docs`);
};
