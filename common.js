const refreshRoutingTable = (url) => {
  return fetch(url).then((res) => {
    console.log(res);
    res.text().then((data) => {
      console.log(data);
      return new Promise((resolve, reject) => {
        chrome.storage.local.set({'routing': data}, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    });
  });
};
