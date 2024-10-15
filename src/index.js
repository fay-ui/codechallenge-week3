document.addEventListener("DOMContentLoaded", () => {
  fetchAllMovies();
  fetchInitialMovie();
});

function fetchInitialMovie() {
  fetch("http://localhost:3000/films/1") // Fetch the first movie (id 2)
      .then(response => response.json())
      .then(movie => {
          displayMovieDetails(movie);
      });
}

function fetchAllMovies() {
  fetch("http://localhost:3000/films")
      .then(response => response.json())
      .then(movies => {
          const filmsList = document.getElementById("films");
          filmsList.innerHTML = ''; // Clear the placeholder
          movies.forEach(movie => {
              const li = document.createElement("li");
              li.textContent = movie.title;
              li.className = movie.tickets_sold >= movie.capacity ? "sold-out film item" : "film item";

              const deleteButton = document.createElement("button");
              deleteButton.textContent = "Delete";
              
              deleteButton.addEventListener("click", (e) => {
                  e.stopPropagation(); // Prevent triggering the click event on the li
                  fetch(`http://localhost:3000/films/${movie.id}`, {
                      method: 'DELETE'
                  })
                  .then(() => {
                      fetchAllMovies(); // Refresh the list
                  });
              });

              li.appendChild(deleteButton);
              li.addEventListener("click", () => displayMovieDetails(movie));
              filmsList.appendChild(li);
          });
      });
}

function displayMovieDetails(movie) {
  const poster = document.getElementById("poster");
  poster.src = movie.poster; // Update poster image
  const availableTickets = movie.capacity - movie.tickets_sold;

  document.getElementById("title").textContent = movie.title;
  document.getElementById("runtime").textContent = `${movie.runtime} minutes`;
  document.getElementById("film-info").textContent = movie.description;
  document.getElementById("showtime").textContent = movie.showtime;
  document.getElementById("ticket-num").textContent = availableTickets;

  const buyTicketButton = document.getElementById("buy-ticket");
  buyTicketButton.disabled = availableTickets <= 0;
  buyTicketButton.textContent = availableTickets <= 0 ? 'Sold Out' : 'Buy Ticket';

  buyTicketButton.onclick = () => {
      if (availableTickets > 0) {
          buyTicket(movie);
      }
  };
}

function buyTicket(movie) {
  const movieId = movie.id;
  fetch(`http://localhost:3000/films/${movieId}`)
      .then(response => response.json())
      .then(movie => {
          if (movie.tickets_sold < movie.capacity) {
              const newTicketsSold = movie.tickets_sold + 1;
              fetch(`http://localhost:3000/films/${movieId}`, {
                  method: "PATCH",
                  headers: {
                      "Content-Type": "application/json"
                  },
                  body: JSON.stringify({ tickets_sold: newTicketsSold })
              })
              .then(() => {
                  displayMovieDetails({ ...movie, tickets_sold: newTicketsSold });
                  return fetch("http://localhost:3000/tickets", {
                      method: "POST",
                      headers: {
                          "Content-Type": "application/json"
                      },
                      body: JSON.stringify({ film_id: movieId, number_of_tickets: 1 })
                  });
              });
          }
      });
}
