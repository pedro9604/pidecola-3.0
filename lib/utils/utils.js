function callbackReturn (sucs, err) {
  if (!err) {
    if (!sucs) console.log('What you are looking for it does not exist')
    return sucs
  }
  console.log('Ha ocurrido un error: ', err)
  return err
}

function callbackMail (sucs, err) {
  if (!err && sucs.rejected.length < 1) {
    return { sent: true, log: sucs.response, errors: '' }
  } else {
    console.log('Error Sending Mail', err)
    return { sent: false, log: '', errors: err }
  }
}

function callbackCount (sucs, err) {
  if (err) {
    return { status: 500, data: err, message: 'Error en la consulta' }
  }
  else {
    return { status: 200, data: sucs, message: 'El valor es'}
  }
}

function callbackAggregation (sucs, err) {
  if (err) {
    return { status: 500, data: err, message: 'Error en la consulta' }
  }
  else {
    if (sucs.length < 1) return { status: 200, data: 0, message: 'El valor es'}
    return { status: 200, data: sucs[0]['count'], message: 'El valor es'}
  }
}

module.exports.callbackReturn = callbackReturn
module.exports.callbackMail = callbackMail
module.exports.callbackCount = callbackCount
module.exports.callbackAggregation = callbackAggregation
