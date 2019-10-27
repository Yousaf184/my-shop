const app = require('./app');
const connectToDB = require('./db/dbConn');

(async () => {
    try {
        await connectToDB();
        app.listen(process.env.PORT, () => {
            console.log('server started on port ' + process.env.PORT);
        });
    } catch (error) {
        console.log('failed to start server because of an error');
    }
})();
