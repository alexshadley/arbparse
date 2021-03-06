"use strict"

// Adding a Parser (grammar only, only reads the input without any actions).
// Using the Token Vocabulary defined in the previous step.

const scriptLexer = require("./lexing")
const Parser = require("chevrotain").Parser
const tokenVocabulary = scriptLexer.tokenVocabulary

// individual imports, prefer ES6 imports if supported in your runtime/transpiler...
const Identifier = tokenVocabulary.Identifier
const Integer = tokenVocabulary.Integer
const Boolean = tokenVocabulary.Boolean
const Equivalence = tokenVocabulary.Equivalence
const Assignment = tokenVocabulary.Assignment
const Addition = tokenVocabulary.Addition
const Subtraction = tokenVocabulary.Subtraction
const Multiplication = tokenVocabulary.Multiplication
const LogicalOR = tokenVocabulary.LogicalOR
const LogcialAND = tokenVocabulary.LogicalAND
const LParen = tokenVocabulary.LParen
const RParen = tokenVocabulary.RParen

// ----------------- parser -----------------
class ScriptParser extends Parser {
    // A config object as a constructor argument is normally not needed.
    // Our tutorial scenario requires a dynamic configuration to support step3 without duplicating code.
    constructor(config) {
        super(tokenVocabulary, config)

        // for conciseness
        const $ = this

        $.RULE("assignmentStatement", () => {
            $.CONSUME(Identifier)
            $.CONSUME(Assignment)
            $.SUBRULE($.expression)
        })

        $.RULE("expression", () => {
            $.SUBRULE($.subtExpression)
        })

        $.RULE("subtExpression", () => {
            $.SUBRULE($.addExpression)
            $.MANY( () => {
                $.CONSUME(Subtraction)
                $.SUBRULE2($.addExpression)
            })
        })

        $.RULE("addExpression", () => {
            $.SUBRULE($.multExpression)
            $.MANY( () => {
                $.CONSUME(Addition)
                $.SUBRULE2($.multExpression)
            })
        })

        $.RULE("multExpression", () => {
            $.SUBRULE($.atomicExpression)
            $.MANY( () => {
                $.CONSUME(Multiplication)
                $.SUBRULE2($.atomicExpression)
            })
        })

        $.RULE("atomicExpression", () => {
            $.OR([
                { ALT: () => {
                    $.CONSUME(LParen)
                    $.SUBRULE($.expression)
                    $.CONSUME(RParen)
                }},
                { ALT: () => $.CONSUME(Integer) },
                { ALT: () => $.CONSUME(Identifier) },
            ])
        })


        // very important to call this after all the rules have been defined.
        // otherwise the parser may not work correctly as it will lack information
        // derived during the self analysis phase.
        this.performSelfAnalysis()
    }
}

// We only ever need one as the parser internal state is reset for each new input.
const parserInstance = new ScriptParser()

module.exports = {
    parserInstance: parserInstance,

    ScriptParser: ScriptParser,

    parse: function(inputText) {
        const lexResult = scriptLexer.lex(inputText)

        // ".input" is a setter which will reset the parser's internal's state.
        parserInstance.input = lexResult.tokens

        // No semantic actions so this won't return anything yet.
        parserInstance.assignmentStatement()

        if (parserInstance.errors.length > 0) {
            throw Error(
                "Sad sad panda, parsing errors detected!\n" +
                    parserInstance.errors[0].message
            )
        }
    }
}