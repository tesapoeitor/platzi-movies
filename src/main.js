import "../styles/app.css"
import { API_KEY } from "./secret"
import { likedMoviesListArticle, trendingMoviesPreviewList, categoriesPreviewList, genericSection, headerSection, movieDetailTitle, movieDetailDescription, movieDetailScore, movieDetailCategoriesList, relatedMoviesContainer, likedMoviesSection } from "./nodes"
import { page } from "./navigation"

let maxPages

// Data
const api = axios.create({
    baseURL: "https://api.themoviedb.org/3/",
    params: {
        "api_key": API_KEY,
        "language": "es-ES"
    }
})

function likesMoviesList() {
    const data = JSON.parse(localStorage.getItem("liked-movies"))
    let movies 

    
    if(data) {
        movies = data
    } else {
        movies = {}
    }

    return movies
}

function likeMovies(movie) {
    const likedMovies = likesMoviesList()

    if(likedMovies[movie.id]) {
        likedMovies[movie.id] = undefined
    } else {
        likedMovies[movie.id] = movie
    }
    localStorage.setItem("liked-movies", JSON.stringify(likedMovies))

    getTrendingMoviesPreview()
    getLikedMovies()
    //para que se oculte la sección de favoritos en caso de que este vacía 
    localStorage.getItem(`liked-movies`) != null && localStorage.getItem(`liked-movies`) != '{}' && location.hash === '' ? likedMoviesSection.classList.remove("inactive") : likedMoviesSection.classList.add("inactive")
}


// Utils
const lazyLoading = new IntersectionObserver(entries => {
    entries.forEach( entry => {
        if(entry.isIntersecting) {
            const url = entry.target.getAttribute("data-img")
            entry.target.setAttribute("src", url)
        }
    })
})

export async function getTrendingMoviesPreview() {
    // const res = await fetch('trending/movie/day')
    // const data = await res.json() as Trending

    const { data } = await api.get("trending/movie/day")
    const movies = data.results

    console.log("trending", movies)
    createMovies(movies, trendingMoviesPreviewList, {lazyLoad: true, clean: true})
}

export async function getCategoriesMoviesPreview() {
    // const res = await fetch('https://api.themoviedb.org/3/genre/movie/list?api_key=' + API_KEY)
    // const data = await res.json()

    const { data } = await api.get("genre/movie/list")
    const genres = data.genres

    console.log("categories", genres)

    createCategories(genres, categoriesPreviewList)
}

export async function getMoviesByCategories(id) {
    const { data } = await api.get("discover/movie", {
        params: {
            with_genres: id
        }
    })
    const movies = data.results
    maxPages = data.total_pages

    createMovies(movies, genericSection, {lazyLoad: true, clean: true})
}

export function getPaginatedMoviesByCategory(id) {
    return async function() {
        const { scrollTop, scrollHeight, clientHeight} = document.documentElement
        const scrollIsBottom = (scrollTop + clientHeight) >= scrollHeight - 40

        const isNotMaxPage = page.num < maxPages
        
        if (scrollIsBottom && isNotMaxPage) {
            page.num ++
            console.log("category page:", page.num)

            const { data } = await api.get("discover/movie", {
                params: {
                    with_genres: id,
                    page: page.num
                }
            })
            const movies = data.results
            createMovies(movies, genericSection, {lazyLoad: true, clean: false})
        }
    }
}

export async function getMoviesBySearch(query) {
    const { data } = await api.get("search/movie", {
        params: {
            query
        }
    }) 
    const movies = data.results
    maxPages = data.total_pages
    console.log(maxPages)
    
    createMovies(movies, genericSection, {lazyLoad: true, clean: true})
}

export function getPaginatedMoviesBySearch(query) {
    return async function() {
        const { scrollTop, scrollHeight, clientHeight} = document.documentElement
        const scrollIsBottom = (scrollTop + clientHeight) >= scrollHeight - 40

        const isNotMaxPage = page.num < maxPages
        
        if (scrollIsBottom && isNotMaxPage) {
            page.num ++
            console.log("search page:", page.num)

            const { data } = await api.get("search/movie", {
                params: {
                    query,
                    page: page.num
                }
            }) 
            const movies = data.results
            createMovies(movies, genericSection, {lazyLoad: true, clean: false})
        }
    }
}

