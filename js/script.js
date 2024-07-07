$(document).ready(function() {
    const featuredMovies = [
        { title: "The Fast and the Furious: Tokyo Drift", year: "2006" },
        { title: "Inside Out 2", year: "2024" },
        { title: "Hunger Games", year: "2012" },
        { title: "Rush Hour 3", year: "2007" },
        { title: "Transformers: Rise of the Beasts", year: "2023" },
        { title: "Ip Man: The Awakening", year: "2021" },
        { title: "Real Steel", year: "2011" },
        { title: "Stand by Me Doraemon", year: "2014" },
        { title: "Oppenheimer", year: "2023" },
        { title: "Sonic the Hedgehog 2", year: "2022" },
        { title: "The Batman", year: "2022" },
        { title: "The Flash", year: "2023" },
        { title: "The Matrix Resurrections", year: "2021" },
        { title: "The Northman", year: "2022" },
        { title: "The Unbearable Weight of Massive Talent", year: "2022" },
        { title: "Thor: Love and Thunder", year: "2022" },
        { title: "Top Gun: Maverick", year: "2022" },
        { title: "Uncharted", year: "2022" }
    ];

    const apiKey = '52d4ad03';

    function fetchMovies(url, callback) {
        $.ajax({
            url: url,
            method: 'GET',
            success: function(data) {
                if (data.Response === "True") {
                    callback(data);
                } else {
                    console.log("Error fetching movies:", data.Error);
                }
            }
        });
    }

    function displayMovies(movies, containerId) {
        const container = $(`#${containerId}`);
        container.empty();
        movies.forEach(movie => {
            const reviews = JSON.parse(localStorage.getItem(`reviews-${movie.imdbID}`)) || [];
            const reviewCount = reviews.length;
            const averageRating = reviews.reduce((acc, review) => acc + parseInt(review.rating), 0) / (reviewCount || 1);
            const movieItem = `
                <div class="movie-item" data-id="${movie.imdbID}">
                    <img src="${movie.Poster}" alt="${movie.Title} Poster">
                    <h4>${movie.Title} (${movie.Year})</h4>
                    <div class="review-info">⭐ ${averageRating.toFixed(1)} <span style="color: gold;">(${reviewCount} reviews)</span></div>
                </div>
            `;
            container.append(movieItem);
        });
    }

    function fetchFeaturedMovies() {
        let movieDataArray = [];
        featuredMovies.forEach(movie => {
            const url = `http://www.omdbapi.com/?t=${encodeURIComponent(movie.title)}&y=${movie.year}&apikey=${apiKey}`;
            fetchMovies(url, data => {
                movieDataArray.push(data);
                if (movieDataArray.length === featuredMovies.length) {
                    displayMovies(movieDataArray, 'movie-slider');
                }
            });
        });
    }

    function getQueryParams() {
        let params = {};
        let searchParams = new URLSearchParams(window.location.search);
        for (let [key, value] of searchParams.entries()) {
            params[key] = value;
        }
        return params;
    }

    function getDecadeRange(releaseDate) {
        switch (releaseDate) {
            case '2021-current':
                return { start: 2021, end: new Date().getFullYear() };
            case '2011-2020':
                return { start: 2011, end: 2020 };
            case '2001-2010':
                return { start: 2001, end: 2010 };
            case '1991-2000':
                return { start: 1991, end: 2000 };
            case '1981-1990':
                return { start: 1981, end: 1990 };
            case '1971-1980':
                return { start: 1971, end: 1980 };
            case '1961-1970':
                return { start: 1961, end: 1970 };
            case '1951-1960':
                return { start: 1951, end: 1960 };
            case '1941-1950':
                return { start: 1941, end: 1950 };
            case '1931-1940':
                return { start: 1931, end: 1940 };
            case '1921-1930':
                return { start: 1921, end: 1930 };
            case '1911-1920':
                return { start: 1911, end: 1920 };
            default:
                return null;
        }
    }

    function displaySearchResults() {
        let params = getQueryParams();
        if (params.query) {
            let url = `http://www.omdbapi.com/?s=${params.query}&apikey=${apiKey}`;
            fetchMovies(url, data => {
                if (data.Response === "True") {
                    let movies = data.Search;
                    let filteredMovies = [];
                    let decadeRange = getDecadeRange(params.releaseDate);

                    let filterGenre = (movie, callback) => {
                        let movieUrl = `http://www.omdbapi.com/?i=${movie.imdbID}&apikey=${apiKey}`;
                        fetchMovies(movieUrl, movieData => {
                            let movieYear = parseInt(movieData.Year);
                            if ((!params.genre || movieData.Genre.toLowerCase().includes(params.genre.toLowerCase())) &&
                                (!params.releaseDate || (movieYear >= decadeRange.start && movieYear <= decadeRange.end))) {
                                callback(movieData);
                            } else {
                                callback(null);
                            }
                        });
                    };

                    let moviePromises = movies.map(movie => {
                        return new Promise((resolve, reject) => {
                            filterGenre(movie, filteredMovie => {
                                resolve(filteredMovie);
                            });
                        });
                    });

                    Promise.all(moviePromises).then(results => {
                        filteredMovies = results.filter(movie => movie);
                        displayMovies(filteredMovies, 'results');
                    });
                } else {
                    $('#results').html('<p>No movies found</p>');
                }
            });
        }
    }

    function fetchRecentlyViewedMovies() {
        let recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
        if (recentlyViewed.length > 0) {
            let movieDataArray = [];
            recentlyViewed.forEach(movieId => {
                const url = `http://www.omdbapi.com/?i=${movieId}&apikey=${apiKey}`;
                fetchMovies(url, data => {
                    movieDataArray.push(data);
                    if (movieDataArray.length === recentlyViewed.length) {
                        displayMovies(movieDataArray, 'recently-viewed');
                    }
                });
            });
        } else {
            $('#recently-viewed').html('<p>No recently viewed movies</p>');
        }
    }

    if (window.location.pathname.endsWith('search-result.html')) {
        displaySearchResults();
    } else {
        fetchFeaturedMovies();
        fetchRecentlyViewedMovies();
    }

    // Redirect to movie-details.html on click
    $('.movie-slider, #recently-viewed, #results').on('click', '.movie-item', function() {
        const movieId = $(this).data('id');
        let recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
        if (!recentlyViewed.includes(movieId)) {
            recentlyViewed.push(movieId);
            if (recentlyViewed.length > 10) {
                recentlyViewed.shift(); // Keep only the last 10 viewed movies
            }
            localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
        }
        window.location.href = `movie-details.html?id=${movieId}`;
    });

    // Arrow navigation
    function scrollSlider(sliderId, direction) {
        const slider = $(`#${sliderId}`);
        const scrollAmount = direction === 'next' ? slider.width() : -slider.width();
        slider.animate({ scrollLeft: slider.scrollLeft() + scrollAmount }, 600);
    }

    $('#featured-prev').click(() => scrollSlider('movie-slider', 'prev'));
    $('#featured-next').click(() => scrollSlider('movie-slider', 'next'));

    // Search functionality with genre filter
    $('#search-button').click(function() {
        let query = $('#search-bar').val();
        let genre = $('#genre-select').val();
        let releaseDate = $('#release-date').val();

        let searchParams = new URLSearchParams();
        searchParams.append("query", query);
        if (genre) searchParams.append("genre", genre);
        if (releaseDate) searchParams.append("releaseDate", releaseDate);

        window.location.href = `search-result.html?${searchParams.toString()}`;
    });

    // For movie-details.html
    let urlParams = new URLSearchParams(window.location.search);
    let movieId = urlParams.get('id');
    if (movieId) {
        let url = `http://www.omdbapi.com/?i=${movieId}&apikey=${apiKey}`;
        fetchMovies(url, data => {
            let output = `
                <h2>${data.Title} (${data.Year})</h2>
                <img src="${data.Poster}" alt="${data.Title} Poster">
                <p><strong>Director:</strong> ${data.Director}</p>
                <p><strong>Cast:</strong> ${data.Actors}</p>
                <p><strong>Genre:</strong> ${data.Genre}</p>
                <p><strong>Plot:</strong> ${data.Plot}</p>
                <p><strong>Duration:</strong> ${data.Runtime}</p>
                <p><strong>Release Date:</strong> ${data.Released}</p>
                <p><a href="https://www.youtube.com/results?search_query=${data.Title} ${data.Year} trailer" target="_blank">Watch Trailer</a></p>
                <button id="add-to-watchlist" data-id="${data.imdbID}">Add to Watchlist</button>
            `;
            $('#movie-details').html(output);
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

        // Handle star rating selection
        $('#rating-stars .star').hover(
            function() { $(this).addClass('hovered').prevAll().addClass('hovered'); },
            function() { $(this).removeClass('hovered').prevAll().removeClass('hovered'); }
        );

        $('#rating-stars .star').click(function() {
            let rating = $(this).data('value');
            $('#rating').val(rating);
            $(this).addClass('selected').siblings().removeClass('selected hovered');
            $(this).prevAll().addClass('selected').removeClass('hovered');
        });

        // Word count for review text
        $('#review-text').on('input', function() {
            let wordCount = $(this).val().split(/\s+/).filter(word => word.length > 0).length;
            $('#word-count').text(`${wordCount}/200 words`);
        });

        // Handle review submission
        $('#review-form').submit(function(event) {
            event.preventDefault();
            let reviewText = $('#review-text').val();
            let rating = $('#rating').val();
            let reviews = JSON.parse(localStorage.getItem(`reviews-${movieId}`)) || [];
            reviews.push({ text: reviewText, rating: rating, name: 'Anonymous' });
            localStorage.setItem(`reviews-${movieId}`, JSON.stringify(reviews));
            displayReviews(movieId);
        });

        function displayReviews(movieId) {
            let reviews = JSON.parse(localStorage.getItem(`reviews-${movieId}`)) || [];
            let reviewsHtml = reviews.map(review => `
                <p>${review.text} - Rating: ${'&#9733;'.repeat(review.rating)}<br><strong>By:</strong> ${review.name}</p>
            `).join('');
            $('#reviews-container').html(reviewsHtml);
        }

        displayReviews(movieId);
    }
});
