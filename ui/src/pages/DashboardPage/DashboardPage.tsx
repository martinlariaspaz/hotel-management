import { Container, Stack } from '@mantine/core';
import type { AuthUser } from '../../features/auth';
import {
  ApiStatusSection,
  DashboardHeaderSection,
  DashboardOverviewSection,
} from './sections';

type DashboardPageProps = {
  isLoggingOut: boolean;
  onLogout(): void;
  user: AuthUser;
};

function DashboardPage({
  isLoggingOut,
  onLogout,
  user,
}: DashboardPageProps) {
  return (
    <main className="dashboard-page">
      <Container className="dashboard-container" size="xl">
        <Stack gap="xl">
          <DashboardHeaderSection
            isLoggingOut={isLoggingOut}
            onLogout={onLogout}
            user={user}
          />

          <section className="dashboard-content-grid">
            <DashboardOverviewSection />
            <ApiStatusSection />
          </section>
        </Stack>
      </Container>
    </main>
  );
}

export default DashboardPage;
