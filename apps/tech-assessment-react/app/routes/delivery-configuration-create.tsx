import { useEffect, useState } from 'react';
import type { BreadcrumbItem, SidebarItem } from '@atpco/atp-web';

const SIDEBAR_ITEMS: SidebarItem[] = [
  { name: 'Collections', id: 'collections', route: 'collections', children: [] },
  {
    name: 'Manage',
    id: 'manage',
    route: 'manage',
    children: [
      { name: 'Input configurations', id: 'input-configurations', route: 'input-configurations' },
      {
        name: 'Output configurations',
        id: 'output-configurations',
        route: 'output-configurations',
      },
      {
        name: 'Packaging configurations',
        id: 'packaging-configurations',
        route: 'packaging-configurations',
      },
      {
        name: 'Delivery configuration',
        id: 'delivery-configuration',
        route: 'delivery-configuration',
      },
    ],
  },
];

const BREADCRUMB_ITEMS: BreadcrumbItem[] = [
  { name: 'Manage', href: '/manage' },
  { name: 'Delivery configuration', href: '/delivery-configuration' },
];

export default function DeliveryConfigurationCreateRoute() {
  const [activeSidebarId, setActiveSidebarId] = useState('delivery-configuration');

  useEffect(() => {
    const header = document.getElementById('delivery-config-header') as HTMLElementTagNameMap['atp-header'] | null;
    const sidebar = document.getElementById(
      'delivery-config-sidebar',
    ) as HTMLElementTagNameMap['atp-sidebar'] | null;
    const breadcrumbs = document.getElementById(
      'delivery-config-breadcrumbs',
    ) as HTMLElementTagNameMap['atp-breadcrumbs'] | null;

    if (header) {
      header.label = 'PriceEye';
      header.org = 'ATPCO';
    }

    if (sidebar) {
      sidebar.items = SIDEBAR_ITEMS;
      sidebar.outputNavigationEvents = true;
    }

    if (breadcrumbs) {
      breadcrumbs.itemsList = BREADCRUMB_ITEMS;
    }
  }, []);

  useEffect(() => {
    const sidebar = document.getElementById(
      'delivery-config-sidebar',
    ) as HTMLElementTagNameMap['atp-sidebar'] | null;

    if (!sidebar) {
      return;
    }

    sidebar.activeId = activeSidebarId;

    const onSidebarNavigation = (event: Event) => {
      const detail = (event as CustomEvent<{ id?: string }>).detail;
      if (detail?.id) {
        setActiveSidebarId(detail.id);
      }
    };

    sidebar.addEventListener('navigationEventOutput', onSidebarNavigation);

    return () => {
      sidebar.removeEventListener('navigationEventOutput', onSidebarNavigation);
    };
  }, [activeSidebarId]);

  return (
    <div className="atp-layout">
      <atp-header id="delivery-config-header" className="layout-header"></atp-header>

      <atp-sidebar id="delivery-config-sidebar" className="layout-sidebar"></atp-sidebar>

      <div className="scroll-wrapper">
        <div className="page-content">
          <atp-breadcrumbs id="delivery-config-breadcrumbs"></atp-breadcrumbs>
          <h1 className="view-title">Create delivery configuration</h1>
        </div>
      </div>
    </div>
  );
}
