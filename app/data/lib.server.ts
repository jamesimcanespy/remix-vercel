import showcases from './showcases.server.json';
import moviesWithAdBreaks from './movie.ads.json';

// ============== declare types ===================

// direct publisher video entry
export type Video = {
  url: string
  quality: string
  videoType: string
  bitrate: number  
}

// direct publisher movie entry
export type Movie = {
  id: number
  title: string
  shortDescription: string
  thumbnail: string
  releaseDate: Date
  genres: string[]
  tags: string[]
  content: {
    dateAdded: Date
    duration: number
    videos: Video[]
    adBreaks: String[]
  }
}

// roku direct publisher feed
export type DirectPublisher = {
  providerName: string,
  lastUpdated:  string, //Date,
  language: string,
  shortFormVideos: Movie[],
  movies: Movie[]
}

// vimeo direct publisher result
type ShowcaseDirectPublisherResult = {
  entry: ShowcaseEntry,
  publisherWithAdBreaks: DirectPublisher
}

// Vimeo showcase entry
type ShowcaseEntry = {
  id: number
  name: string
  roku: string
}

type MovieWithAdBreak = {
  movieTitle: string,
  movieAdBreaks: String[]
}

// ======================== public functions =========================

// generate directpublisher feed from vimeo showcases
export const generateDirectPublisherFeed = async (): Promise<DirectPublisher> => {
  // declare direct publisher result
  let publisher:DirectPublisher = {
    providerName: 'James McAnespy',
    lastUpdated: new Date().toISOString(),
    language: 'en',
    movies: [],
    shortFormVideos: []
  }

  // retrive the list of vimeo showcases to add to the publisher feed
  const showcases = getVimeoShowCases()

  // fetch all vimeo showcase directpublisher results in parallel
  const results:ShowcaseDirectPublisherResult[] = await Promise.all(
    showcases.map( (s:ShowcaseEntry) => getDirectPublisherForShowcase(s) )
  )

  // reduce each showcase directpublisher result into single Directpublisher feed
  publisher = results.reduce((pub:DirectPublisher, showcase:ShowcaseDirectPublisherResult) => updateDirectPublisher(showcase, pub), publisher)
  return publisher
}

// ==================== private utility functions ====================

// retrieve a direct publisher feed for vimeo showcase
const getDirectPublisherForShowcase = async (entry:ShowcaseEntry): Promise<ShowcaseDirectPublisherResult> => {
  const url = `https://vimeo.com/showcase/${entry.id}/feed/roku/${entry.roku}`
  const resp = await fetch(url)
  const publisher = await resp.json()
  const publisherWithAdBreaks = insertAdBreaksInMovie(publisher)
  return {
    entry,
    publisherWithAdBreaks
  }
}

// inserts the associated adBreaks with the movie title found in the movie.ads.json file
const insertAdBreaksInMovie = (publisherWithAdBreaks: DirectPublisher) => {
  // If publisher feed has a movies array
  if (publisherWithAdBreaks.movies !== undefined) {
    // Loop through each movie in the publisher movies array
    publisherWithAdBreaks.movies.forEach(function(movie: Movie) {
      // Search through the moviesWithAdBreaks array for the matching movie title
      const movieHasAdBreaks = moviesWithAdBreaks.find(function(movieWithAdBreak: MovieWithAdBreak) {
        return movieWithAdBreak.movieTitle === movie.title
      })
      // If the matching movie title is found within the moviesWithAdBreaks array then assign the associated adBreaks to the movie
      if (movieHasAdBreaks) {
        // adBreak value format = hh::mm::ss
        movie.content.adBreaks = movieHasAdBreaks.movieAdBreaks
      }
    })
  }
  // If publisher response does not contain a movies key, then response must be for the shortFormVideos feed
  else if (publisherWithAdBreaks.shortFormVideos !== undefined) {
     // Loop through each movie in the publisher shortFormVideos array
     publisherWithAdBreaks.shortFormVideos.forEach(function(movie: Movie) {
      // Search through the moviesWithAdBreaks array for the matching movie title
      const movieHasAdBreaks = moviesWithAdBreaks.find(function(movieWithAdBreak: MovieWithAdBreak) {
        return movieWithAdBreak.movieTitle === movie.title
      })
      // If the matching movie title is found within the moviesWithAdBreaks array then assign the associated adBreaks to the movie
      if (movieHasAdBreaks) {
        // adBreak value format = hh::mm::ss
        movie.content.adBreaks = movieHasAdBreaks.movieAdBreaks
      }
    })
  }
  // return updated publisher feed now with movies including adBreaks
  return publisherWithAdBreaks
}

// add showcase movies to movie list and add showcase name to movie tags
const addMoviesFromShowcase = (showcaseName:string, showcaseMovies:Movie[], movies:Movie[]): Movie[] => {
  showcaseName = showcaseName.toLowerCase()
  // process each movie in showcase
  for (let scMovie of showcaseMovies) {
    // find movie in existing movie list
    const pos = movies.findIndex(m => m.id===scMovie.id)    
    if (pos == -1 ) {    
      // movie not found add showcase name to movie tags and add movie to movie list
      scMovie.tags.push(showcaseName);
      movies.push(scMovie)
    } else {
      // movie found so add showcase name and showcasemovie tags to movie tags 
      movies[pos].tags = movies[pos].tags.concat([showcaseName, ...scMovie.tags])
      // remove duplicates
      movies[pos].tags =  movies[pos].tags.filter((item, index) => movies[pos].tags.indexOf(item) === index)
    }    
  }
  return movies;
}

// update DirectPublisher with ShowcaseDirectPublisher result
const updateDirectPublisher = (showcase: ShowcaseDirectPublisherResult, publisher: DirectPublisher) : DirectPublisher => {
  // check if showcase direct publisher contains short form videos
  if (showcase.publisherWithAdBreaks.shortFormVideos) {
    publisher.shortFormVideos = addMoviesFromShowcase(showcase.entry.name, showcase.publisherWithAdBreaks.shortFormVideos, publisher.shortFormVideos)
    console.log('shortFormVideos', showcase.entry.name, showcase.publisherWithAdBreaks.shortFormVideos?.length,'total', publisher.movies.length)
  }
  // check if showcase direct publisher contains movies
  if (showcase.publisherWithAdBreaks.movies) {
    publisher.movies = addMoviesFromShowcase(showcase.entry.name, showcase.publisherWithAdBreaks.movies, publisher.movies)
    console.log('movies', showcase.entry.name, showcase.publisherWithAdBreaks.movies?.length, 'total', publisher.movies.length)
  }
  return publisher
}

// list of showcases published on Vimeo
export const getVimeoShowCases = () : ShowcaseEntry[] => {
  return showcases
}

// list of movie titles and their adBreaks
export const getMoviesWithAdBreaks = () : MovieWithAdBreak[] => {
  return moviesWithAdBreaks
}