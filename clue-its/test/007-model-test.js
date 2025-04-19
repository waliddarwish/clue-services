var should = require("chai").should(),
  expect = require("chai").expect,
  supertest = require("supertest"),
  api = supertest("http://localhost:8240");

describe("Model Management", function() {
  var tenant = {};
  var user = {};
  var token = "";
  var cookies;
  var connectionId = "";
  var clueModelId = "";
  var clueModelObjectId_table = "";
  var clueModelObjectId_view = "";

  it("Create Tenant", function(done) {
    api
      .put("/catalog/tenant")
      .set("Accept", "application/x-www-form-urlencoded")
      .send({
        tenant: {
          name: "The Fat Data company",
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


  it("Create Connection", function(done) {
    api
      .put("/connection")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({
        name: "New Oracle Connection",
        connectionType: "Oracle",
        connectionInfo: {
          serverName: "localhost",
          serverPort: 1521,
          serviceName: "Oracle Service Name",
          connectionProperties: [],
          username: "oracleUser",
          password:
            "jWz0s9ITX92hqMyzcXxbEWTbav2FvQFAxmNjXZzbCbBvLkxpbtrTjQlo6NCgVmRbHIunsRfRU12wEf0x8+LKHFmjhYDJbe2xIe1QIoxbc2dwbkeZ9xQZkTMcoLrB2ahJPZp72RyM2cxOJE0Mz4C2q2ErnGLB5aHOkPHJ0Y8AIp6GLlvh0rC/KL6sCYbqzvnm+BX/I7j3OFWldMEuiHSYC9FdNnmFitpB7+GwON3myyTpDjDht42Vnv07DwHeJUQ6Zv7MqgG53z6mhlqi8xqO+MtaL856ARh/O5Y3GP5Q4BYRyu/eL12QSu33/zlGZKcsuNJ4+uNKaih7uUug4MuK6Q=="
        }
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        connectionId = res.body.data.id;
        done();
      });
  });



  it("Create Model", function (done) {
    api
      .put("/clue/model")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({
        name: "Clue Model",
        datasources: [{ datasourceId: connectionId}]
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body.status).to.equal(0);
        clueModelId = res.body.data.id;
        done();
      });
  });

  it("Create Model Object - Table", function (done) {
    api
      .put("/clue/model-obj")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({
        name: "New clue model object",
        dataSourceConnectionId: connectionId,
        schemata: "dvdrentals",
        clueModelId,
        type: "TABLE",
        modelObjectItems: [
          {
            nameInDatasource: "renatal_id",
            prettyName: "rentalId",
            dataTypeInDataSource: "NUMBER",
            precisionInDataSource: "10",
            isPrimaryKey: true
          },
          {
            nameInDatasource: "rental_title",
            prettyName: "Rental Title",
            dataTypeInDataSource: "VARCHAR2",
            precisionInDataSource: "52",
            isPrimaryKey: false
          },
          {
            nameInDatasource: "customer_id",
            prettyName: "customerId",
            dataTypeInDataSource: "NUMBER",
            precisionInDataSource: "10",
            isPrimaryKey: false,
            isForeignKey: true,
            references: "customer.customer_id"
          }
        ]
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {

        expect(res.body.status).to.equal(0);
        clueModelObjectId_table = res.body.data.id;
        done();
      });
  });


  it("Create Model Object - View", function (done) {
    api
      .put("/clue/model-obj")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({
        name: "Monthly Sales Per Store",
        dataSourceConnectionId: connectionId,
        schemata: "dvdrentals",
        clueModelId,
        type: "VIEW",
        modelObjectItems: [
          {
            nameInDatasource: "store_id",
            prettyName: "storeId",
            dataTypeInDataSource: "NUMBER",
            precisionInDataSource: "10",
            isPrimaryKey: false,
            isForeignKey: true,
            references: "store.store_id"
          },
          {
            nameInDatasource: "total_sales",
            prettyName: "totalSales",
            dataTypeInDataSource: "NUMBER",
            precisionInDataSource: "12",
            isPrimaryKey: false
          },
          {
            nameInDatasource: "month",
            prettyName: "month",
            dataTypeInDataSource: "VARCHAR2",
            precisionInDataSource: "24"
          }
        ]
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        clueModelObjectId_view = res.body.data.id;
        done();
      });
  });


   it("Update Model Object", function(done) {
     api
       .post("/clue/model-obj/" + clueModelObjectId_view)
       .set("Accept", "application/x-www-form-urlencoded")
       .set("passport", token)
       .set("Cookie", cookies)
       .send({
         name: "Monthly Sales Per Store",
         dataSourceConnectionId: connectionId,
         schemata: "dvdrentals",
         clueModelId,
         type: "VIEW",
         modelObjectItems: [
           {
             nameInDatasource: "store_id",
             prettyName: "storeId",
             dataTypeInDataSource: "NUMBER",
             precisionInDataSource: "10",
             isPrimaryKey: false,
             isForeignKey: true,
             references: "store.store_id"
           },
           {
             nameInDatasource: "total_sales",
             prettyName: "totalSales",
             dataTypeInDataSource: "NUMBER",
             precisionInDataSource: "12",
             isPrimaryKey: false
           },
           {
             nameInDatasource: "month",
             prettyName: "month",
             dataTypeInDataSource: "VARCHAR2",
             precisionInDataSource: "24"
           }
         ]
       })
       .expect("Content-Type", /json/)
       .expect(200)
       .end(function(err, res) {
         expect(res.body.status).to.equal(0);
         clueModelObjectId_view = res.body.data.id;
         done();
       });
   });

  it("Find Model Object - Search", function(done) {
    api
      .post("/search/model-objects/1/100")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({
        criteria: { id: clueModelObjectId_view },
        projections: { id: 1, name: 1 },
        options: { sort: { id: "ascending" } }
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.data.length).to.equal(1);
        done();
      });
  });

  it("Find Model Object - By ID", function (done) {
    api
      .get("/clue/model/" + clueModelId)
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send()
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.data.length).to.equal(1);
        done();
      });
  });

   it("Find Models - Search", function(done) {
     api
       .post("/search/models/1/100")
       .set("Accept", "application/x-www-form-urlencoded")
       .set("passport", token)
       .set("Cookie", cookies)
       .send({
         criteria: { id: clueModelId },
         projections: { id: 1, name: 1 },
         options: { sort: { id: "ascending" } }
       })
       .expect("Content-Type", /json/)
       .expect(200)
       .end(function(err, res) {
         expect(res.body.status).to.equal(0);
         expect(res.body.data.length).to.equal(1);
         done();
       });
   });

  it("Find Model - By User ID", function (done) {
    api
      .get("/clue/model/user/" + user.id)
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send()
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.data.length).to.equal(1);
        done();
      });
  });

  it("Find Model - By Tenant ID", function(done) {
    api
      .get("/clue/model/tenant/" + tenant.id)
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send()
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.data.length).to.equal(1);
        done();
      });
  });

  it("Update Connection", function(done) {
    api
      .post("/connection/" + connectionId)
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({
        name: "New Oracle Connection - updated",
        connectionInfo: {
          connectionProperties: [{ name: "prop1", value: "value1" }],
          username: "oracleUser1",
          password:
            "H/C/YgUD6jXT0kg7Q2i/zzf8L98Q7Kp5Elk5jehKJgVPSxgx6GgrvwrTyGe6F9foxp7NObixFMOsYI75a80V2DUEI98v5fLi6J4tZPiW0muX7IyEoul94hOnmnN0e3Yr8+YIFqp/eDNzTbqtC63sGtbIfDhZAEjP9crDvX8FwnWgiyKOBlZiHa3VTCwmrQQ/vddjGEPq8xDxjIYqiejR+3kjCy5yUabNBXnTC9NidhD9LOxiB1Xh2dXBsV/Hi7iozN3ZUD8DOXbHPNwXULYXE/bXE8c2yTDjz9dGwsqcVtDCTX+mCuCb3bty+KdCoff0z8CyK3ShhGuSHLXT1sNLjQ=="
        }
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        connectionId = res.body.data.id;
        done();
      });
  });

  it("Update Model", function (done) {
    api
        .post("/clue/model/" + clueModelId)
        .set("Accept", "application/x-www-form-urlencoded")
        .set("passport", token)
        .set("Cookie", cookies)
        .send({
            name: "Clue Model - Updated",
            datasources: [{ datasourceId: connectionId} ]
        })
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
            expect(res.body.status).to.equal(0);
            clueModelId = res.body.data.id;
            done();
        });
  });

  it("Find Models - Most Recent - Tenant", function(done) {
    api
      .get("/clue/model/tenant/recent/3")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send()
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.be.equal(0);
        expect(res.body.data.length).to.equal(1);
        done();
      });
  });

  it("Find Models - Most Recent - User", function (done) {
    api
      .get("/clue/model/user/recent/3")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send()
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body.status).to.be.equal(0);
        expect(res.body.data.length).to.equal(1);
        done();
      });
  });

  it("Find Model Objects By Model", function(done) {
    api
      .get("/clue/model-obj/model/"  + clueModelId)
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send()
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.be.equal(0);
        expect(res.body.data.length).to.equal(2);
        done();
      });
  });

    it("Find Model Objects - By Model", function(done) {
      api
        .get("/clue/model-obj/model/" + clueModelId)
        .set("Accept", "application/x-www-form-urlencoded")
        .set("passport", token)
        .set("Cookie", cookies)
        .send()
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function(err, res) {
          expect(res.body.status).to.be.equal(0);
          expect(res.body.data.length).to.equal(2);
          done();
        });
    });


 it("Search Models", function(done) {
   api
     .post("/search/models/1/1")
     .set("Accept", "application/x-www-form-urlencoded")
     .set("passport", token)
     .set("Cookie", cookies)
     .send()
     .expect("Content-Type", /json/)
     .expect(200)
     .end(function(err, res) {
       expect(res.body.status).to.be.equal(0);
       done();
     });
 });


 it("Search Model Objects", function(done) {
   api
     .post("/search/model-objects/1/1")
     .set("Accept", "application/x-www-form-urlencoded")
     .set("passport", token)
     .set("Cookie", cookies)
     .send()
     .expect("Content-Type", /json/)
     .expect(200)
     .end(function(err, res) {
       expect(res.body.status).to.be.equal(0);
       done();
     });
 });



  it("Delete Model", function (done) {
    api
      .delete("/clue/model/" + connectionId)
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

  it("Delete Connection", function(done) {
    api
      .delete("/connection/" + connectionId)
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
