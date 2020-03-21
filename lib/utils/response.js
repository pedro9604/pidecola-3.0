exports.response = (status = false, dataToRes = '', message = '') => {
  if (status) return { status: status, data: dataToRes, message: message }
  return { status: status, errors: dataToRes, message: message }
}
