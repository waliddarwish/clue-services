var should = require("chai").should(),
    expect = require("chai").expect,
    supertest = require("supertest"),
    api = supertest("http://localhost:8240");

describe("Visualization test", function () {
    var tenant = {};
    var user = {};
    var token = "";
    var cookies;
    var visualizationBookId = "";
    var visualizationPageId = "";

    it("Create Tenant", function (done) {
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

    it("should return 200 and create a connection for user", function (done) {
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
            .end(function (err, res) {
                expect(res.body.status).to.equal(0);
                connectionId = res.body.data.id;
                done();
            });
    });

    it("Create Visualization Book", function (done) {
        api
            .put("/clue/visualization-book")
            .set("Accept", "application/x-www-form-urlencoded")
            .set("passport", token)
            .set("Cookie", cookies)
            .send({
                description: "Awesome Visualization Book",
                clueModelId: "123",
                name: "Awesome VisualizationBook"
            })
            .expect("Content-Type", /json/)
            .expect(200)
            .end(function (err, res) {
                expect(res.body.status).to.equal(0);
                visualizationBookId = res.body.data.id;
                done();
            });
    });

    it("Create Visualization Page", function (done) {
        api
            .put("/clue/visualization-page")
            .set("Accept", "application/x-www-form-urlencoded")
            .set("passport", token)
            .set("Cookie", cookies)
            .send({
                description: "Awesome Visualization Page",
                visualizationBookId: visualizationBookId,
                name: "Awesome Visualization Page",
                title: "Page 1"
            })
            .expect("Content-Type", /json/)
            .expect(200)
            .end(function (err, res) {
                expect(res.body.status).to.equal(0);
                visualizationPageId = res.body.data.id;
                done();
            });
    });

    it("Get Visualization Page - By ID", function (done) {
        api
            .get("/clue/visualization-page/" + visualizationPageId)
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

    it("Get Visualization Pages - By Book Id", function (done) {
        api
            .get("/clue/visualization-book/" + visualizationBookId + '/vispage')
            .set("Accept", "application/x-www-form-urlencoded")
            .set("passport", token)
            .set("Cookie", cookies)
            .send()
            .expect("Content-Type", /json/)
            .expect(200)
            .end(function (err, res) {
                expect(res.body.status).to.equal(0);
                // expect(res.body.data.length).to.equal(1);
                done();
            });
    });

    it("Get Visualization Book - By ID", function (done) {
        api
            .get("/clue/visualization-book/" + visualizationBookId)
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

    it("Search Visualization Books", function (done) {
        api
            .post("/search/visualizations/1/1")
            .set("Accept", "application/x-www-form-urlencoded")
            .set("passport", token)
            .set("Cookie", cookies)
            .send()
            .expect("Content-Type", /json/)
            .expect(200)
            .end(function (err, res) {
                expect(res.body.status).to.be.equal(0);
                done();
            });
    });

    it("Search Visualization Pages", function (done) {
        api
            .post("/search/visualizationPages/1/1")
            .set("Accept", "application/x-www-form-urlencoded")
            .set("passport", token)
            .set("Cookie", cookies)
            .send()
            .expect("Content-Type", /json/)
            .expect(200)
            .end(function (err, res) {
                expect(res.body.status).to.be.equal(0);
                done();
            });
    });

    it("Get Recent Visualization Books", function (done) {
        api
            .get("/clue/visualization-book/recent/3")
            .set("Accept", "application/x-www-form-urlencoded")
            .set("passport", token)
            .set("Cookie", cookies)
            .send()
            .expect("Content-Type", /json/)
            .expect(200)
            .end(function (err, res) {
                expect(res.body.status).to.be.equal(0);
                done();
            });
    });



    it("Delete Visualization Book", function (done) {
        api
            .del("/clue/visualization-book/" + visualizationBookId)
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

    it("Delete Visualization Page", function (done) {
        api
            .del("/clue/visualization-page/" + visualizationPageId)
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

    it("Delete Tenant" + tenant.id, function (done) {
        api
            .delete("/catalog/tenant/" + tenant.id)
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
