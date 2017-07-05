const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('./db');
const Album = require('./models/album');
const cors = require('cors');
require('isomorphic-fetch');
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;
db.connect();

const router = express.Router();

const getCoversForAlbum = (albumId) => fetch(`http://coverartarchive.org/release/${albumId}`)
  .then(result => result.json())
  .catch(err => '')

router.get('/', function (req, res) {
  res.json({ message: 'hooray! welcome to our api!' });
});

router.route('/shoppingcart')
  .get((req, res) => Album.find()
    .then(allAlbums => res.json(allAlbums))
    .catch(err => res.json(err))
  )
  .post((req, res) => {
    const album = new Album();
    album.name = req.body.name;
    album.price = req.body.price;
    return album.save()
      .then(createdAlbum => res.json(createdAlbum))
      .catch(err => res.json(err))
  })

router.route('/shoppingcart/:album_id')
  .delete((req, res) =>
    Album.findByIdAndRemove(req.params.album_id)
      .then(deletedAlbum => res.json(deletedAlbum))
      .catch(err => res.json(err))
  )


router.route('/albums/:albumTitle')
  .get((req, res) => {
    return fetch(`http://musicbrainz.org/ws/2/release?query=${req.params.albumTitle}&limit=10&fmt=json`)
      .then(result => result.json())
      .then(({ releases: searchedAlbums }) => {
        const getAlbumCoverPromises = searchedAlbums
          .map(album => getCoversForAlbum(album.id));

        return Promise.all(getAlbumCoverPromises)
          .then(albumCoverPromisesForAllAlbums => albumCoverPromisesForAllAlbums
            .map((albumCover, i) => Object.assign({}, searchedAlbums[i], { albumCoverImageUrl: albumCover ? albumCover.images[0].thumbnails.small : '' }))
          )
          .then(albums => {
            albums = albums.map(({ id, title: title, "artist-credit": artists, albumCoverImageUrl }) => ({ id, title, artists, albumCoverImageUrl }));
            return res.json(albums);
          })
      })
  })

app.use('/api', router);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
}); 