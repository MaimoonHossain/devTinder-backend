function joinUrl(base, path) {
  return base?.replace(/\/+$/, '') + '/' + path?.replace(/^\/+/, '');
}

module.exports = joinUrl;
