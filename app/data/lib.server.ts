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
  publisher: DirectPublisher
}

// Vimeo showcase entry
type ShowcaseEntry = {
  id:number
  name: string
  roku: string
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
  return {
    entry,
    publisher
  }
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
      if (scMovie.tags.indexOf(showcaseName)==-1) scMovie.tags.push(showcaseName);
      movies = movies.concat(scMovie)
    } else {
      // movie found so add showcase name to movie tags
      if (movies[pos].tags.indexOf(showcaseName)==-1) movies[pos].tags.push(showcaseName);
    }
  }
  return movies;
}

// update DirectPublisher with ShowcaseDirectPublisher result
const updateDirectPublisher = (showcase: ShowcaseDirectPublisherResult, publisher: DirectPublisher) : DirectPublisher => {
  // check if showcase direct publisher contains short form videos
  if (showcase.publisher.shortFormVideos) {
    publisher.shortFormVideos = addMoviesFromShowcase(showcase.entry.name, showcase.publisher.shortFormVideos, publisher.shortFormVideos)
    console.log('shortFormVideos', showcase.entry.name, showcase.publisher.shortFormVideos?.length,'total', publisher.movies.length)
  }
  // check if showcase direct publisher contains movies
  if (showcase.publisher.movies) {
    publisher.movies = addMoviesFromShowcase(showcase.entry.name, showcase.publisher.movies, publisher.movies)
    console.log('movies', showcase.entry.name, showcase.publisher.movies?.length, 'total', publisher.movies.length)
  }
  return publisher
}

// list of showcases published on Vimeo
export const getVimeoShowCases = () : ShowcaseEntry[] => {
  return [ 
    { id: 8982324, roku: 'f6b8757fea', name: 'Place'},
    { id: 8721204, roku: '89a270df1c', name: 'Drama'},
    { id: 8501222, roku: '71d386c098', name: 'Chats'},
    { id: 8379104, roku: '3209eecaf6', name: 'Sport'},
    { id: 8139461, roku: 'db1f402180', name: 'Cuisine'},
    { id: 8139225, roku: '320d714527', name: 'Comedy'},
    { id: 8129575, roku: 'a6f185f893', name: 'Editorial'},
    { id: 8116301, roku: '56c931dca2', name: 'Music'},
    //{ id: 8116289, roku: 'badbe9d735', name: 'Frontier Pictures'},
    { id: 8111312, roku: '4a6071e726', name: 'Factual'},
    { id: 8110962, roku: '307a40bc51', name: 'History'}
  ]
}