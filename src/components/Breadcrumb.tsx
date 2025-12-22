"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

export default function Breadcrumb() {
    const pathname = usePathname();

    if (pathname === "/") return null;

    const segments = pathname.split("/").filter((item) => item !== "");

    return (
        <nav aria-label="Breadcrumb" className="mb-6 mt-4">
            <ol className="flex items-center space-x-2 text-sm text-zinc-500">
                <li>
                    <Link
                        href="/"
                        className="flex items-center transition-colors hover:text-zinc-900 dark:hover:text-zinc-50"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-1 h-4 w-4"
                        >
                            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        Home
                    </Link>
                </li>

                {segments.map((segment, index) => {
                    const href = `/${segments.slice(0, index + 1).join("/")}`;
                    const label = segment
                        .replace(/-/g, " ")
                        .replace(/^\w/, (c) => c.toUpperCase());

                    const isLast = index === segments.length - 1;

                    return (
                        <Fragment key={href}>
                            <li aria-hidden="true" className="select-none text-zinc-400">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4"
                                >
                                    <path d="m9 18 6-6-6-6" />
                                </svg>
                            </li>

                            <li>
                                {isLast ? (
                                    <span
                                        aria-current="page"
                                        className="font-medium text-zinc-900 dark:text-zinc-50"
                                    >
                                        {label}
                                    </span>
                                ) : (
                                    <Link
                                        href={href}
                                        className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-50"
                                    >
                                        {label}
                                    </Link>
                                )}
                            </li>
                        </Fragment>
                    );
                })}
            </ol>
        </nav>
    );
}

