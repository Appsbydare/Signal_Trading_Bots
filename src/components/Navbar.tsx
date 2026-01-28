"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import HangTag from "./HangTag";

interface Customer {
    id: number;
    email: string;
    isAdmin?: boolean;
}

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const pathname = usePathname();

    // Check if customer is logged in
    useEffect(() => {
        fetch("/api/auth/customer/me")
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                setCustomer(data?.customer || null);
                setLoading(false);
            })
            .catch(() => {
                setCustomer(null);
                setLoading(false);
            });
    }, [pathname]);

    // Close mobile menu when path changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    // Handle navbar hide/show on scroll
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollDifference = currentScrollY - lastScrollY;

            // Always show at top of page
            if (currentScrollY < 10) {
                setIsVisible(true);
            }
            // Show navbar when scrolling up significantly (more than 50px)
            else if (scrollDifference < -50) {
                setIsVisible(true);
            }
            // Hide navbar when scrolling down (more than 20px)
            else if (scrollDifference > 20 && currentScrollY > 80) {
                setIsVisible(false);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [lastScrollY]);

    return (
        <header className={`sticky z-50 w-screen border-b border-[#5e17eb]/40 bg-zinc-950/98 text-zinc-50 shadow-sm backdrop-blur-sm transition-all duration-300 ${isVisible ? 'top-0' : '-top-24'}`}>
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                {/* LOGO */}
                <Link href="/" className="flex items-center transition-opacity hover:opacity-90">
                    <Image
                        src="/Tradingbot.png"
                        alt="SIGNAL trading bots"
                        width={90}
                        height={25}
                        className="h-auto w-auto"
                        priority
                    />
                </Link>

                {/* DESKTOP NAV */}
                <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
                    {/* Products Link */}
                    <Link href="/products" className="text-zinc-300 transition-colors hover:text-white">Products</Link>

                    {/* Details Dropdown */}
                    <div className="group relative">
                        <button className="flex items-center gap-1.5 text-zinc-300 transition-colors hover:text-white group-hover:text-white">
                            Details
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:rotate-180"><path d="m6 9 6 6 6-6" /></svg>
                        </button>
                        <div className="invisible absolute -left-4 top-full pt-4 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                            <div className="min-w-[180px] rounded-xl border border-zinc-800 bg-zinc-950 p-1.5 shadow-2xl ring-1 ring-zinc-800/50 backdrop-blur-xl">
                                <Link href="/compare" className="block rounded-md px-4 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white">
                                    Compare Plans
                                </Link>
                                <Link href="/specs" className="block rounded-md px-4 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white">
                                    Technical Specs
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Resources Dropdown */}
                    <div className="group relative">
                        <button className="flex items-center gap-1.5 text-zinc-300 transition-colors hover:text-white group-hover:text-white">
                            Resources
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:rotate-180"><path d="m6 9 6 6 6-6" /></svg>
                        </button>
                        <div className="invisible absolute -left-4 top-full pt-4 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                            <div className="min-w-[180px] rounded-xl border border-zinc-800 bg-zinc-950 p-1.5 shadow-2xl ring-1 ring-zinc-800/50 backdrop-blur-xl">
                                <Link href="/faq" className="block rounded-md px-4 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white">
                                    FAQ & Help
                                </Link>
                                <Link href="/usermanual" className="block rounded-md px-4 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white">
                                    User Manual
                                </Link>
                                <Link href="/resources" className="block rounded-md px-4 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white">
                                    Articles & Guides
                                </Link>
                            </div>
                        </div>
                    </div>

                    <Link href="/take-a-tour" className="text-zinc-300 transition-colors hover:text-white">Product Preview</Link>
                    <Link href="/contact" className="text-zinc-300 transition-colors hover:text-white">Contact</Link>

                    {/* User Profile or Sign In */}
                    {!loading && (
                        customer ? (
                            <div className="group relative">
                                <button className="flex items-center gap-2 rounded-full bg-zinc-800 p-1.5 pr-3 transition-all hover:bg-zinc-700">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5e17eb] text-xs font-semibold text-white">
                                        {customer.email.charAt(0).toUpperCase()}
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 transition-transform duration-200 group-hover:rotate-180"><path d="m6 9 6 6 6-6" /></svg>
                                </button>
                                <div className="invisible absolute right-0 top-full pt-4 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                                    <div className="min-w-[200px] rounded-xl border border-zinc-800 bg-zinc-950 p-1.5 shadow-2xl ring-1 ring-zinc-800/50 backdrop-blur-xl">
                                        <div className="border-b border-zinc-800 px-4 py-3">
                                            <p className="text-xs font-medium text-zinc-500">Signed in as</p>
                                            <p className="truncate text-sm text-white">{customer.email}</p>
                                        </div>
                                        <Link href="/portal" className="block rounded-md px-4 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white">
                                            Customer Portal
                                        </Link>
                                        <Link href="/portal/settings" className="block rounded-md px-4 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white">
                                            Settings
                                        </Link>
                                        {customer.isAdmin && (
                                            <>
                                                <div className="my-1 h-px bg-zinc-800"></div>
                                                <Link href="/admin" className="block rounded-md px-4 py-2 text-sm text-[#5e17eb] font-semibold transition-colors hover:bg-zinc-900 hover:text-[#4a11c0]">
                                                    Admin Panel
                                                </Link>
                                            </>
                                        )}
                                        <div className="my-1 h-px bg-zinc-800"></div>
                                        <form action="/api/auth/customer/logout" method="post">
                                            <button type="submit" className="w-full rounded-md px-4 py-2 text-left text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-red-400">
                                                Log out
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="relative">
                                <Link
                                    href="/login"
                                    className="rounded-md bg-[#5e17eb] px-5 py-2 text-sm font-medium text-white shadow-lg shadow-[#5e17eb]/20 transition-all hover:bg-[#4a12bf] hover:shadow-[#5e17eb]/40"
                                >
                                    Sign in
                                </Link>
                                <HangTag />
                            </div>
                        )
                    )}
                </nav>

                {/* MOBILE TOGGLE */}
                <button className="md:hidden text-zinc-300 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
                    {mobileMenuOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                    )}
                </button>
            </div >

            {/* MOBILE MENU */}
            {
                mobileMenuOpen && (
                    <div className="border-b border-zinc-800 bg-zinc-950 px-6 py-4 md:hidden animate-in slide-in-from-top-2">
                        <nav className="flex flex-col gap-4">
                            <Link href="/products" className="block rounded-md px-2 py-1.5 text-sm font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white">Products</Link>

                            <div className="space-y-2">
                                <p className="px-2 text-xs font-semibold uppercase text-zinc-500">Details</p>
                                <Link href="/compare" className="block rounded-md px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white">Compare Plans</Link>
                                <Link href="/specs" className="block rounded-md px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white">Technical Specs</Link>
                            </div>

                            <div className="h-px bg-zinc-900"></div>

                            <div className="space-y-2">
                                <p className="px-2 text-xs font-semibold uppercase text-zinc-500">Resources</p>
                                <Link href="/faq" className="block rounded-md px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white">FAQ</Link>
                                <Link href="/usermanual" className="block rounded-md px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white">User Manual</Link>
                                <Link href="/resources" className="block rounded-md px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white">Articles & Guides</Link>
                            </div>

                            <div className="h-px bg-zinc-900"></div>

                            <Link href="/take-a-tour" className="block rounded-md px-2 py-1.5 text-sm font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white">Product Preview</Link>
                            <Link href="/contact" className="block rounded-md px-2 py-1.5 text-sm font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white">Contact</Link>

                            {/* Mobile User Profile or Sign In */}
                            {!loading && (
                                customer ? (
                                    <>
                                        <div className="h-px bg-zinc-900 mt-2"></div>
                                        <div className="rounded-md bg-zinc-800/50 p-3 mt-2">
                                            <p className="text-xs font-medium text-zinc-500 mb-1">Signed in as</p>
                                            <p className="truncate text-sm text-white mb-3">{customer.email}</p>
                                            <Link href="/portal" className="block rounded-md bg-zinc-800 px-4 py-2 text-center text-sm font-medium text-white hover:bg-zinc-700 mb-2">
                                                Customer Portal
                                            </Link>
                                            <Link href="/portal/settings" className="block rounded-md bg-zinc-800 px-4 py-2 text-center text-sm font-medium text-white hover:bg-zinc-700 mb-2">
                                                Settings
                                            </Link>
                                            <form action="/api/auth/customer/logout" method="post">
                                                <button type="submit" className="w-full rounded-md bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-red-400">
                                                    Log out
                                                </button>
                                            </form>
                                        </div>
                                    </>
                                ) : (
                                    <Link href="/login" className="mt-2 block w-full rounded-md bg-[#5e17eb] px-4 py-2 text-center text-sm font-medium text-white shadow-sm hover:bg-[#4a12bf]">Sign in</Link>
                                )
                            )}
                        </nav>
                    </div>
                )
            }
        </header >
    );
}
