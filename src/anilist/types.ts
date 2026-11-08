export interface Character {
  id: number
  name: string
  image: string | null
  description: string | null
  animeTitles: string[]
}

export interface PageInfo {
  currentPage: number
  hasNextPage: boolean
  lastPage: number
  total: number
}
