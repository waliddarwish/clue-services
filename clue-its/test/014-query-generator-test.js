var should = require("chai").should(),
  expect = require("chai").expect,
  supertest = require("supertest"),
  api = supertest("http://localhost:8240");
var connectionsTestData = require("../data/datasourceconnections.json");
var clueModelsTestData = require("../data/cluemodels.json");
var clueModelObjectsTestData = require("../data/cluemodelobjects.json");

describe("Query generator and executor", function () {
  var tenant = {};
  var user = {}
  var token = "";
  var cookies;
  var invite = {};
  var task1 = {};

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
          userTimeZone: "GMT-5",
          role: "TenantAdmin"
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
        username: "user1@email.com",
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


  it("create test data", function (done) {
    api
      .put("/query/handle-test-data")
      .set("Accept", "application/json")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({ connections: connectionsTestData, models: clueModelsTestData, modelObjs: clueModelObjectsTestData })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body.status).to.equal(0);
        done();
      });
  });


  it("Postgres: generate and execute a query", function (done) {
    api
      .put("/query")
      .set("Accept", "application/json")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({
        id: "12",
        rowLimit: "100",
        ignoreCache: "true",
        selectDistinct: "false",
        projections: [
          {
            id: "1",
            modelObjectItemId: "24a56905-937d-4df9-a31f-309aca2637b2",
            aggregation: "COUNT",
            sortType: "Default"
          }, {
            id: "3",
            modelObjectItemId: "527a0462-e95f-48b3-a4bd-63019f1b8363",
            aggregation: "None"
          }, {
            "id": "4",
            "modelObjectItemId": "a9e1b30e-d603-44db-8fa3-ea2a424846fa",
            "aggregation": "None"
          }, {
            id: "5",
            modelObjectItemId: "b3e5d9ae-cd27-4317-aedc-f3c5f70ced46",
            aggregation: "None"
          }
        ],
        filters: [{
          rightSideId: "a9e1b30e-d603-44db-8fa3-ea2a424846fa",
          operator: "IN_OPERATOR",
          leftSide: ["Mike", "Jon"]
        }]

      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.message.length === 2);
        done();
      });
  });

  it("Postgres: generate graph for a model objects", function (done) {
    api
      .put("/query/graph-for-model-objects")
      .set("Accept", "application/json")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({
        modelObjectIds: [
          "d286a83c-09a2-452f-b098-4d89f1717b6e"
        ]
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body.status).to.equal(0);
        //expect(res.body.message.length).to.equal(2);
        expect(res.body.message.focusedNodeId).to.equal("public.address");
        done();
      });
  });

  it("Postgres: generate graph for a model", function (done) {
    api
      .get("/query/generate-model-graph/c4a44fc4-5dcd-4945-ba8a-58e1c682a2ab")
      .set("Accept", "application/json")
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

  // it("Oracle: generate and execute a query", function (done) {
  //   api
  //     .put("/query")
  //     .set("Accept", "application/json")
  //     .set("passport", token)
  //     .set("Cookie", cookies)
  //     .send({
  //       id: "36022f-8753-5d57-1301-bd21b2bb26cb",
  //       rowLimit: 10000,
  //       ignoreCache: true,
  //       selectDistinct: false,
  //       projections: [
  //         {
  //           id: "57b847-ea1-4f6-60b2-23056887fc5",
  //           modelObjectItemId: "c89d7024-35a5-42bd-b476-f7bb0015b470",
  //           aggregation: "None"
  //         },
  //         {
  //           id: "6681d-0c63-17a3-3474-ce6dd5250c26",
  //           modelObjectItemId: "984813cc-b2b2-4ba9-84d1-aecf8005a0e1",
  //           aggregation: "None"
  //         },
  //         {
  //           id: "ac02c61-2fb-77d6-ec3-5da4eae8e2d",
  //           modelObjectItemId: "944bf2bd-7569-4fd7-92fd-4b569c9f0a33",
  //           aggregation: "None"
  //         },
  //         {
  //           id: "35e0346-16f7-5a37-018a-7c15c16628f1",
  //           modelObjectItemId: "e15ca6c1-6a2d-4a63-9140-478b3b7242b4",
  //           aggregation: "None"
  //         },
  //         {
  //           id: "4e4ba5f-416f-fc18-24a7-fca8a2cb1b4",
  //           modelObjectItemId: "00ab1b35-c890-43e1-8a4f-6d98841900b7",
  //           aggregation: "None"
  //         },
  //         {
  //           id: "f05badd-e8f-a2b6-8282-284af44d220",
  //           modelObjectItemId: "e3067b37-d17e-472c-ac48-74112c1035cd",
  //           aggregation: "None"
  //         }
  //       ],
  //       filters: [

  //       ]
  //     })
  //     .expect("Content-Type", /json/)
  //     .expect(200)
  //     .end(function (err, res) {
  //       expect(res.body.status).to.equal(0);
  //       //expect(res.body.message.length === 2);
  //       done();
  //     });
  // });

  it("Oracle: generate graph for a model", function (done) {
    api
      .get("/query/generate-model-graph/ac66ae77-9880-49c5-94ef-27ebd8f588b9")
      .set("Accept", "application/json")
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

  it("Oracle: generate graph for a model objects", function (done) {
    api
      .put("/query/graph-for-model-objects")
      .set("Accept", "application/json")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({
        modelObjectIds: [
          "c955f6aa-bec4-48d0-84b9-9f0144a6fc49"
        ]
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.message.focusedNodeId).to.equal("OTUSER.WAREHOUSES");
        done();
      });
  });


  it("delete test data", function (done) {
    api
      .put("/query/handle-test-data")
      .set("Accept", "application/json")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({ connections: connectionsTestData, models: clueModelsTestData, modelObjs: clueModelObjectsTestData, forDelete: true })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body.status).to.equal(0);
        done();
      });
  });


  it("Delete Tenant" + tenant.id, function (done) {
    api
      .delete(
        "/catalog/tenant/" + tenant.id
      )
      .set("Accept", "application/x-www-form-urlencoded")
      .send()
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body.status).to.equal(0);
        done();
      });
  });


});
