'use strict';

const express = require('express');

const folderRouter = express.Router();
const bodyParser = express.json();
const uuid = require('uuid/v4');
const logger = require('./logger');
const folderService = require('./folder-service');
const xss = require('xss');

const serializeFolder = folder => ({
  id: xss(folder.id),
  name: xss(folder.name),
});



folderRouter
  .route('/')
  .get((req,res,next) => {
    const knexInstance = req.app.get('db');
    folderService.getAllFolders(knexInstance)
      .then(folders => {
        res.json(folders);
      })
      .catch(next);
  })
  .post(bodyParser, (req,res,next) => {
    const {name } = req.body;
    const id = uuid();
    const newFolder = {id,name};

    for (const [key, value] of Object.entries(newFolder)) {
      if ((value === null || value === undefined)) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }

    folderService.insertFolder(
      req.app.get('db'),
      newFolder
    )
      .then(folder => {
        res
          .status(201)
          .location(`/api/folders/${folder.id}`)
          .json(folder);
      })
      .catch(next);
  });


folderRouter
  .route('/:id')
  .all((req, res, next) => {
    folderService.getFolderById(
      req.app.get('db'),
      req.params.id
    )
      .then(folder => {
        if (!folder) {
          return res.status(404).json({
            error: { message: 'folder doesn\'t exist' }
          });
        }
        res.folder = folder; // save the article for the next middleware
        next(); // don't forget to call next so the next middleware happens!
      })
      .catch(next);
  })
  .get((req,res,next) => {
    return res.json(serializeFolder(res.folder));
  })
  .delete((req,res,next) => {
    const { id } = req.params;
    const knexInstance = req.app.get('db');
    folderService.deleteFolder(knexInstance,id)
      .then(() => {
        res.status(204).end();
      }
      )
      .catch(next);
  })
  .patch(bodyParser,(req,res,next) => {
    const { name } = req.body;
    const updatefolder = { name};
    const numberOfValues = Object.values(updatefolder).filter(Boolean).length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: 'Request body must contain \'name\''
        }
      });
    }
    folderService.updateFolder(
      req.app.get('db'),
      req.params.id,
      updatefolder
    ) .then(updated => {
      res.status(204).end();
    })
      .catch(next);
  });

module.exports = folderRouter;