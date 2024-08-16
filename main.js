// GitHub API endpoint for searching repositories
const githubApiEndpoint = 'https://api.github.com/search/repositories';

// Debounce 
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    return new Promise(resolve => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        resolve(func.apply(context, args));
      }, wait);
    });
  };
}

// Поиск репозитория
function getRepositories(query) {
  const url = `${githubApiEndpoint}?q=${query}&per_page=5`;
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => data.items)
    .catch(error => {
      console.error('Error:', error);
      return []; 
    });
}

//Выпадающий автокомплит список
function displayAutocomplete(repositories) {
  const autocompleteList = document.getElementById('autocomplete-list');
  autocompleteList.innerHTML = '';
  if (repositories.length === 0) {
    autocompleteList.innerHTML = '<li>Repository not found</li>';
  } else {
    repositories.forEach(repository => {
      const autocompleteItem = document.createElement('li');
      autocompleteItem.innerHTML = repository.name; 
      autocompleteItem.addEventListener('click', () => {
        addRepositoryToAddedList(repository);
        document.getElementById('search-input').value = '';
        autocompleteList.innerHTML = ''; 
      });
      autocompleteList.appendChild(autocompleteItem);
    });
  }
  autocompleteList.style.display = 'block';
}

// Карточка репозитория
function addRepositoryToAddedList(repository) {
  const addedList = document.getElementById('added-list');
  const addedItem = document.createElement('li');
  addedItem.innerHTML = `
                        <p>Name:${repository.name}<br><br> 
                        Owner:${repository.owner.login}<br><br> 
                        Stars:${repository.stargazers_count}</p>`;

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.classList.add('delete-button');
  deleteButton.addEventListener('click', () => {
    addedItem.remove();
  });
  addedItem.appendChild(deleteButton);
  addedList.appendChild(addedItem);
  autocompleteList.style.display = 'none';
}

// Основа
const searchInput = document.getElementById('search-input');
const autocompleteList = document.getElementById('autocomplete-list');
const addedList = document.getElementById('added-list');

const debouncedGetRepositories = debounce(getRepositories, 500);

searchInput.addEventListener('input', async function() {
  const searchTerm = this.value.trim();
  if (searchTerm) {
    try {
      const repositories = await debouncedGetRepositories(searchTerm);
      displayAutocomplete(repositories);
      autocompleteList.style.display = 'block';
    } catch (error) {
      console.error(error);
      autocompleteList.innerHTML = 'Error: Unable to fetch repositories'; 
      autocompleteList.style.display = 'block';
    }
  } else {
    autocompleteList.innerHTML = ''; 
    autocompleteList.style.display = 'none';
  }
});