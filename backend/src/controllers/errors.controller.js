


export const debug = async (req, res) => {
    req.logger.debug('Esto es un debug');
    res.send('debug correctamente procesado');
}


export const info = async (req, res) => {
    req.logger.info('Esto es un info');
    res.send('info correctamente procesado');
}

export const warning= async(req, res) => {
    req.logger.warning('Esto es un warning');
    res.send('warning correctamente procesado');
}


export const error = async(req, res) => {
    req.logger.error('Esto es un error');
    res.send('error correctamente procesado');
}

export const fatal = async(req, res) => {
    req.logger.fatal('Esto es un fatal');
    res.send('fatal correctamente procesado');
}



