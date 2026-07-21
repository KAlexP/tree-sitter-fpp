module.exports = ($) => ({
    /*
     *
     */
    number: $ => token(choice(
      /0x[0-9a-fA-F]+/,
      /[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?/
    )),
    
    /*
     *
     */
    logic: $ => choice('true', 'false'),

    /*
     *
     */
    string_literal: $ => choice(
      // Multi-line string
      /"""[\s\S]*?"""/,                            
      seq('"', repeat(choice(/[^"\\\n]+/, /\\./)), '"'),
    ),

// END OF LITERALS EXPORT RULES
});
