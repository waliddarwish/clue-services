var adminUser = {};
var adminToken = null;
var adminCookies = null;
var should = require("chai").should(),
  expect = require("chai").expect,
  supertest = require("supertest"),
  api = supertest("http://localhost:8240");
var tenants = require("../data/tenants.json");
const uuidv1 = require("uuid/v1");


describe("Search Management", function() {
  for (i = 0; i < tenants.length; i++) {
    createTenant(tenants[i]);
    login(tenants[i]);
  }

  it("Login - SuperAdmin", function(done) {
    api
      .post("/access/authenticate")
      .set("Accept", "application/x-www-form-urlencoded")
      .send({
        username: "admin@clueanalytics.com",
        password:
          "ZU/xay/EPYXqqr4Goc8gjQanMLN6flGVVQdiweYBIRjCiFz2qld3eMlZecjsZr1YUsuTyo0xDQtaU/zxUraa4/9eqfkk4tmgfmc32AVpVp7M6XuA9z6UKjDB6KOO5q5hkfEdayhcmHJfo4a7HHxS97xiSgCYGVGDrueS3//O1j+kqSxWIzNqbVnPdLQx2LpjKn+Sg+3K4Pc5xzFOsG4bVOozpUpt4gqNeeygB/8Ggg8rPzXkLsZKcC0s7eOr5KXqnTrXSZ/SgcGejKl7WOaKWa/11rqcH1wyocLOslsXftUb8hRi9CQZeTnUcE3cSy6moDoZAVG53BJ20vbhUL2Hzg=="
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        adminUser = res.body.data.user;
        adminToken = res.body.data.authResult.token;
        adminCookies = res.header["set-cookie"];
        done();
      });
  });

  it("Return Tenants - Page 1", function(done) {
    api
      .post("/search/tenants/1/4")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", adminToken)
      .set("Cookie", adminCookies)
      .send({})
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.data.length).to.equal(4);
        done();
      });
  });

  it("Return Tenants - Page 2", function(done) {
    api
      .post("/search/tenants/2/4")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", adminToken)
      .set("Cookie", adminCookies)
      .send({})
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.data.length).to.equal(4);
        done();
      });
  });

  it("Return Tenants - Page 3", function(done) {
    api
      .post("/search/tenants/3/4")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", adminToken)
      .set("Cookie", adminCookies)
      .send({})
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.data.length).to.equal(4);
        done();
      });
  });

  it("Return Tenants - Page 4", function(done) {
    api
      .post("/search/tenants/4/4")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", adminToken)
      .set("Cookie", adminCookies)
      .send({})
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.data.length).to.equal(4);
        done();
      });
  });

  it("Return Tenants - Page 5", function(done) {
    api
      .post("/search/tenants/5/4")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", adminToken)
      .set("Cookie", adminCookies)
      .send({})
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.data.length).to.equal(1);
        done();
      });
  });

  it("Return Tenants - Page 1", function(done) {
    api
      .post("/search/tenants/1/5")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", adminToken)
      .set("Cookie", adminCookies)
      .send({})
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.data.length).to.equal(5);
        done();
      });
  });

  it("Return Tenants - Page 2", function(done) {
    api
      .post("/search/tenants/2/5")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", adminToken)
      .set("Cookie", adminCookies)
      .send({})
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.data.length).to.equal(5);
        done();
      });
  });

  it("Return Tenants - Page 3", function(done) {
    api
      .post("/search/tenants/3/5")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", adminToken)
      .set("Cookie", adminCookies)
      .send({})
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.data.length).to.equal(5);
        done();
      });
  });

  it("Return Tenants - Page 4", function(done) {
    api
      .post("/search/tenants/4/5")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", adminToken)
      .set("Cookie", adminCookies)
      .send({})
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.data.length).to.equal(2);
        done();
      });
  });

  it("Return Super Tenant - By Name", function(done) {
    api
      .post("/search/tenants/1/100")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", adminToken)
      .set("Cookie", adminCookies)
      .send({
        criteria: { name: "ClueAnalytics" }
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.data.length).to.equal(1);
        done();
      });
  });

  it("Log Off - SuperAdmin", function(done) {
    api
      .post("/access/logout")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", adminToken)
      .set("Cookie", adminCookies)
      .send()
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        done();
      });
  });

  for (i = 0; i < tenants.length; i++) {
    sendInvitations(tenants[i]);
  }

    it("Return Pending Invitations ", function(done) {
      api
        .post("/search/invitations/1/100")
        .set("Accept", "application/x-www-form-urlencoded")
        .set("passport", tenants[4].token)
        .set("Cookie", tenants[4].cookies)
        .send({
          criteria: { status: "Pending" }
        })
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function(err, res) {
          expect(res.body.status).to.equal(0);
          expect(res.body.data.length).to.equal(12);

          done();
        });
    });


  for (i = 0; i < tenants.length; i++) {
    createConnections(tenants[i]);
  }

  it("Return Connections", function(done) {
    api
      .post("/search/connections/1/100")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", tenants[4].token)
      .set("Cookie", tenants[4].cookies)
      .send({
        criteria: { connectionType: "Oracle" }
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.data.length).to.equal(10);

        done();
      });
  });

  it("Return Connections - Not Oracle ", function(done) {
  api
    .post("/search/connections/1/100")
    .set("Accept", "application/x-www-form-urlencoded")
    .set("passport", tenants[4].token)
    .set("Cookie", tenants[4].cookies)
    .send({
      criteria: { connectionType: { $ne: "Oracle" }}
    })
    .expect("Content-Type", /json/)
    .expect(200)
    .end(function(err, res) {
      expect(res.body.status).to.equal(0);
      expect(res.body.data.length).to.equal(0);

      done();
    });
});

 it("Return Connections - Contains", function(done) {
   api
     .post("/search/connections/1/100")
     .set("Accept", "application/x-www-form-urlencoded")
     .set("passport", tenants[4].token)
     .set("Cookie", tenants[4].cookies)
     .send({
       criteria: { name: { $regex : "10", $options: "i" } }
     })
     .expect("Content-Type", /json/)
     .expect(200)
     .end(function(err, res) {
       expect(res.body.status).to.equal(0);

       done();
     });
 });

 it("Return Connections - Only ID and Name ", function(done) {
   api
     .post("/search/connections/1/100")
     .set("Accept", "application/x-www-form-urlencoded")
     .set("passport", tenants[4].token)
     .set("Cookie", tenants[4].cookies)
     .send({
       criteria: { connectionType: { $in : [ "Oracle" ] } },
       projections : {id: 1, name: 1}
     })
     .expect("Content-Type", /json/)
     .expect(200)
     .end(function(err, res) {
       expect(res.body.status).to.equal(0);
       expect(res.body.data.length).to.equal(10);

       done();
     });
 });

 it("Return Connections - Only ID and Name - Order By ID ", function(done) {
   api
     .post("/search/connections/1/100")
     .set("Accept", "application/x-www-form-urlencoded")
     .set("passport", tenants[4].token)
     .set("Cookie", tenants[4].cookies)
     .send({
       criteria: { connectionType: { $in: ["Oracle"] } },
       projections: { id: 1, name: 1 },
       options: { sort: { id: "ascending" } }
     })
     .expect("Content-Type", /json/)
     .expect(200)
     .end(function(err, res) {
       expect(res.body.status).to.equal(0);
       expect(res.body.data.length).to.equal(10);

       done();
     });
 });

  it("Return Connections - Only ID and Name - Order By ID - Desc", function(done) {
    api
      .post("/search/connections/1/100")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", tenants[4].token)
      .set("Cookie", tenants[4].cookies)
      .send({
        criteria: { connectionType: { $in: ["Oracle"] } },
        projections: { id: 1, name: 1 },
        options: { sort: { id: "desc" } }
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        expect(res.body.data.length).to.equal(10);

        done();
      });
  });

  it("Return Connection count", function(done) {
    api
      .post("/search/connections/count/1")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", tenants[4].token)
      .set("Cookie", tenants[4].cookies)
      .send({})
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        done();
      });
  });

  it("Return Datasets count ", function(done) {
    api
      .post("/search/datasets/count/1")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", tenants[4].token)
      .set("Cookie", tenants[4].cookies)
      .send({})
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        done();
      });
  });

  it("Return Models count ", function(done) {
    api
      .post("/search/models/count/1")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", tenants[4].token)
      .set("Cookie", tenants[4].cookies)
      .send({modelType: 'public'})
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        done();
      });
  });

  it("Return visualizations count ", function(done) {
    api
      .post("/search/visualizations/count/1")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", tenants[4].token)
      .set("Cookie", tenants[4].cookies)
      .send({})
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        done();
      });
  });

  it("Return User count ", function(done) {
    api
      .post("/search/users/count/1")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", tenants[4].token)
      .set("Cookie", tenants[4].cookies)
      .send({})
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        done();
      });
  });


  




  it("Login SuperAdmin", function(done) {
    api
      .post("/access/authenticate")
      .set("Accept", "application/x-www-form-urlencoded")
      .send({
        username: "admin@clueanalytics.com",
        password:
          "ZU/xay/EPYXqqr4Goc8gjQanMLN6flGVVQdiweYBIRjCiFz2qld3eMlZecjsZr1YUsuTyo0xDQtaU/zxUraa4/9eqfkk4tmgfmc32AVpVp7M6XuA9z6UKjDB6KOO5q5hkfEdayhcmHJfo4a7HHxS97xiSgCYGVGDrueS3//O1j+kqSxWIzNqbVnPdLQx2LpjKn+Sg+3K4Pc5xzFOsG4bVOozpUpt4gqNeeygB/8Ggg8rPzXkLsZKcC0s7eOr5KXqnTrXSZ/SgcGejKl7WOaKWa/11rqcH1wyocLOslsXftUb8hRi9CQZeTnUcE3cSy6moDoZAVG53BJ20vbhUL2Hzg=="
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        adminUser = res.body.data.user;
        adminToken = res.body.data.authResult.token;
        adminCookies = res.header["set-cookie"];
        done();
      });
  });

  for (i = 0; i < tenants.length; i++) {
    deleteTenant(tenants[i]);
  }

  it("Log Off - SuperAdmin", function(done) {
    api
      .post("/access/logout")
      .set("Accept", "application/x-www-form-urlencoded")
      .set("passport", adminToken)
      .set("Cookie", adminCookies)
      .send()
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        done();
      });
  });
});


