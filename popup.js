const searchField = document.querySelector('#search-input');
const inputField = document.querySelector('#routing-input');
const saveButton = document.querySelector('#save');
const resultsContainer = document.querySelector('#results');
searchField.focus();

loadRoutingTable();

searchField.addEventListener('input', (e) => {
  console.log(routingTable);
  const query = e.target.value;
  const results = search(query);

  resultsContainer.innerHTML = '';
  console.log('Results', results);
  for (const result of results) {
    let resultEl = document.createElement('div');
    resultEl.innerHTML = formatSearchResult(result, query);
    resultsContainer.appendChild(resultEl);
  }
});

// Add event listener
searchField.addEventListener('keydown', (event) => {
  // 'Enter' key.
  if (event.keyCode === 13) {
    event.preventDefault();
    const results = resultsContainer.querySelectorAll('.result');
    if (!results.length) {
      return;
    }
    const firstResult = results[0];
    const target = firstResult.getAttribute('data-target');
    chrome.tabs.update({ url: target });
    // Close the popup
    window.close();
  }
});

saveButton.addEventListener('click', (event) => {
  refreshRoutingTable(inputField.value).then((table) => {
    saveButton.classList.add('success');
    saveButton.textContent = 'Fetched ' + Object.keys(table).length + ' shortcuts';
  }).catch(() => {
    saveButton.classList.add('failure');
    saveButton.textContent = 'Oops! Valid JSON?';
  });
});
