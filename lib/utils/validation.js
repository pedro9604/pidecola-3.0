const Validator = require('validatorjs')

exports.validateIn = (obj, rules, messages) => {
  const validation = new Validator(obj, rules, messages)
  if (validation.passes()) return { pass: true }
  return { pass: false, errors: [].concat.apply([], Object.values(validation.errors.all())) }
}
