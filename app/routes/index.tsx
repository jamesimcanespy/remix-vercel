
import { LoaderFunction, json } from 'remix'
import { loadShowcases } from '~/data/lib'

export const loader: LoaderFunction = async () => {
  const showcase = await loadShowcases()
  return json(showcase)
}

