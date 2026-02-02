import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Car, DollarSign, Folder, Gauge, IdCard, LandPlot, Logs, Users } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: Gauge,
    },
    {
        title: 'Master Data',
        href: '#',
        icon: Folder,
        roles: ['Admin'],
        items: [
            {
                title: 'User',
                href: '/user',
                icon: Users,
            },
            {
                title: 'Tipe Kendaraan',
                href: '/vehicletype',
                icon: Car,
            },
            {
                title: 'Area Parkir',
                href: '/areaparkir',
                icon: LandPlot,
            },
            {
                title: 'Tarif Parkir',
                href: '/tarifparkir',
                icon: DollarSign,
            },
            {
                title: 'Data Kendaraan',
                href: '/datavehicle',
                icon: Car,
            },
            {
                title: 'Member',
                href: '/member',
                icon: IdCard,
            },
        ],
    },
    {
        title: 'Transaction',
        href: '#',
        icon: DollarSign,
        roles: ['Petugas'],
        items: [
            {
                title: 'Live Transaction',
                href: '/transaction',
                icon: DollarSign,
            },
            {
                title: 'Vehicle Entry',
                href: '/transaction/entry',
                icon: Car,
            },
            {
                title: 'History',
                href: '/transaction/history',
                icon: Folder,
            },
        ],
    },
    {
        title: 'Laporan',
        href: '#',
        icon: Folder,
        items: [
            {
                title: 'Laporan Transaksi',
                href: '/laporan-transaksi',
                icon: DollarSign,
            },
            {
                title: 'Laporan Kendaraan',
                href: '/laporan-kendaraan',
                icon: Car,
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Log Activity',
        href: '#',
        icon: Logs,
    },
    {
        title: 'Repository',
        href: 'https://github.com/Pridoh/Project-UKK',
        icon: Folder,
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const userRole = (auth.user as any)?.role?.role_name;

    // Filter menu items based on user role
    const filteredNavItems = mainNavItems.filter((item) => {
        if (!item.roles || item.roles.length === 0) {
            return true; // No role restriction, show to all
        }
        return item.roles.includes(userRole);
    });

    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
