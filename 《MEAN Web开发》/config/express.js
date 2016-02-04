// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies
var config = require('./config'),
        http = require('http'),
        socketio = require('socket.io'), //配置 socket 服务
        express = require('express'),
        morgan = require('morgan'), // 提供简单的日志
        compress = require('compression'), // 提供相应内容的压缩
        bodyParser = require('body-parser'), // 处理请求数据
        methodOverride = require('method-override'), // 添加对 HTTP 的 DELETE 和 PUT 的支持
        session = require('express-session'), // Session 中间件
        MongoStore = require('connect-mongo')(session),
        flash = require('connect-flash'), // 在不同的请求之间传递临时消息机制
        passport = require('passport'); // 请求授权模块

// Define the Express configuration method
module.exports = function (db) {
    // Create a new Express application instance
    var app = express();

    // Create a new HTTP server
    var server = http.createServer(app);

    // Create a new Socket.io server
    var io = socketio.listen(server);

    // Use the 'NDOE_ENV' variable to activate the 'morgan' logger or 'compress' middleware
    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    } else if (process.env.NODE_ENV === 'production') {
        app.use(compress());
    }

    // Use the 'body-parser' and 'method-override' middleware functions
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(methodOverride());

    // Configure the MongoDB session storage
    var mongoStore = new MongoStore({
        db: db.connection.db
    });

    // Configure the 'session' middleware
    app.use(session({
        saveUninitialized: true,
        resave: true,
        secret: config.sessionSecret,
        store: mongoStore
    }));

    // Set the application view engine and 'views' folder
    app.set('views', './app/views');
    app.set('view engine', 'ejs');

    // Configure the flash messages middleware
    app.use(flash());

    // Configure the Passport middleware
    app.use(passport.initialize());
    app.use(passport.session());

    // Load the routing files
    require('../app/routes/index.server.routes.js')(app);
    require('../app/routes/users.server.routes.js')(app);
    require('../app/routes/articles.server.routes.js')(app);

    // Configure static file serving
    app.use(express.static('./public')); // 设置项目的静态文件路径

    // Load the Socket.io configuration
    require('./socketio')(server, io, mongoStore);

    // Return the Server instance
    return server;
};