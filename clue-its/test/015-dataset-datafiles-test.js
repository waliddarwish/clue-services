var should = require("chai").should(),
  expect = require("chai").expect,
  supertest = require("supertest"),
  api = supertest("http://localhost:8240")
  ;

const chaiExec = require("@jsdevtools/chai-exec");
const chai = require("chai");
const uuidv4 = require('uuid/v4');
chai.use(chaiExec);

describe("Dataset Datafiles", function () {
  this.timeout(60000);
  var tenant = {};
  var user = {};
  var token = "";
  var cookies;
  var datasetId = '';
  var firstFileInfo = {};
  var firstFileAnlysis = {};
  var secondFileInfo = {};
  var secondFileAnlysis = {};
  var modelObj = {};
  var importerTrackerId = '';
  var trackerObject = {};
  var modelObjects = {};
  var queryDef = {};

  it("Create Tenant", function (done) {
    api
      .put("/catalog/tenant")
      .set("Accept", "application/x-www-form-urlencoded")
      .send({
        tenant: {
          name: "The Data Halo company",
          address: "57 Len Lunney Cres, Ottawa, ON, Canada, K2G6X4",
          paymentToken: "PaymentTokenFromStripe",
          phoneNumber: "819 329 8179",
          subscriptionPlan : "c845fa96-b68a-44a7-9756-e99bc4f07031",
          paymentDetails: {
            subscribeTenant: false
          }
        },
        user: {
          username: "user2@email.com",
          password:
            "f1CyVthmD0Pz7mA1kZyDzk39sVCCLpNYJazGs8QFtykWx98YJYOgmGzcAWPArH9tUz6iMVdONbqAddxSdZ2PAWVXKJzC9mn7uMTAJ9jfjZwH12IG+KEUduNCUcDJ2EfQQYCsQ4mTXJFZKFFamV6hwJdqrJxb5Kpzqj15MZu1X41OYJSOmVYmUH6wrqIf1QR+kTrBrxWDoFl5myw0/OWzU+iXZBaWdE1wE0OQB6LGW73G0ptW8S4QT+olapJ6tsOkU+eU+ZrOmkpt5cgQCx2sFxFv5milGOyT7dTcpEtNjB3/G1Hg/oo0ePCxSe4SFgTbQ1P9yKF8rNGTuBeHt7qAag==",
          name: {
            firstName: "Walid",
            lastName: "Darwish"
          },
          userLanguage: "en-us",
          userTimeZone: "GMT-5"
        }
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body.status).to.equal(0);
        tenant = res.body.data.tenant;
        user = res.body.data.user;
        done();
      });
  });

  it("Login", function (done) {
    api
      .post("/access/authenticate")
      .set("Accept", "application/x-www-form-urlencoded")
      .send({
        username: "user2@email.com",
        password:
          "f1CyVthmD0Pz7mA1kZyDzk39sVCCLpNYJazGs8QFtykWx98YJYOgmGzcAWPArH9tUz6iMVdONbqAddxSdZ2PAWVXKJzC9mn7uMTAJ9jfjZwH12IG+KEUduNCUcDJ2EfQQYCsQ4mTXJFZKFFamV6hwJdqrJxb5Kpzqj15MZu1X41OYJSOmVYmUH6wrqIf1QR+kTrBrxWDoFl5myw0/OWzU+iXZBaWdE1wE0OQB6LGW73G0ptW8S4QT+olapJ6tsOkU+eU+ZrOmkpt5cgQCx2sFxFv5milGOyT7dTcpEtNjB3/G1Hg/oo0ePCxSe4SFgTbQ1P9yKF8rNGTuBeHt7qAag=="
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body.status).to.equal(0);
        token = res.body.data.authResult.token;
        cookies = res.header["set-cookie"];
        done();
      });
  });

  it("Create Dataset", function (done) {
    api
      .put("/dataset")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({
        datasetName: "Dataset 1",
        datasetDescription: "Best dataset ever"
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body.status).to.equal(0);
        datasetId = res.body.data.id;
        done();
      });
  });


  it("Assign first file id", function (done) {
    api
      .put("/dataset/assign-fid")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({
        fileName: "rdu-weather-history.csv",
        datasetId: datasetId
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        datasetId = datasetId;
        firstFileInfo = res.body.data;
        expect(res.body.status).to.equal(0);
        done();
      });
  });


  it("Upload first file to dfs", function (done) {
    let currentDirectory = chaiExec('pwd');
    let uploadCommand = 'curl -F file=@';
    uploadCommand += currentDirectory.output + '/data/rdu-weather-history.csv';
    uploadCommand += ' ';
    //uploadCommand += 'http://' + firstFileInfo.dfsPublicUrl + '/' + firstFileInfo.volumeId + ',' + firstFileInfo.fid;
    const port = firstFileInfo.dfsPublicUrl.split(":")[1];
    uploadCommand += 'http://localhost:' + port + '/' + firstFileInfo.volumeId + ',' + firstFileInfo.fid;
    uploadCommand = uploadCommand.replace(/(\r\n|\n|\r)/gm, "");

    let fileUploader = chaiExec(uploadCommand);
    fileUploader.stdout.should.contain("size");
    fileUploader.stdout.should.contain("eTag");

    done();
  });



  it("analyze first file", function (done) {
    api
      .put("/dataset/analyze-file")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({
        fileId: firstFileInfo.id
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.message).to.equal('Success');
        done();
      });

  });

  it("Wait for First file analyzer", function (done) {
    var start = new Date().getTime();
    var end = start;
    while (end < start + 5000) {
      end = new Date().getTime();
    }
    done();

  });

  it("Get first file analysis info", function (done) {

    var start = new Date().getTime();
    var end = start;
    while (end < start + 1500) {
      end = new Date().getTime();
    }

    api
      .get("/dataset/datafile/" + firstFileInfo.id)
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send()
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        firstFileAnlysis = res.body.data;
        expect(res.body.status).to.equal(0);
        expect(res.body.data.status).to.equal('import-ready');

        done();
      });


  });




  it("import first file", function (done) {

    api
      .put("/dataset/import-file")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({
        fileId: firstFileInfo.id
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.data.status).to.equal('import-complete');
        done();
      });
  });



  //-------------Second File

  it("Assign second file id", function (done) {
    api
      .put("/dataset/assign-fid")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({
        fileName: "time-series-19-covid-combined_csv.csv",
        datasetId: datasetId
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        datasetId = datasetId;
        secondFileInfo = res.body.data;
        expect(res.body.status).to.equal(0);
        done();
      });
  });


  it("Upload second file to dfs", function (done) {
    let currentDirectory = chaiExec('pwd');
    const port = firstFileInfo.dfsPublicUrl.split(":")[1];
    let uploadCommand = 'curl -F file=@';
    uploadCommand += currentDirectory.output + '/data/time-series-19-covid-combined_csv.csv';
    uploadCommand += ' ';
    //uploadCommand += 'http://' + secondFileInfo.dfsPublicUrl + '/' + secondFileInfo.volumeId + ',' + secondFileInfo.fid;
    uploadCommand += 'http://localhost:' + port +'/'+ + secondFileInfo.volumeId + ',' + secondFileInfo.fid;
    uploadCommand = uploadCommand.replace(/(\r\n|\n|\r)/gm, "");

    let fileUploader = chaiExec(uploadCommand);
    fileUploader.stdout.should.contain("size");
    fileUploader.stdout.should.contain("eTag");


    done();
  });



  it("analyze second file", function (done) {

    api
      .put("/dataset/analyze-file")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({
        fileId: secondFileInfo.id
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.message).to.equal('Success');
        done();
      });

  });

  it("Wait for second file analyzer", function (done) {
    var start = new Date().getTime();
    var end = start;
    while (end < start + 5000) {
      end = new Date().getTime();
    }
    done();

  });

  it("Get second file analysis info", function (done) {

    var start = new Date().getTime();
    var end = start;
    while (end < start + 1500) {
      end = new Date().getTime();
    }

    api
      .get("/dataset/datafile/" + secondFileInfo.id)
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send()
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        secondFileAnlysis = res.body.data;
        expect(res.body.status).to.equal(0);
        expect(res.body.data.status).to.equal('import-ready');
        done();
      });


  });




  it("import second file", function (done) {
    let newTableColumns = [];
    let tableColumns = secondFileAnlysis.tables[0].tableColumns;
    for (tableColumn of tableColumns) {
      if (tableColumn.electedHeaderName === 'Confirmed' || tableColumn.electedHeaderName === 'Recovered' || tableColumn.electedHeaderName === 'Deaths') {
        tableColumn.electedType = 'text';
      }
      newTableColumns.push(tableColumn);
    }
    secondFileAnlysis.tables[0].tableColumns = newTableColumns;


    api
      .put("/dataset/import-file")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({
        fileId: secondFileInfo.id,
        datafileBody: secondFileAnlysis
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.data.status).to.equal('import-complete');
        done();
      });
  });

  //------------- Model

  it("Create Model for Dataset", function (done) {

    api
      .put("/clue/model")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({ "name": "Tony stark model", "datasources": [{ "datasourceType": "Dataset", "datasourceId": datasetId }] })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.message).to.equal('Success');
        modelObj = res.body.data;
        done();
      });

  });


  it("Import Model Objects", function (done) {
    let datasourceMap = {};
    datasourceMap[datasetId] = 'Dataset';
    let importSpecs = {
      "importSpecs": [{
        "connectionId": datasetId,
        "objects": [{ "objectId": firstFileAnlysis.id, "objectName": "Data Files.rdu-weather-history.csv - rdu_weather_history" }, { "objectId": secondFileAnlysis.id, "objectName": "Data Files.time-series-19-covid-combined_csv.csv - time_series_19_covid_combined_csv" }]
      }], datasourceMap
    };

    api
      .post("/metadata/" + modelObj.id + '/import')
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send(importSpecs)
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body.status).to.equal(0);
        importerTrackerId = res.body.data.trackingId;
        var start = new Date().getTime();
        var end = start;
        while (end < start + 1800) {
          end = new Date().getTime();
        }
        done();
      });
  });

  it("Wait for importer", function (done) {
    var start = new Date().getTime();
    var end = start;
    while (end < start + 15000) {
      end = new Date().getTime();
    }
    done();

  });


  it("Return Import Status", function (done) {
    api
      .get("/metadata/status/" + importerTrackerId)
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send()
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body.status).to.equal(0);
        done();
      });
  });

  it("Get metadata tracker Id", function (done) {
    var start = new Date().getTime();
    var end = start;
    while (end < start + 1800) {
      end = new Date().getTime();
    }
    api
      .get("/metadata/status/" + importerTrackerId)
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send()
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body.status).to.equal(0);
        //expect(res.body.data.status).to.equal('Successful');
        trackerObject = res.body.data;
        done();
      });
  });


  it("Get Model Objects by Model id", function (done) {
    var start = new Date().getTime();
    var end = start;
    while (end < start + 1800) {
      end = new Date().getTime();
    }
    api
      .get("/clue/model-obj/model/" + trackerObject[0].clueModelId)
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send()
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body.status).to.equal(0);
        modelObjects = res.body.data;
        done();
      });
  });


  it("Prepare query definition", function (done) {


    let queryProjections = [];
    const randomObject = modelObjects[Math.floor(Math.random() * modelObjects.length)];
    for (modelObject of randomObject.modelObjectItems) {
      var chance = Math.random();
      if (chance < 0.6) {     // 40% chance of being here
        queryProjections.push({
          id: uuidv4(),
          modelObjectItemId: modelObject.modelObjectItemId
        });
      }
    }

    if (!queryProjections || queryProjections.length == 0) {
      queryProjections.push({
        id: uuidv4(),
        modelObjectItemId: randomObject.modelObjectItems[0].modelObjectItemId
      });
    }


    queryDef = {
      id: uuidv4(),
      rowLimit: 1000,
      ignoreCache: true,
      selectDistinct: false,
      projections: queryProjections,
      filters: [
      ]
    }
    done();


  });

  it("execute a query", function (done) {
    api
      .put("/query")
      .set("Accept", "application/json")
      .set("passport", token)
      .set("Cookie", cookies)
      .send(queryDef)
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body.status).to.equal(0);
        done();
      });
  });


  it("Delete Dataset datafile", function (done) {
    api
      .delete("/dataset/datafile/" + firstFileInfo.id)
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send()
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body.status).to.equal(0);
        done();
      });
  });



  it("Delete Dataset", function (done) {
    api
      .delete("/dataset/dataset/" + datasetId)
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send()
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body.status).to.equal(0);
        done();
      });
  });


  it("Delete Tenant", function (done) {
    api
      .delete("/catalog/tenant/" + tenant.id)
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send()
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body.status).to.equal(0);
        done();
      });
  }); 

});
