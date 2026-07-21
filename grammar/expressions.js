module.exports = ($) => ({
   
    /*
     *
     */
    _expression: $ => choice(
      $.qualified_identifier,   
      $.number,
      $.logic,
      $.string_literal,
      $.array_value,
      $.struct_value,
      $.unary_expression,
      $.binary_expression,
      $.paren_expression,
      $.index_expression,
      $.sizeof_expression,
    ),

    /*
     *
     */
    paren_expression: $ => seq('(', $._expression, ')'),

    /*
     *
     */
    unary_expression: $ => prec(4, seq('-', $._expression)),

    /*
     *
     */
    binary_expression: $ => choice(
      prec.left(3, seq($._expression, choice('*', '/'), $._expression)),
      prec.left(2, seq($._expression, choice('+', '-'), $._expression)),
    ),

    /*
     *
     */
    index_expression: $ => prec.left(5, seq($._expression, '[', $._expression, ']')),

    /*
     *
     */
    sizeof_expression: $ => seq('sizeof', '(', $._expression, ')'),

    /*
     *
     */
    array_value: $ => seq(
      '[',
      optional(seq(
        $._expression,
        repeat(seq(optional(','), $._expression)),
        optional(','),
      )),
      ']',
    ),

    /*
     *
     */
    struct_value: $ => seq(
      '{',
      $.struct_member_value,
      repeat(seq(optional(','), $.struct_member_value)),
      optional(','),
      '}',
    ),

    /*
     *
     */
    struct_member_value: $ => seq($.identifier, '=', $._expression),


  // END OF EXPRESSIONS EXPORT RULES
});
