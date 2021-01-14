require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { errors } = require('celebrate');

const limiter = require('./middlewares/limiter');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const routes = require('./routes');
const errorHandler = require('./middlewares/error-handler');
const { DB } = require('./config');

const { PORT = 3002 } = process.env;
const app = express();

// подключаемся к серверу mongo
mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(cors());
app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.use(requestLogger); // ставить в начало цепочки
app.use(limiter); // отсекает запросы в определенный интервал времени
app.use(helmet()); // для установки заголовков безопасности

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(routes);

app.use(errors()); // обработчик ошибок celebrate

app.use(errorLogger);

app.use(errorHandler);

app.listen(PORT, () => console.log(`Listening to port: ${PORT}`));
