export interface User {
  id: string
  username: string
  displayName: string
  avatar: string
  server: string
  email?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Mock users for demo
const mockUsers: User[] = [
  {
    id: "1",
    username: "alice",
    displayName: "Alice Johnson",
    avatar: "/diverse-user-avatars.png",
    server: "mastodon.social",
    email: "alice@example.com",
  },
  {
    id: "2",
    username: "bob",
    displayName: "Bob Chen",
    avatar: "/diverse-woman-avatar.png",
    server: "fosstodon.org",
    email: "bob@example.com",
  },
  {
    id: "3",
    username: "carol",
    displayName: "Carol Smith",
    avatar: "/diverse-designer-avatars.png",
    server: "mas.to",
    email: "carol@example.com",
  },
]

export function mockLogin(username: string, password: string): Promise<User | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = mockUsers.find((u) => u.username === username)
      if (user && password === "password") {
        resolve(user)
      } else {
        resolve(null)
      }
    }, 1000)
  })
}

export function mockLogout(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 500)
  })
}
