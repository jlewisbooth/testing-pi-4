module.exports = function (location, protocol, secure = false) {
  let protocolEndIndex = location.indexOf('://');
  let isProtocolProvided = protocolEndIndex > 0;
  let outputProtocol;
  if(isProtocolProvided) {
    let providedProtocol = location.substr(0, protocolEndIndex);
    if(providedProtocol === protocol + 's') {
      secure = true;
      outputProtocol = providedProtocol;
    }
    else if (providedProtocol === 'https') {
      secure = true;
      outputProtocol = protocol + 's';
    }
    else {
      // providedProtocol has no bearing
      outputProtocol = secure ? protocol + 's' : protocol;
    }
  }
  else {
    outputProtocol = secure ? protocol + 's' : protocol;
  }

  let locationWithoutProtocol = (isProtocolProvided ? 
    location.substr(protocolEndIndex + 3)
    : location
  );

  let slashLocation = locationWithoutProtocol.indexOf('/');
  let host;
  if(slashLocation < 0) {
    locationWithoutProtocol = locationWithoutProtocol + '/';
    host = locationWithoutProtocol;
  }
  else {
    host = locationWithoutProtocol.substr(0, slashLocation);
    let finalSlash = locationWithoutProtocol.lastIndexOf('/');
    let filePath = locationWithoutProtocol.substr(finalSlash + 1);
    if(filePath !== '' && !filePath.includes('.')) {
      locationWithoutProtocol = locationWithoutProtocol + '/';
    }
  }

  let outputLocation = outputProtocol + '://' + locationWithoutProtocol;

  return {
    location: outputLocation,
    secure,
    host
  };
};
