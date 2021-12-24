import { promises as fs, existsSync } from 'fs'
import { json } from 'remix'

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

// direct publisher ShortFormVideo entry
export type ShortFormVideo = {
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

// direct publisher
export type DirectPublisher = {
  providerName: string,
  lastUpdated:  string, //Date,
  language: string,
  shortFormVideos?: ShortFormVideo[],
  movies?: Movie[]
}

// vimeo direct publisher result
export type VimeoDirectPublisherResult = {
  name: string,
  publisher: DirectPublisher
}

// Vimeo showcase entry
export type ShowcaseEntry = {
  id:number
  name: string
  roku: string
}


export const getShowcaseEntry = (id:number): ShowcaseEntry | undefined => {
  return getVimeoShowCases().find(s => s.id === id)
}

export const getShowcaseById = async (id:number): Promise<DirectPublisher> => {
  const token = process.env.TOKEN

  const roku = getShowcaseEntry(id)?.roku || ''

  const url = `https://vimeo.com/showcase/${id}/feed/roku/${roku}`
  //console.log('loadShowcase', url)
  const resp = await fetch(url, { headers: new Headers({'Authorization' : 'Bearer ${token}'}) })
  const json = await resp.json()
  return json
}

// 
export const getDirectPublisherResultForShowcase = async (id:number, name: string): Promise<VimeoDirectPublisherResult> => {
  const publisher = await getShowcaseById(id)
  return {
    name,
    publisher
  }
}

function addMoviesFromShowcase(tag:string, showcaseMovies:Movie[], movies:Movie[]): Movie[] {
  tag = tag.toLowerCase()
  for (let scMovie of showcaseMovies) {
    // find movie in existing movie list
    const pos = movies.findIndex(m => m.id===scMovie.id)
   
    if (pos == -1 ) {       
        if (scMovie.tags.indexOf(tag)==-1) scMovie.tags.push(tag);
        movies = movies.concat(scMovie)
    } else {
      if (movies[pos].tags.indexOf(tag)==-1) movies[pos].tags.push(tag);
    }
  }
  return movies;
}

export const generateDirectPublisherFeed = async (): Promise<DirectPublisher> => {
  let movies: any[] = []
  let short: any[] = []

  // retrive the list of vimeo showcases to add to the publisher feed
  const showcases = getVimeoShowCases()

  // fetch vimeo showcase results in parallel
  const results:VimeoDirectPublisherResult[] = await Promise.all(
    showcases.map( (s:ShowcaseEntry) => getDirectPublisherResultForShowcase(s.id, s.name) )
  )

  // process each shopwcase result adding movies to Directpublisher feed
  for( let result of results) {
    if (result.publisher.shortFormVideos) {
      movies = addMoviesFromShowcase(result.name, result.publisher.shortFormVideos, movies)
      console.log('shortFormVideos', result.name, result.publisher.shortFormVideos?.length,'total', movies.length) //, show.shortFormVideos.map(s => s.id))
    }
    if (result.publisher.movies) {
      movies = addMoviesFromShowcase(result.name, result.publisher.movies, movies)
      console.log('movies', result.name, result.publisher.movies?.length, 'total', movies.length) //, show.movies.map(m => m.id)) 
    }
  }
  return  { 
    providerName: 'James McAnespy',
    lastUpdated: new Date().toISOString(),
    language: 'en',
    movies: movies,
    shortFormVideos: short
  } 

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