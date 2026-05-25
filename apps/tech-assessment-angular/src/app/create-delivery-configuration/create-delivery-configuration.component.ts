import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {SidebarItem, BreadcrumbItem} from '@atpco/atp-web';

@Component({
  selector: 'app-create-delivery-configuration',
  templateUrl: './create-delivery-configuration.component.html',
  styleUrl: './create-delivery-configuration.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CreateDeliveryConfigurationComponent {
  protected activeSidebarId = 'delivery-configuration';
  protected readonly headerNavigationLinks: any[] = [
    {id: 'apps', label: 'Apps', href: '/apps'},
    {id: 'dev-portal', label: 'Dev Portal', href: '/dev-portal'},
    {id: 'support', label: 'Support', href: '/support'},
  ];

  protected readonly sidebarItems: SidebarItem[] = [
    {name: 'Collections', id: 'collections', route: 'collections', children: []},
    {
      name: 'Manage',
      id: 'manage',
      route: 'manage',
      children: [
        {name: 'Input configurations', id: 'input-configurations', route: 'input-configurations'},
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

  protected readonly breadcrumbItems: BreadcrumbItem[] = [
    {name: 'Manage', href: '/manage'},
    {name: 'Delivery configuration', href: '/delivery-configuration'},
  ];

  protected onSidebarNavigation(event: Event): void {
    const detail = (event as CustomEvent<{id?: string}>).detail;
    if (detail?.id) {
      this.activeSidebarId = detail.id;
    }
  }
}
