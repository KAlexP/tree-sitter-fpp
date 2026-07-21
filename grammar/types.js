module.exports = ($) => ({
    
    /*
     *
     */
    abstract_type: $ => seq(
      'type',
      $.qualified_identifier
    ),

    /*
     *
     */
    constant_definition: $ => seq(
      'constant',
      field('name', $.identifier),
      '=',
      $._expression,
      optional(';'),
    ),

    /*
     *
     */
    type_alias_definition: $ => seq(
      'type',
      field('name', $.identifier),
      '=',
      $.type_name,
      optional(';'),
    ),

    /*
     *
     */
    array_definition: $ => prec.left(seq(
      'array',
      field('name', $.identifier),
      '=',
      '[', $._expression, ']',
      $.type_name,
      optional(seq('default', $._expression)),
      optional(seq('format', $.string_literal)),
      optional(';'),
    )),

    /*
     *
     */
    struct_definition: $ => seq(
      'struct',
      field('name', $.identifier),
      '{',
      $.struct_member_sequence,
      '}',
      optional(seq('default', $.struct_value)),
      optional(';'),
    ),

    /*
     *
     */
    struct_member_sequence: $ => seq(
      $.struct_member,
      repeat(seq(optional(','), $.struct_member)),
      optional(','),
    ),

    /*
     *
     */
    struct_member: $ => seq(
      repeat($.pre_annotation),
      $.identifier,
      ':',
      choice(
        $.type_name, 
        seq(
          '[',
          $._expression,
          ']',
          $.type_name,
        )
      ),
      optional(seq('format', $.string_literal)),
      optional($.post_annotation),
    ),

    /*
     *
     */
    enum_definition: $ => seq(
      'enum',
      field('name', $.identifier),
      optional(seq(':', $.type_name)),
      '{',
      $.enumerator_sequence,
      '}',
      optional(seq('default', $._expression)),
      optional(';'),
    ),

    /*
     *
     */
    enumerator_sequence: $ => seq(
      $.enumerator,
      repeat(seq(optional(','), $.enumerator)),
      optional(','),
    ),

    /*
     *
     */
    enumerator: $ => seq(
      repeat($.pre_annotation),
      $.identifier,
      optional(seq('=', $._expression)),
      optional($.post_annotation),
    ),

    /*
     *
     */
    dictionary_definition: $ => seq(
      'dictionary',
      choice(
        $.type_alias_definition,
        $.array_definition,
        $.constant_definition,
        $.enum_definition,
        $.struct_definition,
      ),
    ),

    /*
     *
     */
    type_name: $ => choice(
      $.primitive_type,
      $.string_type,
      $.qualified_identifier,
    ),

    /*
     *
     */
    string_type: $ => prec.right(seq('string', optional(seq('size', $._expression)))),
  
    /*
     *
     */
    primitive_type: $ => choice(
      'F32', 'F64', 'I16', 'I32', 'I64', 'I8',
      'U16', 'U32', 'U64', 'U8', 'bool',
    ),

  // END OF TYPES EXPORT RULES
});
