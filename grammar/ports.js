module.exports = ($) => ({

    /*
     *
     */
    port_definition: $ => seq(
      'port',
      $.qualified_identifier,
      optional(seq(
        '(',
        optional($.formal_param_sequence),
        ')',
      )),
      optional(seq('->', $.type_name)),
      optional(';'),
    ),

    /*
     *
     */
    formal_param_sequence: $ => seq(
      $.formal_param,
      repeat(seq(optional(','), $.formal_param)),
      optional(','),
    ),

    /*
     *
     */
    formal_param: $ => seq(
      repeat($.pre_annotation),
      optional('ref'),
      $.identifier,
      ':',
      $.type_name,
      optional($.post_annotation),
    ),

    /*
     *
     */
      interface_definition: $ => seq(
        'interface',
        $.identifier,
        $._port_interface_member_sequence,
      ),

    _port_interface_member_sequence: $ => seq(
        '{',
        repeat(seq(
          repeat($.pre_annotation),
          choice(
            $.general_port_specifier,
            $.special_port_specifier,
          ),
        )),
        '}',
      ),

    /*
     *
     */
    general_port_specifier: $ => seq(
      optional(choice('sync', 'async', 'guarded')),
      choice('input', 'output'),
      'port',
      $.identifier,
      ':',
      optional(seq('[', $._expression, ']')),
      choice($.type_name, 'serial'),
      repeat($.queue_full_clause),
    ),
    
    /*
     *
     */
    queue_full_clause: $ => choice(
      seq('priority', $._expression),
      choice('assert', 'block', 'drop','hook'),
    ),

    /*
     *
     */
    special_port_kind: $ => seq(
      optional(choice('async','sync','guarded')),
      choice(
        seq('command', 'recv'),
        seq('command', 'reg'),
        seq('command', 'resp'),
        'event',
        seq('param', 'get'),
        seq('param', 'set'),
        seq('product', 'get'),
        seq('product', 'recv'),
        seq('product', 'request'),
        seq('product', 'send'),
        'telemetry',
        seq('text', 'event'),
        seq('time', 'get'),
      )
    ),

    /*
     *
     */
    special_port_specifier: $ => seq(
      $.special_port_kind,
      'port',
      $.identifier,
      repeat($.queue_full_clause),
      optional(';'),
    ),


// END OF PORT EXPORT RULES
});
