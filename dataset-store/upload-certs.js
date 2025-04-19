var MongoClient = require('mongodb').MongoClient;
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));


var myArgs = process.argv.slice(2);
if (myArgs.length < 9) {
    console.log("Usage: node upload-certs.js server post database caCertFile caRootCertFile caRootKeyFile caDUserCertFile caDSUserKeyFile");
    process.exit();
}
var user = "catalog-owner";
var password = "4lzahraa2";
var replicaSet = "clueData01"


let url = "mongodb://" + user + ":" +  password + "@" + myArgs[0] + ":" + myArgs[1] + "/"+  myArgs[2] + "?retryWrites=true&w=majority";
console.log(url);
const client = new MongoClient(url, {
});

client.connect(function (err) {
    if (err) throw err;

    Promise.all([
        fs.readFileAsync(myArgs[3], "utf8"),
        fs.readFileAsync(myArgs[4], "utf8"),
        fs.readFileAsync(myArgs[5], "utf8"),
        fs.readFileAsync(myArgs[6], "utf8"),
        fs.readFileAsync(myArgs[7], "utf8"),
        fs.readFileAsync(myArgs[8], "utf8")
    ]).then(results => {

        const collection = client.db(myArgs[2]).collection('cluesettings');
        collection.findAndModify({ id: "87f6a749-3e7f-4bb4-98cd-331fb4eac8f1" }, {
            id: 1
        }, {
            id: "87f6a749-3e7f-4bb4-98cd-331fb4eac8f1",
            datasetDatabaseCACert: results[0],
            datasetDatabaseCA: results[1],
            datasetDatabaseRootUserCert: results[2],
            datasetDatabaseRootUserKey: results[3],
            datasetDatabaseDSUserCert: results[4],
            datasetDatabaseDSUserKey: results[5],
            installationType: "Multi-tenant",
            schemaMajorVersion: 1,
            schemaMinorVersion: 0,
            maxAcquireDatasetStoreConnectionRetry: 5,
            acquireDatasetStoreConnectionSleepDuration: 1000,
        },
            {
                limit: 1,
                upsert: true
            }, (err, data) => {
                if (err) console.log(err);
                console.log("Cert files successfully uploaded to ClueCatalog ");
                client.close();
                process.exit();
            });

    }).catch(error => {
        console.log(error);
        process.exit();
    });


});