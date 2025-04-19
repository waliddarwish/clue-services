var should = require("chai").should(),
  expect = require("chai").expect,
  supertest = require("supertest"),
  api = supertest("http://localhost:8240");

describe("Plan Test", function() {
 var plan = {};
 var token = "";
 var cookies;


 it("Login SuperAdmin", function(done) {
   api
     .post("/access/authenticate")
     .set("Accept", "application/x-www-form-urlencoded")
     .send({
       username: "admin@clueanalytics.com",
       password:
         "jCJBqRdvmF2YL88It7loiVdz7VS/ktd/pm0dm2/Ittsac8ipZ9JU+biTsmnwmgnoo9Bm/d8/X6QSoLzH220Pvd9up+P745iuhIZdtNEVkFLtVGfaBJlbq7xevIZDQlUx46u4xgwJEdXLyR8v0t1f9yfiSvCssLmm3GonsdmnGwhA9P0kqIow5Xx6JNDPuvC/2r2Oiew0Racv2NTwpWc+pvaNV4fsLSRP54Z3JDF+a3AiMNlmwiVuonAGzJhWCwRAncnaLVm/WEm3poftTa5xWLgOrJi/8REf450gQaMKfSnYSkI+A1Ts2FldB4Mj3NRz0q2/cSuPbxAoWnCHvbdn1Q=="
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
    it("Create Plan", function(done) {
      api
        .put("/subscription-plan")
        .set("Accept", "application/x-www-form-urlencoded")
        .set("passport", token)
        .set("Cookie", cookies)
        .send({
          planName: "Monthly Plan 2",
          planDescription: "$5 per month per user",
          planStripeCode: "CLUE-MONTHLY123",
          planSubTitle: "Best plan",
          planPrice: "$10/Month/User",
          planMarketingStatement: "Modelling and visualizations for only $10",
          status : 'NotActive'
        })
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function(err, res) {
          expect(res.body.status).to.equal(0);
          plan = res.body.data;
          done();
        });
    });


    it("Update Plan", function(done) {
      api
        .post("/subscription-plan/" + plan.id)
        .set("Accept", "application/x-www-form-urlencoded")
        .set("passport", token)
        .set("Cookie", cookies)
        .send({
          planName: "Monthly Plan 3",
          planeDescription: "$5 per month per user",
          planStipeCode: "CLUE-MONTHLY"
        })
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function(err, res) {
          expect(res.body.status).to.equal(0);
          done();
        });
    });


    it("Find Plan", function(done) {
      api
        .get("/subscription-plan/" + plan.id)
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

    it("Find All Plans", function(done) {
      api
        .get("/subscription-plan")
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

    it("Find Public Plans", function(done) {
      api
        .get("/subscription-plan/active")
        .set("Accept", "application/x-www-form-urlencoded")
        .send()
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function(err, res) {
          expect(res.body.status).to.equal(0);
          done();
        });
    });

    it("Find Active Plans", function(done) {
      api
        .get("/subscription-plan/active")
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

    it("Delete Plan", function(done) {
      api
        .del("/subscription-plan/" + plan.id)
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


  it("Log Off", function(done) {
    api
      .post("/access/logout")
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
});
