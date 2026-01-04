// TypeScript types for the projects table
export type Project = {
  id: string
  user_id: string
  name: string
  created_at: string
  updated_at: string
}

export type NewProject = {
  name: string
}

export type UpdateProject = {
  name?: string
}

