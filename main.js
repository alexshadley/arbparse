const lex = require("./lexing").lex

const inputText = "True == Truething"
const lexingResult = lex(inputText)
console.log(JSON.stringify(lexingResult, null, "\t"))