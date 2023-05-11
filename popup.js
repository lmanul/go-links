const inputField = document.querySelector('#routing-input');
const saveButton = document.querySelector('#save');
inputField.focus();

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
