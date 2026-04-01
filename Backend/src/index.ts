import express, { Application, Request, Response } from "express";
import userRoutes from "@/routes/users";
import pharmacyRoutes from "@/routes/pharmacy";

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Server is running" });
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/pharmacy", pharmacyRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
