$(document).ready(function() {
    $('#search-button').click(function() {
        let query = $('#search-bar').val();
        if (query) {
            $.ajax({
                url: `http://www.omdbapi.com/?s=${query}&apikey=52d4ad03`,
                method: 'GET',
                success: function(data) {
                    if (data.Response === "True") {
                        let movies = data.Search;
                        let output = '<ul>';
                        $.each(movies, function(index, movie) {
                            output += `
                                <li class="movie-item">
                                    <a href="movie-details.html?id=${movie.imdbID}">
                                        ${movie.Title} (${movie.Year})
                                    </a>
                                </li>
                            `;
                        });
                        output += '</ul>';
                        $('#results').html(output);
                    } else {
                        $('#results').html('<p>No movies found</p>');
                    }
                }
            });
        }
    });

    // For movie-details.html
    let urlParams = new URLSearchParams(window.location.search);
    let movieId = urlParams.get('id');
    if (movieId) {
        $.ajax({
            url: `http://www.omdbapi.com/?i=${movieId}&apikey=52d4ad03`,
            method: 'GET',
            success: function(data) {
                console.log(data);
                if (data.Response === "True") {
                    let output = `
                        <h2>${data.Title} (${data.Year})</h2>
                        <img src="${data.Poster}" alt="${data.Title} Poster">
                        <p><strong>Director:</strong> ${data.Director}</p>
                        <p><strong>Cast:</strong> ${data.Actors}</p>
                        <p><strong>Genre:</strong> ${data.Genre}</p>
                        <p><strong>Plot:</strong> ${data.Plot}</p>
                        <p><strong>Duration:</strong> ${data.Runtime}</p>
                        <p><strong>Release Date:</strong> ${data.Released}</p>
                        <p><strong>Broadcaster:</strong> ${data.Production}</p>
                        <p><a href="https://www.youtube.com/results?search_query=${data.Title} trailer" target="_blank">Watch Trailer</a></p>
                        <button id="add-to-watchlist" data-id="${data.imdbID}">Add to Watchlist</button>
                    `;
                    $('#movie-details').html(output);
                } else {
                    $('#movie-details').html('<p>Movie details not found</p>');
                }
            }
        });

        $('#movie-details').on('click', '#add-to-watchlist', function() {
            let movieId = $(this).data('id');
            let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
            if (!watchlist.includes(movieId)) {
                watchlist.push(movieId);
                localStorage.setItem('watchlist', JSON.stringify(watchlist));
                alert('Added to watchlist');
            } else {
                alert('Already in watchlist');
            }
        });
    }
});
