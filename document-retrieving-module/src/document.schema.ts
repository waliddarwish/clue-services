import * as mongoose from 'mongoose';

export const DocumentSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    documentTitle: { type : String , required : true},
    documentSubTitle: { type : String , required : true },
    documentContent: mongoose.Schema.Types.Mixed,
    category: { type : String , required : true},
    keywords: [{ type: String}],
    order: { type : Number },
    lastUpdate: Number,
});


export interface Document extends mongoose.Document {
    id: string;
    documentTitle: string;
    documentSubTitle: string;
    documentContent: any;
    category: string;
    keywords: [string];
    order: number;
    lastUpdate: number;
}
