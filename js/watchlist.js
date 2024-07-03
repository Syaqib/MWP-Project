$(document).ready(function() {
    // Get the watchlist from localStorage
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

    // Function to fetch movie details by ID
    function fetchMovieDetails(movieId, callback) {
        $.ajax({
            url: `http://www.omdbapi.com/?i=${movieId}&apikey=52d4ad03`,
            method: 'GET',
            success: function(data) {
                if (data.Response === "True") {
                    callback(data);
                }
            }
        });
    }

    // Populate the watchlist container
    function populateWatchlist() {
        let $container = $('#watchlist-container');
        $container.empty();

        if (watchlist.length === 0) {
            $container.append('<p>Your watchlist is empty.</p>');
            return;
        }

        watchlist.forEach(movieId => {
            fetchMovieDetails(movieId, function(movieDetails) {
                let movieElement = `
                    <div class="movie">
                        <img src="${movieDetails.Poster}" alt="${movieDetails.Title}">
                        <h2>${movieDetails.Title} (${movieDetails.Year})</h2>
                        <p>${movieDetails.Plot}</p>
                        <button class="remove-button">Remove from Watchlist</button>
                    </div>
                `;
                $container.append(movieElement);
            });
        });
    }

    function removeFromWatchlist(movieId){
        watchlist = watchlist.filter(id => id !== movieId);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        populateWatchlist();
        location.reload();
    }

    $('#watchlist-container').on('click', '.remove-button', function(){
        let movieId = $(this).closest('.movie').data('id');
        console.log('Movie has been removed from watchlist', movieId);
        removeFromWatchlist(movieId);
    });
});
