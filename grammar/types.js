const { trailingCommaSep1 } = require('./utils');

module.exports = ($) => ({
    /*
     * Abstract Type Definitions are similar to templates in c++
     *
     * syntax: type identifier
     *
     */
    abstract_type: $ => seq(
      'type',
      $.qualified_identifier
    ),


    /*
     *
     *  Alias Definition
     *
     *  syntax: [dictionary] type identifier = type name
     */
    type_alias_definition: $ => seq(
      'type',
      field('name', $.identifier),
      '=',
      $.type_name,
      optional(';'),
    ),

    /*
     *  Array Definitions -> an array
     *
     *  syntax: [dictionary] array identifier = [expression] type-name [default expression][format string-literal]
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
     * Constant Definition
     *
     * syntax: [dictionary] constant identifier = expression
     *
     */
    constant_definition: $ => seq(
      'constant',
      field('name', $.identifier),
      '=',
      $._expression,
    ),

    /*
     * This rule takes the optional [dictionary] box from the different options
     * inside the choice() option below to eliminate the optional('dictionary')
     * in each of the rules. Making maintenance easier.
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
     *  Enum Definition
     *
     *  syntax: [dictionary] enum identifier [: type name] {enum-constant-sequence} [default expression]
     *
     */
    enum_definition: $ => seq(
      'enum',
      field('name', $.identifier),
      optional(seq(':', $.type_name)),
      '{',
        trailingCommaSep1($.enumerator),
      '}',
      optional(seq('default', $._expression)),
    ),

    /*
     * Helper rule for enum definition: 
     *
     *    defines what the enum names are and allows pre/post annotations
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
    string_type: $ => prec.right(seq('string', optional(seq('size', $._expression)))),

    /*
     * Struct Definition
     *
     *  syntax: [dictionary] struct identifier { struct-type-member-sequence } [default expression]
     *
     */
    struct_definition: $ => seq(
      'struct',
      field('name', $.identifier),
      '{',
        trailingCommaSep1($.struct_member),
      '}',
      optional(seq('default', $.struct_value)),
    ),

    /*
     *  struct definition helper rule that defines the insides of the {} brackets
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
    type_name: $ => choice(
      $.primitive_type,
      $.string_type,
      $.qualified_identifier,
    ),
  
    /*
     *
     */
    primitive_type: $ => choice(
      'F32', 'F64', 'I16', 'I32', 'I64', 'I8',
      'U16', 'U32', 'U64', 'U8', 'bool',
    ),

  // END OF TYPES EXPORT RULES
});
