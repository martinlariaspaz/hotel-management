import type { ReactNode } from 'react';
import {
  ActionIcon,
  AppShell,
  Badge,
  Burger,
  Button,
  Group,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  BarChart3,
  BedDouble,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  Hotel,
  LayoutDashboard,
  LogOut,
  Settings,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { AuthUser, UserRole } from '../../../auth';
import { useI18n, type TranslationKey } from '../../../../i18n';

type AppNavigationItem = {
  disabled?: boolean;
  icon: LucideIcon;
  id: string;
  labelKey: TranslationKey;
  path: string;
  roles: readonly UserRole[];
};

type AuthenticatedAppShellProps = {
  children: ReactNode;
  isLoggingOut: boolean;
  onLogout(): void;
  utilityControls?: ReactNode;
  user: AuthUser;
};

const allStaffRoles = [
  'admin',
  'reception',
  'housekeeping',
  'management',
] as const satisfies readonly UserRole[];

const navigationItems: readonly AppNavigationItem[] = [
  {
    icon: LayoutDashboard,
    id: 'dashboard',
    labelKey: 'appShell.navigation.dashboard',
    path: '/dashboard',
    roles: allStaffRoles,
  },
  {
    disabled: true,
    icon: CalendarCheck,
    id: 'reservations',
    labelKey: 'appShell.navigation.reservations',
    path: '/reservations',
    roles: ['admin', 'reception', 'management'],
  },
  {
    disabled: true,
    icon: BedDouble,
    id: 'rooms',
    labelKey: 'appShell.navigation.rooms',
    path: '/rooms',
    roles: ['admin', 'reception', 'housekeeping'],
  },
  {
    disabled: true,
    icon: ClipboardList,
    id: 'housekeeping',
    labelKey: 'appShell.navigation.housekeeping',
    path: '/housekeeping',
    roles: ['admin', 'housekeeping'],
  },
  {
    disabled: true,
    icon: CreditCard,
    id: 'payments',
    labelKey: 'appShell.navigation.payments',
    path: '/payments',
    roles: ['admin', 'reception', 'management'],
  },
  {
    disabled: true,
    icon: BarChart3,
    id: 'reports',
    labelKey: 'appShell.navigation.reports',
    path: '/reports',
    roles: ['admin', 'management'],
  },
  {
    icon: Settings,
    id: 'settings',
    labelKey: 'appShell.navigation.settings',
    path: '/settings',
    roles: ['admin'],
  },
];

const roleLabelKeys: Record<UserRole, TranslationKey> = {
  admin: 'common.roles.admin',
  housekeeping: 'common.roles.housekeeping',
  management: 'common.roles.management',
  reception: 'common.roles.reception',
};

function getNavigationItemsForRole(role: UserRole): AppNavigationItem[] {
  return navigationItems.filter((item) => item.roles.includes(role));
}

function AuthenticatedAppShell({
  children,
  isLoggingOut,
  onLogout,
  utilityControls,
  user,
}: AuthenticatedAppShellProps) {
  const [opened, { close, toggle }] = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const visibleNavigationItems = getNavigationItemsForRole(user.role);
  const menuLabel = opened
    ? t('appShell.header.closeNavigation')
    : t('appShell.header.openNavigation');

  return (
    <AppShell
      className="authenticated-shell"
      header={{ height: 68 }}
      navbar={{
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
        width: 280,
      }}
      padding="lg"
    >
      <AppShell.Header className="app-shell-header">
        <Group h="100%" justify="space-between" px="md" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger
              aria-label={menuLabel}
              hiddenFrom="sm"
              onClick={toggle}
              opened={opened}
              size="sm"
            />
            <ThemeIcon radius="md" size={42} variant="gradient">
              <Hotel size={22} />
            </ThemeIcon>
            <Stack gap={0}>
              <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                {t('common.brand.productName')}
              </Text>
              <Title className="app-shell-title" order={1}>
                {t('appShell.header.title')}
              </Title>
            </Stack>
          </Group>

          <Group gap="sm" wrap="nowrap">
            {utilityControls}
            <Badge
              className="app-shell-role"
              leftSection={<UserRound size={14} />}
              size="lg"
              variant="light"
              visibleFrom="md"
            >
              {t(roleLabelKeys[user.role])}
            </Badge>
            <Tooltip label={t('common.actions.logout')} position="bottom">
              <ActionIcon
                aria-label={t('common.actions.logout')}
                loading={isLoggingOut}
                onClick={onLogout}
                radius="md"
                size="lg"
                variant="default"
              >
                <LogOut size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        aria-label={t('appShell.navigation.ariaLabel')}
        className="app-shell-navbar"
        p="md"
      >
        <ScrollArea flex={1}>
          <Stack gap={4}>
            {visibleNavigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  active={isActive}
                  disabled={item.disabled}
                  key={item.id}
                  label={t(item.labelKey)}
                  leftSection={<Icon size={18} />}
                  onClick={() => {
                    if (!item.disabled) {
                      navigate(item.path);
                      close();
                    }
                  }}
                  variant="light"
                />
              );
            })}
          </Stack>
        </ScrollArea>

        <Button
          fullWidth
          leftSection={<LogOut size={18} />}
          loading={isLoggingOut}
          onClick={onLogout}
          type="button"
          variant="subtle"
        >
          {t('common.actions.logout')}
        </Button>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}

export default AuthenticatedAppShell;
