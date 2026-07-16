module.exports = grammar({
  name: 'fpp',
  word: $ => $._identifier_name,
  extras: $ => [
    /\s/,
    /\\[ \t]*\r?\n/,
    $.comment,
  ],
  conflicts: $ => [
    [$.component_instance_definition],
  ],
  rules: {
    source_file: $ => repeat($._member),

    _member: $ => seq(
      repeat($.pre_annotation),
      choice(
        $.constant_definition,
        $.module_definition,
        $.type_alias_definition,
        $.array_definition,
        $.struct_definition,
        $.enum_definition,
        $.port_definition,
        $.component_definition,
        $.component_instance_definition,
        $.topology_definition,
        $.state_machine_definition,
      ),
      optional($.post_annotation),
    ),

    // ---------- Definitions ----------
    constant_definition: $ => seq(
      'constant',
      field('name', $.identifier),
      '=',
      $._expression,
      optional(';'),
    ),
    module_definition: $ => seq(
      'module',
      field('name', $.identifier),
      '{',
      repeat($._member),
      '}',
    ),

    import_definition: $ => seq(
      'import',
      field('path', $.qualified_identifier),
      optional(';'),
    ),

    type_alias_definition: $ => seq(
      'type',
      field('name', $.identifier),
      '=',
      $.type_name,
      optional(';'),
    ),

    array_definition: $ => seq(
      optional('dictionary'),
      'array',
      field('name', $.identifier),
      '=',
      '[', $._expression, ']',
      $.type_name,
      optional(seq('default', $._expression)),
      optional(seq('format', $.string_literal)),
      optional(';'),
    ),

    struct_definition: $ => seq(
      optional('dictionary'),
      'struct',
      field('name', $.identifier),
      '{',
      $.struct_member_sequence,
      '}',
      optional(seq('default', $.struct_value)),
      optional(';'),
    ),

    // element sequence: comma is the optional terminator; a newline
    // (handled by extras) can stand in for it between elements.
    struct_member_sequence: $ => seq(
      $.struct_member,
      repeat(seq(optional(','), $.struct_member)),
      optional(','),
    ),

    struct_member: $ => seq(
      repeat($.pre_annotation),
      $.identifier,
      ':',
      $.type_name,
      optional(seq('format', $.string_literal)),
      optional($.post_annotation),
    ),

    enum_definition: $ => seq(
      optional('dictionary'),
      'enum',
      field('name', $.identifier),
      optional(seq(':', $.type_name)),
      '{',
      $.enumerator_sequence,
      '}',
      optional(seq('default', $._expression)),
      optional(';'),
    ),

    enumerator_sequence: $ => seq(
      $.enumerator,
      repeat(seq(optional(','), $.enumerator)),
      optional(','),
    ),

    enumerator: $ => seq(
      repeat($.pre_annotation),
      $.identifier,
      optional(seq('=', $._expression)),
      optional($.post_annotation),
    ),

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

    formal_param_sequence: $ => seq(
      $.formal_param,
      repeat(seq(optional(','), $.formal_param)),
      optional(','),
    ),

    formal_param: $ => seq(
      repeat($.pre_annotation),
      optional('ref'),
      $.identifier,
      ':',
      $.type_name,
      optional($.post_annotation),
    ),

    // ---------- Components ----------

    component_definition: $ => seq(
      choice('active', 'passive', 'queued'),
      'component',
      field('name', $.identifier),
      '{',
      repeat($._component_member),
      '}',
      optional(';'),
    ),

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
      ),
      optional($.post_annotation),
    ),

    // sync/async/guarded input port, or an output port. Formal-param
    // style declaration: name : [array-size] Type, plus queue-full
    // behavior for async ports.
    general_port_specifier: $ => seq(
      optional(choice('sync', 'async', 'guarded')),
      choice('input', 'output'),
      'port',
      $.identifier,
      ':',
      optional(seq('[', $._expression, ']')),
      choice($.type_name, 'serial'),
      repeat($.queue_full_clause),
      optional(';'),
    ),

    // priority and queue-full behavior, shared by every async-capable
    // port/command specifier below.
    queue_full_clause: $ => choice(
      seq('priority', $._expression),
      choice('assert', 'block', 'drop'),
    ),

    // BEST EFFORT: the twelve special-port kinds (command recv/reg/resp,
    // event, param get/set, product get/recv/request/send, telemetry,
    // text event, time get) each bind to a fixed port signature defined
    // by the framework rather than a user-supplied type.
    special_port_kind: $ => choice(
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
    ),

    special_port_specifier: $ => seq(
      $.special_port_kind,
      'port',
      $.identifier,
      repeat($.queue_full_clause),
      optional(';'),
    ),

    command_specifier: $ => seq(
      optional(choice('sync', 'async', 'guarded')),
      'command',
      $.identifier,
      optional(seq('(', optional($.formal_param_sequence), ')')),
      repeat($.command_modifier_clause),
      optional(';'),
    ),

    command_modifier_clause: $ => choice(
      seq('opcode', $._expression),
      $.queue_full_clause,
    ),

    event_specifier: $ => seq(
      'event',
      $.identifier,
      optional(seq('(', optional($.formal_param_sequence), ')')),
      repeat($.event_modifier_clause),
      optional(';'),
    ),

    event_modifier_clause: $ => choice(
      seq('severity', $.severity),
      seq('id', $._expression),
      seq('format', $.string_literal),
      seq('throttle', $._expression),
    ),

    severity: $ => choice(
      seq('activity', choice('low', 'high')),
      seq('warning', choice('low', 'high')),
      'diagnostic',
      'fatal',
      'command',
    ),

    param_specifier: $ => seq(
      'param',
      $.identifier,
      ':',
      $.type_name,
      repeat($.param_modifier_clause),
      optional(';'),
    ),

    param_modifier_clause: $ => choice(
      seq('default', $._expression),
      seq('id', $._expression),
      seq('set', 'opcode', $._expression),
      seq('save', 'opcode', $._expression),
    ),

    telemetry_specifier: $ => seq(
      'telemetry',
      $.identifier,
      ':',
      $.type_name,
      repeat($.telemetry_modifier_clause),
      optional(';'),
    ),

    telemetry_modifier_clause: $ => choice(
      seq('id', $._expression),
      seq('update', choice('always', 'on', 'change')),
      seq('format', $.string_literal),
      seq('low', $.limit_sequence),
      seq('high', $.limit_sequence),
    ),

    limit_sequence: $ => seq('{', $.limit, repeat(seq(',', $.limit)), '}'),

    limit: $ => seq(choice('yellow', 'orange', 'red'), $._expression),

    internal_port_specifier: $ => seq(
      'internal',
      'port',
      $.identifier,
      optional(seq('(', optional($.formal_param_sequence), ')')),
      repeat($.queue_full_clause),
      optional(';'),
    ),

    state_machine_instance_specifier: $ => seq(
      optional(choice('sync', 'async', 'guarded')),
      'state', 'machine', 'instance',
      $.identifier,
      ':',
      $.qualified_identifier,
      repeat($.queue_full_clause),
      optional(';'),
    ),

    // ---------- Component instances ----------

    component_instance_definition: $ => seq(
      'instance',
      $.identifier,
      ':',
      $.qualified_identifier,
      'base', 'id', $._expression,
      repeat($.instance_modifier_clause),
      optional(seq('{', repeat($.init_specifier), '}')),
      optional(';'),
    ),
    instance_modifier_clause: $ => choice(
      seq('type', $.string_literal),
      seq('at', $.string_literal),
      seq('queue', 'size', $._expression),
      seq('stack', 'size', $._expression),
      seq('priority', $._expression),
      seq('cpu', $._expression),
    ),

    // BEST EFFORT: init specifiers bind C++ init-code phases to a
    // named/numbered phase; verify exact phase-name grammar in spec.
    init_specifier: $ => seq(
      'phase',
      choice($.identifier, $.number),
      $.string_literal,
      optional(';'),
    ),

    // ---------- Topologies ----------

    topology_definition: $ => seq(
      'topology',
      field('name', $.identifier),
      '{',
      repeat($._topology_member),
      '}',
    ),

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

    topology_import_specifier: $ => seq('import', $.qualified_identifier, optional(';')),

    instance_specifier: $ => seq('instance', $.qualified_identifier, optional(';')),

    connection_graph_specifier: $ => seq(
      'connections',
      optional($.identifier),
      '{',
      repeat($.connection),
      '}',
    ),
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

    connection: $ => seq(
      optional('unmatched'),
      $.port_instance_identifier,
      '->',
      $.port_instance_identifier,
      optional(';'),
    ),

    port_instance_identifier: $ => seq(
      $.qualified_identifier,
      optional(seq('[', $._expression, ']')),
    ),

    state_machine_definition: $ => seq(
      'state', 'machine',
      field('name', $.identifier),
      '{',
      repeat($._state_machine_member),
      '}',
      optional(';'),
    ),

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
    transition_specifier: $ => prec(1,seq(
      field('on',$.reserved_word),
      field('signal', $.identifier),
      optional(seq(field('do',$.reserved_word),
        $.action_list
      )),
      field('enter',$.reserved_word),
      field('state',$.identifier)
    )),

    signal_definition: $ => prec(1,seq('signal', $.identifier, optional(seq(':', $.type_name)), optional(';'))),

    action_definition: $ => prec(1,seq('action', $.identifier, optional(seq(':', $.type_name)), optional(';'))),

    guard_definition: $ => prec(1,seq('guard', $.identifier, optional(seq(':', $.type_name)), optional(';'))),

    state_definition: $ => prec(1,seq(
      'state', $.identifier,
      '{',
      repeat($._state_member),
      '}',
      optional(';'),
    )),

    _state_member: $ => choice(
      $.entry_specifier,
      $.exit_specifier,
      $.transition_specifier,
      $.state_definition,
      $.choice_definition,
    ),

    entry_specifier: $ => seq('entry', 'do', '{', $.action_list, '}'),

    exit_specifier: $ => seq('exit', 'do','{', repeat($.action_use), '}'),

    action_use: $ => seq($.identifier, optional(';')),

    action_list: $ => seq(choice(seq( '{', $.identifier, optional( repeat(seq(',',$.identifier))), '}'), $.identifier)),

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

    // ---------- Types ----------

    type_name: $ => choice(
      $.primitive_type,
      $.string_type,
      $.qualified_identifier,
    ),

    // 'string' optionally carries a max-size expression: string size 40
    string_type: $ => prec.right(seq('string', optional(seq('size', $._expression)))),

    primitive_type: $ => choice(
      'F32', 'F64', 'I16', 'I32', 'I64', 'I8',
      'U16', 'U32', 'U64', 'U8', 'bool',
    ),

    // ---------- Expressions ----------

    _expression: $ => choice(
      $.qualified_identifier,   // name expression: a, or A.a
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

    paren_expression: $ => seq('(', $._expression, ')'),

    unary_expression: $ => prec(4, seq('-', $._expression)),

    binary_expression: $ => choice(
      prec.left(3, seq($._expression, choice('*', '/'), $._expression)),
      prec.left(2, seq($._expression, choice('+', '-'), $._expression)),
    ),

    // NOTE: there's no separate "member access" expression. FPP doesn't
    // distinguish "module-qualified name" (A.a) from "struct field
    // access" (structVal.y) at the syntax level -- both are just a
    // dotted qualified_identifier; the distinction is resolved later
    // during semantic analysis, not by the grammar. Keeping a separate
    // member_expression rule here would just create a real ambiguity
    // with qualified_identifier over the same '.' token.

    index_expression: $ => prec.left(5, seq($._expression, '[', $._expression, ']')),

    sizeof_expression: $ => seq('sizeof', '(', $._expression, ')'),

    array_value: $ => seq(
      '[',
      optional(seq(
        $._expression,
        repeat(seq(optional(','), $._expression)),
        optional(','),
      )),
      ']',
    ),

    struct_value: $ => seq(
      '{',
      $.struct_member_value,
      repeat(seq(optional(','), $.struct_member_value)),
      optional(','),
      '}',
    ),

    struct_member_value: $ => seq($.identifier, '=', $._expression),

    // ---------- Literals ----------

    number: $ => token(choice(
      /0x[0-9a-fA-F]+/,
      /[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?/
    )),
    
    logic: $ => choice('true', 'false'),

    string_literal: $ => choice(
      /"""[\s\S]*?"""/,                            // multiline
      seq('"', repeat(choice(/[^"\\\n]+/, /\\./)), '"'),
    ),

    // ---------- Names ----------

    qualified_identifier: $ => seq(
      $.identifier,
      repeat(seq('.', $.identifier)),
    ),

    // The plain-name token. This has to be its own terminal rule (pure
    // regex, no references to other named rules) because it's the one
    // pointed to by `word` above -- tree-sitter uses it to resolve
    // keyword-vs-identifier lexing conflicts.
    _identifier_name: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    // '$' escapes a reserved word so it can be used as a name, e.g. $type.
    // It has no effect (and isn't required) on a non-reserved identifier.
    identifier: $ => choice(
      $._identifier_name,
      seq('$', $.reserved_word),
    ),

    reserved_word: $ => choice(
      'F32', 'F64', 'I16', 'I32', 'I64', 'I8', 'U16', 'U32', 'U64', 'U8',
      'action', 'active', 'activity', 'always', 'array', 'assert', 'async', 'at',
      'base', 'block', 'bool', 'change', 'choice', 'command', 'component', 'connections',
      'constant', 'container', 'cpu', 'default', 'diagnostic', 'dictionary', 'do',
      'drop', 'else', 'enter', 'entry', 'enum', 'event', 'every', 'exit', 'external',
      'false', 'fatal', 'format', 'get', 'group', 'guard', 'guarded', 'health', 'high',
      'hook', 'id', 'if', 'import', 'include', 'initial', 'input', 'instance', 'interface',
      'internal', 'locate', 'low', 'machine', 'match', 'module', 'omit', 'on', 'opcode',
      'orange', 'output', 'packet', 'packets', 'param', 'passive', 'phase', 'port',
      'priority', 'product', 'queue', 'queued', 'record', 'recv', 'red', 'ref', 'reg',
      'request', 'resp', 'save', 'send', 'serial', 'set', 'severity', 'signal', 'size',
      'sizeof', 'stack', 'state', 'string', 'struct', 'sync', 'telemetry', 'text', 'throttle',
      'time', 'topology', 'true', 'type', 'unmatched', 'update', 'warning', 'with', 'yellow',
    ),

    // ---------- Comments / annotations ----------

    comment: $ => /#[^\n]*/,

    // Pre-annotation, attaches to the definition that follows it.
    pre_annotation: $ => /@[^<\n][^\n]*/,

    // Post-annotation, trails a definition on the same line.
    post_annotation: $ => /@<[^\n]*/,
  },
});
