import * as express from 'express'
import * as bodyparser from 'body-parser'
import * as cors from 'cors'

const app = express()
app.use(cors())
app.use(bodyparser.urlencoded({ extended: true }))

app.get('/', (_, res) => {
  res.end('Working Software 2019 - Typescript in salsa funzionale')
})
app.post('/customer', (req, res) => {
  console.log('body: ', req.body)
  if (req.body === {}) {
    return res.json({ success: false, message: 'post data are empty' })
  }
  return res.json({ success: true })
})
app.listen(3333)
console.log('server listening to port 3333')
