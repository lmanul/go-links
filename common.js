const refreshRoutingTable = (url) => {
  return fetch(url).then((res) => {
    return res.text().then((data) => {
      // Let's remove all new line characters.
      data = data.replace(/\n/g, '');
      // Also collapse all spaces
      while (data.indexOf('  ') != -1) {
        data = data.replace(/  /g, ' ');
      }
      // JSON doesn't like a trailing comma at the very end of a list
      data = data.replace(/],}/, ']}');
      return new Promise((resolve, reject) => {
        try {
          const parsed = JSON.parse(data);
          chrome.storage.local.set({'routing': data}, () => {
            if (chrome.runtime.lastError) {
              console.log('Local storage failure');
              reject(chrome.runtime.lastError);
            } else {
              resolve(parsed);
            }
          });
        } catch (e) {
          console.log('Could not parse JSON');
          reject();
        }
      });
    });
  });
};
