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
        $.telemetry_packet_set_specifier,
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

    /*
     * telemetry packets identifier { telemetry-packet-group-member-sequence } [omit { telemetry-channel-identifier-sequence }]
     */
    telemetry_packet_set_specifier: $ => seq(
      'telemetry',
      'packets',
      $.identifier,
      repeat(choice(
        seq( '{', repeat(choice( seq($.telemetry_packet_specifier,optional(','),optional($.post_annotation)), $.pre_annotation, seq('include',$.string_literal),)), '}'),
        seq( 'omit', $.telemetry_packet_member_sequence,),
      )),
    ),

    /*
     *  packet identifier [id expression] group expression { telemetry-packet-memeber-sequence }
     */
    telemetry_packet_specifier: $ => seq(
      'packet',
      $.identifier,
      optional(seq('id',$.number)),
      seq('group',$.number),
      $.telemetry_packet_member_sequence,
    ),

    /*
     *
     */
    telemetry_packet_member_sequence: $ => seq(
      '{',
        repeat(seq(optional($.pre_annotation),$.qualified_identifier)),
        repeat(seq('include',$.string_literal)),
      '}',
    ),

// END OF TOPOLOGY EXPORT MODULE
});
