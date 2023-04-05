import { Map } from '../models/map.js'

const index = async (req, res) => {
  try {
    const maps = await Map.find({})
    res.status(200).json(maps)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

const show = async (req, res) => {
  try {
    const map = await Map.findById(req.params.id)
    res.status(200).json(map)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

const create = async (req, res) => {
  try {
    const map = await Map.create(req.body)
    res.status(200).json(map)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

const updateMap = async (req, res) => {
  try {
    const map = await Map.findByIdAndUpdate(
      req.params.id,
      req.body,
      {new: true}
    )
    res.status(201).json(map)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}


export { 
  index,
  show,
  create,
  updateMap,
}
