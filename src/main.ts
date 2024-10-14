import './style.css';

const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

interface Note {
  id: number;
  name: string;
  description: string;
  date: string;
}

let notes: Note[] = [];

let editingNoteId: number | null = null;
let noteToDeleteId: number | null = null;
let currentlyEditingListItem: HTMLLIElement | null = null;
let isNewCreating: boolean = false;

const notesContainer = document.getElementById('empty-container') as HTMLDivElement;
const addNewButton = document.getElementById('addNew') as HTMLButtonElement;

const renderNotes = (filter: string = ''): void => {
  const notesList = document.getElementById('notesList') as HTMLUListElement;
  notesList.innerHTML = '';
  const resultsMessage = document.getElementById('results') as HTMLDivElement;

  const filteredNotes = notes.filter(
    (note) => note.name.includes(filter) || note.description.includes(filter)
  );

  const isEmpty = notes.length === 0 && filteredNotes.length === 0;
  const noResults = filter !== '' && filteredNotes.length === 0;

  if (!isEmpty && !isNewCreating) {
    addNewButton.classList.add('btn-add--active');
  } else if (isEmpty && !isNewCreating) {
    notesContainer.classList.add('empty--active');
    addNewButton.classList.remove('btn-add--active');
  } else {
    notesContainer.classList.remove('empty--active');
  }

  if (noResults && !isEmpty) {
    resultsMessage.innerText = `No results for: ${filter}`;
  } else if (!noResults && filter) {
    resultsMessage.innerText = `Results for: ${filter}`;
  } else {
    resultsMessage.innerText = '';
  }

  if (!filter) {
    const searchInput = document.getElementById('search') as HTMLInputElement;
    searchInput.value = "";
  }

  filteredNotes.forEach((note: Note) => {
    const li = document.createElement('li');

    li.innerHTML = `
      <div class="notes-element">
        <div class="note-element__header">
          <p class="text-m-bold ">${note.name}</p>
          <div class="note-element__buttons">
            <button class="edit-button"></button>
            <button class="delete-button"></button>
          </div>
        </div>
        <p class="text-m notes-element__desc">${note.description}</p>
        <p class="text-s">${note.date}</p>
      </div>
    `;

    const editButton = li.querySelector('.edit-button') as HTMLButtonElement;
    const deleteButton = li.querySelector('.delete-button') as HTMLButtonElement;

    editButton.onclick = () => {
      loadNoteForEditing(note.id, li);
      hideAddNew();
    };

    deleteButton.onclick = () => {
      if (editingNoteId !== note.id) {
        confirmDelete(note.id);
      }
    };

    notesList.prepend(li);
  });
};

const showAddForm = (isEditingMood = false): void => {
  isNewCreating = true;
  const form = document.getElementById('noteForm') as HTMLElement;
  const formTitle = document.getElementById('noteFormTitle') as HTMLElement;
  formTitle.innerText = `${isEditingMood ? "Edit note" : "Add new note"}`;
  form.classList.add('note-form--active');
};

const loadNoteForEditing = (id: number, listItem: HTMLLIElement): void => {
  const note = notes.find((note) => note.id === id);
  if (note) {
    const noteNameInput = document.getElementById('noteInputName') as HTMLInputElement;
    const noteDescInput = document.getElementById('noteInputDesc') as HTMLTextAreaElement;
    noteNameInput.value = note.name;
    noteDescInput.value = note.description;
    editingNoteId = note.id;
    currentlyEditingListItem = listItem;

    showAddForm(true);
  }
};

const saveNote = (event: Event): void => {
  event.preventDefault();

  const noteNameInput = document.getElementById('noteInputName') as HTMLInputElement;
  const noteDescInput = document.getElementById('noteInputDesc') as HTMLTextAreaElement;
  const noteName = noteNameInput.value.trim();
  const noteDesc = noteDescInput.value.trim();

  let isValid = true; 

  if (!noteName) {
      noteNameInput.setCustomValidity('Note title is required');
      isValid = false; 
  } else {
      noteNameInput.setCustomValidity('');
  }
  
  if (!noteDesc) {
      noteDescInput.setCustomValidity('Note description is required');
      isValid = false; 
  } else {
      noteDescInput.setCustomValidity('');
  }
  
  noteNameInput.reportValidity();
  noteDescInput.reportValidity();
  
  if (!isValid) {
      return; 
  }

  if (noteName && noteDesc) {
    if (editingNoteId !== null) {
      const noteIndex = notes.findIndex((note) => note.id === editingNoteId);
      if (noteIndex > -1) {
        notes[noteIndex].name = noteName;
        notes[noteIndex].description = noteDesc;
        notes[noteIndex].date = new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
        });
      }
      currentlyEditingListItem!.style.display = 'block';
      editingNoteId = null;
    } else {
      const newNote: Note = {
        id: Date.now(),
        name: noteName,
        description: noteDesc,
        date: new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
        }),
      };
      notes.push(newNote);
    }

    hideAddForm();
    renderNotes();
  }
};

const hideAddNew = (): void => {
  addNewButton.classList.remove('btn-add--active');
};

const hideAddForm = (): void => {
  const form = document.getElementById('noteForm') as HTMLElement;
  form.classList.remove('note-form--active');
  isNewCreating = false;
  clearFormInputs();
};

const clearFormInputs = (): void => {
  const noteNameInput = document.getElementById('noteInputName') as HTMLInputElement;
  const noteDescInput = document.getElementById('noteInputDesc') as HTMLTextAreaElement;
  noteNameInput.value = '';
  noteDescInput.value = '';
};

const confirmDelete = (id: number): void => {
  noteToDeleteId = id;
  openDeleteModal();
};

const deleteNote = (): void => {
  if (noteToDeleteId !== null) {
    notes = notes.filter((note) => note.id !== noteToDeleteId);
    noteToDeleteId = null;
    closeDeleteModal();
    renderNotes();
  }
};

const filterNotes = (): void => {
  const searchInput = document.getElementById('search') as HTMLInputElement;
  const filter = searchInput.value.trim();
  renderNotes(filter);
};

const openDeleteModal = (): void => {
  const modal = document.getElementById('deleteModal') as HTMLElement;
  modal.style.display = 'block';
};

const closeDeleteModal = (): void => {
  const modal = document.getElementById('deleteModal') as HTMLElement;
  modal.style.display = 'none';
  noteToDeleteId = null;
};

document.getElementById('addButton')!.onclick = () => {
  clearFormInputs();
  showAddForm();
  notesContainer.classList.remove('empty--active');
  editingNoteId = null;
};

document.getElementById('addNew')!.onclick = () => {
  clearFormInputs();
  showAddForm();
  notesContainer.classList.remove('empty--active');
  editingNoteId = null;
  hideAddNew();
};

document.getElementById('saveButton')!.onclick = saveNote;
document.getElementById('cancelButton')!.onclick = () => {
  editingNoteId=null;
  hideAddForm();
  renderNotes();
};
document.getElementById('confirmDeleteButton')!.onclick = deleteNote;
document.getElementById('cancelDeleteButton')!.onclick = closeDeleteModal;
const debouncedFilterNotes = debounce(filterNotes, 300);
document.getElementById('search')!.oninput = debouncedFilterNotes;

renderNotes();