function createConnections(tenant) {
  for (j = 0; j < 10; j++) {
    it(
      "Create Oracle Connection -  " + i ,
      function(done) {
        api
          .put("/connection")
          .set("Accept", "application/x-www-form-urlencoded")
          .set("passport", tenant.token)
          .set("Cookie", tenant.cookies)
          .send({
            name: "Oracle :" + uuidv1(),
            connectionType: "Oracle",
            connectionInfo: {
              serverName: "localhost",
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
      }
    );
  }
}

function sendInvitation(tenant, index , prefix) {
  it(
    "Create Invitation" +
      "TenantAdmin" +
      index +
      "@" +
      tenant.tenant.name +
      ".com",
    function(done) {
      api
        .put("/invitation/invite")
        .set("Accept", "application/json")
        .set("passport", tenant.token)
        .set("Cookie", tenant.cookies)
        .send({
          email: "TenantAdmin" + index + '_' + prefix + "@" + tenant.tenant.id + ".com",
          role: "TenantAdmin",
          tenantId: tenant.tenant.id
        })
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function(err, res) {
          expect(res.body.status).to.equal(0);
          invite = res.body.data.invite;
          done();
        });
    }
  );
}

function sendInvitations(tenant) {
  for (j = 0; j < 3; j++) {
    sendInvitation(tenant, j , 1);
  }

  for (j = 0; j < 3; j++) {
    sendInvitation(tenant, j , 2 );
  }
  for (j = 0; j < 3; j++) {
    sendInvitation(tenant, j , 3 );
  }

  for (j = 0; j < 3; j++) {
    sendInvitation(tenant, j , 4);
  }
}

function deleteTenant(tenant) {
  it("Delete Tenant"  + tenant.tenant.name, function(
    done
  ) {
    api
      .delete("/catalog/tenant/" + tenant.tenant.id)
      .set("Accept", "application/x-www-form-urlencoded")
      .send()
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        done();
      });
  });
}
function login(tenant) {
  it("Login TenantAdmin " + tenant.id , function(done) {
    api
      .post("/access/authenticate")
      .set("Accept", "application/x-www-form-urlencoded")
      .send({
        username: tenant.user.username,
        password:
          "f1CyVthmD0Pz7mA1kZyDzk39sVCCLpNYJazGs8QFtykWx98YJYOgmGzcAWPArH9tUz6iMVdONbqAddxSdZ2PAWVXKJzC9mn7uMTAJ9jfjZwH12IG+KEUduNCUcDJ2EfQQYCsQ4mTXJFZKFFamV6hwJdqrJxb5Kpzqj15MZu1X41OYJSOmVYmUH6wrqIf1QR+kTrBrxWDoFl5myw0/OWzU+iXZBaWdE1wE0OQB6LGW73G0ptW8S4QT+olapJ6tsOkU+eU+ZrOmkpt5cgQCx2sFxFv5milGOyT7dTcpEtNjB3/G1Hg/oo0ePCxSe4SFgTbQ1P9yKF8rNGTuBeHt7qAag=="
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        tenant.token = res.body.data.authResult.token;
        tenant.cookies = res.header["set-cookie"];
        done();
      });
  });
}
function createTenant(tenant) {
  it("Create Tenant" + tenant.id, function(done) {
    api
      .put("/catalog/tenant")
      .set("Accept", "application/x-www-form-urlencoded")
      .send({
        tenant: tenant.tenant,
        user: tenant.user
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.status).to.equal(0);
        tenant.tenant = res.body.data.tenant;
        tenant.user = res.body.data.user;
        done();
      });
  });
}
