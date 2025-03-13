require("dotenv").config();
const pjbgDB = require("./models/connection");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken"); // Ajouter jwt pour la vérification du token

const app = express();
pjbgDB();

// Middleware pour vérifier l'authentification par token PLUS UTILISE
const verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers["authorization"]; // Vérifier si un token est présent dans les cookies ou les en-têtes
  if (!token) {
    return res.status(401).json({ message: "Veuillez vous connecter." }); // Rediriger vers la connexion si pas de token
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Vérifier la validité du token
    req.user = decoded; // Stocker les informations utilisateur dans req.user
    next(); // Passer à la route suivante
  } catch (err) {
    return res.status(400).json({ message: "Token invalide ou expiré." }); // Si le token est invalide
  }
};

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const projectsRouter = require("./routes/projects");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json()); // Middleware pour parser le body


const corsOptions = {
  origin: "https://pjbg-frontend.vercel.app",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

// Routes API
app.use("/api/users", usersRouter);
app.use("/api/projects", projectsRouter);

// Routes standard (si nécessaire)
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/projects", projectsRouter);

module.exports = app;
