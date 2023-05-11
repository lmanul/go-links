let routingTable;

const ROUTING_TABLE_STORAGE_KEY = 'routing';

const loadRoutingTable = () => {
  chrome.storage.local.get(ROUTING_TABLE_STORAGE_KEY, (data) => {
    console.log('Loaded');
    console.log(data);
    routingTable = JSON.parse(data[ROUTING_TABLE_STORAGE_KEY]);
    console.log(routingTable);
  });
};

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
          routingTable = parsed;
          chrome.storage.local.set({ROUTING_TABLE_STORAGE_KEY: data}, () => {
            if (chrome.runtime.lastError) {
              console.log('Local storage failure');
              reject(chrome.runtime.lastError);
            } else {
              console.log('Updated storage');
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

const search = (query) => {
  if (!routingTable) {
    console.log('No routing table');
    return [];
  }
  query = query.toLowerCase();
  if (!query.trim()) {
    console.log('Empty query');
    return [];
  }
  if (query in routingTable) {
    // Exact match, return just that one.
    console.log('Match for ', routingTable[query]);
    return [[query, routingTable[query]]];
  }
  const filtered = [];
  for (const key in routingTable) {
    if (key.includes(query)) {
      filtered.push([key, routingTable[key]]);
    }
  }
  console.log('Filtered', filtered);
  return filtered;
};

const formatSearchResult = (result, userQuery) => {
  let output = '';
  output += '<div class="result">';
  output += '  <div class="result-key">';
  output +=      result[0];
  output += '  </div>';
  output += '  <div class="result-target">';
  output +=      result[1][0];
  output += '  </div>';
  output += '</div>';
  return output;
};
