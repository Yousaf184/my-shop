const mongoose = require('mongoose');

mongoose.connection.on('connected', () => console.log('connected to MongoDB'));
mongoose.connection.on('disconnected', () => console.log('MongoDB connection disconnected'));
mongoose.connection.on('close', () => console.log('MongoDB connection closed'));
mongoose.connection.on('error', (error) => console.log('could not connect to MongoDB'));

const connectToDB = async () => {
    try {
        if (mongoose.connection.readyState !== mongoose.connection.states.connected) {
            const connectionOptions = {
                useNewUrlParser: true,
                useCreateIndex: true,
                useUnifiedTopology: true
            };

            await mongoose.connect(process.env.MONGODB_CONNECTION_STR, connectionOptions);
        }
    } catch (error) {
        throw error;
    }
};

module.exports = connectToDB;