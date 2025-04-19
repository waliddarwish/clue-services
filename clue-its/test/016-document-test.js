var should = require("chai").should(),
  expect = require("chai").expect,
  supertest = require("supertest"),
  api = supertest("http://localhost:8240");

describe("Documents", function() {

  var token = "";
  var cookies;
  var createdDocuments = [];
 


  it("Login", function(done) {
    api
      .post("/access/authenticate")
      .set("Accept", "application/x-www-form-urlencoded")
      .send({
        username: "admin@clueanalytics.com",
        password:
          "SN/rqTK3HDDkfX737Td37PAXU/qqVSLAUJ3DasY7A9VW7mCcMijWDYOmxB+Ai0CXF2ACNw+yjPNAsO62ijbS1WlAa0H1+C6ozDCkEkwYpZlg+CrijmB8QRrm0Kh4Nc7aFZOtxqWxxN1XWZx5zcf8oo9HEXGzZJgf50ilve+if8Xsb7fXE8q0E6eZoQ/R6UdjsrfLQch4r2rPHBne/LkDkPjXL1bJ2OURjF5xv2MSPKXJgtJupA5hk+mvPyPbM061cyGcG6CLB8dJ1+zwppi5eVnPXXzbzGR8F6FLfacGyNQEFvxYa+FWBtW73rFvjoT4gRCwqYHmcK8T418FcN8Wsw=="
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


  
  it("Create Document", function(done) {
    api
      .put("/document")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({
        documentTitle: "Some document",
        documentSubTitle: "Some subtitle",
        documentContent: "Some contents",
        category: "Cat1",
        keywords: ['keyword1' , "keyword2" ],
        order: 1
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        createdDocuments.push(res.body.data.data.id)
        expect(res.body.status).to.equal(0);
        done();
      });
  });

  it("Create Another Document ", function(done) {
    api
      .put("/document")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({
        documentTitle: "Some other document ",
        documentSubTitle: "Some other subtitle",
        documentContent: "Some other contents",
        category: "Cat2",
        keywords: ['keyword1' , 'keyword3' ],
        order: 1
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        createdDocuments.push(res.body.data.data.id);
        expect(res.body.status).to.equal(0);
        done();
      });
  });

  it("Create a third Document ", function(done) {
    api
      .put("/document")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({
        documentTitle: "Some other document ",
        documentSubTitle: "Some other subtitle",
        documentContent: "Some other contents",
        category: "Cat2",
        keywords: ['keyword1' , 'keyword3' ],
        order: 1
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        createdDocuments.push(res.body.data.data.id)
        expect(res.body.status).to.equal(0);
        done();
      });
  });


  it("Update a Document ", function(done) {
    api
      .post("/document/" + createdDocuments[0])
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({
        documentTitle: "Some other document updated ",
        documentSubTitle: "Some other subtitle",
        documentContent: "Some other contents",
        order: 1
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        done();
      });
  });

  it("Find Documents ", function(done) {
    api
      .get("/document/" + createdDocuments[0])
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
  it("Find Documents by Category ", function(done) {
    api
      .get("/document/category/Cat1")
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

  it("Find Documents by Keyword ", function(done) {
    api
      .get("/document/keyword/keyword1")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send()
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.data.data.length).to.equal(3);
        done();
      });
  });

  it("Search documents ", function(done) {
    api
      .get("/document/search/some")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send()
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.data.data.length).to.equal(3);
        done();
      });
  });


  it("Log Out", function(done) {
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

  it("Find Documents ", function(done) {
    api
      .get("/document/" + createdDocuments[0])
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
  it("Find Documents by Category ", function(done) {
    api
      .get("/document/category/Cat1")
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

  it("Find Documents by Keyword ", function(done) {
    api
      .get("/document/keyword/keyword1")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send()
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.data.data.length).to.equal(3);
        done();
      });
  });

  it("Search documents ", function(done) {
    api
      .get("/document/search/some")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send()
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.data.data.length).to.equal(3);
        done();
      });
  });


  it("Login again", function(done) {
    api
      .post("/access/authenticate")
      .set("Accept", "application/x-www-form-urlencoded")
      .send({
        username: "admin@clueanalytics.com",
        password:
          "SN/rqTK3HDDkfX737Td37PAXU/qqVSLAUJ3DasY7A9VW7mCcMijWDYOmxB+Ai0CXF2ACNw+yjPNAsO62ijbS1WlAa0H1+C6ozDCkEkwYpZlg+CrijmB8QRrm0Kh4Nc7aFZOtxqWxxN1XWZx5zcf8oo9HEXGzZJgf50ilve+if8Xsb7fXE8q0E6eZoQ/R6UdjsrfLQch4r2rPHBne/LkDkPjXL1bJ2OURjF5xv2MSPKXJgtJupA5hk+mvPyPbM061cyGcG6CLB8dJ1+zwppi5eVnPXXzbzGR8F6FLfacGyNQEFvxYa+FWBtW73rFvjoT4gRCwqYHmcK8T418FcN8Wsw=="
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


  it("Delete Documents", function(done) {
    for (let docId of createdDocuments) {
      api
        .delete("/document/" + docId)
        .set("Accept", "application/x-www-form-urlencoded")
        .set("passport", token)
        .set("Cookie", cookies)
        .send()
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function(err, res) {
          expect(res.body.status).to.equal(0);
        });
      }
      done();

  });

  it("Log Out", function(done) {
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
