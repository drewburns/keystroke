function generate64() {
  echo $(openssl base64 < "${1}" | tr -d '\n')
}

# @param {String} path to image
function copy64() {
  local CODE=$(generate64 "${1}")
  echo "${CODE}" | pbcopy
  echo "base64 encoding for your image copied to your clipboard! (${#CODE} characters)"
}

# @param {String} path to image
function base64toCSS() {
  local CODE=$(generate64 "${1}")
  echo "url(data:image/${1##*\.};base64,${CODE})" | pbcopy
  echo "base64 encoding for your image copied to your clipboard! (${#CODE} characters)"
  echo "Clipboard includes the url() wrapper for CSS."
}

