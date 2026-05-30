import { Container, Stack } from '@mantine/core';
import {
  ApiStatusSection,
  DashboardHeaderSection,
  DashboardOverviewSection,
} from './sections';

function DashboardPage() {
  return (
    <div className="dashboard-page">
      <Container className="dashboard-container" size="xl">
        <Stack gap="xl">
          <DashboardHeaderSection />

          <section className="dashboard-content-grid">
            <DashboardOverviewSection />
            <ApiStatusSection />
          </section>
        </Stack>
      </Container>
    </div>
  );
}

export default DashboardPage;
