import { useEffect, useRef, useState } from 'react';
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

  const headerRef = useRef<HTMLElementTagNameMap['atp-header']>(null);
  const sidebarRef = useRef<HTMLElementTagNameMap['atp-sidebar']>(null);
  const breadcrumbsRef = useRef<HTMLElementTagNameMap['atp-breadcrumbs']>(null);

  useEffect(() => {
    if (headerRef.current) {
      headerRef.current.label = 'PriceEye';
      headerRef.current.org = 'ATPCO';
    }

    if (sidebarRef.current) {
      sidebarRef.current.items = SIDEBAR_ITEMS;
      sidebarRef.current.outputNavigationEvents = true;
    }

    if (breadcrumbsRef.current) {
      breadcrumbsRef.current.itemsList = BREADCRUMB_ITEMS;
    }
  }, []);

  useEffect(() => {
    const sidebar = sidebarRef.current;
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
      <atp-header ref={headerRef} className="layout-header"></atp-header>

      <atp-sidebar ref={sidebarRef} className="layout-sidebar"></atp-sidebar>

      <div className="scroll-wrapper">
        <div className="page-content">
          <atp-breadcrumbs ref={breadcrumbsRef}></atp-breadcrumbs>
          <h1 className="view-title">Create delivery configuration</h1>
        </div>
      </div>
    </div>
  );
}
