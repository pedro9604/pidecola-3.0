const Validator = require('validatorjs')

exports.validateIn = (obj, rules) => {
  const validation = new Validator(obj, rules)
  if (validation.passes) {
    return { pass: true }
  } else {
    return { pass: false, errors: validation.errors.all() }
  }
}
