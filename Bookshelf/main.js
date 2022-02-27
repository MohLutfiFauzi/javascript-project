// {
//   id: string | number,
//   title: string,
//   author: string,
//   year: number,
//   isComplete: boolean,
// }

const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";
const SEARCH = "search-book";

// fungsi membuat id untuk setiap buku
function generateId() {
  return +new Date();
}

function isStorageExist() /* boolean */ {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  const searchBook = document.getElementById("searchBook");

  searchBook.addEventListener("submit", (e) => {
    e.preventDefault();
    searchBookByTittle();
  });

  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

// cari buku

function searchBookByTittle() {
  const searchBookTitle = document
    .getElementById("searchBookTitle")
    .value.toLowerCase();

  for (book of books) {
    const bookTitle = book.title.toLowerCase();
    const displayData = document.getElementById(`book-${book.id}`);
    if (bookTitle.indexOf(searchBookTitle) != -1) {
      displayData.style.display = "block";
    } else {
      displayData.style.display = "none";
    }
  }
}

// menambahkan buku

function addBook() {
  const bookTitle = document.getElementById("inputBookTitle").value;
  const bookAuthor = document.getElementById("inputBookAuthor").value;
  const bookYear = document.getElementById("inputBookYear").value;
  const inputBookIsComplete = document.getElementById(
    "inputBookIsComplete"
  ).checked;

  const generatedID = generateId();

  const bookObject = generateBookObject(
    generatedID,
    bookTitle,
    bookAuthor,
    bookYear,
    inputBookIsComplete
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// cari buku berdasarkan id
function findBook(bookId) {
  for (bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

// cari indes dari array books

function findBookIndex(bookId) {
  for (index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

// Menghapus buku

function removeBookFromCompleted(bookId) {
  const confirma = confirm("Yakin ingin menghapus buku ini ?");
  if (confirma == true) {
    const bookTarget = findBookIndex(bookId);
    if (bookTarget === -1) return;
    books.splice(bookTarget, 1);
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// Mengembalikan buku ke selesai dibaca

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// menambahkan buku dari selesai baca

function addBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// Edit buku
function editBook(bookId, bookTitle, bookAuthor, bookYear) {
  const bookTitleEdit = prompt("Title nya mau jadi apa ?", bookTitle);
  const bookAuthorEdit = prompt("Author nya mau jadi apa ?", bookAuthor);
  const bookTahunEdit = prompt("Tahun nya mau jadi apa ?", bookYear);

  if (
    bookTitleEdit != ("" || null) &&
    bookAuthorEdit != ("" || null) &&
    bookTahunEdit != ("" || null)
  ) {
    for (book of books) {
      if (book.id === bookId) {
        book.title = bookTitleEdit;
        book.author = bookAuthorEdit;
        book.year = bookTahunEdit;
      }
    }
  } else {
    alert("judul, penulis, dan tahun tidak boleh kosong");
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// membuat buku

function makeBookShelf(bookShelfObject) {
  const textTitle = document.createElement("h3");
  textTitle.innerText = `${bookShelfObject.title}`;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = `Penulis : ${bookShelfObject.author}`;

  const textYear = document.createElement("p");
  textYear.innerText = `Tahun Cetak : ${bookShelfObject.year}`;

  const textContainer = document.createElement("article");
  textContainer.classList.add("book_item");
  textContainer.append(textTitle, textAuthor, textYear);
  textContainer.setAttribute("id", `book-${bookShelfObject.id}`);

  const buttonDone = document.createElement("button");
  buttonDone.classList.add("blue");
  buttonDone.innerText = "Belum Selesai";

  const buttonRemove = document.createElement("button");
  buttonRemove.classList.add("red");
  buttonRemove.innerText = "Hapus buku";

  const buttonEdit = document.createElement("button");
  buttonEdit.classList.add("green");
  buttonEdit.innerText = "Edit buku";
  buttonEdit.addEventListener("click", () => {
    editBook(
      bookShelfObject.id,
      bookShelfObject.title,
      bookShelfObject.author,
      bookShelfObject.year
    );
  });

  if (bookShelfObject.isComplete) {
    buttonDone.addEventListener("click", () => {
      undoBookFromCompleted(bookShelfObject.id);
    });
    buttonRemove.addEventListener("click", () => {
      removeBookFromCompleted(bookShelfObject.id);
    });
  } else {
    buttonDone.innerText = "Selesai dibaca";
    buttonDone.addEventListener("click", () => {
      addBookFromCompleted(bookShelfObject.id);
    });
    buttonRemove.addEventListener("click", () => {
      removeBookFromCompleted(bookShelfObject.id);
    });
  }

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("action");
  buttonContainer.append(buttonDone, buttonRemove, buttonEdit);
  textContainer.append(buttonContainer);

  return textContainer;
}

// fungsi save data

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

// menampilkan data dari local storage

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);

  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

// render data buku

document.addEventListener(RENDER_EVENT, () => {
  const incomplitedBookShelf = document.getElementById(
    "incompleteBookshelfList"
  );
  incomplitedBookShelf.innerHTML = "";

  const completeBookshelfList = document.getElementById(
    "completeBookshelfList"
  );
  completeBookshelfList.innerHTML = "";

  for (book of books) {
    const bookElement = makeBookShelf(book);
    if (book.isComplete == false) {
      incomplitedBookShelf.append(bookElement);
    } else {
      completeBookshelfList.append(bookElement);
    }
  }
});

// render save data buku

// document.addEventListener(SAVED_EVENT, function () {
//   console.log(localStorage.getItem(STORAGE_KEY));
// });
