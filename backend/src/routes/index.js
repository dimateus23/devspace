import { Router } from 'express'

const router = Router()

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'devspace-api' })
})

export default router
