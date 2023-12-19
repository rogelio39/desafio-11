import winston from 'winston';

const customLevelOpt = {
    levels: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        debug: 4
    },
    colors: {
        fatal: 'red',
        error: 'cyan',
        info: 'blue',
        debug: 'grey'
    }
}

//creacion de los loggers de winston, en base al objeto ya creado
const logger = winston.createLogger({
    levels: customLevelOpt.levels,
    //podemos generar el guardado implementando cada uno de ellos y guardarlos de forma independiente.
    transports: [
        new winston.transports.File({
            filename: './errors.log',
            level: 'fatal',
            format: winston.format.combine(
                winston.format.colorize({ colors: customLevelOpt.colors }),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename: './errors.log',
            level: 'error',
            format: winston.format.combine(
                winston.format.colorize({ colors: customLevelOpt.colors }),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename: './loggers.log',
            level: 'warning',
            format: winston.format.combine(
                winston.format.colorize({ colors: customLevelOpt.colors }),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename: './loggers.log',
            level: 'info',
            format: winston.format.combine(
                winston.format.colorize({ colors: customLevelOpt.colors }),
                winston.format.simple()
            )
        }),
        new winston.transports.Console({
            level: 'debug',
            format: winston.format.combine(
                winston.format.colorize({ colors: customLevelOpt.colors }),
                winston.format.simple()
            )
        })
    ]
})

export const addLogger = (req, res, next) => {
    if (!req.logger) {
        req.logger = logger;
        //aqui devuelvo quien hizo la peticion
        req.logger.debug(`${req.method} es ${req.url} - ${new Date().toLocaleDateString()}`);
    }
    next();
}
