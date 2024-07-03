$(document).ready(function() {
    const featuredMovies = [
        { title: "The Fast and the Furious: Tokyo Drift", year: "2006" },
        { title: "Inside Out 2", year: "2024" },
        { title: "Hunger Games", year: "2012" },
        { title: "Rush Hour 3", year: "2007" },
        { title: "Transformers: Rise of the Beasts", year: "2023" },
        { title: "Ip Man: The Awakening", year: "2021" },
        { title: "Real Steel", year: "2011" },
        { title: "Stand by Me Doraemon", year: "2014" }
    ];
    // Function to fetch and display featured movies
    function fetchFeaturedMovies() {
        featuredMovies.forEach(movie => {
            $.ajax({
                url: `http://www.omdbapi.com/?t=${encodeURIComponent(movie.title)}&y=${movie.year}&apikey=52d4ad03`,
                method: 'GET',
                success: function(data) {
                    if (data.Response === "True") {
                        const movieItem = `
                            <div class="movie-item" data-id="${data.imdbID}">
                                <img src="${data.Poster}" alt="${data.Title} Poster">
                                <h4>${data.Title} (${data.Year})</h4>
                            </div>
                        `;
                        $('#movie-slider').append(movieItem);
                    }
                }
            });
        });
    }

    // Fetch and display featured movies on page load
    fetchFeaturedMovies();

    // Redirect to movie-details.html on click
    $('#movie-slider').on('click', '.movie-item', function() {
        const movieId = $(this).data('id');
        window.location.href = `movie-details.html?id=${movieId}`;
    });

    // Search functionality with genre filter
    $('#search-button').click(function() {
        let query = $('#search-bar').val();
        let genre = $('#genre-select').val();

        if (query) {
            $.ajax({
                url: `http://www.omdbapi.com/?s=${query}&apikey=52d4ad03`,
                method: 'GET',
                success: function(data) {
                    if (data.Response === "True") {
                        let movies = data.Search;
                        let filteredMovies = [];

                        // Filter movies by genre
                        let filterGenre = function(movie, callback) {
                            $.ajax({
                                url: `http://www.omdbapi.com/?i=${movie.imdbID}&apikey=52d4ad03`,
                                method: 'GET',
                                success: function(movieData) {
                                    if (movieData.Response === "True" && (!genre || movieData.Genre.toLowerCase().includes(genre.toLowerCase()))) {
                                        callback(movieData);
                                    } else {
                                        callback(null);
                                    }
                                }
                            });
                        };

                        let checkAndDisplayMovies = function() {
                            let output = '<ul>';
                            let foundMovies = false;
                            filteredMovies.forEach(function(movie) {
                                if (movie) {
                                    foundMovies = true;
                                    output += `
                                        <li class="movie-item">
                                        <div class="search-movie">    
                                            <div class="content">
                                                <a href="movie-details.html?id=${movie.imdbID}">
                                                    <img src="${movie.Poster}" alt="${movie.Title} Poster">                
                                                </a>
                                            
                                            </div>
                                            <div class="description">
                                              <p>${movie.Title} (${movie.Year})</p>
                                              <p><strong>Duration: </strong> ${movie.Runtime}</p>
                                              <p><strong>Release Date:</strong> ${movie.Released}</p>
                                              <p><strong>Cast:</strong> ${movie.Actors}</p>
                                            </div>  
                                        </div>
                                        </li>
                                    `;
                                }
                            });
                            output += '</ul>';
                            if (!foundMovies) {
                                $('#results').html('<p>No movies found</p>');
                            } else {
                                $('#results').html(output);
                            }
                        };

                        let moviePromises = movies.map(movie => {
                            return new Promise((resolve, reject) => {
                                filterGenre(movie, function(filteredMovie) {
                                    resolve(filteredMovie);
                                });
                            });
                        });

                        Promise.all(moviePromises).then(function(results) {
                            filteredMovies = results;
                            checkAndDisplayMovies();
                        });

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
                        <p><a href="https://www.youtube.com/results?search_query=${data.Title} ${data.Year} trailer" target="_blank">Watch Trailer</a></p>
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
