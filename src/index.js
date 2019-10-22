const app = require('./app');
const connectToDB = require('./db/dbConn');

(async () => {
    await connectToDB();
    app.listen(process.env.PORT, () => {
        console.log('server started on port ' + process.env.PORT);
    });
})();
