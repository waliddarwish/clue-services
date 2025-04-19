var should = require("chai").should(),
  expect = require("chai").expect,
  supertest = require("supertest"),
  api = supertest("http://localhost:8240");

describe("Metadata Management", function() {
  var tenant = {};
  var user = {};
  var token = "";
  var cookies;
  var oracleConnectionId;
  var postgresConnectionId;
  var model;
  var oracleObjects;
  var postgresObjects;
  var trackingId;

  var databaseServerIp = '62.151.176.216';

  it("Create Tenant", function(done) {
    api
      .put("/catalog/tenant")
      .set("Accept", "application/x-www-form-urlencoded")
      .send({
        tenant: {
          name: "The Data Halo company",
          address: "57 Len Lunney Cres, Ottawa, ON, Canada, K2G6X4",
          paymentToken: "PaymentTokenFromStripe",
          phoneNumber: "819 329 8179",
          paymentDetails: {
            subscribeTenant: false
          }
        },
        user: {
          username: "user1@email.com",
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
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        tenant = res.body.data.tenant;
        user = res.body.data.user;
        done();
      });
  });

   it("Login", function(done) {
     api
       .post("/access/authenticate")
       .set("Accept", "application/x-www-form-urlencoded")
       .send({
         username: "user1@email.com",
         password:
           "f1CyVthmD0Pz7mA1kZyDzk39sVCCLpNYJazGs8QFtykWx98YJYOgmGzcAWPArH9tUz6iMVdONbqAddxSdZ2PAWVXKJzC9mn7uMTAJ9jfjZwH12IG+KEUduNCUcDJ2EfQQYCsQ4mTXJFZKFFamV6hwJdqrJxb5Kpzqj15MZu1X41OYJSOmVYmUH6wrqIf1QR+kTrBrxWDoFl5myw0/OWzU+iXZBaWdE1wE0OQB6LGW73G0ptW8S4QT+olapJ6tsOkU+eU+ZrOmkpt5cgQCx2sFxFv5milGOyT7dTcpEtNjB3/G1Hg/oo0ePCxSe4SFgTbQ1P9yKF8rNGTuBeHt7qAag=="
       })
       .expect("Content-Type", /json/)
       .expect(200)
       .end(function(err, res) {
         expect(res.body.status).to.equal(0);
         token = res.body.data.authResult.token;
         cookies = res.header["set-cookie"];
         done();
       });
   });

  it("Create Connection Oracle", function(done) {
    api
      .put("/connection")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({
        name: "True Oracle Connection",
        connectionInfo: {
          username: "OTUSER",
          serverName: databaseServerIp,
          serviceName: "samples.localdomain",
          password:
            "gJp0s3a5wlcRTryZt8cK5wVnemFnmFqzVq3BLy9+0KLJit7PLNa0Z2JFl/W6NrmE+cYxHRMZsiOFKedZfse3yYZvplEWXFbHUcA01l5LFsvIMz7oB++fFJIKesN48Lv33EDrBLEVucjAzD+wJi8+IXCeVpMgKGsXDgu5ZKhI1Tqot3Ti6gzWNoSkwBNP4bNf4PWUmlE65ORZcJcLIA/9Zm4pH71Zbp4jb47t9Bq40SpN/bFlmxroIUxwtpnUVrmorbLBV7UupimApBfmO+HYLqfpqAbF+QZI+43BHD+utqXJHimjlIfu9yb1uN0DSqobCrSx5I0OvYbIJCZntkphNw==/ViHaRw0RfsvgbAAoN9caZXrYAKlkJF7E6vZ7lO2lHNjcy7+6yIlVmhJfoLgwR0zWItNDQqiPX2qzcu9u3vO8xd/ryWNFWV1szbRMuWSekvaJJTuzeFCEP1ZHF2gfXwCOlhR7xORg3OcTjJ4cXUM6peuwDpa/tV7sfDg31hSY33L6y3yeWr9hy8yEhgqjF4EO+ChiVIFb6vWB840DEkcZe4W4xRyjt0CvLuSGgLihK/pHGTMp1y5VCUm3I0U9WT+ZV8/thxEYGXHGJNHSgBzXxNR8PAw==",
          serverPort: 1521,
          connectionTimeout: 30000
        },
        connectionType: "Oracle"
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        oracleConnectionId = res.body.data.id;
        done();
      });
  });

 it("Create Connection Postgres", function(done) {
   api
     .put("/connection")
     .set("Accept", "application/x-www-form-urlencoded")
     .set("passport", token)
     .set("Cookie", cookies)
     .send({
       name: "New Postgres Connection 1",
       connectionType: "Postgres",
       connectionInfo: {
         serverName: databaseServerIp,
         serverPort: 5432,
         serviceName: "dvdrental",
         connectionProperties: [],
         username: "postgres",
         password:
           "VopDMCnSVd0qFaN63kUmbETIhppK2cbCV8/NQC8dJRM7o2fv1FSAtCvMJPz8vd9PqWmVwcXzKnOyliwSmDjqTvitotMKzr5XtwyDJ+npetefNDrs53VGBV4bT1d/ga139+NEA+UAuQid1q4h5LHc5f9CNc7s6142+kniKapXmlvDE/X6M+nMV1TnB6Phu3g0217XcA3RaKYh+Gfpn4MHymbeMoWcJ/8x+qHetru2BZ0RBADgDaDOYmbUrFri62PvBwbjyIQ4IDXAb6FIBDSyisueNrpiR0TUglW2tt93avQhWY2swS2iWeh0K8HWlIthkmaXweGKe1uBXnL8ojrnfA=="
       }
     })
     .expect("Content-Type", /json/)
     .expect(200)
     .end(function(err, res) {
       expect(res.body.status).to.equal(0);
       postgresConnectionId = res.body.data.id;
       done();
     });
 });
  

  // it("List Oracle Schemas", function(done) {
  //   api
  //     .get("/metadata/" + oracleConnectionId + "/schema" )
  //     .set("Accept", "application/x-www-form-urlencoded")
  //     .set("passport", token)
  //     .set("Cookie", cookies)
  //     .send()
  //     .expect("Content-Type", /json/)
  //     .expect(200)
  //     .end(function(err, res) {
  //       expect(res.body.status).to.equal(0);
  //       expect(res.body.data.data.length).to.equal(47);
  //       done();
  //     });
  // });

  it("List Postgres Schemas", function(done) {
    api
      .get("/metadata/" + postgresConnectionId + "/schema")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send()
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.data.data.length).to.equal(6)
        done();
      });
  });

  // it("List Table - Oracle - OTUSER", function(done) {
  //   api
  //     .get("/metadata/" + oracleConnectionId + "/DatabaseConnection/schema/OTUSER/objects")
  //     .set("Accept", "application/x-www-form-urlencoded")
  //     .set("passport", token)
  //     .set("Cookie", cookies)
  //     .send()
  //     .expect("Content-Type", /json/)
  //     .expect(200)
  //     .end(function(err, res) {
  //       expect(res.body.data.data.length).to.equal(12);
  //       expect(res.body.status).to.equal(0);
  //       oracleObjects = res.body.data.data;
  //       done();
  //     });
  // });

  it("List Table - Postgres - Public", function(done) {
    api
      .get("/metadata/" + postgresConnectionId + "/DatabaseConnection/schema/public/objects")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send()
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.data.data.length).to.equal(22);
        postgresObjects = res.body.data.data;
        done();
      });
  });

  // it("List Tables - Oracle - OEUser", function(done) {
  //   api
  //     .get("/metadata/" + oracleConnectionId + "/DatabaseConnection/schema/OE/objects")
  //     .set("Accept", "application/x-www-form-urlencoded")
  //     .set("passport", token)
  //     .set("Cookie", cookies)
  //     .send()
  //     .expect("Content-Type", /json/)
  //     .expect(200)
  //     .end(function(err, res) {
  //       expect(res.body.data.data.length).to.equal(12);
  //       expect(res.body.status).to.equal(0);
  //       done();
  //     });
  // });

  it("Create Model", function(done) {
    api
      .put("/clue/model")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({
        name: "Clue Model",
        datasources: [{ datasourceType: 'DatabaseConnection' , datasourceId: oracleConnectionId} , 
                      { datasourceType: 'DatabaseConnection' , datasourceId : postgresConnectionId}]
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        model = res.body.data;
        done();
      });
  });

  // it("Import Tables - Oracle - OTUSER", function(done) {
  //   var importSpecs = [{
  //       connectionId: oracleConnectionId,
  //       objects: [],
  //     },{
  //       connectionId: postgresConnectionId,
  //       objects: [],
  //     },
  //   ];
  //   for (let object of oracleObjects) {
  //     importSpecs[0].objects.push( { objectName : 'OTUSER.' + object.OBJECT_NAME});
  //   }
  //   for (let object of postgresObjects) {
  //     importSpecs[1].objects.push({ objectName : 'public.' + object.object_name });
  //   }
  //   api
  //     .post("/metadata/" + model.id + "/import")
  //     .set("Accept", "application/x-www-form-urlencoded")
  //     .set("passport", token)
  //     .set("Cookie", cookies)
  //     .send(
  //        { importSpecs , 
  //         datasourceMap : { 
  //          [oracleConnectionId] : 'DatabaseConnection' ,
  //          [postgresConnectionId] : 'DatabaseConnection' ,
  //        }
  //       }
  //     )
  //     .expect("Content-Type", /json/)
  //     .expect(200)
  //     .end(function(err, res) {
  //       trackingId = res.body.data.trackingId;
  //       expect(res.body.status).to.equal(0);
  //       done();
  //     });
  // });
  

   it("Return Import Status", function(done) {
     api
       .get("/metadata/status/" + trackingId)
       .set("Accept", "application/x-www-form-urlencoded")
       .set("passport", token)
       .set("Cookie", cookies)
       .send()
       .expect("Content-Type", /json/)
       .expect(200)
       .end(function(err, res) {
         expect(res.body.status).to.equal(0);
         done();
       });
   }); 


   it("Create Oracle Connection", function(done) {
     api
       .put("/connection")
       .set("Accept", "application/x-www-form-urlencoded")
       .set("passport", token)
       .set("Cookie", cookies)
       .send({
         name: "True Oracle Connection 2",
         connectionInfo: {
           username: "OTUSER",
           serverName: databaseServerIp,
           serviceName: "samples.localdomain",
           password:
             "gJp0s3a5wlcRTryZt8cK5wVnemFnmFqzVq3BLy9+0KLJit7PLNa0Z2JFl/W6NrmE+cYxHRMZsiOFKedZfse3yYZvplEWXFbHUcA01l5LFsvIMz7oB++fFJIKesN48Lv33EDrBLEVucjAzD+wJi8+IXCeVpMgKGsXDgu5ZKhI1Tqot3Ti6gzWNoSkwBNP4bNf4PWUmlE65ORZcJcLIA/9Zm4pH71Zbp4jb47t9Bq40SpN/bFlmxroIUxwtpnUVrmorbLBV7UupimApBfmO+HYLqfpqAbF+QZI+43BHD+utqXJHimjlIfu9yb1uN0DSqobCrSx5I0OvYbIJCZntkphNw==/ViHaRw0RfsvgbAAoN9caZXrYAKlkJF7E6vZ7lO2lHNjcy7+6yIlVmhJfoLgwR0zWItNDQqiPX2qzcu9u3vO8xd/ryWNFWV1szbRMuWSekvaJJTuzeFCEP1ZHF2gfXwCOlhR7xORg3OcTjJ4cXUM6peuwDpa/tV7sfDg31hSY33L6y3yeWr9hy8yEhgqjF4EO+ChiVIFb6vWB840DEkcZe4W4xRyjt0CvLuSGgLihK/pHGTMp1y5VCUm3I0U9WT+ZV8/thxEYGXHGJNHSgBzXxNR8PAw==",
           serverPort: 1521,
           connectionTimeout: 30000
         },
         connectionType: "Oracle",
         maxMetadataConnectionCount: 4,
         metadataConcurrency: 2
       })
       .expect("Content-Type", /json/)
       .expect(200)
       .end(function(err, res) {
         expect(res.body.status).to.equal(0);
         oracleConnectionId = res.body.data.id;
         done();
       });
   });

   it("Create Postgres Connection", function(done) {
     api
       .put("/connection")
       .set("Accept", "application/x-www-form-urlencoded")
       .set("passport", token)
       .set("Cookie", cookies)
       .send({
         name: "New Postgres Connection 2",
         connectionType: "Postgres",
         maxMetadataConnectionCount: 4,
         metadataConcurrency: 2,
         connectionInfo: {
           serverName: databaseServerIp,
           serverPort: 5432,
           serviceName: "dvdrental",
           connectionProperties: [],
           username: "postgres",
           password:
             "VopDMCnSVd0qFaN63kUmbETIhppK2cbCV8/NQC8dJRM7o2fv1FSAtCvMJPz8vd9PqWmVwcXzKnOyliwSmDjqTvitotMKzr5XtwyDJ+npetefNDrs53VGBV4bT1d/ga139+NEA+UAuQid1q4h5LHc5f9CNc7s6142+kniKapXmlvDE/X6M+nMV1TnB6Phu3g0217XcA3RaKYh+Gfpn4MHymbeMoWcJ/8x+qHetru2BZ0RBADgDaDOYmbUrFri62PvBwbjyIQ4IDXAb6FIBDSyisueNrpiR0TUglW2tt93avQhWY2swS2iWeh0K8HWlIthkmaXweGKe1uBXnL8ojrnfA=="
         }
       })
       .expect("Content-Type", /json/)
       .expect(200)
       .end(function(err, res) {
         expect(res.body.status).to.equal(0);
         postgresConnectionId = res.body.data.id;
         done();
       });
   });

  //  it("Import Objects - Oracle - OTUSER, Postgres - Public", function(done) {
  //    var importSpecs = [
  //      {
  //        connectionId: oracleConnectionId,
  //        objects: []
  //      },
  //      {
  //        connectionId: postgresConnectionId,
  //        objects: []
  //      }
  //    ];
  //    for (let object of oracleObjects) {
  //      importSpecs[0].objects.push({ objectName : "OTUSER." + object.OBJECT_NAME });
  //    }
  //    for (let object of postgresObjects) {
  //      importSpecs[1].objects.push({ objectName : "public." + object.object_name });
  //    }
  //    api
  //      .post("/metadata/" + model.id + "/import")
  //      .set("Accept", "application/x-www-form-urlencoded")
  //      .set("passport", token)
  //      .set("Cookie", cookies)
  //      .send( { importSpecs , 
  //       datasourceMap : { 
  //         [oracleConnectionId] : 'DatabaseConnection' ,
  //         [postgresConnectionId] : 'DatabaseConnection' ,
  //       }
  //     })
  //      .expect("Content-Type", /json/)
  //      .expect(200)
  //      .end(function(err, res) {
  //        trackingId = res.body.data.trackingId;
  //        expect(res.body.status).to.equal(0);
  //        done();
  //      });
  //  });

   it("Collective Status by Model ID", function(done) {
    api
        .get("/metadata/collective-status/" + model.id)
        .set("Accept", "application/x-www-form-urlencoded")
        .set("passport", token)
        .set("Cookie", cookies)
        .send()
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function(err, res) {
            expect(res.body.status).to.equal(0);
            done();
        });
});


   it("Return Import Status", function(done) {
     api
       .get("/metadata/status/" + trackingId)
       .set("Accept", "application/x-www-form-urlencoded")
       .set("passport", token)
       .set("Cookie", cookies)
       .send()
       .expect("Content-Type", /json/)
       .expect(200)
       .end(function(err, res) {
         expect(res.body.status).to.equal(0);
         done();
       });
   });


    it("Import Status by Model ID", function(done) {
        api
            .get("/metadata/statusByModel/" + model.id)
            .set("Accept", "application/x-www-form-urlencoded")
            .set("passport", token)
            .set("Cookie", cookies)
            .send()
            .expect("Content-Type", /json/)
            .expect(200)
            .end(function(err, res) {
                expect(res.body.status).to.equal(0);
                done();
            });
    });


    it("Create Model", function(done) {
      api
        .put("/clue/model")
        .set("Accept", "application/x-www-form-urlencoded")
        .set("passport", token)
        .set("Cookie", cookies)
        .send({
          name: "Clue Model - Postgres",
          datasources: [ { datasourceType: 'DatabaseConnection' , datasourceId : postgresConnectionId}]
        })
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function(err, res) {
          expect(res.body.status).to.equal(0);
          model = res.body.data;
          done();
        });
    });

    it("Create Postgres Connection", function(done) {
      api
        .put("/connection")
        .set("Accept", "application/x-www-form-urlencoded")
        .set("passport", token)
        .set("Cookie", cookies)
        .send({
          name: "New Postgres Connection - Public - DVDRENTAL",
          connectionType: "Postgres",
          maxMetadataConnectionCount: 4,
          metadataConcurrency: 2,
          connectionInfo: {
            serverName: databaseServerIp,
            serverPort: 5432,
            serviceName: "dvdrental",
            connectionProperties: [],
            username: "postgres",
            password:
              "VopDMCnSVd0qFaN63kUmbETIhppK2cbCV8/NQC8dJRM7o2fv1FSAtCvMJPz8vd9PqWmVwcXzKnOyliwSmDjqTvitotMKzr5XtwyDJ+npetefNDrs53VGBV4bT1d/ga139+NEA+UAuQid1q4h5LHc5f9CNc7s6142+kniKapXmlvDE/X6M+nMV1TnB6Phu3g0217XcA3RaKYh+Gfpn4MHymbeMoWcJ/8x+qHetru2BZ0RBADgDaDOYmbUrFri62PvBwbjyIQ4IDXAb6FIBDSyisueNrpiR0TUglW2tt93avQhWY2swS2iWeh0K8HWlIthkmaXweGKe1uBXnL8ojrnfA=="
          }
        })
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function(err, res) {
          expect(res.body.status).to.equal(0);
          postgresConnectionId = res.body.data.id;
          done();
        });
    });

    it("Import Objects - Postgres - Public", function(done) {
      var importSpecs = [
        {
          connectionId: postgresConnectionId,
          objects: []
        }
      ];

      for (let object of postgresObjects) {
        importSpecs[0].objects.push({ objectName : "public." + object.object_name });
      }
      api
        .post("/metadata/" + model.id + "/import")
        .set("Accept", "application/x-www-form-urlencoded")
        .set("passport", token)
        .set("Cookie", cookies)
        .send( { importSpecs , 
         datasourceMap : { 
           [oracleConnectionId] : 'DatabaseConnection' ,
           [postgresConnectionId] : 'DatabaseConnection' ,
         }
       })
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function(err, res) {
          trackingId = res.body.data.trackingId;
          expect(res.body.status).to.equal(0);
          done();
        });
    });
 
   

    it("Delete Tenant" + tenant.id, function(done) {
    api
      .delete("/catalog/tenant/" + tenant.id)
      .set("Accept", "application/x-www-form-urlencoded")
      .send()
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        done();
      });
  });
});
