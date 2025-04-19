var should = require("chai").should(),
  expect = require("chai").expect,
  supertest = require("supertest"),
  api = supertest("http://localhost:8240");

describe("Orchestrator Test", function() {
 var tenant = {};
 var user = {};
 var token = "";
 var cookies;
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

 it("Return All Tenants", function(done) {
  api
    .get("/catalog/tenant")
    .set("Accept", "application/x-www-form-urlencoded")
    .set("passport", token)
    .set("Cookie", cookies)
    .send()
    .expect("Content-Type", /json/)
    .expect(200)
    .end(function(err, res) {
      expect(res.body.status).to.equal(0);
      expect(res.body.data.length >= 2);
      done();
    });
});
  it("Return Supported Languages", function(done) {
    api
      .get("/orchestrator/language")
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
