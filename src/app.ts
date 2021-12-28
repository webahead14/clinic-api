import express from "express";
import cors from "cors";
import helmet from "helmet";
import router from "./router";

const app = express();
const port = process.env.PORT || 4000;

declare global {
  namespace Express {
    interface Request {
      user: any;
    }
  }
}

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", router);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port} `);
});
