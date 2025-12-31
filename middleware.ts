import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Defina as rotas públicas (que não precisam de autenticação)
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  // Protege todas as rotas exceto as públicas
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Ignora arquivos estáticos e Next.js internals
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Sempre roda para API routes
    '/(api|trpc)(.*)',
  ],
}
