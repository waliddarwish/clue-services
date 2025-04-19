var should = require("chai").should(),
  expect = require("chai").expect,
  supertest = require("supertest"),
  api = supertest("http://localhost:8240");

describe("Task Management", function() {
  var tenant = {};
  var user = {}
  var token = "";
  var cookies;
  var invite = {};
  var task1 = {};

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
          userTimeZone: "GMT-5",
          role: "TenantAdmin"
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


 it("Schedule Task", function(done) {
  api
    .put("/task/add")
    .set("Accept", "application/json")
    .set("passport", token)
    .set("Cookie", cookies)
    .send({
      "id": "1", "schedulingType": "now", "schedulingString": "in 2 minutes", "taskType": "task1", "tenantId": tenant.id, "taskParam": [{ "host": "127.0.0.1", "port": 8250, "nodeId": "Node1" }]
    })
    .expect("Content-Type", /json/)
    .expect(200)
    .end(function(err, res) {
      expect(res.body.status).to.equal(0);
      done();
    });
});

  it("Schedule Task - Future", function (done) {
    api
      .put("/task/add")
      .set("Accept", "application/json")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({
        "id": "1", "schedulingType": "schedule", "schedulingString": "in 5 minutes", "taskType": "task1", "tenantId": tenant.id, "taskParam": [{ "host": "127.0.0.1", "port": 8250, "nodeId": "Node1" }]
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body.status).to.equal(0);
        task1 = res.body.data;
        done();
      });
  });


  it("Get Task Details", function (done) {
    api
      .get("/task/get/" + task1.id)
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


  it("Get Task - By Tenant", function (done) {
    api
      .get("/task/get-tasks/" + tenant.id)
      .set("Accept", "application/json")
      .set("passport", token)
      .set("Cookie", cookies)
      .send()
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.data.length).to.equal(2);
        done();
      });
  });
  

  it("Cancel Task", function (done) {
    api
      .get("/task/cancel/" + task1.id)
      .set("Accept", "application/json")
      .set("passport", token)
      .set("Cookie", cookies)
      .send()
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.data).to.equal(1);
        done();
      });
  });

  it("Delete Tenant" + tenant.id , function(done) {
    api
      .delete(
        "/catalog/tenant/" + tenant.id
      )
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
