import * as mongoose from 'mongoose';

export const LoggerSchema = new mongoose.Schema({
    id: { type: String, unique: true},
    sessionId: String,
    requestId: String,
    level: { type: String, enum: [ 'debug' , 'info' , 'warn' , 'error'] },
    message: String,
    timestamp: Number,
    sourceNode: String,
    logger: String,
    tenantId: String,
    messageType: { type: String, enum: ['nodeRegistration','call'] },
    userId: String, 
    duration: Number,
    callRoute: String

});

export interface LogEntry extends mongoose.Document {
    id: string;
    sessionId: string;
    requestId: string;
    level: string;
    message: string;
    timestamp: number;
    sourceNode: string;
    logger: string;
    tenantId: string;
    messageType: string;
    userId: string;
    druration: number;
    callRoute: string;

}
