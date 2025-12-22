export function PostSkeleton() {
    return (
        <div className="border-b border-gray-100 p-4 bg-white animate-pulse">
            <div className="flex gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="h-4 bg-gray-200 rounded w-32" />
                        <div className="h-4 bg-gray-200 rounded w-20" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full" />
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </div>
                    <div className="flex gap-8 mt-3">
                        <div className="h-4 bg-gray-200 rounded w-12" />
                        <div className="h-4 bg-gray-200 rounded w-12" />
                        <div className="h-4 bg-gray-200 rounded w-12" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export function ProfileSkeleton() {
    return (
        <div className="bg-white min-h-screen animate-pulse">
            <div className="h-32 bg-gray-200" />
            <div className="px-4 pb-4">
                <div className="w-32 h-32 rounded-full bg-gray-300 -mt-16 border-4 border-white" />
                <div className="mt-4 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-48" />
                    <div className="h-4 bg-gray-200 rounded w-32" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="flex gap-4 mt-4">
                        <div className="h-4 bg-gray-200 rounded w-24" />
                        <div className="h-4 bg-gray-200 rounded w-24" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export function FeedSkeleton() {
    return (
        <div className="flex flex-col">
            {[...Array(5)].map((_, i) => (
                <PostSkeleton key={i} />
            ))}
        </div>
    )
}

export function UserCardSkeleton() {
    return (
        <div className="border-b border-gray-100 p-4 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32" />
                        <div className="h-3 bg-gray-200 rounded w-24" />
                    </div>
                </div>
                <div className="h-8 bg-gray-200 rounded-full w-20" />
            </div>
        </div>
    )
}
