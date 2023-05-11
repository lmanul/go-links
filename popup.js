const inputField = document.querySelector('#routing-input');
const saveButton = document.querySelector('#save');
inputField.focus();

saveButton.addEventListener('click', (event) => {
  refreshRoutingTable(inputField.value).then(() => {
    saveButton.classList.add('success');
    saveButton.textContent = 'Success!';
  });
});
