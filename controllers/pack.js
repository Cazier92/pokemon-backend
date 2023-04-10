import { Pack } from '../models/map.js'

const index = async (req, res) => {
  try {
    const packs = await Pack.find({})
    res.status(200).json(packs)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

const show = async (req, res) => {
  try {
    const pack = await Pack.findOne({ owner: req.user.profile })
    res.status(200).json(pack)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}




export { 
  index,
  show,
}