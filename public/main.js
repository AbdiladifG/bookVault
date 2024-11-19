const deleteButton = document.querySelectorAll(".delete-btn");
deleteButton.forEach((item) => {
  item.addEventListener("click", (e) => {
    console.log("delete btn clicked");

    let id = e.target.getAttribute("id");
    console.log(id)
    fetch("/deleteBook", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: id,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        location.reload();
      })
      .catch((error) => console.error("Error:", error));
  });
});


document.querySelector("#search-button").addEventListener("click", getBooks);
document
  .querySelector("#search-input")
  .addEventListener("keypress", (event) =>
    event.key === "Enter" ? getBooks() : null
  );

function getBooks() {
  let book = document.querySelector("#search-input").value;
  fetch(`https://www.googleapis.com/books/v1/volumes?q=${book}`)
    .then((res) => res.json())
    .then((data) => {
      document.querySelector(".results").innerHTML = "";

      data.items.forEach((element) => {
        let title = element.volumeInfo.title;
        let image = element.volumeInfo.imageLinks.thumbnail;
        let author = element.volumeInfo.authors[0];

        document.querySelector(".results").innerHTML += `
      
            <div class="book">
            <img src="${image}" alt="Book cover" />
            <h3>${title}</h3>
            <p>${author}</p>
            <form action="/bookmark" method="post">
            <input type="text" name="title" value="${title}" hidden>
            <input type="text" name="author" value="${author}" hidden>
            <input type="text" name="imageLink" value="${image}" hidden>
            <button class="bookmark-btn" type="submit">Bookmark</button>
            </form>
            
          </div>
            
            `;
      });
    });
}
