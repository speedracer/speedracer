import pify from 'pify'
import fs from 'fs'
import { partialRight } from 'lodash'

const readFile = partialRight(pify(fs.readFile), 'utf8')
export default readFile
