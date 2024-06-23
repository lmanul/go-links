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

const autoRefresh = () => {
  getRoutingTableUrl().then(refreshRoutingTable);
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
    routingTable = JSON.parse(data['routing']);
  });
};

const refreshRoutingTable = (url) => {
  return fetch(url).then((res) => {
    return res.text().then((data) => {
      const lines = data.split('\n');
      const filtered_lines = [];
      for (let line of lines) {
        line = line.trim();
        // Collapse all spaces
        while (line.indexOf('  ') != -1) {
          line = line.replace(/  /g, ' ');
        }
        if (!line) {
          continue;
        }
        filtered_lines.push(line);
      }
      let sanitized_data = filtered_lines.join(' ');
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
          console.log(e);
          console.log(sanitized_data);
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

const getRelativeTimeAgo = (past_timestamp) => {
  const now = (new Date()).getTime();
  const diff_seconds = Math.floor((now - past_timestamp) / 1000);
  const diff_minutes = Math.floor(diff_seconds / 60);
  const diff_hours = Math.floor(diff_minutes / 60);
  const diff_days = Math.floor(diff_hours / 24);

  if (!!diff_days) {
    return diff_days === 1 ? '1 day' : diff_days + ' days';
  }
  if (!!diff_hours) {
    return diff_hours === 1 ? '1 hour' : diff_hours + ' hours';
  }
  if (!!diff_minutes) {
    return diff_minutes === 1 ? '1 minute' : diff_minutes + ' minutes';
  }
  return 'moments';
};
