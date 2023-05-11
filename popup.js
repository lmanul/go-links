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
    resultEl.innerHTML = formatSearchResult(result);
    resultsContainer.appendChild(resultEl);
  }
});

saveButton.addEventListener('click', (event) => {
  refreshRoutingTable(inputField.value).then((table) => {
    saveButton.classList.add('success');
    // Subtract because of the "instructions" line.
    saveButton.textContent = 'Fetched ' + (Object.keys(table).length - 1) + ' shortcuts';
  }).catch(() => {
    saveButton.classList.add('failure');
    saveButton.textContent = 'Oops! Valid JSON?';
  });
});
