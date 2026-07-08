; === Keywords ===
[
  "active"
  "activity"
  "array"
  "assert"
  "action"
  "at"
  "base"
  "block"
  "choice"
  "command"
  "component"
  "connections"
  "constant"
  "cpu"
  "default"
  "diagnostic"
  "dictionary"
  "do"
  "drop"
  "else"
  "enter"
  "entry"
  "enum"
  "event"
  "exit"
  "fatal"
  "format"
  "guard"
  "high"
  "id"
  "if"
  "import"
  "initial"
  "input"
  "instance"
  "internal"
  "low"
  "machine"
  "module"
  "on"
  "opcode"
  "orange"
  "output"
  "passive"
  "phase"
  "port"
  "priority"
  "queued"
  "queue"
  "recv"
  "red"
  "ref"
  "reg"
  "resp"
  "save"
  "set"
  "severity"
  "signal"
  "size"
  "sizeof"
  "stack"
  "state"
  "struct"
  "telemetry"
  "throttle"
  "topology"
  "type"
  "unmatched"
  "update"
  "warning"
  "yellow"
] @keyword

; === Operators & Punctuation ===
[
  "="
  "->"
  ":"
  ";"
  ","
  "."
] @operator

[
  "{"
  "}"
  "["
  "]"
  "("
  ")"
] @punctuation.bracket

; === Primitive Types ===
[
  "F32"
  "F64"
  "I16"
  "I32"
  "I64"
  "I8"
  "U16"
  "U32"
  "U64"
  "U8"
  "bool"
  "string"
  "serial"
] @type.builtin

; === Literals ===
(number) @number
(logic) @boolean
(string_literal) @string

; === Comments & Annotations ===
(comment) @comment
(pre_annotation) @comment.documentation
(post_annotation) @comment.documentation

; === Identifiers & Structures ===
(module_definition name: (identifier) @module)
(component_definition name: (identifier) @type)
(state_machine_definition name: (identifier) @type)
(topology_definition name: (identifier) @type)
(struct_definition name: (identifier) @type)
(enum_definition name: (identifier) @type)
(array_definition name: (identifier) @type)
(type_alias_definition name: (identifier) @type)

(constant_definition name: (identifier) @constant)

(identifier) @variable
