"use client";

import { useEffect, useState } from "react";
import { ToolCard } from "@/components/admin/ToolCard";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --- Icons ---
function LicenseIcon(props: any) {
    return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
    );
}

// Define the allowed colors based on ToolCard's requirements
type ToolColor = "blue" | "emerald" | "purple" | "orange" | "pink" | "cyan";

interface ToolData {
    id: string;
    title: string;
    description: string;
    href: string;
    color: ToolColor;
    iconKey: string;
}

const TOOLS_DATA: ToolData[] = [
    {
        id: "licenses",
        title: "License Management",
        description: "Create, revoke, and manage user licenses and sessions.",
        href: "/admin/licenses",
        color: "blue",
        iconKey: "LicenseIcon"
    },
    {
        id: "news",
        title: "News Updates",
        description: "Post announcements and news to the application.",
        href: "/admin/news",
        color: "orange",
        iconKey: "NewsIcon"
    },
    {
        id: "blog",
        title: "Blog Posts",
        description: "Create, edit, and manage blog articles.",
        href: "/admin/blog",
        color: "purple",
        iconKey: "BlogIcon"
    },
    {
        id: "youtube",
        title: "YouTube Guides",
        description: "Manage video tutorials and help content.",
        href: "/admin/youtube-help",
        color: "pink",
        iconKey: "YoutubeIcon"
    },
    {
        id: "agents",
        title: "Virtual Agents",
        description: "Configure support agents and their responses.",
        href: "/admin/agents",
        color: "purple",
        iconKey: "AgentsIcon"
    },
    {
        id: "docs",
        title: "Knowledge Base",
        description: "Edit documentation and FAQ articles.",
        href: "/admin/docs",
        color: "cyan",
        iconKey: "DocsIcon"
    },
    {
        id: "tickets",
        title: "Support Tickets",
        description: "View and detailed support requests.",
        href: "/admin/tickets",
        color: "emerald",
        iconKey: "TicketsIcon"
    },
    {
        id: "promo",
        title: "Promotional Images",
        description: "Update marketing assets and banners.",
        href: "/admin/promotional-image",
        color: "purple",
        iconKey: "PromoIcon"
    },
    {
        id: "faqs",
        title: "FAQs",
        description: "Manage frequently asked questions.",
        href: "/admin/faqs",
        color: "cyan",
        iconKey: "FaqIcon"
    }
];

// Map keys to the actual SVG JSX
const ICON_MAP: Record<string, React.ReactNode> = {
    LicenseIcon: <LicenseIcon className="h-6 w-6" />,
    NewsIcon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
        </svg>
    ),
    BlogIcon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
    ),
    YoutubeIcon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
        </svg>
    ),
    AgentsIcon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
    ),
    DocsIcon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
    ),
    TicketsIcon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
        </svg>
    ),
    PromoIcon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
    ),
    FaqIcon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
    ),
};

function SortableItem({ tool }: { tool: ToolData }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: tool.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : "auto",
        opacity: isDragging ? 0.3 : 1,
        position: "relative" as const,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <ToolCard
                title={tool.title}
                description={tool.description}
                href={tool.href}
                color={tool.color}
                icon={ICON_MAP[tool.iconKey]}
            />
        </div>
    );
}

export function DashboardToolsGrid() {
    const [items, setItems] = useState<ToolData[]>(TOOLS_DATA);
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Avoid accidental drags
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        const savedOrder = localStorage.getItem("admin-tools-order");
        if (savedOrder) {
            try {
                const orderIds = JSON.parse(savedOrder);
                const orderedItems = orderIds
                    .map((id: string) => TOOLS_DATA.find((item) => item.id === id))
                    .filter(Boolean) as ToolData[];

                // Add any new items that weren't in saved order
                const missingItems = TOOLS_DATA.filter(item => !orderIds.includes(item.id));
                setItems([...orderedItems, ...missingItems]);
            } catch (e) {
                console.error("Failed to parse saved order", e);
            }
        }
    }, []);

    function handleDragStart(event: any) {
        setActiveId(event.active.id);
    }

    function handleDragEnd(event: any) {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                const newOrder = arrayMove(items, oldIndex, newIndex);

                // Save to local storage
                localStorage.setItem("admin-tools-order", JSON.stringify(newOrder.map(item => item.id)));

                return newOrder;
            });
        }

        setActiveId(null);
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((tool) => (
                        <SortableItem key={tool.id} tool={tool} />
                    ))}
                </div>
            </SortableContext>

            {/* Drag Overlay for smooth visual */}
            <DragOverlay>
                {activeId ? (
                    (() => {
                        const tool = items.find(i => i.id === activeId);
                        return tool ? (
                            <div className="cursor-grabbing">
                                <ToolCard
                                    title={tool.title}
                                    description={tool.description}
                                    href={tool.href}
                                    color={tool.color}
                                    icon={ICON_MAP[tool.iconKey]}
                                />
                            </div>
                        ) : null;
                    })()
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
