const goneResponse = () =>
  Response.json(
    {
      error: 'Endpoint removido',
      message: 'A rota /api/autonoma nao esta mais disponivel.',
    },
    { status: 410 }
  )

export async function GET() {
  return goneResponse()
}

export async function POST() {
  return goneResponse()
}
