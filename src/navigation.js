import { headerSection, trendingPreviewSection, categoriesPreviewSection, genericSection, movieDetailSection, likedMoviesSection, searchForm, trendingMoviesPreviewList, categoriesPreviewList, movieDetailCategoriesList, relatedMoviesContainer, likedMoviesListArticle, headerTitle, arrowBtn, headerCategoryTitle, searchFormInput, searchFormBtn, trendingBtn, movieDetailTitle, movieDetailDescription, movieDetailScore } from "./nodes"
import { getTrendingMoviesPreview, getCategoriesMoviesPreview, getMovieById, getMoviesByCategories, getMoviesBySearch, getPaginatedMoviesByCategory, getPaginatedMoviesBySearch, getPaginatedTrendingMovies, getTrendingMovies, getLikedMovies} from "./main"


// const searchHistory = []
export const page = {num: 1}
let infiniteScroll

trendingBtn.addEventListener("click", () => {
    location.hash = "#trends"
})

searchFormBtn.addEventListener("click", (event) => {
    location.hash = "#search=" + searchFormInput.value
    event.preventDefault()
    return false

    // // se guarda en searchHistory el historial de búsqueda
    // searchHistory.push(location.hash.split("=")[1])
})

arrowBtn.addEventListener("click", () => {
    searchFormInput.value = ""
    history.back()
    location.hash = "#home"

    // // se verifica si existe historial de búsqueda
    // if(searchHistory.length <= 1) {
    //     location.hash = "#home"
    //     searchFormInput.value = ""
    //     searchHistory.pop()
    // } else {
    //     searchHistory.pop()
    //     location.hash = `search=${searchHistory[searchHistory.length - 1]}`
    //     searchFormInput.value = searchHistory[searchHistory.length - 1]
    // }
    
})

window.addEventListener('DOMContentLoaded', navigatorController, false);
window.addEventListener('hashchange', navigatorController, false);
window.addEventListener('scroll', infiniteScroll, false)

function navigatorController() {
    if(infiniteScroll) {
        window.removeEventListener("scroll", infiniteScroll, {passive: false})
        infiniteScroll = undefined
    }

    if(location.hash.startsWith("#trends")) {
        trendsPage()
    } else if(location.hash.startsWith("#search=")) {
        searchPage()
    } else if(location.hash.startsWith("#movie=")) {
        movieDetailsPage()
    } else if(location.hash.startsWith("#category=")) {
        categoryPage()
    } else {
        homePage()
    }

    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0

    relatedMoviesContainer.scrollLeft = 0

    if(infiniteScroll) {
        window.addEventListener("scroll", infiniteScroll, {passive: true})
    }
}

function homePage() {
    console.log("Home!")

    //header
    headerSection.classList.remove("header-container--long")
    headerSection.style.background = ""
    arrowBtn.classList.add("inactive")
    headerTitle.classList.remove("inactive")
    headerCategoryTitle.classList.add("inactive")
    searchForm.classList.remove("inactive")

    //sections
    trendingPreviewSection.classList.remove("inactive")
    categoriesPreviewSection.classList.remove("inactive")
    // likedMoviesSection.classList.remove("inactive")
    localStorage.getItem(`liked-movies`) != null && localStorage.getItem(`liked-movies`) != '{}' && location.hash === '' ? likedMoviesSection.classList.remove("inactive") : likedMoviesSection.classList.add("inactive")
    genericSection.classList.add("inactive")
    movieDetailSection.classList.add("inactive")

    getTrendingMoviesPreview()
    getCategoriesMoviesPreview()
    getLikedMovies()
    page.num = 1
}

function trendsPage() {
    console.log("Trends!")

    headerSection.classList.remove("header-container--long")
    headerSection.style.background = ""
    arrowBtn.classList.remove("header-arrow--white")
    arrowBtn.classList.remove("inactive")
    headerTitle.classList.add("inactive")
    headerCategoryTitle.classList.remove("inactive")
    searchForm.classList.add("inactive")

    //sections
    trendingPreviewSection.classList.add("inactive")
    categoriesPreviewSection.classList.add("inactive")
    likedMoviesSection.classList.add("inactive")
    genericSection.classList.remove("inactive")
    movieDetailSection.classList.add("inactive")

    headerCategoryTitle.innerHTML = "Tendencias"

    getTrendingMovies()
    infiniteScroll = getPaginatedTrendingMovies
}

function searchPage() {
    console.log("Search!")

    headerSection.classList.remove("header-container--long")
    headerSection.style.background = ""
    arrowBtn.classList.remove("header-arrow--white")
    arrowBtn.classList.remove("inactive")
    headerTitle.classList.add("inactive")
    headerCategoryTitle.classList.add("inactive")
    searchForm.classList.remove("inactive")

    //sections
    trendingPreviewSection.classList.add("inactive")
    categoriesPreviewSection.classList.add("inactive")
    likedMoviesSection.classList.add("inactive")
    genericSection.classList.remove("inactive")
    movieDetailSection.classList.add("inactive")

    const [_, query] = location.hash.split("=") // [#search, query]
    getMoviesBySearch(query)
    infiniteScroll = getPaginatedMoviesBySearch(query) // retorna una closure
}

function movieDetailsPage() {
    console.log("Movie!")

    headerSection.classList.add("header-container--long")
    // headerSection.style.background = ""
    arrowBtn.classList.add("header-arrow--white")
    arrowBtn.classList.remove("inactive")
    headerTitle.classList.add("inactive")
    headerCategoryTitle.classList.add("inactive")
    searchForm.classList.add("inactive")

    //sections
    trendingPreviewSection.classList.add("inactive")
    categoriesPreviewSection.classList.add("inactive")
    likedMoviesSection.classList.add("inactive")
    genericSection.classList.add("inactive")
    movieDetailSection.classList.remove("inactive")

    const [_, movieId] = location.hash.split("=") // [#movie, 234124]
    getMovieById(movieId)
}

function categoryPage() {
    console.log("Category!")

    headerSection.classList.remove("header-container--long")
    headerSection.style.background = ""
    arrowBtn.classList.remove("header-arrow--white")
    arrowBtn.classList.remove("inactive")
    headerTitle.classList.add("inactive")
    headerCategoryTitle.classList.remove("inactive")
    searchForm.classList.add("inactive")

    //sections
    trendingPreviewSection.classList.add("inactive")
    categoriesPreviewSection.classList.add("inactive")
    likedMoviesSection.classList.add("inactive")
    genericSection.classList.remove("inactive")
    movieDetailSection.classList.add("inactive")

    const [_, categoryData] = location.hash.split("=") // [category, 3434-action]
    const [categoryId, categoryName] = categoryData.split("-")

    headerCategoryTitle.innerHTML = decodeURI(categoryName)
    getMoviesByCategories(categoryId)
    infiniteScroll = getPaginatedMoviesByCategory(categoryId)
}