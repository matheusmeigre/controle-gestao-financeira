import { DashboardClient } from '@/features/dashboard/components/DashboardClient'
import { getDashboardInitialData } from '@/features/dashboard/services/dashboard.query'
import { AppShell } from '@/components/app-shell'

export default async function HomePage() {
  const initialData = await getDashboardInitialData()

  return (
    <AppShell>
      <DashboardClient initialData={initialData} />
    </AppShell>
  )
}
