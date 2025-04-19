import { async } from "rxjs/internal/scheduler/async";
import { GlobalizerService } from "./globalizer.service";
import { Res } from "@nestjs/common";



describe('sample test', () => {
    let globalizationModel;
    globalizationModel = {
        findOne: jest.fn().mockImplementation(() => globalizationModel),
        exec: jest.fn()
    };
    let globalizerService;

    beforeEach(async() => {
        jest.clearAllMocks();
        globalizerService = new GlobalizerService();
    });

    it('test getting a key', async() => {
        let connection = {
            model: jest.fn().mockReturnValue(globalizationModel)
        };
        globalizerService.initService(connection);
        globalizationModel.exec.mockReturnValue(Promise.resolve({name: 'got lang keys'}));

        let result = await globalizerService.get('lang', 'key');
        expect(result).toEqual({name: 'got lang keys'});

        expect(globalizationModel.findOne).toBeCalledTimes(1);
        expect(globalizationModel.findOne).toBeCalledWith({ language: 'lang' , key: 'key'  });

        expect(globalizationModel.exec).toBeCalledTimes(1);
        expect(globalizationModel.exec).toBeCalledWith();
        
        expect(connection.model).toBeCalledTimes(1);
       // expect(connection.model).toBeCalledWith("GlobalizationEntry", {"$id": 1, "_indexes": [], "_userProvidedOptions": {}, "aliases": {}, "callQueue": [], "childSchemas": [], "inherits": {}, "methodOptions": {}, "methods": {}, "nested": {}, "obj": {"key": {"required": true, "type": [Function String], "unique": true}, "language": {"required": true, "type": [Function String]}, "message": {"required": true, "type": [Function String]}}, "options": {"_id": true, "autoIndex": null, "bufferCommands": true, "capped": false, "discriminatorKey": "__t", "id": true, "minimize": true, "noId": false, "noVirtualId": false, "read": null, "shardKey": null, "strict": true, "typeKey": "type", "typePojoToMixed": true, "validateBeforeSave": true, "versionKey": "__v"}, "paths": {"_id": {"_index": null, "defaultValue": [Function defaultId], "getters": [], "instance": "ObjectID", "options": {"auto": true, "type": "ObjectId"}, "path": "_id", "setters": [[Function resetId]], "validators": [], Symbol(mongoose#schemaType): true}, "key": {"_index": {"unique": true}, "enumValues": [], "getters": [], "instance": "String", "isRequired": true, "options": {"required": true, "type": [Function String], "unique": true}, "originalRequiredValue": true, "path": "key", "regExp": null, "requiredValidator": [Function anonymous], "setters": [], "validators": [{"message": "Path `{PATH}` is required.", "type": "required", "validator": [Function anonymous]}], Symbol(mongoose#schemaType): true}, "language": {"_index": null, "enumValues": [], "getters": [], "instance": "String", "isRequired": true, "options": {"required": true, "type": [Function String]}, "originalRequiredValue": true, "path": "language", "regExp": null, "requiredValidator": [Function anonymous], "setters": [], "validators": [{"message": "Path `{PATH}` is required.", "type": "required", "validator": [Function anonymous]}], Symbol(mongoose#schemaType): true}, "message": {"_index": null, "enumValues": [], "getters": [], "instance": "String", "isRequired": true, "options": {"required": true, "type": [Function String]}, "originalRequiredValue": true, "path": "message", "regExp": null, "requiredValidator": [Function anonymous], "setters": [], "validators": [{"message": "Path `{PATH}` is required.", "type": "required", "validator": [Function anonymous]}], Symbol(mongoose#schemaType): true}}, "plugins": [], "query": {}, "s": {"hooks": {"_posts": Map {}, "_pres": Map {}}}, "singleNestedPaths": {}, "statics": {}, "subpaths": {}, "tree": {"_id": {"auto": true, "type": "ObjectId"}, "key": {"required": true, "type": [Function String], "unique": true}, "language": {"required": true, "type": [Function String]}, "message": {"required": true, "type": [Function String]}}, "virtuals": {}}, "global");
    });
});