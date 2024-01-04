import 'dotenv/config';
import express, { json } from "express";
import mongoose from "mongoose";
import cookieParser from 'cookie-parser';
import passport from 'passport';
import initializePassport from './config/passport.js';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cors from 'cors';
//rutas de db
import router from './routes/index.routes.js';
import compression from 'express-compression'
import { addLogger } from './config/logger.js';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';
import { swaggerOptions } from './config/swagger.js';
import cluster from 'cluster';
import { cpus } from 'os';


const PORT = 4000;

const app = express();

const specs = swaggerJSDoc(swaggerOptions);

const whiteList = ['http://localhost:5173'];

const numeroDeProcesadores = cpus().length;


const corsOptions = {
    origin: function (origin, callback) {
        if (whiteList.indexOf(origin) != -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('access denied'));
        }
    },
    credentials: true
}


app.use(express.json());
app.use(cookieParser(process.env.SIGNED_COOKIE)) // La cookie esta firmada
app.use(session({
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        mongoOptions: {
            useNewUrlParser: true, //Establezco que la conexion sea mediante URL
            useUnifiedTopology: true //Manego de clusters de manera dinamica
        },
        ttl: 60 //Duracion de la sesion en la BDD en segundos

    }),
    secret: process.env.SESSION_SECRET,
    resave: false, //Fuerzo a que se intente guardar a pesar de no tener modificacion en los datos
    saveUninitialized: false //Fuerzo a guardar la session a pesar de no tener ningun dato
}))
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

//inicializamos la estrategia
initializePassport();
//para que funcione passport en toda la aplicacion
app.use(passport.initialize());
//inicializamos las sesiones. Hacemos que maneje lo que seria de las sesiones
app.use(passport.session());


//conectando mongoDB atlas con visual studio code.
mongoose.connect(process.env.MONGO_URL)
    .then(async () => {
        console.log('DB is connected');

    }).catch(() => console.log('error en conexion a DB'));


app.use(compression());
//generacion de loggers
app.use(addLogger);
//swagger
app.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

//db routes
app.use('/', router);


app.get('/testArtillery', (req, res) => {
    let sum = 0;
    for (let i = 0; i < 5e8; i++) {
        sum += i
    }
    res.send({ sum });
})


if (cluster.isPrimary) {
    console.log('proceso primario, generando proceso trabajador: Numero 1');
    for (let i = 0; i < numeroDeProcesadores; i++) {
        cluster.fork();
        console.log(`Proceso forkeado, soy un worker ${i} `);
    }
} else {
    console.log(`worker con el id: ${process.pid}`);

    app.get('/operacionSencilla', (req, res) => {
        let sum = 0;
        for (let i = 0; i < 10000; i++) {
            sum += i;
        }
        res.send({ status: 'success', message: `El worker ${process.pid} ha atendido esta peticion, el resultado es ${sum}` });
    });

    app.get('/operacionCompleja', (req, res) => {
        let sum = 0;
        for (let i = 0; i < 5e8; i++) {
            sum += i;
        }
        res.send({ status: "success", message: `El worker ${process.pid} ha atendido esta peticion compleja, el resultado es ${sum}` });
    })

    app.listen(PORT, () => {
        console.log(`listening on port ${PORT}`)
    })
}



