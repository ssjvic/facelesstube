// Loading Skeleton Components
// Shimmer effect placeholders for content loading

// Base skeleton with shimmer animation
export function Skeleton({ className = '', ...props }) {
    return (
        <div
            className={`animate-pulse bg-white/10 rounded ${className}`}
            {...props}
        />
    )
}

// Text line skeleton
export function SkeletonText({ lines = 1, className = '' }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
                />
            ))}
        </div>
    )
}

// Card skeleton
export function SkeletonCard({ className = '' }) {
    return (
        <div className={`glass-card p-6 ${className}`}>
            <div className="flex items-center gap-4 mb-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-32" />
                </div>
            </div>
            <SkeletonText lines={3} />
        </div>
    )
}

// Video card skeleton
export function SkeletonVideoCard({ className = '' }) {
    return (
        <div className={`glass-card overflow-hidden ${className}`}>
            <Skeleton className="aspect-video w-full" />
            <div className="p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-3" />
                <div className="flex gap-2">
                    <Skeleton className="h-8 flex-1 rounded-lg" />
                    <Skeleton className="h-8 flex-1 rounded-lg" />
                </div>
            </div>
        </div>
    )
}

// Stats card skeleton
export function SkeletonStats({ className = '' }) {
    return (
        <div className={`glass-card p-4 ${className}`}>
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-8 w-16" />
        </div>
    )
}

// List item skeleton
export function SkeletonListItem({ className = '' }) {
    return (
        <div className={`flex items-center gap-3 p-3 ${className}`}>
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="w-16 h-6 rounded" />
        </div>
    )
}

// Table row skeleton
export function SkeletonTableRow({ cols = 4, className = '' }) {
    return (
        <div className={`flex items-center gap-4 p-4 border-b border-white/5 ${className}`}>
            {Array.from({ length: cols }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={`h-4 ${i === 0 ? 'w-8' : 'flex-1'}`}
                />
            ))}
        </div>
    )
}

// Dashboard skeleton
export function SkeletonDashboard() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32 rounded-xl" />
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SkeletonStats />
                <SkeletonStats />
                <SkeletonStats />
                <SkeletonStats />
            </div>

            {/* Form area */}
            <SkeletonCard />
        </div>
    )
}

// History skeleton
export function SkeletonHistory() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-10 w-28 rounded-lg" />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <SkeletonVideoCard />
                <SkeletonVideoCard />
                <SkeletonVideoCard />
            </div>
        </div>
    )
}
