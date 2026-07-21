// Rule Group files
const    components = require('./grammar/components');
const         ports = require('./grammar/ports');
const      topology = require('./grammar/topology');
const state_machine = require('./grammar/state_machine.js');
const         types = require('./grammar/types');
const   expressions = require('./grammar/expressions');
const      literals = require('./grammar/literals');
const         names = require('./grammar/names');

// The grammar rules to export
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
        $.abstract_type,
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
        $.dictionary_definition,
        $.interface_definition,
      ),
      optional($.post_annotation),
    ),

    /*
     *
     */
    module_definition: $ => seq(
      'module',
      field('name', $.identifier),
      '{',
      repeat($._member),
      '}',
    ),

    /*
     *
     */
    import_definition: $ => seq(
      'import',
      field('path', $.qualified_identifier),
      optional(';'),
    ),
    
    // ---------- Comments / annotations ----------
    
    /*
     *
     */
    comment: $ => /#[^\n]*/,
   
    /*
     *
     */
    pre_annotation: $ => /@[^<\n][^\n]*/,
   
    /*
     *
     */
    post_annotation: $ => /@<[^\n]*/,

    // Included Language Rules Located In Other Files
    ...components(),
    ...ports(),
    ...topology(),
    ...state_machine(),
    ...types(),
    ...expressions(),
    ...literals(),
    ...names(),
 
  },
});
