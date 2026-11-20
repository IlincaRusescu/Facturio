import express from 'express'
import cors from 'cors'

import authRoutes from './routes/auth.routes.js'
import clientsRoutes from './routes/clients.routes.js'
import invoicesRoutes from './routes/invoices.routes.js'

const app = express()

// Permitem accesul din frontend-ul Vue
app.use(cors({
  origin: 'http://localhost:5173'
}))

// Interpretarea datelor JSON din cereri
app.use(express.json({ limit: '100kb' }))

// Ruta de verificare a serverului
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'FACTURIO API functioneaza'
  })
})

// Rute pentru autentificare si inregistrare
app.use('/api/auth', authRoutes)

// Rute pentru gestionarea clientilor
app.use('/api/clients', clientsRoutes)

// Rute pentru facturi
app.use('/api/invoices', invoicesRoutes)

export default app
