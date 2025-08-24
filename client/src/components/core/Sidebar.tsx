import { Link, useLocation } from 'react-router';
import { useDispatch } from 'react-redux';
import {
	LayoutDashboard,
	Folders,
	GitBranch,
	PlayCircle,
	Server,
	Globe,
	Shield,
	ChevronLeft,
	ChevronRight,
	Headset,
	LogOut,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { logout } from '@/app/features/auth/authSlice';
import { AppDispatch } from '@/app/store';

type NavItem = { name: string; href: string; icon: React.ComponentType<{ className?: string }>; hasChildren?: boolean };

const primaryNav: NavItem[] = [
	{ name: 'Dashboard', href: '/', icon: LayoutDashboard },
	{ name: 'Projects', href: '/projects', icon: Folders },
	{ name: 'Pipelines', href: '/pipelines', icon: GitBranch },
	{ name: 'Runs', href: '/runs', icon: PlayCircle },
	{ name: 'Runners', href: '/runners', icon: Server },
	{ name: 'Environments', href: '/environments', icon: Globe },
	{ name: 'System Admin', href: '/admin', icon: Shield },
];

const supportNav: NavItem[] = [
	{ name: 'Contact DevOps Team', href: '/support/contact', icon: Headset },
];

function Sidebar() {
	const location = useLocation();
	const dispatch = useDispatch<AppDispatch>();
	const [isCollapsed, setIsCollapsed] = useState(false);

	const handleLogout = async () => {
		try {
			await dispatch(logout()).unwrap();
			console.log('Déconnexion réussie');
		} catch (error) {
			console.error('Erreur lors de la déconnexion:', error);
		}
	};

	const Brand = (
		<AnimatePresence mode="wait">
			{!isCollapsed ? (
				<motion.div
					className="flex items-center gap-3"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.15 }}
				>
					<div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
						<div className="h-4 w-4 rounded-sm bg-primary" />
					</div>
					<h1 className="text-lg font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
						Shiply
					</h1>
				</motion.div>
			) : (
				<div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
					<div className="h-4 w-4 rounded-sm bg-primary" />
				</div>
			)}
		</AnimatePresence>
	);

	const SectionLabel = ({ children }: { children: React.ReactNode }) => (
		!isCollapsed ? (
			<div className="px-4 pb-2 text-xs font-medium tracking-wider text-muted-foreground/80">
				{children}
			</div>
		) : null
	);

	const renderItem = (item: NavItem) => {
		const isActive = location.pathname === item.href;
		return (
			<Link
				key={item.name}
				to={item.href}
				className={cn(
					"group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-base transition-colors",
					isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
					isCollapsed && "justify-center"
				)}
			>
				{isActive && <div className="absolute inset-0 rounded-lg bg-primary/10" />}
				<div className={cn("p-2 rounded-lg transition-colors", isActive ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground group-hover:bg-muted")}
				>
					<item.icon className="h-5 w-5" />
				</div>
				<AnimatePresence>
					{!isCollapsed && (
						<motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="relative z-10 flex-1">
							{item.name}
						</motion.span>
					)}
				</AnimatePresence>
			</Link>
		);
	};

	return (
		<div
			className={cn(
				"flex h-screen flex-col bg-background/80 backdrop-blur-xl border-r border-border/40 relative transition-all duration-200 ease-in-out",
				isCollapsed ? "w-20" : "w-64"
			)}
		>
			<button
				onClick={() => setIsCollapsed(!isCollapsed)}
				className="absolute -right-3 top-6 z-50 h-6 w-6 rounded-full border bg-background shadow-md flex items-center justify-center hover:bg-muted transition-colors"
			>
				{isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
			</button>

			<div className="flex h-20 items-center justify-center border-b border-border/40 bg-gradient-to-b from-background to-background/50">
				{Brand}
			</div>

			<nav className="flex-1 space-y-4 p-4">
				<SectionLabel>Menus</SectionLabel>
				<div className="space-y-2">
					{primaryNav.map(renderItem)}
				</div>

				<SectionLabel>Support</SectionLabel>
				<div className="space-y-2">
					{supportNav.map(renderItem)}
				</div>
			</nav>

			<div className="border-t border-border/40 bg-gradient-to-t from-background to-background/50 p-4">
				<div className={cn("flex items-center gap-3 rounded-lg p-3", isCollapsed ? "justify-center" : "bg-muted/30")}
				>
					<div className="h-8 w-8 rounded-full bg-primary/15 text-primary grid place-items-center font-semibold">
						L
					</div>
					<AnimatePresence>
						{!isCollapsed && (
							<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-w-0 flex-1">
								<div className="truncate text-sm font-medium">Leslie Alexander</div>
								<div className="truncate text-xs text-muted-foreground">leslie@gmail.com</div>
							</motion.div>
						)}
					</AnimatePresence>
					<button
						onClick={handleLogout}
						className="ml-auto rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
						aria-label="Logout"
					>
						<LogOut className="h-4 w-4" />
					</button>
				</div>
			</div>
		</div>
	);
}

export default Sidebar;
