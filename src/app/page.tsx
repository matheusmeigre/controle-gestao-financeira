import { DashboardClient } from '@/features/dashboard/components/DashboardClient'
import { getDashboardInitialData } from '@/features/dashboard/services/dashboard.query'

export default async function HomePage() {
  const initialData = await getDashboardInitialData()

  return <DashboardClient initialData={initialData} />
}
