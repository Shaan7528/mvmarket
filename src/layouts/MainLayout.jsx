import { Outlet } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { BottomNav } from '../components/BottomNav'
import { NotificationListener } from '../components/NotificationListener'

export function MainLayout() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <NotificationListener />
      <Navbar />
      <main className="pb-20 md:pb-0 max-w-7xl mx-auto page-enter">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
