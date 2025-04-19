const { DateTime } = require("luxon");
//console.log(DateTime.fromHTTP('Sun, 06 Nov 1994 08:49:37 GMT'));
let c = DateTime.fromMillis("1542674993410");
console.log(c);
if (c.invalid) {
    console.log("Invalid: " + c.invalid);
}
console.log("\n\n")
