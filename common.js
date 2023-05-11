let routingTable;

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
          console.log("Fetched", sanitized_data);
          const parsed = JSON.parse(sanitized_data);
          routingTable = parsed;
          chrome.storage.local.set({'routing': sanitized_data}, () => {
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
