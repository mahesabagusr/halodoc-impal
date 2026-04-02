import express, { Application, Request, Response } from "express";
import userRoutes from "@/routes/users";
import pharmacyRoutes from "@/routes/pharmacy";
import { config } from "@/helpers/infra/global-config";

const app: Application = express();
const PORT = Number(config.express.port ?? "3000");
const HOST = config.express.host ?? "localhost";

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Server is running" });
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/pharmacy", pharmacyRoutes);

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
