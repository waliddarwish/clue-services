var should = require("chai").should(),
  expect = require("chai").expect,
  supertest = require("supertest"),
  api = supertest("http://localhost:8240");

describe("Connection Management", function() {
  var tenant = {};
  var tenant2 = {};
  var user2 = {};
  var user = {};
  var token = "";
  var token2 = "";
  var cookies2;
  var cookies;
  var connectionId = "";
  var databaseServerIp = '62.151.176.216';

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

  it("Create Tenant - 2", function(done) {
    api
      .put("/catalog/tenant")
      .set("Accept", "application/x-www-form-urlencoded")
      .send({
        tenant: {
          name: "The DataOcean Company",
          address: "57 Len Lunney Cres, Ottawa, ON, Canada, K2G6X4",
          paymentToken: "PaymentTokenFromStripe",
          phoneNumber: "819 329 8179",
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
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        tenant2 = res.body.data.tenant;
        user2 = res.body.data.user;
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

  it("Login - 2", function(done) {
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
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        token2 = res.body.data.authResult.token;
        cookies2 = res.header["set-cookie"];
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
          serverName: databaseServerIp,
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

  it("Create Connection 2", function(done) {
    api
      .put("/connection")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token2)
      .set("Cookie", cookies2)
      .send({
        name: "Oracle 1",
        connectionType: "Oracle",
        connectionInfo: {
          serverName: databaseServerIp,
          serverPort: 1521,
          serviceName: "Oracle SID",
          connectionProperties: [],
          username: "oracleUser11",
          password:
            "jWz0s9ITX92hqMyzcXxbEWTbav2FvQFAxmNjXZzbCbBvLkxpbtrTjQlo6NCgVmRbHIunsRfRU12wEf0x8+LKHFmjhYDJbe2xIe1QIoxbc2dwbkeZ9xQZkTMcoLrB2ahJPZp72RyM2cxOJE0Mz4C2q2ErnGLB5aHOkPHJ0Y8AIp6GLlvh0rC/KL6sCYbqzvnm+BX/I7j3OFWldMEuiHSYC9FdNnmFitpB7+GwON3myyTpDjDht42Vnv07DwHeJUQ6Zv7MqgG53z6mhlqi8xqO+MtaL856ARh/O5Y3GP5Q4BYRyu/eL12QSu33/zlGZKcsuNJ4+uNKaih7uUug4MuK6Q=="
        }
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        done();
      });
  });

  it("Connection Exists", function(done) {
    api
      .put("/connection")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({
        name: "New Oracle Connection",
        connectionType: "Oracle",
        connectionInfo: {
          serverName: databaseServerIp,
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
        expect(res.body.status).to.equal(3001);
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

  it("Create Connection - 3", function(done) {
    api
      .put("/connection")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({
        name: "New Oracle Connection 1",
        connectionType: "Oracle",
        connectionInfo: {
          serverName: databaseServerIp,
          serverPort: 1521,
          serviceName: "Oracle Service Name",
          connectionProperties: [],
          username: "oracleUser2",
          password:
            "jWz0s9ITX92hqMyzcXxbEWTbav2FvQFAxmNjXZzbCbBvLkxpbtrTjQlo6NCgVmRbHIunsRfRU12wEf0x8+LKHFmjhYDJbe2xIe1QIoxbc2dwbkeZ9xQZkTMcoLrB2ahJPZp72RyM2cxOJE0Mz4C2q2ErnGLB5aHOkPHJ0Y8AIp6GLlvh0rC/KL6sCYbqzvnm+BX/I7j3OFWldMEuiHSYC9FdNnmFitpB7+GwON3myyTpDjDht42Vnv07DwHeJUQ6Zv7MqgG53z6mhlqi8xqO+MtaL856ARh/O5Y3GP5Q4BYRyu/eL12QSu33/zlGZKcsuNJ4+uNKaih7uUug4MuK6Q=="
        }
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        done();
      });
  });

  it("Create Connection - 4", function(done) {
    api
      .put("/connection")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({
        name: "New Oracle Connection 3",
        connectionType: "Oracle",
        connectionInfo: {
          serverName: databaseServerIp,
          serverPort: 1521,
          serviceName: "Oracle Service Name",
          connectionProperties: [],
          username: "oracleUser3",
          password:
            "jWz0s9ITX92hqMyzcXxbEWTbav2FvQFAxmNjXZzbCbBvLkxpbtrTjQlo6NCgVmRbHIunsRfRU12wEf0x8+LKHFmjhYDJbe2xIe1QIoxbc2dwbkeZ9xQZkTMcoLrB2ahJPZp72RyM2cxOJE0Mz4C2q2ErnGLB5aHOkPHJ0Y8AIp6GLlvh0rC/KL6sCYbqzvnm+BX/I7j3OFWldMEuiHSYC9FdNnmFitpB7+GwON3myyTpDjDht42Vnv07DwHeJUQ6Zv7MqgG53z6mhlqi8xqO+MtaL856ARh/O5Y3GP5Q4BYRyu/eL12QSu33/zlGZKcsuNJ4+uNKaih7uUug4MuK6Q=="
        }
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        done();
      });
  });

  it("Create Connection - 5", function(done) {
    api
      .put("/connection")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({
        name: "New PostGres Connection 1",
        connectionType: "Postgres",
        connectionInfo: {
          serverName: databaseServerIp,
          serverPort: 1521,
          serviceName: "Postgres Service Name",
          connectionProperties: [],
          username: "postgresuser",
          password:
            "M+9VmJ6ZfuDXKNzV1z81Fy5hq9JOA4h+r7P1SaxrZ7oKCHdDdITs1OCc4shzkfAkM/FolSgEbA2Iu5J4UUOnrB9CV+AzOlPs6sYOW+Jj7Z8H0QnkF3K84k+mmhQ7VKd3TZVZOPrjvhKvHdPvYnIelu2/epduc1p5EwyM3Q/hB0wGm2eK/a4AsgmfyPl3WDup1DndmS/ijBBd01bt51/InnQgNUZJVtHTa11zqZcXYdXwTAPgTrPKII+Vxk51goBgsyA5mzOXkzpSi8pPBVcE1cb5xbAxM+Fh95CpfHn+pUqLdVtSAT4zxhM9wRNriqHN+xhBfSAncVGyabzR+lXt2w=="
        }
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        done();
      });
  });
  it("Return Connections - 3", function(done) {
    api
      .get("/connection/search/Oracle")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send()
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.data.length).to.equal(3);
        done();
      });
  });

  it("Return Connections - 1 - Postgres", function(done) {
    api
      .get("/connection/search/Oracle")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token2)
      .set("Cookie", cookies2)
      .send()
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.data.length).to.equal(1);
        done();
      });
  });

  it("Return Connections - 1 - Oracle", function(done) {
    api
      .get("/connection/search/Postgres")
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

  it("Return Connections - 1", function(done) {
    api
      .get("/connection/search/3")
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

  it("Return Connections - OracleUser", function(done) {
    api
      .get("/connection/search/oracleUser2")
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

  it("Return Connections - By User Id ", function(done) {
    api
      .get("/connection/user/" + user.id)
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send()
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.data.length).to.equal(4);
        done();
      });
  });

  it("Return Connections - By Tenant ID", function(done) {
    api
      .get("/connection")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send()
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.be.equal(0);
        expect(res.body.data.length).to.equal(4);
        done();
      });
  });

  it("Return Recent Connections", function(done) {
    api
      .get("/connection/recent/3")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send()
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.be.equal(0);
        expect(res.body.data.length).to.equal(3);
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

  it("Return Connection  - BY ID", function(done) {
    api
      .get("/connection/" + connectionId)
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

  it("Create Connection - Oracle" , function(done) {
    api
      .put("/connection")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({
        name: "True Oracle Connection",
        connectionInfo: {
          username: "SYSTEM",
          serverName: databaseServerIp,
          serviceName: "ORCLCDB.localdomain",
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
        connectionId = res.body.data.id;
        done();
      });
  });

  // it("Test Connection", function(done) {
  //   api
  //     .get("/connection/test/" + connectionId)
  //     .set("Accept", "application/x-www-form-urlencoded")
  //     .set("passport", token)
  //     .set("Cookie", cookies)
  //     .send()
  //     .expect("Content-Type", /json/)
  //     .expect(200)
  //     .end(function(err, res) {
  //       expect(res.body.status).to.equal(0);
  //       expect(res.body.data.result).to.equal("Success");
  //       done();
  //     });
  // });

  // it("Test Connection - Body", function(done) {
  //   api
  //     .post("/connection/test")
  //     .set("Accept", "application/x-www-form-urlencoded")
  //     .set("passport", token)
  //     .set("Cookie", cookies)
  //     .send({
  //       connectionInfo: {
  //         // no need for a name as users can test connections before creating them
  //         username: "SYSTEM",
  //         serverName: databaseServerIp,
  //         serviceName: "ORCLCDB.localdomain",
  //         password:
  //           "gJp0s3a5wlcRTryZt8cK5wVnemFnmFqzVq3BLy9+0KLJit7PLNa0Z2JFl/W6NrmE+cYxHRMZsiOFKedZfse3yYZvplEWXFbHUcA01l5LFsvIMz7oB++fFJIKesN48Lv33EDrBLEVucjAzD+wJi8+IXCeVpMgKGsXDgu5ZKhI1Tqot3Ti6gzWNoSkwBNP4bNf4PWUmlE65ORZcJcLIA/9Zm4pH71Zbp4jb47t9Bq40SpN/bFlmxroIUxwtpnUVrmorbLBV7UupimApBfmO+HYLqfpqAbF+QZI+43BHD+utqXJHimjlIfu9yb1uN0DSqobCrSx5I0OvYbIJCZntkphNw==",
  //         serverPort: 1521,
  //         connectionTimeout: 30000
  //       },
  //       connectionType: "Oracle"
  //     })
  //     .expect("Content-Type", /json/)
  //     .expect(200)
  //     .end(function(err, res) {
  //       expect(res.body.status).to.equal(0);
  //       expect(res.body.data.result).to.equal("Success");
  //       done();
  //     });
  // });

  // it("Test Connection - Fail 1", function(done) {
  //   api
  //     .post("/connection/test")
  //     .set("Accept", "application/x-www-form-urlencoded")
  //     .set("passport", token)
  //     .set("Cookie", cookies)
  //     .send({
  //       connectionInfo: {
  //         // no need for a name as users can test connections before creating them
  //         username: "books_admin",
  //         serverName: databaseServerIp,
  //         serviceName: "ORCLCDB.localdomain",
  //         password:
  //           "c92KgcCqNSSEdTDpwHwujkvG8epsqn3qGRc2xnW5B0nB2cuMW78jUxfl82/ViHaRw0RfsvgbAAoN9caZXrYAKlkJF7E6vZ7lO2lHNjcy7+6yIlVmhJfoLgwR0zWItNDQqiPX2qzcu9u3vO8xd/ryWNFWV1szbRMuWSekvaJJTuzeFCEP1ZHF2gfXwCOlhR7xORg3OcTjJ4cXUM6peuwDpa/tV7sfDg31hSY33L6y3yeWr9hy8yEhgqjF4EO+ChiVIFb6vWB840DEkcZe4W4xRyjt0CvLuSGgLihK/pHGTMp1y5VCUm3I0U9WT+ZV8/thxEYGXHGJNHSgBzXxNR8PAw==",
  //         serverPort: 1521,
  //         connectionTimeout: 30000
  //       },
  //       connectionType: "Oracle"
  //     })
  //     .expect("Content-Type", /json/)
  //     .expect(200)
  //     .end(function(err, res) {
  //       expect(res.body.status).to.equal(0);
  //       expect(res.body.data.result).to.equal("error");
  //       expect(res.body.data.dberror.errorNum).to.equal(12545);
  //       done();
  //     });
  // });

  // it("Test Connection - Fail 2", function(done) {
  //   api
  //     .post("/connection/test")
  //     .set("Accept", "application/x-www-form-urlencoded")
  //     .set("passport", token)
  //     .set("Cookie", cookies)
  //     .send({
  //       connectionInfo: {
  //         // no need for a name as users can test connections before creating them
  //         username: "books_admin1",
  //         serverName: databaseServerIp,
  //         serviceName: "ORCLCDB.localdomain",
  //         password:
  //           "c92KgcCqNSSEdTDpwHwujkvG8epsqn3qGRc2xnW5B0nB2cuMW78jUxfl82/ViHaRw0RfsvgbAAoN9caZXrYAKlkJF7E6vZ7lO2lHNjcy7+6yIlVmhJfoLgwR0zWItNDQqiPX2qzcu9u3vO8xd/ryWNFWV1szbRMuWSekvaJJTuzeFCEP1ZHF2gfXwCOlhR7xORg3OcTjJ4cXUM6peuwDpa/tV7sfDg31hSY33L6y3yeWr9hy8yEhgqjF4EO+ChiVIFb6vWB840DEkcZe4W4xRyjt0CvLuSGgLihK/pHGTMp1y5VCUm3I0U9WT+ZV8/thxEYGXHGJNHSgBzXxNR8PAw==",
  //         serverPort: 1521,
  //         connectionTimeout: 30000
  //       },
  //       connectionType: "Oracle"
  //     })
  //     .expect("Content-Type", /json/)
  //     .expect(200)
  //     .end(function(err, res) {
  //       expect(res.body.status).to.equal(0);
  //       expect(res.body.data.result).to.equal("error");
  //       expect(res.body.data.dberror.errorNum).to.equal(1017);
  //       done();
  //     });
  // });

  // it("Test Connection - Fail 3", function(done) {
  //   api
  //     .post("/connection/test")
  //     .set("Accept", "application/x-www-form-urlencoded")
  //     .set("passport", token)
  //     .set("Cookie", cookies)
  //     .send({
  //       connectionInfo: {
  //         // no need for a name as users can test connections before creating them
  //         username: "books_admin",
  //         serverName: databaseServerIp,
  //         serviceName: "ORCLCDB.localdomain",
  //         password:
  //           "G6TQKgnToSAeOqJUOM9Tozqk0oDEGHnluQ37UB9MpUDXD2xsE+lR8Qmzr0ccauUffc+1+lBXHFRwoZtyPXkcsiieIubWweElVmrNXu34yGfmlYBDmMm1Wjc4Ss5sjyvxh4OsoEjwsFXBxGBrlRA6FA+h0U5CBpw6WPUSnJSQ4NOC4FXQgEr0yTA1E+k0yU/x5+eAO2C77dtPgE/sz6gJREfmj6UyqhN3E558smrWK9JkEBq2CCJ4MEnq+D1SdQ70xJjzwuxspBOfCJbDgZDm8Du/x3xOOIduPNYR34sHDekoaSdEoGuAUAAvIHGZG9o98pn1IayV7aNJOqN/nW+hRw==",
  //         serverPort: 1521,
  //         connectionTimeout: 30000
  //       },
  //       connectionType: "Oracle"
  //     })
  //     .expect("Content-Type", /json/)
  //     .expect(200)
  //     .end(function(err, res) {
  //       expect(res.body.status).to.equal(0);
  //       expect(res.body.data.result).to.equal("error");
  //       expect(res.body.data.dberror.errorNum).to.equal(1017);
  //       done();
  //     });
  // });

  // it("Test Connection - Fail 4", function(done) {
  //   api
  //     .post("/connection/test")
  //     .set("Accept", "application/x-www-form-urlencoded")
  //     .set("passport", token)
  //     .set("Cookie", cookies)
  //     .send({
  //       connectionInfo: {
  //         // no need for a name as users can test connections before creating them
  //         username: "books_admin",
  //         serverName: databaseServerIp,
  //         serviceName: "ORCLCDB.localdomain1",
  //         password:
  //           "c92KgcCqNSSEdTDpwHwujkvG8epsqn3qGRc2xnW5B0nB2cuMW78jUxfl82/ViHaRw0RfsvgbAAoN9caZXrYAKlkJF7E6vZ7lO2lHNjcy7+6yIlVmhJfoLgwR0zWItNDQqiPX2qzcu9u3vO8xd/ryWNFWV1szbRMuWSekvaJJTuzeFCEP1ZHF2gfXwCOlhR7xORg3OcTjJ4cXUM6peuwDpa/tV7sfDg31hSY33L6y3yeWr9hy8yEhgqjF4EO+ChiVIFb6vWB840DEkcZe4W4xRyjt0CvLuSGgLihK/pHGTMp1y5VCUm3I0U9WT+ZV8/thxEYGXHGJNHSgBzXxNR8PAw==",
  //         serverPort: 1521,
  //         connectionTimeout: 30000
  //       },
  //       connectionType: "Oracle"
  //     })
  //     .expect("Content-Type", /json/)
  //     .expect(200)
  //     .end(function(err, res) {
  //       expect(res.body.status).to.equal(0);
  //       expect(res.body.data.result).to.equal("error");
  //       expect(res.body.data.dberror.errorNum).to.equal(12514);
  //       done();
  //     });
  // });

  // it("Test Conenction  - Fail 5", function(done) {
  //   api
  //     .post("/connection/test")
  //     .set("Accept", "application/x-www-form-urlencoded")
  //     .set("passport", token)
  //     .set("Cookie", cookies)
  //     .send({
  //       connectionInfo: {
  //         // no need for a name as users can test connections before creating them
  //         username: "books_admin",
  //         serverName: databaseServerIp,
  //         serviceName: "ORCLCDB.localdomain",
  //         password:
  //           "c92KgcCqNSSEdTDpwHwujkvG8epsqn3qGRc2xnW5B0nB2cuMW78jUxfl82/ViHaRw0RfsvgbAAoN9caZXrYAKlkJF7E6vZ7lO2lHNjcy7+6yIlVmhJfoLgwR0zWItNDQqiPX2qzcu9u3vO8xd/ryWNFWV1szbRMuWSekvaJJTuzeFCEP1ZHF2gfXwCOlhR7xORg3OcTjJ4cXUM6peuwDpa/tV7sfDg31hSY33L6y3yeWr9hy8yEhgqjF4EO+ChiVIFb6vWB840DEkcZe4W4xRyjt0CvLuSGgLihK/pHGTMp1y5VCUm3I0U9WT+ZV8/thxEYGXHGJNHSgBzXxNR8PAw==",
  //         serverPort: 1522,
  //         connectionTimeout: 30000
  //       },
  //       connectionType: "Oracle"
  //     })
  //     .expect("Content-Type", /json/)
  //     .expect(200)
  //     .end(function(err, res) {
  //       expect(res.body.status).to.equal(0);
  //       expect(res.body.data.result).to.equal("error");
  //       expect(res.body.data.dberror.errorNum).to.equal(12541);
  //       done();
  //     });
  // });

  it("Test Connection - Success - Postgres", function(done) {
    api
      .post("/connection/test")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", token)
      .set("Cookie", cookies)
      .send({
        connectionInfo: {
          // no need for a name as users can test connections before creating them
          username: "postgres",
          serverName: databaseServerIp,
          serviceName: "postgres",
          password:
            "TNTJ/s3ZLJCJ5L3Jbmi69j4ml8Gg0F5k4qi4adhDqR/3L0TVAljYtrAZlF3teSI/sqcYRzfgeCZarVhlKewZIxsRFg/8xWaX3O4OnpVN9vvX13ufpQQOs0iWpV/z2NIXTtvqMdR/6sNjC9qfzCcuJpir+NofZdT4lJYEs86icAv9ORytPKITeUZ0Ux9A2YiTuBT0kA9nTeHvldtr+NSS9Eh6YMEFBBv7xRpfYuvVm6kBjqreKqBlDmIbJn99YrVE9ykEq3ohTfsBz2v0xU2Yf4qFvUPvp7kZDLn3HIVyz8f0/JoWVegyayjDFbgEBltd9XXPVhvLDvkUMeMCj0/w8w==",
          serverPort: 5432,
          connectionTimeout: 30000
        },
        connectionType: "Postgres"
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.data.result).to.equal("Success");
        done();
      });
  });

  it("Delete Connections", function(done) {
    api
      .delete("/connection")
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

  it("should return 200 and delete tenant " + tenant.id, function(done) {
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

  it("Delete Tenant" + tenant2.id, function(done) {
    api
      .delete("/catalog/tenant/" + tenant2.id)
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
