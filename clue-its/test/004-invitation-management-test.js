var should = require("chai").should(),
  expect = require("chai").expect,
  supertest = require("supertest"),
  api = supertest("http://localhost:8240");

describe("Invitation Management", function() {
  var tenant = {};
  var user = {}
  var token = "";
  var cookies;
  var invite = {};

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
          role: "Consumer"
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


 it("Create Invitation", function(done) {
  api
    .put("/invitation/invite")
    .set("Accept", "application/json")
    .set("passport", token)
    .set("Cookie", cookies)
    .send({
      email: "usaer2@email.com",
      role: "Admin",
    })
    .expect("Content-Type", /json/)
    .expect(200)
    .end(function(err, res) {
      expect(res.body.status).to.equal(0);
      invite = res.body.data;
      done();
    });
});

  it("Search Invitations" , function (done) {
    api
      .get("/invitation/get-invites" )
      .set("Accept", "application/json")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({})
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.data.length === 1);
        done();
      });
  });

  it("Resend Invitation", function (done) {
    api
      .post("/invitation/resend/" + invite.id)
      .set("Accept", "application/json")
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

  it("Accept Invitation", function (done) {
    api
      .put("/invitation/accept")
      .set("Accept", "application/json")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({
        invitationId: invite.id,
        firstName: "Ahmed",
        lastName: "Ali",
        password: "f1CyVthmD0Pz7mA1kZyDzk39sVCCLpNYJazGs8QFtykWx98YJYOgmGzcAWPArH9tUz6iMVdONbqAddxSdZ2PAWVXKJzC9mn7uMTAJ9jfjZwH12IG+KEUduNCUcDJ2EfQQYCsQ4mTXJFZKFFamV6hwJdqrJxb5Kpzqj15MZu1X41OYJSOmVYmUH6wrqIf1QR+kTrBrxWDoFl5myw0/OWzU+iXZBaWdE1wE0OQB6LGW73G0ptW8S4QT+olapJ6tsOkU+eU+ZrOmkpt5cgQCx2sFxFv5milGOyT7dTcpEtNjB3/G1Hg/oo0ePCxSe4SFgTbQ1P9yKF8rNGTuBeHt7qAag==",
        userLanguage: 'English',
        userTimeZone: 'America/Atikokan'
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body.status).to.equal(0);
        done();
      });
  });
  


  it("Delete Tenant Invitation", function (done) {
    api
      .delete("/invitation/delete/" + invite.id)
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

  it("Delete All Accepted Invitation ", function(done) {
    api
      .delete(
        "/invitation/delete-all-accepted"
      )
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


  it("Find Invitations - Return Nothing", function (done) {
    api
      .get("/invitation/get-invites")
      .set("Accept", "application/json")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({})
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.data.length === 0);
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
