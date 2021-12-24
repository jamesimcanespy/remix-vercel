
import { LoaderFunction, json } from 'remix'
import { generateDirectPublisherFeed } from '~/data/lib.server'

export const loader: LoaderFunction = async () => {  
  const feed = await generateDirectPublisherFeed()
  return json(feed)
}

