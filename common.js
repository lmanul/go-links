let routingTable;

const saveRoutingTableUrl = (url) => {
  return chrome.storage.local.set({'routing_source_url': url});
};

const getRoutingTableUrl = () => {
  return chrome.storage.local.get(['routing_source_url']).then(
    (loadedObject) => {
      return loadedObject['routing_source_url'];
    }
  );
};

const setLastRefreshTimestamp = () => {
  chrome.storage.local.set({
    'last_refresh_timestamp': (new Date().getTime())
  });
};

const getLastRefreshTimestamp = () => {
  return chrome.storage.local.get(['last_refresh_timestamp']).then(
    (loadedObject) => {
      return loadedObject['last_refresh_timestamp'];
    }
  );
};

const loadRoutingTable = () => {
  chrome.storage.local.get(['routing']).then((data) => {
    console.log('Loaded');
    console.log(data['routing']);
    routingTable = JSON.parse(data['routing']);
    console.log(routingTable);
  });
};

const refreshRoutingTable = (url) => {
  return fetch(url).then((res) => {
    return res.text().then((data) => {
      const lines = data.split('\n');
      const filtered_lines = [];
      for (let line of lines) {
        line = line.trim();
        // Ignore comments
        if (line.startsWith('"#')) {
          continue;
        }
        // Also collapse all spaces
        while (line.indexOf('  ') != -1) {
          line = line.replace(/  /g, ' ');
        }
        if (!line) {
          continue;
        }
        filtered_lines.push(line);
      }
      let sanitized_data = filtered_lines.join(' ');
      // JSON doesn't like a trailing comma at the very end of a list
      sanitized_data = sanitized_data.replace(/],\s?}/, ']}');
      return new Promise((resolve, reject) => {
        try {
          const parsed = JSON.parse(sanitized_data);
          routingTable = parsed;
          chrome.storage.local.set({'routing': sanitized_data}, () => {
            if (chrome.runtime.lastError) {
              console.log('Local storage failure');
              reject(chrome.runtime.lastError);
            } else {
              setLastRefreshTimestamp();
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
  query = normalize(query);
  if (!query.trim()) {
    console.log('Empty query');
    return [];
  }
  const normalizedTable = {};
  const normalizedQuery = normalize(query);
  for (const key in routingTable) {
    normalizedTable[normalize(key)] = routingTable[key];
  }
  if (normalizedQuery in normalizedTable) {
    // Exact match, return just that one.
    return [[normalizedQuery, normalizedTable[normalizedQuery]]];
  }
  const filtered = [];
  for (const key in normalizedTable) {
    if (key.includes(normalizedQuery)) {
      filtered.push([key, normalizedTable[key]]);
    }
  }
  console.log('Filtered', filtered);
  return filtered;
};

const normalize = (s) => {
  let normalized = s;
  // Ignore dashes, use only lowercase.
  normalized = normalized.replace(/-/g, '').toLowerCase();
  return normalized;
};

const formatSearchResult = (result, userQuery) => {
  const target = result[1][0];
  const key = result[0];
  const matchIndexStart = key.indexOf(userQuery);
  const matchIndexEnd = matchIndexStart + userQuery.length;
  const keyWithHighlight = '<span>' +
      key.substring(0, matchIndexStart) +
      '<b>' + key.substring(matchIndexStart, matchIndexEnd) + '</b>' +
      key.substring(matchIndexEnd) +
      '</span>';
  let output = '';
  output += '<div class="result" data-target="' + target + '">';
  output += '  <div class="result-key">';
  output +=      keyWithHighlight;
  output += '  </div>';
  output += '  <div class="result-target">';
  output +=      target;
  output += '  </div>';
  output += '</div>';
  return output;
};

const loadUrl = (target) => {
  chrome.tabs.update({ url: target });
};
