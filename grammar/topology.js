module.exports = ($) => ({
    /*
     *
     */
    topology_definition: $ => seq(
      'topology',
      field('name', $.identifier),
      '{',
      repeat($._topology_member),
      '}',
    ),

    /*
     *
     */
    _topology_member: $ => seq(
      repeat($.pre_annotation),
      choice(
        $.topology_import_specifier,
        $.instance_specifier,
        $.connection_graph_specifier,
        $.pattern_graph_specifier,
      ),
      optional($.post_annotation),
    ),

    /*
     *
     */
    topology_import_specifier: $ => seq('import', $.qualified_identifier),

    /*
     *
     */
    instance_specifier: $ => seq('instance', $.qualified_identifier),

    /*
     *
     */
    connection_graph_specifier: $ => seq(
      'connections',
      optional($.identifier),
      '{',
      repeat($.connection),
      '}',
    ),

    /*
     *
     */
    pattern_graph_specifier: $ => seq(
      choice(
        'command',
        'event',
        'health',
        'param',
        'telemetry',
        seq('text','event'),
        'time'
      ),
      'connections',
      'instance',
      $.qualified_identifier,
    ),

    /*
     *
     */
    connection: $ => seq(
      optional('unmatched'),
      $.port_instance_identifier,
      '->',
      $.port_instance_identifier,
      optional(';'),
    ),

    /*
     *
     */
    port_instance_identifier: $ => seq(
      $.qualified_identifier,
      optional(seq('[', $._expression, ']')),
    ),

// END OF TOPOLOGY EXPORT MODULE
});
