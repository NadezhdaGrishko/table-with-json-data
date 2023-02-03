// FETCHING LOGIC
// Function for fetching data from json file
async function getJsonData(path) {
  const response = await fetch(path);

  // check HTTP response status
  if (!response.ok) {
    const message = `An error has occured with status: ${response.status}`;
    throw new Error(message);
  }

  // extract JSON object from the response
  const jsonObjects = await response.json();
  return jsonObjects;
}

// get data from data.json file and render to HTML page
getJsonData("./data.json")
  .then((jsonObjects) => {
    let table = document.querySelector("#table-data");
    let out = "";
    for (let person of jsonObjects) {
      out += `
        <tr>
        <td class="firstName">${person.name.firstName}</td>
        <td class="lastName">${person.name.lastName}</td>
        <td class="about">${person.about}</td>
        <td class="eyeColor" style="background-color: ${person.eyeColor}">${person.eyeColor}</td>
        </tr>
        `;
      table.innerHTML = out;
    }

    // PAGINATION LOGIC
    // define variables for pagination
    const paginationNumbers = document.getElementById("pagination-numbers");
    const paginatedList = document.getElementById("table-data");
    const listItems = paginatedList.querySelectorAll("tr");
    const nextButton = document.getElementById("next-button");
    const prevButton = document.getElementById("prev-button");

    const paginationLimit = 10;
    const pageCount = Math.ceil(listItems.length / paginationLimit);
    let currentPage;

    // function to create buttons for the page numbers
    const appendPageNumber = (index) => {
      const pageNumber = document.createElement("button");
      pageNumber.className = "pagination-number";
      pageNumber.innerHTML = index;
      pageNumber.setAttribute("page-index", index);
      pageNumber.setAttribute("aria-label", "Page " + index);
      paginationNumbers.appendChild(pageNumber);
    };
    // add page number buttons to the page
    for (let i = 1; i <= pageCount; i++) {
      appendPageNumber(i);
    }

    // function for setting the current page
    const setCurrentPage = (pageNum) => {
      currentPage = pageNum;
      const prevRange = (pageNum - 1) * paginationLimit;
      const currRange = pageNum * paginationLimit;

      listItems.forEach((item, index) => {
        item.classList.add("hidden");
        if (index >= prevRange && index < currRange) {
          item.classList.remove("hidden");
        }
      });

      // update active page every time a new page is set
      document.querySelectorAll(".pagination-number").forEach((button) => {
        button.classList.remove("active");
        const pageIndex = Number(button.getAttribute("page-index"));
        if (pageIndex == currentPage) {
          button.classList.add("active");
        }
      });

      // make prev and next buttons disable on the first or last page
      const disableButton = (button) => {
        button.classList.add("disabled");
        button.setAttribute("disabled", true);
      };

      const enableButton = (button) => {
        button.classList.remove("disabled");
        button.removeAttribute("disabled");
      };

      if (currentPage === 1) {
        disableButton(prevButton);
      } else {
        enableButton(prevButton);
      }

      if (pageCount === currentPage) {
        disableButton(nextButton);
      } else {
        enableButton(nextButton);
      }
    };

    // call the function setCurrentPage with current page argument 1 as default value
    setCurrentPage(1);

    // add the event listeners to next and previous buttons
    prevButton.addEventListener("click", () => {
      setCurrentPage(currentPage - 1);
    });

    nextButton.addEventListener("click", () => {
      setCurrentPage(currentPage + 1);
    });

    // change the page content whenever a page number button is clicked
    document.querySelectorAll(".pagination-number").forEach((button) => {
      const pageIndex = Number(button.getAttribute("page-index"));
      if (pageIndex) {
        button.addEventListener("click", () => {
          setCurrentPage(pageIndex);
        });
      }
    });

    editData();
  })
  // throw an error on a bad HTTP status
  .catch((error) => {
    error.message;
  });

// SORTING LOGIC

function sortTable(n, e) {
  var tbody = document.querySelector("tbody");
  var table = document.querySelector("table"),
    thead = document.querySelector("thead"),
    bRows = [...tbody.rows];
  (hData = [...thead.querySelectorAll("th")]), (desc = false);

  hData.map((head) => {
    if (head != e) {
      head.classList.remove("asc", "desc");
    }
  });

  desc = e.classList.contains("asc") ? true : false;
  e.classList[desc ? "remove" : "add"]("asc");
  e.classList[desc ? "add" : "remove"]("desc");

  tbody.innerHTML = "";
  bRows.sort((a, b) => {
    let x = a.getElementsByTagName("td")[n].innerHTML.toLowerCase(),
      y = b.getElementsByTagName("td")[n].innerHTML.toLowerCase();
    return desc ? (x < y ? 1 : -1) : x < y ? -1 : 1;
  });
  bRows.map((bRow) => {
    tbody.appendChild(bRow);
  });
}

// EDITING TABLE ROWS LOGIC
// function for edit table rows
function editData() {
  var tdr = document.getElementById("table-data").querySelectorAll("tr");
  tdr.forEach((tr) => {
    tr.setAttribute("contenteditable", true);

    tr.addEventListener("click", (e) => {
      if (!inEditing(tr)) {
        startEditing(tr);
      }
    });
  });
}

// functions for save and cancel buttons
function startEditing(tr) {
  const activeTr = findEditing();
  if (activeTr) {
    cancelEditing(activeTr);
  }

  tr.className = "in-editing";
  tr.setAttribute("old-value", tr.innerHTML);
  createButtonToolbar(tr);
}

function cancelEditing(tr) {
  tr.innerHTML = tr.getAttribute("old-value");
  tr.classList.remove("in-editing");
}

function finishedEditing(tr) {
  tr.classList.remove("in-editing");
  removeToolbar(tr);
}

function inEditing(tr) {
  return tr.classList.contains("in-editing");
}

// create toolbar with save and cancel buttons
function createButtonToolbar(tr) {
  const toolbar = document.createElement("div");
  toolbar.className = "button-toolbar";
  toolbar.setAttribute("contenteditable", false);

  toolbar.innerHTML = `
  <button id="saveButton" class="saveButton">Save</button>
  <button id="cancelButton" class="cancelButton">Cancel</button>
  `;
  tr.appendChild(toolbar);

  const saveButton = toolbar.querySelector("#saveButton");
  const cancelButton = toolbar.querySelector("#cancelButton");

  saveButton.addEventListener("click", (e) => {
    e.stopPropagation();
    finishedEditing(tr);
  });

  cancelButton.addEventListener("click", (e) => {
    e.stopPropagation();
    cancelEditing(tr);
  });
}

function removeToolbar(tr) {
  const toolbar = tr.querySelector(".button-toolbar");
  toolbar.remove();
}

function findEditing() {
  var tdr = document.getElementById("table-data").querySelectorAll("tr");
  return Array.prototype.find.call(tdr, (tr) => inEditing(tr));
}
