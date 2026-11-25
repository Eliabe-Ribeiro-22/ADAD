function asyncHandler(handler) {
  return function wrappedHandler(request, response, next) {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

function isPositiveInteger(value) {
  return /^\\d+$/.test(String(value)) && Number(value) > 0;
}

function currentDate() {
  return new Date().toISOString().slice(0, 10);
}

module.exports = { asyncHandler, currentDate, isPositiveInteger };
