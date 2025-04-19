import { Injectable } from '@nestjs/common';
import { Connection , Model } from 'mongoose';
import { Document , DocumentSchema } from '../../document-retrieving-module/src/document.schema';
import { DocumentEntry } from '../../document-retrieving-module/src/document.entry';
import uuidv4 = require('uuid/v4');


@Injectable()
export class DocumentRetrieverService {

    private documentModel : Model<Document>;
    
    initService(connection: Connection) {
      this.documentModel = connection.model('Document', DocumentSchema  , 'documents');
    }

    async createDocument(document: DocumentEntry): Promise<DocumentEntry> {
      const createdDoucment = new this.documentModel(document);
      createdDoucment.id =  uuidv4();
      createdDoucment.lastUpdate = new Date().getTime();
      return createdDoucment.save();
    }
    async updateDocument(id: string , entry : Document ): Promise<DocumentEntry> {
      entry.lastUpdate = new Date().getTime();
      return this.documentModel.findOneAndUpdate({ id }, entry, { new: true }).exec();
    }

    async getDocument(id: string): Promise<DocumentEntry> {
      return this.documentModel.findOne({ id }).exec().then((result) => {
        return [result];
    });
    }
    
    async deleteDocument(id: string): Promise<DocumentEntry> {
      return this.documentModel.deleteOne({ id }).exec();
    }

    async getDocumentsByCategory(category: String): Promise<DocumentEntry> {
      return this.documentModel.find({ category }).exec().then((result) => {
        return result;
      });    
    }

    async getDocumentsByKeyword(keyword: string): Promise<DocumentEntry> {

      return this.documentModel.find({keywords: { $all: [ keyword ] }}).exec().then((result) => {
        return result;
      });    
    }

    async searchDocuments(searchText: string): Promise<DocumentEntry> {
      return this.documentModel.find(
        {
          $or: [ 
            { keywords: { $all: [ searchText ] } },
            {category: {$regex: new RegExp('/' + searchText + '/'  , 'i').compile() }},
            {documentContent: {$regex: new RegExp('/' + searchText + '/'  , 'i').compile() }},
            {documentSubTitle: {$regex: new RegExp('/' + searchText + '/'  , 'i').compile() }},
            {documentTitle: {$regex: new RegExp('/' + searchText + '/'  , 'i').compile() }}
          ]
        }).exec().then((result) => {
        return result;
      });     

    }

}