export async function getTrendingMovies() {
    // const res = await fetch('trending/movie/day')
    // const data = await res.json() as Trending

    const { data } = await api.get("trending/movie/day")
    const movies = data.results
    maxPages = data.total_pages

    console.log("trending", movies)
    createMovies(movies, genericSection, {lazyLoad: true, clean: true})
}

export async function getPaginatedTrendingMovies() {
    const { scrollTop, scrollHeight, clientHeight} = document.documentElement
    const scrollIsBottom = (scrollTop + clientHeight) >= scrollHeight - 40

    const isMaxPage = page.num < maxPages
    
    if (scrollIsBottom && isMaxPage) {
        page.num ++
        console.log(" trending page:", page.num)

        const { data } = await api.get("trending/movie/day", {
            params: {
                page: page.num
            }
        })
        const movies = data.results
        createMovies(movies, genericSection, {lazyLoad: true, clean: false})
    }
}

export async function getMovieById(movieId) {
    // const res = await fetch('trending/movie/day')
    // const data = await res.json() as Trending

    const { data: movie } = await api.get("movie/" + movieId)

    const movieImgUrl = `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
    headerSection.style.background = `
    linear-gradient(180deg, rgba(0, 0, 0, 0.35) 19.27%, rgba(0, 0, 0, 0) 29.17%),
    url(${movieImgUrl})`
    
    const releaseDate = movie.release_date.split("-")[0]

    movieDetailTitle.textContent = releaseDate ? `${movie.title} (${releaseDate})` : `${movie.title}`
    movieDetailDescription.textContent = movie.overview
    movieDetailScore.textContent = movie.vote_average.toFixed(1)

    console.log("Movie: ", movie)
    createCategories(movie.genres, movieDetailCategoriesList)
    getRelatedMoviesId(movieId)
    
}

async function getRelatedMoviesId(movieId) {
    const { data } = await api.get(`movie/${movieId}/similar`)
    const relatedMovies = data.results
    console.log(relatedMovies)

    createMovies(relatedMovies, relatedMoviesContainer, {lazyLoad: true, clean: true})
}

function createMovies(movies, container, {lazyLoad = false, clean= true }) {
    if(clean) {
        container.innerHTML = ""
    }

    movies.forEach(movie => {
        const movieContainer = document.createElement("div")
        movieContainer.classList.add("movie-container")

        const movieImg = document.createElement("img")
        movieImg.classList.add("movie-img")
        movieImg.setAttribute("alt", movie.title)
        movieImg.setAttribute(
            lazyLoad ? "data-img" : "src",
            `https://image.tmdb.org/t/p/w300${movie.poster_path}` 
        )

        movieImg.addEventListener("error", () => {
            movieImg.setAttribute("src", "https://static.platzi.com/static/images/error/img404.png")
        })
        movieImg.addEventListener("click", () => {
            location.hash = "#movie=" + movie.id
        })

        const movieBtn = document.createElement("button")
        movieBtn.classList.add("movie-btn")
        likesMoviesList()[movie.id] ? movieBtn.classList.add("movie-btn--liked") : movieBtn.classList.remove("movie-btn--liked") 
        movieBtn.addEventListener("click", () => {
            movieBtn.classList.toggle("movie-btn--liked")
            likeMovies(movie)
        })

        if(lazyLoad) {
            lazyLoading.observe(movieImg)
        }

        movieContainer.appendChild(movieImg)
        movieContainer.appendChild(movieBtn)
        container?.appendChild(movieContainer)
    });
}

function createCategories(genres, container) {

    container.innerHTML = ""
    genres.forEach(genre => {

        const categoryContainer = document.createElement("div")
        categoryContainer.classList.add("category-container")

        const categoryTitle = document.createElement("h3")
        categoryTitle.classList.add("category-title")
        categoryTitle.setAttribute("id", `id${genre.id}`)
        categoryTitle.addEventListener("click", () => {
            location.hash = `#category=${genre.id}-${genre.name}`
        })

        const categoryTitleText = document.createTextNode(genre.name)

        categoryTitle.appendChild(categoryTitleText)
        categoryContainer.appendChild(categoryTitle)
        container?.appendChild(categoryContainer)
    });
}

export function getLikedMovies() {
    const likedMovies = likesMoviesList()
    const movies = Object.values(likedMovies) // Para convertir en un array

    createMovies(movies, likedMoviesListArticle, {lazyLoad: true, clean: true})
}