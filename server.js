require('dotenv').config();
const express = require('express');
const path = require('path');

const { customErrorHandler } = require('./app/middleware/error.middleware');
const { requestLogger, addRequestId, attachChildLogger } = require('./app/middleware/logger.middleware');
const webAPI = require('./app/routes/index.route');

const app = express();
const server = require('http').createServer(app);
const cookieParser = require('cookie-parser');

app.use(express.json({ limit: process.env.PAYLOAD_SIZE_LIMIT }));
app.use(express.urlencoded({
  extended: true,
  limit: process.env.PAYLOAD_SIZE_LIMIT,
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser()); 

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'app/views'));

// Request logger
app.use(addRequestId);
app.use(requestLogger);
app.use(attachChildLogger);

// Register your routes and error handler
app.use(webAPI);

//custom error handler
app.use(customErrorHandler);

// catch 404 and forward to error handler
// app.get('*', (req, res) => {
//   res.render('home/error', { 
//     status: 'Not Found', 
//     message: 'Page not found!', 
//     httpStatus: 404, 
//     redirectUrl: '/dashboard' });
// });

const port = process.env.APP_PORT || 3000;
server.listen(port, () => {
  console.log(`Server started at port ${port}`);
});
