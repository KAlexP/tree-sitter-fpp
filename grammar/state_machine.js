module.exports = ($) => ({

  /*
   *    State Machine Definition
   *
   *    Syntax (things in [] are optional)
   *
   *     state machine identifier [{state-machine-member-sequence}] 
   */
    state_machine_definition: $ => seq(
      'state', 'machine',
      optional(
        choice(
          seq(
            field('name', $.identifier),
            '{',
            repeat($._state_machine_member),
            '}',
          ),
          field('name', $.identifier), 
        )
      ),
    ),

    /*
     *
     */
    _state_machine_member: $ => seq(
      repeat($.pre_annotation),
      choice(
        $.initial_transition_specifier,
        $.transition_specifier,
        $.state_definition,
        $.choice_definition,
        $.signal_definition,
        $.action_definition,
        $.guard_definition,
      ),
      optional($.post_annotation),
    ),

    /*
     *
     */
    initial_transition_specifier: $ => seq(
      'initial', 
      optional(seq( 
        'do', 
        $.action_list
      )),
      'enter',
      $.qualified_identifier,
      optional(';')
    ),

    /*
     *
     */
    transition_specifier: $ => prec(1,seq(
      field('on',$.reserved_word),
      field('signal', $.identifier),
      optional(seq(field('do',$.reserved_word),
        $.action_list
      )),
      field('enter',$.reserved_word),
      field('state',$.identifier)
    )),

    /*
     *
     */
    signal_definition: $ => prec(1,seq('signal', $.identifier, optional(seq(':', $.type_name)), optional(';'))),

    /*
     *
     */
    action_definition: $ => prec(1,seq('action', $.identifier, optional(seq(':', $.type_name)), optional(';'))),

    /*
     *
     */
    guard_definition: $ => prec(1,seq('guard', $.identifier, optional(seq(':', $.type_name)), optional(';'))),

    /*
     *
     */
    state_definition: $ => prec(1,seq(
      'state', $.identifier,
      '{',
      repeat($._state_member),
      '}',
      optional(';'),
    )),

    /*
     *
     */
    _state_member: $ => choice(
      $.entry_specifier,
      $.exit_specifier,
      $.transition_specifier,
      $.state_definition,
      $.choice_definition,
    ),

    /*
     *
     */
    entry_specifier: $ => seq('entry', 'do', '{', $.action_list, '}'),

    /*
     *
     */
    exit_specifier: $ => seq('exit', 'do','{', repeat($.action_use), '}'),

    /*
     *
     */
    action_use: $ => seq($.identifier, optional(';')),

    /*
     *
     */
    action_list: $ => seq(choice(seq( '{', $.identifier, optional( repeat(seq(',',$.identifier))), '}'), $.identifier)),

    /*
     *
     */
    choice_definition: $ => prec(1,seq(
      'choice', $.identifier,
      '{',
      'if', $.identifier,
      optional(seq('do', '{', repeat($.action_use), '}')),
      'enter', $.qualified_identifier,
      'else',
      optional(seq('do', '{', repeat($.action_use), '}')),
      'enter', $.qualified_identifier,
      '}',
      optional(';'),
    )),

// END OF STATE MACHINE EXPORT RULES
});
