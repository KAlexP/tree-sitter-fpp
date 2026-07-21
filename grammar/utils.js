function trailingCommaSep1(rule) {
  return seq(rule, repeat(seq(optional(','), rule)), optional(','));
}

module.exports = { trailingCommaSep1 };
