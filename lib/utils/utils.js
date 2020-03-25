function callbackReturn(sucs, err) {
  if (!err) {
  	if (!sucs) console.log('What you are looking for it does not exist')
  	return sucs
  }
  return err
}

function callbackMail(sucs, err) {
  if (!err && sucs.info.rejected.length < 1) {
    return { sent: true, log: sucs.info.response, errors: '' }
  } else {
    console.log('Error Sending Mail', err)
    return { sent: false, log: '', errors: err }
  }
}

module.exports.callbackReturn = callbackReturn
module.exports.callbackMail   = callbackMail