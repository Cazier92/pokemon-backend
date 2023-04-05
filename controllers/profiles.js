import { Profile } from '../models/profile.js'
import { Pack } from '../models/pack.js'
import { v2 as cloudinary } from 'cloudinary'

function index(req, res) {
  Profile.find({})
  .then(profiles => res.json(profiles))
  .catch(err => {
    console.log(err)
    res.status(500).json(err)
  })
}

function addPhoto(req, res) {
  const imageFile = req.files.photo.path
  Profile.findById(req.params.id)
  .then(profile => {
    cloudinary.uploader.upload(imageFile, {tags: `${req.user.email}`})
    .then(image => {
      profile.photo = image.url
      profile.save()
      .then(profile => {
        res.status(201).json(profile.photo)
      })
    })
    .catch(err => {
      console.log(err)
      res.status(500).json(err)
    })
  })
}

const show = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id)
    .populate('party')
    .populate('pokemonPC')
    .populate('currentMap')
    .populate('pack')
    res.status(200).json(profile)
  } catch (error) {
    console.log(err)
    res.status(500).json(err)
  }
}

const updateProfile = async (req, res) => {
  try {
    const profile = await Profile.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    .populate('party')
    .populate('pokemonPC')
    .populate('currentMap')
    .populate('pack')
    res.status(201).json(profile)
  } catch (error) {
    console.log(err)
    res.status(500).json(err)
  }
}

function packIndex(req, res) {
  Pack.find({})
  .then(packs => res.json(packs))
  .catch(err => {
    console.log(err)
    res.status(500).json(err)
  })
}

export { index, addPhoto, show, updateProfile, packIndex }
