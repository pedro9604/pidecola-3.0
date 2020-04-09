function callbackReturn(sucs, err) {
  if (!err) return sucs
  return err
}

module.exports.callbackReturn = callbackReturn