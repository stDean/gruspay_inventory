import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgen from "morgan";
import Routes from "./routes/index.mjs";
import "express-async-errors";

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgen("common"));
app.use(cors());

// Route
app.use("/api", Routes);

const PORT = 5001 | process.env.PORT;
const start = async () => {
	try {
		app.listen(PORT, () => {
			console.log(`server started on port: ${PORT}`);
		});
	} catch (error) {
		console.log(error);
	}
};

start();
