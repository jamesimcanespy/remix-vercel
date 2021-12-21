
export type ShowcaseEntry = {
  id:number
  name: string
  roku: string
}

export type Video = {
  url: string
  quality: string
  videoType: string
  bitrate: number  
}

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

export type VimeoShowcase = {
  providerName: string,
  lastUpdated:  string, //Date,
  language: string,
  shortFormVideos?: ShortFormVideo[],
  movies?: Movie[]
}


export const loadShowcaseById = async (id:number): Promise<VimeoShowcase> => {
  const token = process.env.TOKEN

  const roku = showcases.find(s => s.id === id)?.roku || ''

  const url = `https://vimeo.com/showcase/${id}/feed/roku/${roku}`
  //console.log('loadShowcase', url)
  const resp = await fetch(url, { headers: new Headers({'Authorization' : 'Bearer ${token}'}) })
  const json = await resp.json()
  return json
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
  //console.log(`showcase ${tag}`, showcaseMovies.length, 'movies', movies.length)
 
  return movies;
}

export const loadShowcases = async (): Promise<VimeoShowcase> => {
  let movies: any[] = []
  let short: any[] = []

  for( let s of showcases) {
    const show = await loadShowcaseById(s.id)
    if (show.shortFormVideos) {
      short = addMoviesFromShowcase(s.name, show.shortFormVideos, short)
      console.log('shortFormVideos', s.name, show.shortFormVideos?.length,'total', movies.length) //, show.shortFormVideos.map(s => s.id))
    }
    if (show.movies) {
      movies = addMoviesFromShowcase(s.name, show.movies, movies)
      console.log('movies', s.name, show.movies?.length, 'total', movies.length) //, show.movies.map(m => m.id)) 
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

export const transform = (m:Movie, name:string) => {
  m.tags = [...m.tags, name]
  return m
}

 
export const showcases: ShowcaseEntry[] = [ 
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