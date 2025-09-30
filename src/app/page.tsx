import { redirect } from 'next/navigation'

export default async function RootPage() {
  // Redirect to Directory page as the main landing page
  redirect('/directory')
}