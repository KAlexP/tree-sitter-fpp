module.exports = ($) => ({   

  /*
   *
   */
  component_definition: $ => seq(
      choice('active', 'passive', 'queued'),
      'component',
      field('name', $.identifier),
      '{',
      repeat($._component_member),
      '}',
      optional(';'),
    ),

  /*
   *
   */
    _component_member: $ => seq(
      repeat($.pre_annotation),
      choice(
        $.import_definition,
        $.general_port_specifier,
        $.special_port_specifier,
        $.command_specifier,
        $.event_specifier,
        $.param_specifier,
        $.telemetry_specifier,
        $.internal_port_specifier,
        $.state_machine_instance_specifier,
        $.state_machine_definition,
        $.constant_definition,
        $.type_alias_definition,
        $.array_definition,
        $.struct_definition,
        $.enum_definition,
        $.port_definition,
        $.record_definition,
        $.container_definition,
        $.port_match,
      ),
      optional($.post_annotation),
    ),

  /*
   *
   */
    port_match: $ => seq(
      'match',
      $.identifier,
      'with',
      $.identifier,
    ),

  /*
   *
   */
    command_specifier: $ => seq(
      optional(choice('sync', 'async', 'guarded')),
      'command',
      $.identifier,
      optional(seq('(', optional($.formal_param_sequence), ')')),
      repeat($.command_modifier_clause),
      optional(';'),
    ),

  /*
   *
   */
    command_modifier_clause: $ => choice(
      seq('opcode', $._expression),
      $.queue_full_clause,
    ),

  /*
   *
   */
    event_specifier: $ => seq(
      'event',
      $.identifier,
      optional(seq(
        '(',
        repeat(seq(
          $.identifier,
          ':',
          $.type_name,
          optional($.post_annotation),
        )),
        ')'
      )),
      repeat($.event_modifier_clause),
      optional(';'),
    ),

  /*
   *
   */
    event_modifier_clause: $ => choice(
        seq('severity', $.severity),
        seq('id', $._expression),
        seq('format', $.string_literal),
        seq('throttle', $._expression,
          optional(seq('every',$.struct_value)),
        ),
    ),

  /*
   *
   */
    severity: $ => choice(
      seq('activity', choice('low', 'high')),
      seq('warning', choice('low', 'high')),
      'diagnostic',
      'fatal',
      'command',
    ),

  /*
   *
   */
    param_specifier: $ => seq(
      optional('external'),
      'param',
      $.identifier,
      ':',
      $.type_name,
      repeat($.param_modifier_clause),
      optional(';'),
    ),

  /*
   *
   */
    param_modifier_clause: $ => choice(
      seq('default', $._expression),
      seq('id', $._expression),
      seq('set', 'opcode', $._expression),
      seq('save', 'opcode', $._expression),
    ),

  /*
   *
   */
    telemetry_specifier: $ => seq(
      'telemetry',
      $.identifier,
      ':',
      $.type_name,
      repeat($.telemetry_modifier_clause),
      optional(';'),
    ),

  /*
   *
   */
    telemetry_modifier_clause: $ => choice(
      seq('id', $._expression),
      seq('update', choice('always', seq('on', 'change'))),
      seq('format', $.string_literal),
      seq('low', $.limit_sequence),
      seq('high', $.limit_sequence),
    ),

  /*
   *
   */
    limit_sequence: $ => seq('{', $.limit, repeat(seq(',', $.limit)), '}'),

  /*
   *
   */
    limit: $ => seq(choice('yellow', 'orange', 'red'), $._expression),

  /*
   *
   */
    internal_port_specifier: $ => seq(
      'internal',
      'port',
      $.identifier,
      optional(seq('(', optional($.formal_param_sequence), ')')),
      repeat($.queue_full_clause),
      optional(';'),
    ),

  /*
   *
   */
    state_machine_instance_specifier: $ => seq(
      optional(choice('sync', 'async', 'guarded')),
      'state', 'machine', 'instance',
      $.identifier,
      ':',
      $.qualified_identifier,
      repeat($.queue_full_clause),
      optional(';'),
    ),

  /*
   *
   */
    component_instance_definition: $ => seq(
      'instance',
      $.identifier,
      ':',
      $.qualified_identifier,
      'base', 'id', $._expression,
      repeat(choice(
        $.pre_annotation,
        seq('type', $.string_literal),
        seq('at', $.string_literal),
        seq('queue', 'size', $._expression),
        seq('stack', 'size', $._expression),
        seq('priority', $._expression),
        seq('cpu', $._expression),
      )),
      optional(seq('{', repeat($.init_specifier), '}')),
    ),

  /*
   *
   */
    init_specifier: $ => seq(
      'phase',
      choice($.identifier, $.number),
      $.string_literal,
      optional(';'),
    ),

  /*
   *
   */
    record_definition: $ => prec.right(seq(
      'product',
      'record',
      $.identifier,
      ':',
      $.type_name,
      optional('array'),
      optional(seq(
        'id',
        $.number
      )),
    )),

  /*
   *
   */
    container_definition: $ => seq( 
    'product', 
    'container',
      $.identifier,
      optional(seq(
        'id',
        $.number,
      )),
      optional(
        seq(
          'default','priority',$.number
        )
      ),
    ),

// END OF COMPONENT EXPORT RULES
});
