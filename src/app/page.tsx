import Link from "next/link"

import { APP_NAME, BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 bg-muted px-4 py-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <BrandLogo className="size-14" />
        <h1 className="text-3xl font-semibold tracking-tight">{APP_NAME}</h1>
      </div>
      <div className="flex gap-3">
        {/* Base UI composes through `render`; `nativeButton` is off because the result is a link. */}
        <Button size="lg" nativeButton={false} render={<Link href="/login" />}>
          Login
        </Button>
        <Button
          size="lg"
          variant="outline"
          nativeButton={false}
          render={<Link href="/signup" />}
        >
          Sign up
        </Button>
      </div>
    </main>
  )
}
