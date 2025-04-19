import * as mongoose from 'mongoose';

export const GlobalizationSchema = new mongoose.Schema({
    language: { type: String, required: true},
    key: { type: String, required: true , unique: true},
    message : { type: String, required: true },
});

export interface GlobalizationEntry extends mongoose.Document {
    language: string;
    key: string;
    message: string;
}
